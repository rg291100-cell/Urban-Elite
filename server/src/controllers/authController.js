const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Register new user
exports.register = async (req, res) => {
    try {
        const {
            name, email, phone, password, role,
            serviceCategory, businessName, businessAddress, experienceYears,
            aadhaarUrl, panUrl
        } = req.body;

        console.log('Registration Request Body:', req.body); // DEBUG
        console.log('Role received:', role); // DEBUG

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required'
            });
        }

        // Validate role
        const userRole = role && (role === 'VENDOR' || role === 'USER') ? role : 'USER';

        // Validate vendor-specific fields
        if (userRole === 'VENDOR') {
            if (!serviceCategory || !businessName || !businessAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Service category, business name, and business address are required for vendors'
                });
            }
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare user data
        const userData = {
            name,
            email,
            phone: phone || null,
            password: hashedPassword,
            role: userRole,
            is_premium: false,
            approval_status: userRole === 'VENDOR' ? 'PENDING' : 'APPROVED'
        };

        // Add vendor-specific fields if vendor
        if (userRole === 'VENDOR') {
            userData.service_category = serviceCategory;
            userData.business_name = businessName;
            userData.business_address = businessAddress;
            userData.experience_years = experienceYears ? parseInt(experienceYears) : null;
            userData.aadhaar_url = aadhaarUrl || null;
            userData.pan_url = panUrl || null;
        }

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

        if (error) throw error;

        // For vendors, don't generate token - they need approval first
        if (userRole === 'VENDOR') {
            return res.status(201).json({
                success: true,
                message: 'Vendor registration successful! Your account is pending admin approval.',
                requiresApproval: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    approvalStatus: user.approval_status
                }
            });
        }

        // For regular users, generate token and allow immediate login
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                walletBalance: '₹0'
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register user'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check approval status for vendors
        if (user.role === 'VENDOR') {
            if (user.approval_status === 'PENDING') {
                return res.status(403).json({
                    success: false,
                    error: 'Your account is pending approval from admin. Please wait for approval.',
                    approvalStatus: 'PENDING'
                });
            }
            if (user.approval_status === 'REJECTED') {
                return res.status(403).json({
                    success: false,
                    error: 'Your account has been rejected. Please contact support for more information.',
                    approvalStatus: 'REJECTED'
                });
            }
        }

        // Generate JWT token with role
        // Use runtime process.env check to ensure consistency with middleware
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        console.log('DEBUG: Login Signing Secret:', secret.substring(0, 5) + '...');
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isPremium: user.is_premium,
                walletBalance: user.wallet_balance || '₹0',
                approvalStatus: user.approval_status
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        // req.user from authMiddleware (Supabase User)
        // If checking against custom table:
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, phone')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                ...user,
                walletBalance: user.wallet_balance || '₹0'
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Check if user exists
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                error: 'User with this email not found'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Save OTP to user record
        const { error: updateError } = await supabase
            .from('users')
            .update({
                reset_otp: otp,
                reset_otp_expires_at: expiresAt
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // SIMULATE SENDING EMAIL
        console.log(`[EMAIL SIMULATION] Sending OTP ${otp} to ${email}`);

        // In a real application, you would use a service like NodeMailer, SendGrid, or AWS SES
        // For development, we'll return the success status 
        // We also return the OTP in the response ONLY for testing/demo convenience
        res.json({
            success: true,
            message: 'OTP sent successfully to your email',
            otp: process.env.NODE_ENV === 'production' ? undefined : otp // Only return in dev
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process forgot password request'
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Email and OTP are required'
            });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, reset_otp, reset_otp_expires_at')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.reset_otp !== otp) {
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP'
            });
        }

        if (new Date(user.reset_otp_expires_at) < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'OTP has expired'
            });
        }

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify OTP'
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Email, OTP, and new password are required'
            });
        }

        // Verify OTP again (security measure)
        const { data: user, error } = await supabase
            .from('users')
            .select('id, reset_otp, reset_otp_expires_at')
            .eq('email', email)
            .single();

        if (error || !user || user.reset_otp !== otp || new Date(user.reset_otp_expires_at) < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password: hashedPassword,
                reset_otp: null,
                reset_otp_expires_at: null
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset password'
        });
    }
};
