'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI } from '@/lib/api';
import { ClipboardList, Search, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronDown, Phone, MapPin, Calendar } from 'lucide-react';

// Extend the adminAPI with Others requests endpoints
const othersAPI = {
    getRequests: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
        fetch(
            `/api/admin/others-requests?${new URLSearchParams(
                Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
            )}`,
            { headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''}` } }
        ).then(r => r.json()),

    updateRequest: (id: string, data: { status?: string; adminNotes?: string }) =>
        fetch(`/api/admin/others-requests/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''}`,
            },
            body: JSON.stringify(data),
        }).then(r => r.json()),
};

// Use proxy API base
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:3000';

function apiFetch(path: string, options?: RequestInit) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    return fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options?.headers || {}),
        },
    }).then(r => r.json());
}

const STATUS_OPTIONS = ['ALL', 'PENDING', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    PENDING: { color: 'text-yellow-700', bg: 'bg-yellow-50', icon: Clock, label: 'Pending' },
    REVIEWED: { color: 'text-blue-700', bg: 'bg-blue-50', icon: AlertCircle, label: 'Reviewed' },
    IN_PROGRESS: { color: 'text-purple-700', bg: 'bg-purple-50', icon: RefreshCw, label: 'In Progress' },
    COMPLETED: { color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle, label: 'Completed' },
    CANCELLED: { color: 'text-red-700', bg: 'bg-red-50', icon: XCircle, label: 'Cancelled' },
};

interface OthersRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    categoryName: string;
    subcategoryName: string;
    serviceName: string;
    description: string;
    preferredDate?: string;
    preferredTime?: string;
    locationAddress?: string;
    attachmentUrl?: string;
    status: string;
    adminNotes?: string;
    createdAt: string;
}

export default function OthersRequestsPage() {
    const [requests, setRequests] = useState<OthersRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedRequest, setSelectedRequest] = useState<OthersRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

    const fetchRequests = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params: Record<string, string> = { page: String(page), limit: '20' };
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (search.trim()) params.search = search.trim();

            const data = await apiFetch(
                `/api/admin/others-requests?${new URLSearchParams(params)}`
            );
            if (data.success) {
                setRequests(data.requests || []);
                setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => {
        fetchRequests(1);
    }, [fetchRequests]);

    const handleUpdate = async () => {
        if (!selectedRequest) return;
        setSubmitting(true);
        try {
            const data = await apiFetch(`/api/admin/others-requests/${selectedRequest.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus || selectedRequest.status, adminNotes }),
            });
            if (data.success) {
                setSelectedRequest(null);
                fetchRequests(pagination.page);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const openRequest = (req: OthersRequest) => {
        setSelectedRequest(req);
        setAdminNotes(req.adminNotes || '');
        setNewStatus(req.status);
    };

    const formatDate = (dt: string) => new Date(dt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-purple-600" />
                            Others / On-Demand Requests
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage service requests from the "Others" category — no fixed pricing, handled manually.
                        </p>
                    </div>
                    <button
                        onClick={() => fetchRequests(1)}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-56">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by service, user, email..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchRequests(1)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s
                                        ? 'bg-purple-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {s === 'ALL' ? 'All' : (STATUS_CONFIG[s]?.label || s)}
                                {s === 'PENDING' && requests.filter(r => r.status === 'PENDING').length > 0 && statusFilter !== 'PENDING' && (
                                    <span className="ml-1 bg-yellow-200 text-yellow-800 rounded-full px-1.5 py-0.5 text-xs">
                                        {requests.filter(r => r.status === 'PENDING').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                            Loading requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
                            <p className="font-medium text-gray-500">No requests found</p>
                            <p className="text-sm mt-1">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {['Customer', 'Service', 'Category', 'Preferred Date', 'Status', 'Submitted', 'Action'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {requests.map(req => {
                                        const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                                        const Icon = cfg.icon;
                                        return (
                                            <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900">{req.userName || 'N/A'}</p>
                                                    <p className="text-xs text-gray-400">{req.userEmail}</p>
                                                    {req.userPhone && (
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <Phone className="w-3 h-3" />{req.userPhone}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-800">{req.serviceName}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 max-w-48">{req.description}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-semibold text-purple-600">{req.categoryName}</p>
                                                    {req.subcategoryName && <p className="text-xs text-gray-400">{req.subcategoryName}</p>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {req.preferredDate ? (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-700">{req.preferredDate}</p>
                                                            {req.preferredTime && <p className="text-xs text-gray-400">{req.preferredTime}</p>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Not specified</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                                                        <Icon className="w-3 h-3" />
                                                        {cfg.label}
                                                    </span>
                                                    {req.adminNotes && (
                                                        <p className="text-xs text-blue-500 mt-1 italic line-clamp-1">has note</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                                    {formatDate(req.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => openRequest(req)}
                                                        className="bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                                                    >
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <p>Showing {requests.length} of {pagination.total} requests</p>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => fetchRequests(pagination.page - 1)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => fetchRequests(pagination.page + 1)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail / Edit Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{selectedRequest.serviceName}</h2>
                                    <p className="text-sm text-purple-600 font-medium mt-0.5">
                                        {selectedRequest.categoryName}
                                        {selectedRequest.subcategoryName ? ` › ${selectedRequest.subcategoryName}` : ''}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">ID: #{selectedRequest.id.slice(0, 8).toUpperCase()}</p>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer Info</h3>
                                <p className="font-semibold text-gray-800">{selectedRequest.userName}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{selectedRequest.userEmail}</p>
                                {selectedRequest.userPhone && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3 h-3" />{selectedRequest.userPhone}
                                    </p>
                                )}
                            </div>

                            {/* Request Details */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Service Description</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">{selectedRequest.description}</p>
                            </div>

                            {/* Schedule & Location */}
                            <div className="grid grid-cols-2 gap-3">
                                {selectedRequest.preferredDate && (
                                    <div className="bg-blue-50 rounded-xl p-3">
                                        <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mb-1">
                                            <Calendar className="w-3 h-3" />Preferred Date
                                        </p>
                                        <p className="text-sm font-medium text-blue-800">{selectedRequest.preferredDate}</p>
                                        {selectedRequest.preferredTime && <p className="text-xs text-blue-600">{selectedRequest.preferredTime}</p>}
                                    </div>
                                )}
                                {selectedRequest.locationAddress && (
                                    <div className="bg-green-50 rounded-xl p-3">
                                        <p className="text-xs font-semibold text-green-600 flex items-center gap-1 mb-1">
                                            <MapPin className="w-3 h-3" />Location
                                        </p>
                                        <p className="text-sm text-green-800 leading-snug">{selectedRequest.locationAddress}</p>
                                    </div>
                                )}
                            </div>

                            {/* Update Status */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</label>
                                <div className="relative">
                                    <select
                                        value={newStatus}
                                        onChange={e => setNewStatus(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    >
                                        {STATUS_OPTIONS.filter(s => s !== 'ALL').map(s => (
                                            <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Response / Notes to Customer</label>
                                <textarea
                                    rows={3}
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder="Add a note for the customer (e.g. pricing quote, scheduled time, or any details)..."
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={submitting}
                                    className="flex-1 bg-purple-600 text-white font-semibold py-2.5 rounded-xl hover:bg-purple-700 transition-colors text-sm disabled:opacity-60"
                                >
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
