require('dotenv').config();
const { supabase } = require('./src/lib/supabase');

async function checkBookingTable() {
    console.log('--- Checking Bookings Table ---');
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching from bookings:', error);
    } else {
        console.log('Successfully connected to bookings table.');
        if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, cannot determine columns this way.');
        }
    }
}

checkBookingTable();
