const supabase = require('../config/database');

/**
 * GET /api/user/notifications
 * Returns all global notifications, enriched with read status for the calling user.
 * Also returns the unread count.
 */
exports.getUserNotifications = async (req, res) => {
    try {
        console.log('GET /notifications hit for user:', req.user.id);
        const userId = req.user.id;

        // Fetch all notifications (newest first), max 50
        const { data: notifications, error: nErr } = await supabase
            .from('notifications')
            .select('*, vendor:users!notifications_vendor_id_fkey(name, business_name)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (nErr) throw nErr;

        // Fetch which of these the user has already read
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
            icon: n.icon || (n.type === 'OFFER' ? '🎁' : n.type === 'JOB' ? '💼' : '🔔'),
            actionLabel: n.action_label,
            actionData: n.action_data,
            vendorName: n.vendor?.business_name || n.vendor?.name || 'Urban Elite',
            offerId: n.offer_id,
            unread: !readSet.has(n.id),
            createdAt: n.created_at,
            timeAgo: formatTimeAgo(n.created_at),
        }));

        const unreadCount = enriched.filter(n => n.unread).length;

        res.json({
            success: true,
            notifications: enriched,
            unreadCount,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
};


/**
 * POST /api/user/notifications/mark-read
 * Body: { notificationIds: string[] }  OR  { all: true } to mark everything read
 */
exports.markNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationIds, all } = req.body;

        if (all) {
            // Fetch all notification IDs first
            const { data: allNotes } = await supabase
                .from('notifications')
                .select('id');

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
 * Lightweight endpoint used to show the badge on the bell icon.
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log('GET /notifications/unread-count hit for user:', userId);

        // Total notifications
        const { count: total, error: totalErr } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true });

        if (totalErr) {
            console.error('Error fetching total notifications:', totalErr);
            throw totalErr;
        }


        // How many the user has read
        // How many the user has read
        const { count: readCount, error: readErr } = await supabase
            .from('notification_reads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (readErr) {
            console.error('Error fetching read count:', readErr);
            throw readErr;
        }

        console.log(`Unread count calculation: Total=${total}, Read=${readCount}`);


        const unreadCount = Math.max(0, (total || 0) - (readCount || 0));

        res.json({ success: true, unreadCount });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false, unreadCount: 0 });
    }
};

// ─── Internal helper — called by offersController after inserting an offer ────
/**
 * Creates a notification entry for a newly posted offer or job opening.
 * Not an HTTP handler — called directly from offersController.
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
            action_label: isJob ? 'VIEW JOB →' : 'CLAIM NOW →',
            action_data: { screen: 'Ads', offerId },
        });

        console.log(`[Notifications] Created notification for ${isJob ? 'job' : 'offer'}: ${title}`);
    } catch (err) {
        // Non-fatal — don't block the offer creation
        console.error('[Notifications] Failed to create notification:', err.message);
    }
};

// ─── Utility ──────────────────────────────────────────────────────────────────
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
