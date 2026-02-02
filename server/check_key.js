const key = 'sb_publishable_Soz4hwm5PjJVGUuGnpmt_w_Uou-WkWJ';

if (key.startsWith('sb_publishable_')) {
    console.log('Key format: Custom/Opaque (starts with sb_publishable_)');
    console.log('Is Standard Supabase JWT: NO');
} else {
    const parts = key.split('.');
    if (parts.length === 3) {
        console.log('Key format: JWT structure detected');
        try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            console.log('Payload:', JSON.stringify(payload, null, 2));
        } catch (e) {
            console.log('Error decoding payload:', e.message);
        }
    } else {
        console.log('Key format: Unknown');
        console.log('Is Standard Supabase JWT: NO');
    }
}
