require('dotenv').config();
const { supabase } = require('../lib/supabase');

async function runSeed() {
    console.log('Starting dummy data seeding via Supabase-JS...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase credentials in environment.');
        return;
    }

    try {
        // 1. Categories
        const categories = [
            { name: 'Cleaning', slug: 'cleaning', image: 'https://img.freepik.com/free-photo/professional-cleaning-service-person-working-apartment_23-2150454452.jpg' },
            { name: 'AC Repair', slug: 'ac-repair', image: 'https://img.freepik.com/free-photo/repairman-fixing-air-conditioner-wall_23-2148171782.jpg' },
            { name: 'Electrician', slug: 'electrician', image: 'https://img.freepik.com/free-photo/electrician-working-house-building_23-2148274937.jpg' },
            { name: 'Plumbing', slug: 'plumbing', image: 'https://img.freepik.com/free-photo/plumber-fixing-sink_23-2148204215.jpg' },
            { name: 'Painting', slug: 'painting', image: 'https://img.freepik.com/free-photo/painter-painting-wall_23-2148813350.jpg' },
            { name: 'Men\'s Salon', slug: 'mens-salon', image: 'https://img.freepik.com/free-photo/man-getting-haircut-barber-shop_23-2148835445.jpg' },
            { name: 'Women\'s Salon', slug: 'womens-salon', image: 'https://img.freepik.com/free-photo/beautiful-woman-gets-facial-massage-beauty-salon_23-2148181283.jpg' },
            { name: 'Carpentry', slug: 'carpentry', image: 'https://img.freepik.com/free-photo/carpenter-working-with-wood_23-2148129532.jpg' }
        ];

        console.log('Upserting categories...');
        const { data: catData, error: catError } = await supabase
            .from('service_categories')
            .upsert(categories, { onConflict: 'slug' })
            .select();

        if (catError) throw catError;
        console.log(`Successfully processed ${catData.length} categories.`);

        const catMap = {};
        catData.forEach(c => catMap[c.slug] = c.id);

        // 2. Service Items - Insert individually to avoid constraint issues if unique index is missing
        const items = [
            { slug: 'cleaning', title: 'Full House Cleaning', title_full: 'Deep Home Cleaning Service (1-2 BHK)', duration: '4-5 hrs', price: '₹2,499', rating: '4.9', image: 'https://img.freepik.com/free-photo/person-cleaning-house_23-2148181395.jpg', color: '#FFF5F5' },
            { slug: 'cleaning', title: 'Kitchen Cleaning', title_full: 'Deep Cleaning of Kitchen Cabinets & Floors', duration: '2-3 hrs', price: '₹999', rating: '4.8', image: 'https://img.freepik.com/free-photo/woman-cleaning-kitchen_23-2148181400.jpg', color: '#F0FFF4' },
            { slug: 'cleaning', title: 'Bathroom Cleaning', title_full: 'Disinfection & Deep Scrubbing of Bathrooms', duration: '1 hr', price: '₹499', rating: '4.7', image: 'https://img.freepik.com/free-photo/cleaning-bathroom_23-2148181405.jpg', color: '#EBF8FF' },
            { slug: 'ac-repair', title: 'AC Service', title_full: 'Filter cleaning & Basic Servicing', duration: '45 min', price: '₹599', rating: '4.9', image: 'https://img.freepik.com/free-photo/repairman-fixing-air-conditioner_23-2148171780.jpg', color: '#EBF8FF' },
            { slug: 'ac-repair', title: 'Installation', title_full: 'Safe Installation of Split or Window AC', duration: '3 hrs', price: '₹1,500', rating: '4.8', image: 'https://img.freepik.com/free-photo/ac-installation_23-2148171790.jpg', color: '#F0FFF4' },
            { slug: 'electrician', title: 'Fan Repair', title_full: 'Ceiling Fan Repair & Capacitor Change', duration: '30 min', price: '₹199', rating: '4.8', image: 'https://img.freepik.com/free-photo/fan-repair_23-2148274940.jpg', color: '#FFF9E6' },
            { slug: 'electrician', title: 'LED Panel Fixing', title_full: 'Concealed LED Light Installation', duration: '45 min', price: '₹149', rating: '4.9', image: 'https://img.freepik.com/free-photo/led-lights_23-2148274950.jpg', color: '#F0F5FF' },
            { slug: 'plumbing', title: 'Tap Leakage', title_full: 'Fixing or Replacing Leaky Faucets', duration: '30 min', price: '₹149', rating: '4.8', image: 'https://img.freepik.com/free-photo/plumbing-tap_23-2148204220.jpg', color: '#EBF8FF' },
            { slug: 'plumbing', title: 'Flush Repair', title_full: 'Toilet Tank Flush Mechanism Fix', duration: '1 hr', price: '₹399', rating: '4.6', image: 'https://img.freepik.com/free-photo/toilet-repair_23-2148204225.jpg', color: '#FFF5F5' },
            { slug: 'mens-salon', title: 'Haircut', title_full: 'Adult Haircut & Styling', duration: '30 min', price: '₹199', rating: '4.9', image: 'https://img.freepik.com/free-photo/haircut-men_23-2148835450.jpg', color: '#F5F5F5' },
            { slug: 'mens-salon', title: 'Shave & Trim', title_full: 'Classic Shave or Beard Trim', duration: '20 min', price: '₹99', rating: '4.8', image: 'https://img.freepik.com/free-photo/beard-trim_23-2148835455.jpg', color: '#F0F4FF' },
            { slug: 'womens-salon', title: 'Facial', title_full: 'Herbal or Fruit Facial', duration: '1 hr', price: '₹799', rating: '4.8', image: 'https://img.freepik.com/free-photo/facial-women_23-2148181285.jpg', color: '#FFF5F7' },
            { slug: 'womens-salon', title: 'Manicure', title_full: 'Classic Hand Care & Polish', duration: '45 min', price: '₹499', rating: '4.7', image: 'https://img.freepik.com/free-photo/manicure_23-2148181290.jpg', color: '#F5F0FF' }
        ];

        console.log('Inserting service items...');
        for (const item of items) {
            const categoryId = catMap[item.slug];
            if (!categoryId) continue;

            const { slug, ...itemData } = item;
            itemData.category_id = categoryId;

            // Check if item exists
            const { data: existing } = await supabase
                .from('service_items')
                .select('id')
                .eq('category_id', categoryId)
                .eq('title', item.title)
                .single();

            if (existing) {
                await supabase.from('service_items').update(itemData).eq('id', existing.id);
            } else {
                await supabase.from('service_items').insert(itemData);
            }
        }

        console.log('✅ Seeding completed successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    }
}

runSeed();
