'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { CheckCircle, XCircle, Clock, Building2, Briefcase, MapPin, Star, Phone, Mail, UserCheck, Plus } from 'lucide-react';

interface Vendor {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    service_category: string;
    business_name: string;
    business_address: string;
    experience_years: number | null;
    aadhaar_url: string | null;
    pan_url: string | null;
    approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    // Specialization State
    const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCatId, setSelectedCatId] = useState('');
    const [categoryItems, setCategoryItems] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [specPrice, setSpecPrice] = useState('');

    useEffect(() => {
        fetchVendors();
    }, [filter]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await adminAPI.getServiceCategories();
                if (res.data.success) setCategories(res.data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadItems = async () => {
            if (!selectedCatId) {
                setCategoryItems([]);
                return;
            }
            try {
                const res = await adminAPI.getServiceItems(selectedCatId);
                if (res.data.success) setCategoryItems(res.data.items);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        loadItems();
    }, [selectedCatId]);

    const openSpecializationModal = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setIsSpecModalOpen(true);
        setSelectedCatId('');
        setSelectedServiceId('');
        setSpecPrice('');
    };

    const handleAddSpecialization = async () => {
        if (!selectedVendor || !selectedServiceId) return;

        try {
            await adminAPI.assignServiceToVendor({
                vendorId: selectedVendor.id,
                serviceItemId: selectedServiceId,
                customPrice: specPrice
            });
            alert('Specialization added successfully!');
            setIsSpecModalOpen(false);
        } catch (error) {
            console.error('Error adding specialization:', error);
            alert('Failed to add specialization');
        }
    };

    const fetchVendors = async () => {
        setLoading(true);
        try {
            if (filter === 'PENDING') {
                const response = await adminAPI.getPendingVendors();
                setVendors(response.data.vendors);
            } else {
                const params = filter === 'ALL' ? {} : { status: filter };
                const response = await adminAPI.getAllVendors(params);
                setVendors(response.data.vendors);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, name: string) => {
        if (!confirm(`Approve vendor "${name}"? They will be able to login and access the vendor dashboard.`)) return;

        try {
            await adminAPI.approveVendor(id);
            alert(`✅ Vendor "${name}" has been approved! They can now login.`);
            fetchVendors();
        } catch (error) {
            console.error('Error approving vendor:', error);
            alert('Failed to approve vendor');
        }
    };

    const handleReject = async (id: string, name: string) => {
        if (!confirm(`Reject vendor "${name}"? They will not be able to login.`)) return;

        try {
            await adminAPI.rejectVendor(id);
            alert(`❌ Vendor "${name}" has been rejected.`);
            fetchVendors();
        } catch (error) {
            console.error('Error rejecting vendor:', error);
            alert('Failed to reject vendor');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-4 h-4" />
                        Pending Approval
                    </span>
                );
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <XCircle className="w-4 h-4" />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Service Providers (Vendors)</h1>
                    <p className="text-gray-600 mt-2">Manage service provider registrations and approvals</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-900">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-900 mt-2">
                            {vendors.filter(v => v.approval_status === 'PENDING').length}
                        </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Approved</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 mt-2">
                            {vendors.filter(v => v.approval_status === 'APPROVED').length}
                        </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-red-900">Rejected</span>
                        </div>
                        <p className="text-2xl font-bold text-red-900 mt-2">
                            {vendors.filter(v => v.approval_status === 'REJECTED').length}
                        </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 mt-2">
                            {vendors.length}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Vendors List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center text-gray-600 py-12">
                            Loading service providers...
                        </div>
                    ) : vendors.length === 0 ? (
                        <div className="text-center text-gray-600 py-12 bg-white rounded-lg shadow">
                            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium">No {filter.toLowerCase()} vendors found</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {filter === 'PENDING'
                                    ? 'New vendor registrations will appear here for approval'
                                    : 'Vendors will appear here once they register'}
                            </p>
                        </div>
                    ) : (
                        vendors.map((vendor) => (
                            <div key={vendor.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
                                            {getStatusBadge(vendor.approval_status)}
                                        </div>
                                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <span>{vendor.email}</span>
                                            </div>
                                            {vendor.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{vendor.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Building2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase">Business Name</p>
                                            <p className="text-sm text-gray-900 font-medium">{vendor.business_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Briefcase className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase">Service Category</p>
                                            <p className="text-sm text-gray-900 font-medium">{vendor.service_category}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase">Business Address</p>
                                            <p className="text-sm text-gray-900">{vendor.business_address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase">Experience</p>
                                            <p className="text-sm text-gray-900 font-medium">
                                                {vendor.experience_years ? `${vendor.experience_years} years` : 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* KYC Documents Section */}
                                <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                        <UserCheck className="w-3 h-3 text-blue-500" />
                                        KYC Verification Documents
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex-1 min-w-[200px]">
                                            <p className="text-xs text-gray-400 mb-1">Aadhaar Card</p>
                                            {vendor.aadhaar_url ? (
                                                <a
                                                    href={vendor.aadhaar_url}
                                                    target="_blank"
                                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-white p-2 rounded border border-blue-100 transition-colors"
                                                >
                                                    View Aadhaar Card ↗
                                                </a>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic bg-white p-2 rounded border border-gray-100">Not provided</p>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <p className="text-xs text-gray-400 mb-1">PAN Card</p>
                                            {vendor.pan_url ? (
                                                <a
                                                    href={vendor.pan_url}
                                                    target="_blank"
                                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-white p-2 rounded border border-blue-100 transition-colors"
                                                >
                                                    View PAN Card ↗
                                                </a>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic bg-white p-2 rounded border border-gray-100">Not provided</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                                    <span>Registered: {new Date(vendor.created_at).toLocaleString()}</span>
                                    <span className="text-gray-400">ID: {vendor.id.slice(0, 8)}...</span>
                                </div>

                                {/* Action Buttons */}
                                {vendor.approval_status === 'PENDING' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(vendor.id, vendor.name)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Vendor
                                        </button>
                                        <button
                                            onClick={() => handleReject(vendor.id, vendor.name)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Vendor
                                        </button>
                                    </div>
                                )}

                                {vendor.approval_status === 'APPROVED' && (
                                    <div className="space-y-3">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                            <p className="text-sm text-green-800">
                                                ✅ This vendor is approved and can login to provide services
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => openSpecializationModal(vendor)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors bg-white font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Manage Specializations
                                        </button>
                                    </div>
                                )}

                                {vendor.approval_status === 'REJECTED' && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                        <p className="text-sm text-red-800">
                                            ❌ This vendor has been rejected and cannot login
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Specialization Modal */}
                {isSpecModalOpen && selectedVendor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Manage Specializations
                                </h2>
                                <button onClick={() => setIsSpecModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-4">
                                Assign specific service items to <strong>{selectedVendor.name}</strong>
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Service Category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        value={selectedCatId}
                                        onChange={(e) => setSelectedCatId(e.target.value)}
                                    >
                                        <option value="">-- Choose Category --</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedCatId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Sub-Service (Specialization)</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            value={selectedServiceId}
                                            onChange={(e) => setSelectedServiceId(e.target.value)}
                                        >
                                            <option value="">-- Choose Service --</option>
                                            {categoryItems.map(item => (
                                                <option key={item.id} value={item.id}>{item.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Price for Vendor (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ₹599"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        value={specPrice}
                                        onChange={(e) => setSpecPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsSpecModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSpecialization}
                                    disabled={!selectedServiceId}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    Add Specialization
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
