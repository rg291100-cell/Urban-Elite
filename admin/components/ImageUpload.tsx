'use client';

import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ImageUploadProps {
    value: string | null;            // Current image URL
    onChange: (url: string) => void; // Called with the public URL after upload
    bucket?: string;                 // Storage bucket (default: 'service-icons')
    folder?: string;                 // Sub-folder inside bucket (default: 'icons')
    label?: string;
    hint?: string;
}

export default function ImageUpload({
    value,
    onChange,
    bucket = 'service-icons',
    folder = 'icons',
    label = 'Icon Image',
    hint = 'PNG, JPG, WebP, SVG — max 2 MB',
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError('File too large — maximum 2 MB');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const ext = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { data, error: uploadErr } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, { upsert: true });

            if (uploadErr) {
                setError(uploadErr.message);
                return;
            }

            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
            onChange(urlData.publicUrl);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            <div
                className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer
                    ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/40'}
                    ${value ? 'border-solid border-gray-200 bg-gray-50' : ''}`}
                onClick={() => !uploading && fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {value ? (
                    /* Preview */
                    <div className="flex items-center gap-4 p-3">
                        <img
                            src={value}
                            alt="Icon preview"
                            className="w-16 h-16 object-contain rounded-lg bg-white border border-gray-200 p-1"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">Icon uploaded</p>
                            <p className="text-xs text-gray-400 truncate">{value.split('/').pop()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                            >
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Drop zone */
                    <div className="flex flex-col items-center justify-center py-8 px-4 gap-2">
                        {uploading ? (
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        ) : (
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6 text-blue-500" />
                            </div>
                        )}
                        <p className="text-sm font-medium text-gray-700">
                            {uploading ? 'Uploading…' : 'Click or drag & drop to upload'}
                        </p>
                        <p className="text-xs text-gray-400">{hint}</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" /> {error}
                </p>
            )}

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}
