'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Loader2, X, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';

interface SubCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    category_id: string;
    category?: { name: string };
}

interface Category {
    id: string;
    name: string;
}

export default function SubCategoriesListPage() {
    const router = useRouter();
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
        categoryId: ''
    });

    const [editingItem, setEditingItem] = useState<SubCategory | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const catsRes = await adminAPI.getServiceCategories();
            if (catsRes.data.success) {
                setCategories(catsRes.data.categories);
                const allSubs: SubCategory[] = [];
                for (const cat of catsRes.data.categories) {
                    try {
                        const subRes = await adminAPI.getSubCategories(cat.id);
                        if (subRes.data.success) {
                            const subsWithCat = subRes.data.data.map((s: any) => ({ ...s, category: { name: cat.name }, category_id: cat.id }));
                            allSubs.push(...subsWithCat);
                        }
                    } catch (e) {
                        // ignore empty or error
                    }
                }
                setSubCategories(allSubs);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        try {
            if (!formData.name || !formData.categoryId) {
                alert('Name and Category are required');
                return;
            }

            if (editingItem) {
                await adminAPI.updateSubCategory(editingItem.id, {
                    name: formData.name,
                    description: formData.description,
                    image: formData.image
                    // Note: changing categoryId is not supported by backend currently for update, 
                    // or would require moving permissions. Assuming purely field updates for now.
                });
            } else {
                await adminAPI.createSubCategory({
                    categoryId: formData.categoryId,
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
                    description: formData.description,
                    image: formData.image
                });
            }

            setIsDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error('Error saving subcategory:', error);
            alert(`Failed to save subcategory: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sub-category? This will also delete all service options under it.')) return;
        try {
            await adminAPI.deleteSubCategory(id);
            fetchData();
        } catch (error: any) {
            console.error('Error deleting subcategory:', error);
            alert(`Failed to delete subcategory: ${error.response?.data?.error || error.message}`);
        }
    };

    const openEdit = (item: SubCategory) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            slug: item.slug,
            description: item.description || '',
            image: item.image || '',
            categoryId: item.category_id
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', description: '', image: '', categoryId: '' });
        setEditingItem(null);
    };

    const filteredItems = subCategories.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sub-Categories</h1>
                        <p className="text-gray-500 mt-1">Manage all sub-categories (Level 2) across services.</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsDialogOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Sub-Category
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Search sub-categories..."
                            className="pl-9 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Image</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Parent Category</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Slug</th>
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
                                            No sub-categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/services/${item.category_id}/${item.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-blue-600 font-medium">{item.category?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.slug}</td>
                                            <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex justify-end gap-2 items-center">
                                                    <Link
                                                        href={`/services/${item.category_id}/${item.id}`}
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

                {isDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingItem ? 'Edit Sub-Category' : 'Add New Sub-Category'}
                                </h2>
                                <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        disabled={!!editingItem} // Disable changing parent category during edit for now
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {editingItem && <p className="text-xs text-gray-500 mt-1">Cannot change parent category once created.</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. AC Repair"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
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
                                <button onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                    {editingItem ? 'Update Sub-Category' : 'Save Sub-Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
