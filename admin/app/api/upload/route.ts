import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Missing Supabase env vars for upload');
        return NextResponse.json(
            { error: 'Server misconfiguration: missing storage credentials' },
            { status: 500 }
        );
    }

    // Create client inside handler — avoids build-time crash if env vars aren't set at init
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const bucket = (formData.get('bucket') as string) || 'service-icons';
        const folder = (formData.get('folder') as string) || 'icons';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large — maximum 2 MB' }, { status: 400 });
        }

        const ext = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadErr } = await supabaseAdmin.storage
            .from(bucket)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadErr) {
            console.error('Supabase upload error:', uploadErr);
            return NextResponse.json({ error: uploadErr.message }, { status: 500 });
        }

        const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (err: any) {
        console.error('Upload API error:', err);
        return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
    }
}
