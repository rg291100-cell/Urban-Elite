const supabase = require('../config/database');

// Get messages for a booking
exports.getMessages = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id; // Check if user is part of booking? (Security enhancement)

        // Ideally verification: booking exists AND (user_id == userId OR vendor_id == userId)
        // For now, fetching messages directly.

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            data: messages || []
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch messages'
        });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Message content is required'
            });
        }

        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                booking_id: bookingId,
                sender_id: senderId,
                content
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
};
