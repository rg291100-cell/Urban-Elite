'use client';

import { useState, useEffect, use } from 'react';
import { adminAPI } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Loader2, ArrowLeft, X, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface ServiceItem {
    id: string;
    title: string;
    titleFull: string | null;
    duration: string;
    price: string;
    rating: string;
    image: string | null;
    color: string | null;
    isImage: boolean;
}

export default function ServiceItemsPage({ params }: { params: Promise<{ categoryId: string; subCategoryId: string }> }) {
    const router = useRouter();
    const { categoryId, subCategoryId } = use(params);

    const [items, setItems] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        titleFull: '',
        duration: '',
        price: '',
        rating: '4.8',
        color: '#F7FAFC',
        isImage: false
    });

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getServiceListing(subCategoryId);
            if (res.data.success) {
                setItems(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching service items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [subCategoryId]);

    const handleSave = async () => {
        try {
            if (!formData.title) {
                alert('Title is required');
                return;
            }

            const dataToSave = {
                ...formData,
                categoryId,
                subCategoryId
            };

            if (editingItem) {
                await adminAPI.updateServiceItem(editingItem.id, dataToSave);
            } else {
                await adminAPI.createServiceItem(dataToSave);
            }

            setIsDialogOpen(false);
            resetForm();
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Failed to save service item');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await adminAPI.deleteServiceItem(id);
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete service item');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            titleFull: '',
            duration: '',
            price: '',
            rating: '4.8',
            color: '#F7FAFC',
            isImage: false
        });
        setEditingItem(null);
    };

    const openEdit = (item: ServiceItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            titleFull: item.titleFull || '',
            duration: item.duration,
            price: item.price,
            rating: item.rating,
            color: item.color || '#F7FAFC',
            isImage: item.isImage
        });
        setIsDialogOpen(true);
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/services/${categoryId}`} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Service Options</h1>
                    <p className="text-gray-500 mt-1">Manage options (e.g., AC Not Cooling, Gas Refill).</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => { resetForm(); setIsDialogOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Option
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 w-[100px]">Image</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Option Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Duration</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Rating</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="h-32 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="h-32 text-center text-gray-500">
                                        No options found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{item.title}</td>
                                        <td className="px-6 py-4 text-green-600 font-bold">{item.price}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.duration}</td>
                                        <td className="px-6 py-4 text-gray-900">★ {item.rating}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingItem ? 'Edit Option' : 'Add New Option'}
                            </h2>
                            <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. AC Not Cooling"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Title (Optional)</label>
                                <input
                                    value={formData.titleFull}
                                    onChange={(e) => setFormData({ ...formData, titleFull: e.target.value })}
                                    placeholder="e.g. detailed description"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="e.g. ₹599"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                <input
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g. 45 Mins"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full h-[42px] border border-gray-300 rounded-lg px-1 py-1"
                                />
                            </div>

                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">💡 Icons are automatically assigned based on the service title.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Save Option
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
