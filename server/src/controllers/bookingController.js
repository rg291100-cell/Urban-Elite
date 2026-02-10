const supabase = require('../config/database');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const {
            serviceId,
            serviceName,
            date,
            timeSlot,
            location,
            instructions,
            price,
            paymentMode
        } = req.body;

        console.log('Booking Request Received:', { serviceName, date, timeSlot, userId: req.user?.id, paymentMode });

        // Get authenticated user ID from middleware
        const userId = req.user.id; // supabase auth uses 'id'

        // Insert into Supabase (professional will be assigned later)
        const { data: booking, error } = await supabase
            .from('bookings')
            .insert({
                service_id: serviceId,
                service_name: serviceName,
                date,
                time_slot: timeSlot,
                location_type: location?.type || 'Home',
                location_address: location?.address || '',
                instructions: instructions || '',
                status: 'PENDING',
                price,
                payment_mode: paymentMode || 'PREPAID',
                professional_id: null,
                professional_name: null,
                estimated_time: '12m',
                user_id: userId
            })
            .select()
            .single();

        if (error) {
            console.error('Booking DB Insert Error:', error);
            throw error;
        }

        res.status(201).json({
            success: true,
            bookingId: booking.id,
            status: booking.status,
            professional: booking.professional_id ? {
                id: booking.professional_id,
                name: booking.professional_name
            } : null,
            estimatedArrival: booking.estimated_time,
            message: 'Booking confirmed! A professional will be assigned shortly.'
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking'
        });
    }
};

// Get booking by ID
exports.getBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: booking, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking: {
                id: booking.id,
                service: booking.service_name,
                date: booking.date,
                timeSlot: booking.time_slot,
                location: {
                    type: booking.location_type,
                    address: booking.location_address
                },
                instructions: booking.instructions,
                status: booking.status,
                price: booking.price,
                professional: {
                    id: booking.professional_id,
                    name: booking.professional_name,
                    estimatedTime: booking.estimated_time
                }
            }
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking'
        });
    }
};

// Get booking tracking info
exports.getBookingTracking = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: booking, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Simulate live tracking data
        res.json({
            success: true,
            professional: {
                name: booking.professional_name,
                location: {
                    lat: 19.0760 + (Math.random() - 0.5) * 0.01,
                    lng: 72.8777 + (Math.random() - 0.5) * 0.01
                }
            },
            status: booking.status.toUpperCase(),
            estimatedTime: booking.estimated_time
        });
    } catch (error) {
        console.error('Error fetching tracking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tracking data'
        });
    }
};

// Get all bookings for user
exports.getUserBookings = async (req, res) => {
    try {
        // Get authenticated user ID from middleware
        const userId = req.user.id;

        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            bookings: bookings.map(b => ({
                id: b.id,
                service: b.service_name,
                date: b.date,
                status: b.status,
                price: b.price
            }))
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Verify ownership (optional but recommended)
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !booking) {
            console.error('Cancel Error: Booking not found', id);
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        if (booking.user_id !== req.user.id) {
            console.error('Cancel Error: Unauthorized', { userId: req.user.id, bookingUser: booking.user_id });
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        // Update status
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'CANCELLED', instructions: booking.instructions + (reason ? ` [Cancel Reason: ${reason}]` : '') })
            .eq('id', id);

        if (error) throw error;

        console.log('Booking Cancelled:', id);
        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel booking' });
    }
};
