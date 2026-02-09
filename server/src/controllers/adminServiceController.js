const supabase = require('../config/database');

// 1. Create a New Service Category
const createCategory = async (req, res) => {
    const { name, slug, description, image } = req.body;
    try {
        const { data, error } = await supabase
            .from('service_categories')
            .insert([{ name, slug, description, image }])
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Create a Sub-Service (Service Item)
const createServiceItem = async (req, res) => {
    const { categoryId, name, description, basePrice, imageUrl } = req.body;
    try {
        const { data, error } = await supabase
            .from('service_items')
            .insert([{
                category_id: categoryId,
                name,
                description,
                base_price: basePrice,
                image_url: imageUrl
            }])
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create Service Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. List Service Items by Category
const getServiceItems = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const query = supabase
            .from('service_items')
            .select('*');

        if (categoryId) {
            query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error('Get Service Items Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. Assign Service to Vendor (Vendor Specialization)
const assignServiceToVendor = async (req, res) => {
    const { vendorId, serviceItemId, customPrice } = req.body;
    try {
        const { data, error } = await supabase
            .from('vendor_services')
            .upsert([{
                vendor_id: vendorId,
                service_item_id: serviceItemId,
                custom_price: customPrice
            }])
            .select();

        if (error) throw error;
        res.json({ success: true, message: 'Vendor specialization updated', data });
    } catch (error) {
        console.error('Assign Vendor Service Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createCategory,
    createServiceItem,
    getServiceItems,
    assignServiceToVendor
};
