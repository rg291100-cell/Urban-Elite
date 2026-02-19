const supabase = require('../config/database');

/**
 * GET /api/home/vendors
 * Returns approved vendors optionally filtered by service category name or slug.
 * Used by the mobile app's VendorSelectionScreen during booking.
 *
 * Query params:
 *   categoryName  (string) – e.g. "AC Repair"
 *   categorySlug  (string) – e.g. "ac-repair" (alternative)
 *   serviceItemId (string) – future: filter by specific service item
 *   limit         (number) – default 20
 */
exports.getVendorsForService = async (req, res) => {
    try {
        const { categoryName, categorySlug, limit = 20 } = req.query;

        let query = supabase
            .from('users')
            .select(
                'id, name, email, phone, profile_image, business_name, service_category, ' +
                'experience_years, vendor_rating, total_jobs, total_reviews, specialty, approval_status'
            )
            .eq('role', 'VENDOR')
            .eq('approval_status', 'APPROVED')
            .order('vendor_rating', { ascending: false })
            .limit(parseInt(limit));

        // Filter by category name (case-insensitive match)
        if (categoryName) {
            query = query.ilike('service_category', `%${categoryName}%`);
        } else if (categorySlug) {
            // Convert slug to approximate name match
            const nameFromSlug = categorySlug.replace(/-/g, ' ');
            query = query.ilike('service_category', `%${nameFromSlug}%`);
        }

        const { data: vendors, error } = await query;

        if (error) throw error;

        // Compute specialized tag from experience + jobs
        const enriched = (vendors || []).map(v => {
            const jobs = v.total_jobs || 0;
            const exp = v.experience_years || 0;
            let specialtyLabel = v.specialty || 'Professional';
            if (jobs >= 300 || exp >= 5) specialtyLabel = 'Expert';
            else if (jobs >= 100 || exp >= 3) specialtyLabel = 'Professional';
            else if (jobs >= 30 || exp >= 1) specialtyLabel = 'Standard';
            else specialtyLabel = 'New';

            return {
                id: v.id,
                name: v.name || v.business_name || 'Professional',
                image: v.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name || 'P')}&background=random&size=200`,
                rating: parseFloat(v.vendor_rating) || 4.5,
                reviews: v.total_reviews || 0,
                jobs: v.total_jobs || 0,
                verified: true, // All APPROVED vendors are verified
                specialty: specialtyLabel,
                businessName: v.business_name,
                serviceCategory: v.service_category,
                experienceYears: v.experience_years || 0,
                phone: v.phone,
            };
        });

        res.json({
            success: true,
            vendors: enriched,
            total: enriched.length
        });
    } catch (error) {
        console.error('Error fetching vendors for service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vendors'
        });
    }
};

/**
 * GET /api/home/vendors/:id
 * Returns a single vendor's public profile by user ID.
 */
exports.getVendorProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: vendor, error } = await supabase
            .from('users')
            .select(
                'id, name, email, phone, profile_image, business_name, service_category, ' +
                'experience_years, vendor_rating, total_jobs, total_reviews, specialty, business_address'
            )
            .eq('id', id)
            .eq('role', 'VENDOR')
            .eq('approval_status', 'APPROVED')
            .single();

        if (error || !vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        const jobs = vendor.total_jobs || 0;
        const exp = vendor.experience_years || 0;
        let specialtyLabel = vendor.specialty || 'Professional';
        if (jobs >= 300 || exp >= 5) specialtyLabel = 'Expert';
        else if (jobs >= 100 || exp >= 3) specialtyLabel = 'Professional';
        else if (jobs >= 30 || exp >= 1) specialtyLabel = 'Standard';
        else specialtyLabel = 'New';

        res.json({
            success: true,
            vendor: {
                id: vendor.id,
                name: vendor.name || vendor.business_name || 'Professional',
                image: vendor.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.name || 'P')}&background=random&size=200`,
                rating: parseFloat(vendor.vendor_rating) || 4.5,
                reviews: vendor.total_reviews || 0,
                jobs: vendor.total_jobs || 0,
                verified: true,
                specialty: specialtyLabel,
                businessName: vendor.business_name,
                serviceCategory: vendor.service_category,
                businessAddress: vendor.business_address,
                experienceYears: vendor.experience_years || 0,
                phone: vendor.phone,
            }
        });
    } catch (error) {
        console.error('Error fetching vendor profile:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch vendor profile' });
    }
};
