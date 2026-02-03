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
            serviceCategory, businessName, businessAddress, experienceYears
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
                walletBalance: '₹0'
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
