const { supabase } = require('../lib/supabase');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth middleware: No token provided - returning 401');
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }


        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token using JWT_SECRET
        // This matches the signing logic in authController.js
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        console.log('DEBUG: Middleware Verify Secret:', secret.substring(0, 5) + '...');
        console.log('DEBUG: Middleware Token:', token.substring(0, 5) + '...' + token.substring(token.length - 5));
        const decoded = jwt.verify(token, secret);

        // Attach user info to request
        // The token payload contains: { userId: user.id, email: user.email, role: user.role }
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            error: `Invalid or expired token: ${error.message}`
        });
    }
};

module.exports = authMiddleware;
