const { supabase } = require('../lib/supabase');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Supabase auth error:', error);
            throw new Error('Invalid token');
        }

        // Attach user info to request
        req.user = user;
        req.user.id = user.id; // Ensure ID is accessible

        // Note: Supabase user metadata is in user.user_metadata
        // req.user.name = user.user_metadata.name;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

module.exports = authMiddleware;
