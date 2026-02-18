'use client';

import { useState, useEffect, use } from 'react';
import { adminAPI } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Loader2, ArrowLeft, X, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface SubCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
}

export default function SubCategoriesPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const router = useRouter();
    const { categoryId } = use(params);

    const [items, setItems] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: ''
    });

    const [editingItem, setEditingItem] = useState<SubCategory | null>(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getSubCategories(categoryId);
            if (res.data.success) {
                setItems(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [categoryId]);

    const handleSave = async () => {
        try {
            if (!formData.name) {
                alert('Name is required');
                return;
            }

            const dataToSave = {
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                description: formData.description,
                image: formData.image,
                categoryId // Only needed for create, ignored by update in backend typically or not harmful
            };

            if (editingItem) {
                await adminAPI.updateSubCategory(editingItem.id, dataToSave);
            } else {
                await adminAPI.createSubCategory(dataToSave);
            }

            setIsDialogOpen(false);
            resetForm();
            fetchItems();
        } catch (error: any) {
            console.error('Error saving subcategory:', error);
            alert(`Failed to save subcategory: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sub-category? This will also delete all service options under it.')) return;
        try {
            await adminAPI.deleteSubCategory(id);
            fetchItems();
        } catch (error: any) {
            console.error('Error deleting subcategory:', error);
            alert(`Failed to delete subcategory: ${error.response?.data?.error || error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            image: ''
        });
        setEditingItem(null);
    };

    const openEdit = (item: SubCategory) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            slug: item.slug,
            description: item.description || '',
            image: item.image || ''
        });
        setIsDialogOpen(true);
    };

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        setFormData({ ...formData, name, slug });
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/services" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sub-Categories</h1>
                    <p className="text-gray-500 mt-1">Manage sub-categories (e.g., AC Repair, Fridge Repair).</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => { resetForm(); setIsDialogOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Sub-Category
                    </button>
                </div>
            </div>

            <div className="flex items-center mb-6 space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        placeholder="Search sub-categories..."
                        className="pl-9 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 w-[100px]">Image</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Slug</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Description</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="h-32 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="h-32 text-center text-gray-500">
                                        No sub-categories found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/services/${categoryId}/${item.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.slug}</td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.description}</td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/services/${categoryId}/${item.id}`}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                                    title="Manage Items"
                                                >
                                                    <Plus className="h-4 w-4" /> Items
                                                </Link>
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
                                {editingItem ? 'Edit Sub-Category' : 'Add New Sub-Category'}
                            </h2>
                            <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    placeholder="e.g. AC Repair"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
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
                                {editingItem ? 'Update Sub-Category' : 'Save Sub-Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
