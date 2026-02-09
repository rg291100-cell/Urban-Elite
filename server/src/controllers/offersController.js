const supabase = require('../config/database');

// Get all active offers
exports.getOffers = async (req, res) => {
    try {
        const { data: offers, error } = await supabase
            .from('offers')
            .select('*, vendor:users!offers_vendor_id_fkey(business_name, business_address)') // Join vendor details
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: offers || []
        });
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch offers'
        });
    }
};

// Create a new offer
exports.createOffer = async (req, res) => {
    try {
        const { title, description, discountAmount, discountCode, serviceId, validUntil, imageUrl } = req.body;
        const userId = req.user.id;
        const role = req.user.role;

        // Only VENDOR or ADMIN can create offers
        if (role !== 'VENDOR' && role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        const offerData = {
            title,
            description,
            discount_amount: discountAmount,
            discount_code: discountCode,
            service_id: serviceId || null,
            vendor_id: role === 'VENDOR' ? userId : null, // Admin offers have null vendor_id (or could be specific)
            valid_until: validUntil,
            image_url: imageUrl,
            status: 'ACTIVE',
            type: req.body.type || 'PROMOTION' // PROMOTION or JOB
        };

        const { data: offer, error } = await supabase
            .from('offers')
            .insert(offerData)
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Offer created successfully',
            data: offer
        });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create offer'
        });
    }
};

// Get Vendor's own offers
exports.getVendorOffers = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const { data: offers, error } = await supabase
            .from('offers')
            .select('*')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: offers || []
        });
    } catch (error) {
        console.error('Error fetching vendor offers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch offers'
        });
    }
};
