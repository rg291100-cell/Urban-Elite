require('dotenv').config({ path: '.env' });
const { supabase } = require('../lib/supabase');

async function checkTransactions() {
    console.log('Checking transactions and user table...');

    // CHECK USER COLUMNS
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (userError) {
        console.error('User Select Error:', userError);
    } else {
        console.log('User Table Sample:', user);
    }

    // WRITE TEST
    const testUserId = '9dac2b1c-f76a-467c-b385-53fe82d4faa0'; // Existing ID
    const { data: insertData, error: insertError } = await supabase
        .from('transactions')
        .insert({
            user_id: testUserId,
            amount: 1.00,
            type: 'debit',
            title: 'Test Script Transaction #' + Date.now(),
            tag: 'TEST',
            date: new Date().toISOString()
        })
        .select();

    if (insertError) {
        console.error('WRITE TEST FAILED:', insertError);
    } else {
        console.log('WRITE TEST SUCCESS:', insertData);
    }

    // Check count
    const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error getting count:', countError);
    } else {
        console.log('Total Transactions Count:', count);
    }

    // Get last 20
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching transactions:', error);
    } else {
        console.log('Last 5 transactions:', JSON.stringify(data, null, 2));
    }
}

checkTransactions();
