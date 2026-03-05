const supabase = require('../config/database');

/**
 * GET /api/user/notifications
 * Returns global broadcast notifications + personal notifications targeted at the calling user.
 * Enriched with read status. Ordered newest first.
 */
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch broadcast notifications (target_user_id IS NULL) +
        // personal notifications addressed to this user
        const { data: notifications, error: nErr } = await supabase
            .from('notifications')
            .select('*, vendor:users!notifications_vendor_id_fkey(name, business_name)')
            .or(`target_user_id.is.null,target_user_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(80);

        if (nErr) throw nErr;

        // Fetch which notifications this user has already read
        const { data: reads, error: rErr } = await supabase
            .from('notification_reads')
            .select('notification_id')
            .eq('user_id', userId);

        if (rErr) throw rErr;

        const readSet = new Set((reads || []).map(r => r.notification_id));

        const enriched = (notifications || []).map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            icon: n.icon || iconForType(n.type),
            actionLabel: n.action_label,
            actionData: n.action_data,
            vendorName: n.vendor?.business_name || n.vendor?.name || 'Olfix',
            offerId: n.offer_id,
            bookingId: n.booking_id,
            isPersonal: !!n.target_user_id,
            unread: !readSet.has(n.id),
            createdAt: n.created_at,
            timeAgo: formatTimeAgo(n.created_at),
        }));

        const unreadCount = enriched.filter(n => n.unread).length;

        res.json({ success: true, notifications: enriched, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
};


/**
 * POST /api/user/notifications/mark-read
 * Body: { notificationIds: string[] }  OR  { all: true }
 */
exports.markNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationIds, all } = req.body;

        if (all) {
            // Fetch all relevant notification IDs for this user
            const { data: allNotes } = await supabase
                .from('notifications')
                .select('id')
                .or(`target_user_id.is.null,target_user_id.eq.${userId}`);

            const ids = (allNotes || []).map(n => n.id);
            if (ids.length > 0) {
                await supabase
                    .from('notification_reads')
                    .upsert(
                        ids.map(id => ({ user_id: userId, notification_id: id })),
                        { onConflict: 'user_id,notification_id' }
                    );
            }
        } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
            await supabase
                .from('notification_reads')
                .upsert(
                    notificationIds.map(id => ({ user_id: userId, notification_id: id })),
                    { onConflict: 'user_id,notification_id' }
                );
        }

        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error('Error marking notifications read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark as read' });
    }
};


/**
 * GET /api/user/notifications/unread-count
 * Lightweight — only returns the badge count for the bell icon.
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Count notifications visible to this user (broadcast + personal)
        const { count: total, error: totalErr } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .or(`target_user_id.is.null,target_user_id.eq.${userId}`);

        if (totalErr) throw totalErr;

        // Count how many they've read
        const { count: readCount, error: readErr } = await supabase
            .from('notification_reads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (readErr) throw readErr;

        const unreadCount = Math.max(0, (total || 0) - (readCount || 0));

        res.json({ success: true, unreadCount });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false, unreadCount: 0 });
    }
};


// ─── Internal Helpers — called by other controllers ───────────────────────────

/**
 * Creates a broadcast notification when a vendor/admin posts an offer or job.
 * target_user_id = NULL → delivered to all users.
 */
exports.createOfferNotification = async ({ offerId, vendorId, type, title, description, discountAmount }) => {
    try {
        const isJob = type === 'JOB';
        const notifTitle = isJob ? `💼 New Job Opening: ${title}` : `🎁 New Offer: ${title}`;
        const notifMessage = isJob
            ? `${description || 'A new job opportunity has been posted.'} Compensation: ${discountAmount || 'Negotiable'}`
            : `${description || 'A new offer is available.'} Discount: ${discountAmount || ''}`;

        await supabase.from('notifications').insert({
            type: isJob ? 'JOB' : 'OFFER',
            title: notifTitle,
            message: notifMessage,
            icon: isJob ? '💼' : '🎁',
            offer_id: offerId,
            vendor_id: vendorId || null,
            target_user_id: null, // Broadcast
            action_label: isJob ? 'VIEW JOB →' : 'CLAIM NOW →',
            action_data: { screen: 'Ads', offerId },
        });

        console.log(`[Notifications] Broadcast notification created for ${isJob ? 'job' : 'offer'}: ${title}`);
    } catch (err) {
        console.error('[Notifications] Failed to create offer notification:', err.message);
    }
};

/**
 * Notifies the assigned VENDOR that they received a new booking.
 * target_user_id = vendorId → only vendor sees it.
 */
exports.createBookingNotificationForVendor = async ({ bookingId, vendorId, serviceName, date, timeSlot, userName }) => {
    if (!vendorId) return;
    try {
        await supabase.from('notifications').insert({
            type: 'BOOKING',
            title: '📅 New Booking Received!',
            message: `${userName || 'A customer'} booked ${serviceName} on ${date} at ${timeSlot}. Please confirm.`,
            icon: '📅',
            booking_id: bookingId,
            target_user_id: vendorId, // Personal — vendor only
            action_label: 'VIEW BOOKING →',
            action_data: { screen: 'VendorBookings', bookingId },
        });
        console.log(`[Notifications] New booking notification sent to vendor ${vendorId}`);
    } catch (err) {
        console.error('[Notifications] Failed to notify vendor of booking:', err.message);
    }
};

/**
 * Notifies the USER about a booking status change.
 * target_user_id = userId → only that user sees it.
 */
exports.createBookingStatusNotificationForUser = async ({ bookingId, userId, serviceName, newStatus }) => {
    if (!userId) return;
    try {
        const { icon, title, message, actionLabel } = getStatusNotificationContent(newStatus, serviceName);

        await supabase.from('notifications').insert({
            type: 'BOOKING_UPDATE',
            title,
            message,
            icon,
            booking_id: bookingId,
            target_user_id: userId, // Personal — user only
            action_label: actionLabel,
            action_data: { screen: 'BookingDetail', params: { bookingId } },
        });
        console.log(`[Notifications] Booking status update (${newStatus}) sent to user ${userId}`);
    } catch (err) {
        console.error('[Notifications] Failed to notify user of status change:', err.message);
    }
};


// ─── Utilities ────────────────────────────────────────────────────────────────

function iconForType(type) {
    switch (type) {
        case 'OFFER': return '🎁';
        case 'JOB': return '💼';
        case 'BOOKING': return '📅';
        case 'BOOKING_UPDATE': return '🔄';
        default: return '🔔';
    }
}

function getStatusNotificationContent(status, serviceName) {
    switch (status?.toUpperCase()) {
        case 'ACCEPTED':
            return {
                icon: '✅', title: 'Booking Accepted!',
                message: `Your ${serviceName} booking has been accepted. Your professional is getting ready.`,
                actionLabel: 'VIEW DETAILS →'
            };
        case 'ACTIVE':
        case 'IN_PROGRESS':
            return {
                icon: '🔧', title: 'Service In Progress',
                message: `Your ${serviceName} service has started.`,
                actionLabel: 'VIEW STATUS →'
            };
        case 'COMPLETED':
            return {
                icon: '⭐', title: 'Service Completed!',
                message: `Your ${serviceName} service is done. How was your experience? Leave a review.`,
                actionLabel: 'RATE SERVICE →'
            };
        case 'CANCELLED':
            return {
                icon: '❌', title: 'Booking Cancelled',
                message: `Your ${serviceName} booking has been cancelled. Tap to rebook or contact support.`,
                actionLabel: 'REBOOK →'
            };
        default:
            return {
                icon: '🔔', title: `Booking Update: ${status}`,
                message: `Your ${serviceName} booking status changed to ${status}.`,
                actionLabel: 'VIEW →'
            };
    }
}

function formatTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}
