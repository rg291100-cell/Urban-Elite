'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Loader2, X, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';

interface ServiceItem {
    id: string;
    title: string;
    price: string;
    image: string | null;
    subcategory_id: string;
    // We ideally need parent subcat/category names for display, but listing API might not return them by default.
    // We might need to fetch them separately or update API.
    // For now, let's just list items.
}

interface SubCategory {
    id: string;
    name: string;
    category_id: string;
}

export default function ServiceItemsListPage() {
    const router = useRouter();
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSubCat, setSelectedSubCat] = useState<string>('all');
    // State for filtering
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Dialog States (Simple Add - Redirects or basic form?)
    // Since items require a SubCategory, better to redirect to the specific subcategory page or show a complex modal.
    // Let's us a Redirect Modal first.

    // State for create modal
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        titleFull: '',
        duration: '',
        price: '',
        rating: '4.8',
        image: '',
        color: '#F7FAFC',
        isImage: true,
        categoryId: '',
        subCategoryId: ''
    });

    const categories = Array.from(new Set(subCategories.map(s => s.category_id))).map(cid => {
        const sub = subCategories.find(s => s.category_id === cid);
        return { id: cid, name: 'Category ' + cid }; // We need actual category name, but let's try to pass it down or fetch it.
        // Actually, in fetchData we fetched categories. We should store them.
    });

    // Let's improve valid category storage
    const [allCategories, setAllCategories] = useState<{ id: string, name: string }[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const catsRes = await adminAPI.getServiceCategories();
            let allSubs: SubCategory[] = [];

            if (catsRes.data.success) {
                setAllCategories(catsRes.data.categories);

                for (const cat of catsRes.data.categories) {
                    try {
                        const subRes = await adminAPI.getSubCategories(cat.id);
                        if (subRes.data.success) {
                            allSubs.push(...subRes.data.data.map((s: any) => ({ ...s, category_id: cat.id })));
                        }
                    } catch (e) { }
                }
                setSubCategories(allSubs);
            }

            const allItems: ServiceItem[] = [];
            for (const sub of allSubs) {
                try {
                    const itemsRes = await adminAPI.getServiceListing(sub.id);
                    if (itemsRes.data.success) {
                        allItems.push(...itemsRes.data.data.map((i: any) => ({ ...i, subcategory_id: sub.id })));
                    }
                } catch (e) { }
            }
            setItems(allItems);

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
            if (!formData.title || !formData.subCategoryId) {
                alert('Title and Sub-Category are required');
                return;
            }

            // Find categoryId from subCategoryId if not selected (though we force selection)
            const sub = subCategories.find(s => s.id === formData.subCategoryId);
            const payload = {
                ...formData,
                categoryId: sub?.category_id || formData.categoryId
            };

            await adminAPI.createServiceItem(payload);
            setIsDialogOpen(false);
            setFormData({
                title: '', titleFull: '', duration: '', price: '', rating: '4.8', image: '', color: '#F7FAFC', isImage: true, categoryId: '', subCategoryId: ''
            });
            fetchData();
        } catch (error: any) {
            console.error('Error saving item:', error);
            alert(`Failed to save item: ${error.response?.data?.error || error.message}`);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());

        // Filter by category
        let matchesCategory = true;
        if (selectedCategory !== 'all') {
            const sub = subCategories.find(s => s.id === item.subcategory_id);
            if (sub?.category_id !== selectedCategory) matchesCategory = false;
        }

        const matchesSubCat = selectedSubCat === 'all' || item.subcategory_id === selectedSubCat;
        return matchesSearch && matchesCategory && matchesSubCat;
    });

    const getSubCatName = (id: string) => subCategories.find(s => s.id === id)?.name || 'Unknown';

    // Filter subcategories for dropdown based on selectedCategory
    const filteredSubCategories = selectedCategory === 'all'
        ? subCategories
        : subCategories.filter(s => s.category_id === selectedCategory);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Service Items</h1>
                        <p className="text-gray-500 mt-1">Global list of all service options (Level 3).</p>
                    </div>
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add New Service
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Search items..."
                            className="pl-9 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedSubCat('all'); // Reset subcat
                        }}
                    >
                        <option value="all">All Categories</option>
                        {allCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {/* SubCategory Filter */}
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={selectedSubCat}
                        onChange={(e) => setSelectedSubCat(e.target.value)}
                    >
                        <option value="all">All Sub-Categories</option>
                        {filteredSubCategories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Image</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Service Title</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Sub-Category</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
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
                                            No items found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 text-gray-500">{getSubCatName(item.subcategory_id)}</td>
                                            <td className="px-6 py-4 text-green-600 font-bold">{item.price}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        const sub = subCategories.find(s => s.id === item.subcategory_id);
                                                        if (sub) {
                                                            router.push(`/services/${sub.category_id}/${sub.id}`);
                                                        }
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Add New Service</h2>
                                <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                                    >
                                        <option value="">Select Category</option>
                                        {allCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.subCategoryId}
                                        onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                                        disabled={!formData.categoryId}
                                    >
                                        <option value="">Select Sub-Category</option>
                                        {subCategories.filter(s => s.category_id === formData.categoryId).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. AC Not Cooling"
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

                                <div className="col-span-2">
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
                                    Save Service
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
