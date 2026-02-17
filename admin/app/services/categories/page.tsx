'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';


interface Category {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    _count?: {
        services: number;
    };
}

export default function ServicesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', image: '' });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getServiceCategories();
            if (res.data.success) {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback mock data if API fails during dev/test
            // setCategories([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = async () => {
        try {
            if (!formData.name) {
                alert('Name is required');
                return;
            }

            if (editingCategory) {
                await adminAPI.updateServiceCategory(editingCategory.id, formData);
            } else {
                await adminAPI.createServiceCategory(formData);
            }

            setIsDialogOpen(false);
            setFormData({ name: '', image: '' });
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await adminAPI.deleteServiceCategory(id);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, image: category.image || '' });
        setIsDialogOpen(true);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Service Categories</h1>
                        <p className="text-gray-500 mt-1">Manage service categories and icons.</p>
                    </div>
                    <button
                        onClick={() => { setEditingCategory(null); setFormData({ name: '', image: '' }); setIsDialogOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Category
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Search categories..."
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
                                    <th className="px-6 py-4 font-semibold text-gray-700 w-[100px]">Icon</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Slug</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Services Count</th>
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
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="h-32 text-center text-gray-500">
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-2xl">
                                                {category.image || '📦'}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{category.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                                            <td className="px-6 py-4 text-gray-900">{category._count?.services || 0}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/services/${category.id}`}
                                                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                                        title="Manage Sub-Services"
                                                    >
                                                        <Plus className="h-4 w-4" /> Items
                                                    </Link>
                                                    <button
                                                        onClick={() => openEdit(category)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h2>
                                <button
                                    onClick={() => setIsDialogOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Electrician"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji or URL)</label>
                                    <input
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="📦"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use an emoji for simplicity or an external image URL.</p>
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
                                    Save Category
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
