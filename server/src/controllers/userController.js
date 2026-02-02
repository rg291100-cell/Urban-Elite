const supabase = require('../config/database');

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            console.error('Supabase error:', error);
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            isPremium: user.is_premium, // Map from snake_case to camelCase
            walletBalance: '₹0'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get User Wallet
const getUserWallet = async (req, res) => {
    try {
        // Fetch users, transactions, and promos (mocking relations for now as join queries are different in Supabase JS)
        // Ideally we fetch them separately or use foreign key joins if setup
        const { data: user, error } = await supabase
            .from('users')
            .select('*, transactions(*), promos(*)')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            balance: '₹0',
            transactions: user.transactions || [],
            promos: user.promos || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update User Profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, location } = req.body;
        const { data: user, error } = await supabase
            .from('users')
            .update({ name, email, phone, location })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ ...user, walletBalance: '₹0' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Address Management
const getAddresses = async (req, res) => {
    try {
        const { data: addresses, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', req.user.id); // Assuming column name is user_id

        if (error) throw error;
        res.json(addresses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addAddress = async (req, res) => {
    try {
        const { type, address, isDefault } = req.body;
        const { data: newAddr, error } = await supabase
            .from('addresses')
            .insert({
                user_id: req.user.id,
                type,
                address,
                is_default: isDefault
            })
            .select()
            .single();

        if (error) throw error;
        res.json(newAddr);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Payment Methods
const getPaymentMethods = async (req, res) => {
    try {
        const { data: methods, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json(methods);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addPaymentMethod = async (req, res) => {
    try {
        const { type, label, detail } = req.body;
        const { data: method, error } = await supabase
            .from('payment_methods')
            .insert({
                user_id: req.user.id,
                type,
                label,
                detail
            })
            .select()
            .single();

        if (error) throw error;
        res.json(method);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deletePaymentMethod = async (req, res) => {
    try {
        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Wallet Topup
const topupWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        let addAmount = parseFloat(amount);

        const { error } = await supabase
            .from('transactions')
            .insert({
                user_id: req.user.id,
                title: 'Wallet Top-up',
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                tag: 'PAYMENT',
                amount: `+₹${addAmount}`,
                type: 'credit',
                icon: '⬇️'
            });

        if (error) throw error;

        res.json({ message: 'Topup Successful', balance: `₹${addAmount}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Notification Settings
const getNotificationSettings = async (req, res) => {
    try {
        let { data: settings, error } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (!settings) {
            // Create default
            const { data: newSettings, error: createError } = await supabase
                .from('notification_settings')
                .insert({ user_id: req.user.id })
                .select()
                .single();
            settings = newSettings;
        }

        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateNotificationSettings = async (req, res) => {
    try {
        const { data: settings, error } = await supabase
            .from('notification_settings')
            .upsert({ user_id: req.user.id, ...req.body })
            .select()
            .single();

        if (error) throw error;
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get User Bookings
const getUserBookings = async (req, res) => {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', req.user.id);

        if (error) throw error;

        // Group by status
        const upcoming = bookings.filter(b => b.status === 'Upcoming');
        const completed = bookings.filter(b => b.status === 'Completed');
        const cancelled = bookings.filter(b => b.status === 'Cancelled');

        res.json({
            upcoming,
            completed,
            cancelled
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUserProfile, updateProfile,
    getUserWallet, topupWallet,
    getUserBookings,
    getAddresses, addAddress, deleteAddress,
    getPaymentMethods, addPaymentMethod, deletePaymentMethod,
    getNotificationSettings, updateNotificationSettings
};
