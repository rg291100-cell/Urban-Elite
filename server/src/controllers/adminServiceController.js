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

// 2. Manage Sub-Categories (Level 2)
const createSubCategory = async (req, res) => {
    const { categoryId, name, slug, description, image } = req.body;
    try {
        const { data, error } = await supabase
            .from('service_subcategories')
            .insert([{ category_id: categoryId, name, slug, description, image }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create SubCategory Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getSubCategories = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const { data, error } = await supabase
            .from('service_subcategories')
            .select('*')
            .eq('category_id', categoryId);

        if (error) throw error;
        res.json({ success: true, count: data?.length || 0, data });
    } catch (error) {
        console.error('Get SubCategories Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, image } = req.body;
    try {
        const updates = {};
        if (name) {
            updates.name = name;
            updates.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        if (description !== undefined) updates.description = description;
        if (image !== undefined) updates.image = image;

        const { data, error } = await supabase
            .from('service_subcategories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, message: 'Subcategory updated', data });
    } catch (error) {
        console.error('Update SubCategory Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteSubCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('service_subcategories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Subcategory deleted' });
    } catch (error) {
        console.error('Delete SubCategory Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// 3. Manage Service Items (Level 3 - Listings)
// Renamed from createServiceItem to be specific to Level 3, but keeping old for legacy reference or update it.
// I'll update the existing createServiceItem to handle subcategories.
const createServiceItem = async (req, res) => {
    // Supports both legacy category link (if any) or new subcategory link
    const { categoryId, subCategoryId, name, title, description, price, basePrice, imageUrl, image, duration } = req.body;

    // Normalize fields based on schema (title, price, image) vs inputs
    const itemData = {
        title: title || name,
        price: price || basePrice, // Text field in DB
        image: image || imageUrl,
        description: description,
        duration: duration,
        // If subCategoryId is provided, use it. Else use categoryId (legacy or if strict hierarchy not enforced)
        subcategory_id: subCategoryId || null,
        category_id: categoryId || null
    };

    try {
        const { data, error } = await supabase
            .from('service_items')
            .insert([itemData])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create Service Item Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// List Items by SubCategory
const getServiceListing = async (req, res) => {
    const { subCategoryId } = req.params;
    try {
        const { data, error } = await supabase
            .from('service_items')
            .select('*')
            .eq('subcategory_id', subCategoryId);

        if (error) throw error;
        res.json({ success: true, count: data?.length || 0, data });
    } catch (error) {
        console.error('Get Listing Error:', error);
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

// Backward Compatibility: List Service Items by Category (Level 2 view, or deprecated)
const getServiceItems = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const { data, error } = await supabase
            .from('service_items')
            .select('*')
            // Items might now be linked to subcategory_id, not category_id. 
            // So queries by category_id might return empty unless we join or data is dual-linked.
            // For now, let's try querying by category_id directly (legacy data)
            .eq('category_id', categoryId);

        if (error) throw error;
        res.json({ success: true, count: data?.length || 0, data });
    } catch (error) {
        console.error('Get Service Items Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createCategory,
    createSubCategory,
    getSubCategories,
    updateSubCategory,
    deleteSubCategory,
    createServiceItem,
    getServiceListing,
    getServiceItems,
    assignServiceToVendor
};
