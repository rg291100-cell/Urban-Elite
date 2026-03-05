import { supabase } from '../lib/supabase';
// @ts-ignore
import { decode } from 'base64-arraybuffer';

export interface UploadResult {
    url: string | null;
    error: string | null;
}

const ensureBucketExists = async (bucket: string): Promise<string | null> => {
    try {
        // Check if bucket exists by listing buckets
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
            console.warn('Could not list buckets:', listError.message);
            // Continue anyway — maybe the bucket exists but we couldn't verify
            return null;
        }

        const exists = buckets?.some((b) => b.name === bucket);
        if (!exists) {
            // Attempt to create the bucket (public so we can get public URLs)
            const { error: createError } = await supabase.storage.createBucket(bucket, {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
                fileSizeLimit: 10485760, // 10MB
            });

            if (createError) {
                // If creation fails (e.g. insufficient permissions), return the error message
                return createError.message;
            }
        }
        return null;
    } catch (err: any) {
        console.warn('ensureBucketExists error:', err);
        return null; // Non-fatal – proceed with the upload attempt
    }
};

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
            // Ensure the bucket exists before uploading
            const bucketError = await ensureBucketExists(bucket);
            if (bucketError) {
                return {
                    url: null,
                    error: `Storage bucket "${bucket}" could not be created: ${bucketError}. Please contact support.`,
                };
            }

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
