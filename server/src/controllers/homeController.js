const supabase = require('../config/database');

// Get Home Data
const getHomeData = async (req, res) => {
    try {
        console.log('Home Controller: Fetching home data...');
        const { data: services, error } = await supabase
            .from('service_categories')
            .select('id, name, image, slug');

        if (error) {
            console.error('Home Controller DB Error:', error);
            throw error;
        }

        console.log(`Home Controller: Found ${services?.length} services`);

        res.json({
            services: services,
            banners: [],
            offers: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Service Categories (for Vendor Registration)
const getServiceCategories = async (req, res) => {
    try {
        const { data: categories, error } = await supabase
            .from('service_categories')
            .select('*');

        if (error) throw error;

        res.json({
            success: true,
            categories: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
};

// Get Service Details
const getServiceDetails = async (req, res) => {
    const { type } = req.params;

    try {
        // Fetch category with nested services and Mock filters
        // Relation: One Category -> Many service_items
        // We need to fetch service_items where category_id matches.

        // Step 1: Get Category by Slug
        const { data: category, error: catError } = await supabase
            .from('service_categories')
            .select('*')
            .eq('slug', type)
            .single();

        if (catError || !category) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Step 2: Get Service items for this category
        const { data: services, error: servError } = await supabase
            .from('service_items')
            .select('*')
            .eq('category_id', category.id);

        if (servError) throw servError;

        // Mock filters or fetch from a filters table if it exists
        // Assuming filters are static or fetched from a separate table if user added it
        // The previous code implied a 'one-to-many' relation `filters`. Use mock if not found.
        const filters = ['ALL', 'RECOMMENDED'];

        const response = {
            filters: filters,
            services: services
        };
        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Service Item Detail (with augmented mock data)
const getServiceDetailById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: service, error } = await supabase
            .from('service_items')
            .select('*, service_categories(name, slug)')
            .eq('id', id)
            .single();

        if (error || !service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Augment with detailed data
        const augmentedService = {
            ...service,
            category: service.service_categories,
            titleFull: service.title_full || service.title,
            isImage: service.is_image,
            provider: {
                name: 'Expert',
                surname: 'Professional',
                image: 'https://img.freepik.com/free-photo/portrait-handsome-young-man-with-crossed-arms_23-2148464103.jpg',
                rating: '4.9',
                services: '1,240 SERVICES',
                verified: true
            },
            specifications: service.description || `Professional ${service.title} service. Our certified experts ensure top-quality results using premium tools and safe practices. Guaranteed satisfaction with post-service support.`,
            features: [
                'Certified Professional',
                'Insurance Covered',
                '100% Guaranteed',
                'Post-Service Support'
            ],
            reviews: []
        };
        res.json(augmentedService);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getHomeData, getServiceDetails, getServiceDetailById, getServiceCategories };
