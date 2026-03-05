'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import {
    Plus, Trash2, X, ImageIcon, Video, Tag, Briefcase,
    ToggleLeft, ToggleRight, Loader2, Eye, EyeOff,
} from 'lucide-react';

interface Offer {
    id: string;
    title: string;
    description: string;
    discount_amount: string;
    discount_code: string;
    image_url: string | null;
    media_urls: string[];
    valid_until: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    type: 'PROMOTION' | 'JOB';
    created_at: string;
    vendor?: { name: string; business_name: string; email: string } | null;
}

const BUCKET = 'offer-media';

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'PROMOTION' | 'JOB'>('ALL');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        type: 'PROMOTION' as 'PROMOTION' | 'JOB',
        title: '',
        description: '',
        discountAmount: '',
        discountCode: '',
        validUntil: '',
    });

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await adminAPI.getOffers();
            setOffers(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const combined = [...mediaFiles, ...files].slice(0, 5);
        setMediaFiles(combined);
        const previews = combined.map(f => URL.createObjectURL(f));
        setMediaPreviews(previews);
    };

    const removeMedia = (index: number) => {
        const updated = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(updated);
        setMediaPreviews(updated.map(f => URL.createObjectURL(f)));
    };

    const uploadMediaToSupabase = async (files: File[]): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of files) {
            const ext = file.name.split('.').pop();
            const path = `admin/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
                contentType: file.type,
                upsert: true,
            });
            if (error) {
                console.error('Upload error:', error.message);
                continue;
            }
            const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
            if (urlData?.publicUrl) urls.push(urlData.publicUrl);
        }
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.discountAmount) {
            alert('Title and Amount/Compensation are required.');
            return;
        }
        setSubmitting(true);
        try {
            let mediaUrls: string[] = [];
            if (mediaFiles.length > 0) {
                setUploadingMedia(true);
                mediaUrls = await uploadMediaToSupabase(mediaFiles);
                setUploadingMedia(false);
            }

            await adminAPI.createOffer({
                ...form,
                imageUrl: mediaUrls[0] || '',
                mediaUrls,
                validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
            });

            setShowForm(false);
            setForm({ type: 'PROMOTION', title: '', description: '', discountAmount: '', discountCode: '', validUntil: '' });
            setMediaFiles([]);
            setMediaPreviews([]);
            fetchOffers();
        } catch (err) {
            console.error(err);
            alert('Failed to create offer. Check console for details.');
        } finally {
            setSubmitting(false);
            setUploadingMedia(false);
        }
    };

    const toggleStatus = async (offer: Offer) => {
        const newStatus = offer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await adminAPI.updateOffer(offer.id, { status: newStatus });
            setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;
        try {
            await adminAPI.deleteOffer(id);
            setOffers(prev => prev.filter(o => o.id !== id));
        } catch (err) {
            alert('Failed to delete offer.');
        }
    };

    const filteredOffers = filter === 'ALL' ? offers : offers.filter(o => o.type === filter);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Offers & Ads</h1>
                        <p className="text-gray-600 mt-1">Manage promotional ads and job openings across the platform</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow"
                    >
                        <Plus className="w-5 h-5" />
                        Create New
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {(['ALL', 'PROMOTION', 'JOB'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === tab
                                ? 'bg-orange-500 text-white shadow'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {tab === 'ALL' ? 'All' : tab === 'PROMOTION' ? '📣 Promotions' : '💼 Job Openings'}
                            <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                                {tab === 'ALL' ? offers.length : offers.filter(o => o.type === tab).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Create Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Create Offer / Ad</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Type Toggle */}
                                <div className="flex gap-3">
                                    {(['PROMOTION', 'JOB'] as const).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setForm({ ...form, type: t })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${form.type === t
                                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            {t === 'PROMOTION' ? <Tag className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                            {t === 'PROMOTION' ? 'Promotion / Ad' : 'Job Opening'}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            {form.type === 'JOB' ? 'Job Title *' : 'Offer Title *'}
                                        </label>
                                        <input
                                            required
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                            placeholder={form.type === 'JOB' ? 'e.g. Senior Hairstylist' : 'e.g. Summer Sale 20% Off'}
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                                            placeholder={form.type === 'JOB' ? 'Describe the role and requirements...' : 'Describe the offer details...'}
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                {form.type === 'JOB' ? 'Salary / Compensation *' : 'Discount Amount *'}
                                            </label>
                                            <input
                                                required
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                placeholder={form.type === 'JOB' ? '₹25,000–₹35,000/mo' : '20% OFF or ₹500 OFF'}
                                                value={form.discountAmount}
                                                onChange={e => setForm({ ...form, discountAmount: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                {form.type === 'JOB' ? 'Job ID / Ref (Optional)' : 'Discount Code (Optional)'}
                                            </label>
                                            <input
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase"
                                                placeholder={form.type === 'JOB' ? 'JOB-2024-001' : 'SAVE20'}
                                                value={form.discountCode}
                                                onChange={e => setForm({ ...form, discountCode: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            {form.type === 'JOB' ? 'Application Deadline' : 'Valid Until'}
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                            value={form.validUntil}
                                            onChange={e => setForm({ ...form, validUntil: e.target.value })}
                                        />
                                    </div>

                                    {/* Media Upload */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Photos & Videos <span className="text-gray-400 font-normal">(optional, max 5)</span>
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {mediaPreviews.map((src, i) => {
                                                const isVideo = mediaFiles[i]?.type?.startsWith('video');
                                                return (
                                                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                                                        {isVideo ? (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                                <Video className="w-8 h-8 text-white" />
                                                                <span className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-1 rounded">MP4</span>
                                                            </div>
                                                        ) : (
                                                            <img src={src} className="w-full h-full object-cover" alt="" />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedia(i)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            {mediaFiles.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-24 h-24 rounded-xl border-2 border-dashed border-orange-300 flex flex-col items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 transition-colors text-orange-500"
                                                >
                                                    <ImageIcon className="w-6 h-6" />
                                                    <span className="text-xs font-semibold">Add</span>
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Supported: JPG, PNG, WebP, MP4, MOV (video max 50MB)</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {uploadingMedia ? 'Uploading media...' : submitting ? 'Creating...' : form.type === 'JOB' ? 'Post Job' : 'Create Offer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Offers Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : filteredOffers.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="text-5xl mb-4">📣</div>
                        <p className="text-gray-500 text-lg font-medium">No offers yet</p>
                        <p className="text-gray-400 text-sm mt-1">Create your first promotion or job posting</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredOffers.map(offer => (
                            <div key={offer.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${offer.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
                                {/* Media Preview */}
                                {offer.image_url && (
                                    <div className="relative h-40 bg-gray-100">
                                        {/* Check if primary is video */}
                                        {offer.image_url.includes('.mp4') || offer.image_url.includes('.mov') ? (
                                            <video src={offer.image_url} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <img src={offer.image_url} className="w-full h-full object-cover" alt={offer.title} />
                                        )}
                                        {(offer.media_urls?.length ?? 0) > 1 && (
                                            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                                +{(offer.media_urls?.length ?? 0) - 1} more
                                            </span>
                                        )}
                                        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${offer.type === 'JOB' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {offer.type === 'JOB' ? '💼 JOB' : '📣 PROMO'}
                                        </span>
                                    </div>
                                )}

                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 text-base leading-snug">{offer.title}</h3>
                                        {!offer.image_url && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${offer.type === 'JOB' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {offer.type === 'JOB' ? '💼 JOB' : '📣 PROMO'}
                                            </span>
                                        )}
                                    </div>

                                    {offer.description && (
                                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{offer.description}</p>
                                    )}

                                    <div className="flex gap-2 flex-wrap mb-3">
                                        <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-lg">
                                            {offer.discount_amount}
                                        </span>
                                        {offer.discount_code && (
                                            <span className="bg-purple-50 text-purple-700 text-xs font-mono px-2 py-1 rounded-lg">
                                                {offer.discount_code}
                                            </span>
                                        )}
                                        {offer.valid_until && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                                                Until {new Date(offer.valid_until).toLocaleDateString('en-IN')}
                                            </span>
                                        )}
                                    </div>

                                    {offer.vendor && (
                                        <p className="text-xs text-gray-400 mb-3">
                                            By: {offer.vendor.business_name || offer.vendor.name}
                                        </p>
                                    )}
                                    {!offer.vendor && (
                                        <p className="text-xs text-orange-500 font-semibold mb-3">Admin Post</p>
                                    )}

                                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => toggleStatus(offer)}
                                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${offer.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {offer.status === 'ACTIVE'
                                                ? <><Eye className="w-3.5 h-3.5" /> Active</>
                                                : <><EyeOff className="w-3.5 h-3.5" /> Inactive</>
                                            }
                                        </button>
                                        <span className="flex-1" />
                                        <button
                                            onClick={() => handleDelete(offer.id)}
                                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
