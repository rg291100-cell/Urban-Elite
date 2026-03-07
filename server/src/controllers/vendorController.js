const supabase = require('../config/database');
const { createBookingStatusNotificationForUser } = require('./notificationsController');

// Get vendor dashboard data
exports.getDashboard = async (req, res) => {
    try {
        console.log('DEBUG: getDashboard called for Vendor ID:', req.user?.id); // DEBUG LOG
        const vendorId = req.user.id;

        // Get vendor's bookings count
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .eq('vendor_id', vendorId);

        if (bookingsError) throw bookingsError;

        // Calculate stats
        const todayBookings = bookings?.filter(b => {
            const bookingDate = new Date(b.date);
            const today = new Date();
            return bookingDate.toDateString() === today.toDateString();
        }).length || 0;

        const pendingRequests = bookings?.filter(b => b.status === 'PENDING').length || 0;
        const activeServices = bookings?.filter(b => b.status === 'ACTIVE').length || 0;

        // Calculate total revenue (from completed bookings)
        const completedBookings = bookings?.filter(b => b.status === 'COMPLETED') || [];
        const totalRevenue = completedBookings.reduce((sum, booking) => {
            const price = parseFloat(booking.price?.replace('₹', '').replace(',', '') || 0);
            return sum + price;
        }, 0);

        // Get recent bookings
        const recentBookings = bookings
            ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5) || [];

        res.json({
            success: true,
            data: {
                stats: {
                    todayBookings,
                    pendingRequests,
                    totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
                    activeServices
                },
                recentBookings
            }
        });
    } catch (error) {
        console.error('Error fetching vendor dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
};

// Get vendor revenue data
exports.getRevenue = async (req, res) => {
    try {
        const vendorId = req.user.id;

        // Get all completed bookings for revenue calculation
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('vendor_id', vendorId)
            .eq('status', 'COMPLETED')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate total earnings
        const totalEarnings = bookings?.reduce((sum, booking) => {
            const price = parseFloat(booking.price?.replace('₹', '').replace(',', '') || 0);
            return sum + price;
        }, 0) || 0;

        // Calculate this month's earnings
        const now = new Date();
        const thisMonthBookings = bookings?.filter(b => {
            const bookingDate = new Date(b.created_at);
            return bookingDate.getMonth() === now.getMonth() &&
                bookingDate.getFullYear() === now.getFullYear();
        }) || [];

        const thisMonthEarnings = thisMonthBookings.reduce((sum, booking) => {
            const price = parseFloat(booking.price?.replace('₹', '').replace(',', '') || 0);
            return sum + price;
        }, 0);

        // Prepare transaction history
        const transactions = bookings?.map(booking => ({
            id: booking.id,
            serviceName: booking.service_name,
            amount: booking.price,
            date: booking.created_at,
            status: 'Completed'
        })) || [];

        res.json({
            success: true,
            data: {
                totalEarnings: `₹${totalEarnings.toLocaleString('en-IN')}`,
                thisMonthEarnings: `₹${thisMonthEarnings.toLocaleString('en-IN')}`,
                totalBookings: bookings?.length || 0,
                transactions
            }
        });
    } catch (error) {
        console.error('Error fetching vendor revenue:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch revenue data'
        });
    }
};

// Get vendor bookings
exports.getBookings = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { status } = req.query;

        let query = supabase
            .from('bookings')
            .select('*, users!bookings_user_id_fkey(name, phone)')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false });

        if (status) {
            if (status.toUpperCase() === 'ACTIVE') {
                query = query.in('status', ['ACCEPTED', 'ACTIVE']);
            } else {
                query = query.eq('status', status.toUpperCase());
            }
        }

        const { data: bookings, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: bookings || []
        });
    } catch (error) {
        console.error('Error fetching vendor bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { bookingId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['PENDING', 'ACCEPTED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        // Update booking
        const { data: booking, error } = await supabase
            .from('bookings')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', bookingId)
            .eq('vendor_id', vendorId)
            .select()
            .single();

        if (error) throw error;

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });

        // 🔔 Notify user of status change (non-blocking, after response)
        createBookingStatusNotificationForUser({
            bookingId: booking.id,
            userId: booking.user_id,
            serviceName: booking.service_name,
            newStatus: status,
        }).catch(err => console.error('[Notification] Error notifying user:', err.message));

    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            error: error?.message || 'Failed to update booking status',
            detail: error?.details || error?.hint || null,
        });
    }
};

// Get vendor services (Actual items they offer)
exports.getServices = async (req, res) => {
    try {
        const vendorId = req.user.id;

        // Fetch services offered by this vendor linked with actual service item details
        const { data: services, error } = await supabase
            .from('vendor_services')
            .select(`
                id,
                service_item_id,
                custom_price,
                custom_duration,
                is_enabled,
                price_updated_by,
                duration_updated_by,
                service_items (
                    id,
                    title,
                    price,
                    duration,
                    image,
                    subcategory_id
                )
            `)
            .eq('vendor_id', vendorId);

        if (error) throw error;

        // Transform for frontend
        const formatted = (services || []).map(s => ({
            id: s.service_item_id,
            vendorServiceId: s.id,
            name: s.service_items?.title || 'Unknown',
            basePrice: s.service_items?.price,
            baseDuration: s.service_items?.duration,
            customPrice: s.custom_price,
            customDuration: s.custom_duration,
            isEnabled: s.is_enabled,
            priceUpdatedBy: s.price_updated_by || 'VENDOR',
            durationUpdatedBy: s.duration_updated_by || 'VENDOR',
            image: s.service_items?.image
        }));

        res.json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Error fetching vendor services:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch services'
        });
    }
};

// Update a single vendor service price/duration/status
exports.updateServiceItem = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { serviceItemId, customPrice, customDuration, isEnabled } = req.body;

        if (!serviceItemId) {
            return res.status(400).json({ success: false, error: 'Service Item ID is required' });
        }

        const updates = {};
        if (customPrice !== undefined) {
            updates.custom_price = customPrice;
            updates.price_updated_by = 'VENDOR';
        }
        if (customDuration !== undefined) {
            updates.custom_duration = customDuration ? parseInt(customDuration) : null;
            updates.duration_updated_by = 'VENDOR';
        }
        if (isEnabled !== undefined) updates.is_enabled = isEnabled;

        const { data, error } = await supabase
            .from('vendor_services')
            .update(updates)
            .eq('vendor_id', vendorId)
            .eq('service_item_id', serviceItemId)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: data?.[0]
        });
    } catch (error) {
        console.error('Error updating vendor service:', error.message || error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update service'
        });
    }
};

// Update vendor services
exports.updateServices = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { services } = req.body;

        // This would update a vendor_services junction table
        // For now, just return success
        res.json({
            success: true,
            message: 'Services updated successfully',
            data: services
        });
    } catch (error) {
        console.error('Error updating vendor services:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update services'
        });
    }
};
