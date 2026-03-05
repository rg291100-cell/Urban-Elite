import { supabase } from '../lib/supabase';
// @ts-ignore
import { decode } from 'base64-arraybuffer';

export interface UploadResult {
    url: string | null;
    error: string | null;
}

export const storageService = {
    /**
     * Upload a file to Supabase Storage.
     * NOTE: Buckets must already exist (created via SQL migration in Supabase dashboard).
     *       Do NOT try to auto-create buckets from the client — it will fail with RLS errors.
     *
     * @param bucket  Bucket name (e.g. 'kyc-documents', 'profile-images')
     * @param path    File path within bucket (e.g. 'aadhaar/user-uuid-123.jpg')
     * @param base64  Base64 string of the file content
     * @param contentType  MIME type (e.g. 'image/jpeg', 'application/pdf')
     */
    uploadFile: async (
        bucket: string,
        path: string,
        base64: string,
        contentType: string
    ): Promise<UploadResult> => {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, decode(base64), {
                    contentType,
                    upsert: true,
                });

            if (error) {
                console.error(`Upload error (bucket: ${bucket}):`, error);
                return { url: null, error: error.message };
            }

            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return { url: publicUrlData.publicUrl, error: null };
        } catch (error: any) {
            console.error('Storage service error:', error);
            return { url: null, error: error.message };
        }
    },
};
