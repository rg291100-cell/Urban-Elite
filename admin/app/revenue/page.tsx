'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Booking } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, TrendingUp, Download } from 'lucide-react';

export default function RevenuePage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        fetchBookings();
    }, [page, search]);

    const fetchBookings = async () => {
        try {
            const response = await adminAPI.getBookings({
                page,
                limit: 10,
                search,
                status: 'Completed' // Revenue usually implies completed transactions, but let's show all or filter? Sticking to all for now but highlighting completed.
            });
            setBookings(response.data.bookings);
            setTotalPages(response.data.pagination.totalPages);

            // Calculate revenue from visible bookings (approximate for now, ideal would be backend aggregate)
            // Or we can fetch dashboard stats again to get global revenue? 
            // Let's just sum visible for now or fetch stats.
            const statsResponse = await adminAPI.getDashboardStats();
            // Parse revenue string "₹1098" -> 1098
            const revenueStr = statsResponse.data.stats.totalRevenue.toString().replace(/[^0-9]/g, '');
            setTotalRevenue(parseInt(revenueStr) || 0);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Revenue & Transactions</h1>
                    <p className="text-gray-600 mt-2">Track financial performance and transaction history</p>
                </div>

                {/* Revenue Summary Card */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">Total Revenue (All Time)</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalRevenue}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                        <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search transaction..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {/* <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button> */}
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                                        Loading...
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {booking.date}<br />
                                            <span className="text-xs text-gray-400">{booking.timeSlot}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{booking.serviceName}</div>
                                            <div className="text-xs text-gray-500">ID: {booking.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {booking.user?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'Completed'
                                                ? 'bg-green-100 text-green-800'
                                                : booking.status === 'Cancelled'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                            {booking.price}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
