require('dotenv').config();
const supabase = require('./src/config/database');

async function testNotifs() {
    try {
        console.log('Testing notifications table access...');

        // 1. Insert dummy notification (system type)
        /*
        const { data: inserted, error: insErr } = await supabase
            .from('notifications')
            .insert({ type: 'SYSTEM', title: 'Test', message: 'Test message' })
            .select()
            .single();
        
        if (insErr) {
            console.error('Insert failed:', insErr);
        } else {
            console.log('Insert success:', inserted.id);
        }
        */

        // 2. Count
        const { count, error: countErr } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true });

        if (countErr) {
            console.error('Count failed:', countErr);
            if (countErr.code === '42P01') {
                console.error('Table "notifications" does not exist! Migration failed?');
            }
        } else {
            console.log('Table "notifications" exists. Count:', count);
        }

        const { count: readsCount, error: readsErr } = await supabase
            .from('notification_reads')
            .select('*', { count: 'exact', head: true });

        if (readsErr) {
            console.error('Reads Count failed:', readsErr);
        } else {
            console.log('Table "notification_reads" exists. Count:', readsCount);
        }


    } catch (err) {
        console.error('Test crashed:', err);
    }
}

testNotifs();
