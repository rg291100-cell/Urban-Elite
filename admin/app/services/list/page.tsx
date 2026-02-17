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

    // Dialog States (Simple Add - Redirects or basic form?)
    // Since items require a SubCategory, better to redirect to the specific subcategory page or show a complex modal.
    // Let's us a Redirect Modal first.

    const fetchData = async () => {
        try {
            setLoading(true);
            // FETCHING ALL ITEMS IS EXPENSIVE. 
            // Ideally we should have pagination or filter by subcat enforced.
            // For now, let's fetch categories -> subcategories -> then items (or just use what we have).
            // Actually, let's just show "Select a Sub-Category to view Items" initially to avoid massive load?
            // Or fetch all subcategories to populate filter.

            // 1. Fetch Categories/Subcats for filter
            const catsRes = await adminAPI.getServiceCategories();
            const allSubs: SubCategory[] = [];
            if (catsRes.data.success) {
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

            // 2. If 'all', we might want to avoid fetching ALL unless necessary.
            // checking if there is a 'getAllServiceItems' API? No.
            // We have getServiceListing(subCategoryId).
            // So we MUST select a subcategory or iterate.
            // Iterating is safer for now given small data.
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

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        const matchesSubCat = selectedSubCat === 'all' || item.subcategory_id === selectedSubCat;
        return matchesSearch && matchesSubCat;
    });

    const getSubCatName = (id: string) => subCategories.find(s => s.id === id)?.name || 'Unknown';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Service Items</h1>
                        <p className="text-gray-500 mt-1">Global list of all service options (Level 3).</p>
                    </div>
                    {/* Add button here could be tricky without pre-selecting subcat. 
                        Maybe prompt user to select subcat first? */}
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
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={selectedSubCat}
                        onChange={(e) => setSelectedSubCat(e.target.value)}
                    >
                        <option value="all">All Sub-Categories</option>
                        {subCategories.map(s => (
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
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 bg-blue-50 rounded"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
