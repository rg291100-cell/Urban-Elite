import { supabase } from '../lib/supabase';
// @ts-ignore
import { decode } from 'base64-arraybuffer';

export interface UploadResult {
    url: string | null;
    error: string | null;
}

export const storageService = {
    /**
     * Upload an image to Supabase Storage
     * @param bucket Bucket name (e.g. 'kyc-documents')
     * @param path File path in bucket (e.g. 'aadhaar/user-uuid-123.jpg')
     * @param base64 Base64 string of the image
     * @param contentType Content type (e.g. 'image/jpeg')
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
                console.error('Upload error:', error);
                return { url: null, error: error.message };
            }

            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return { url: publicUrlData.publicUrl, error: null };
        } catch (error: any) {
            console.error('Storage service catch error:', error);
            return { url: null, error: error.message };
        }
    }
};
