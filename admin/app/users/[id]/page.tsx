'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { User } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Mail, Phone, MapPin, Wallet, Star } from 'lucide-react';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchUserDetails(params.id as string);
        }
    }, [params.id]);

    const fetchUserDetails = async (id: string) => {
        try {
            const response = await adminAPI.getUserDetails(id);
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-600">Loading user details...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-gray-600">User not found</p>
                    <button
                        onClick={() => router.push('/users')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Back to Users
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <button
                    onClick={() => router.push('/users')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users
                </button>

                {/* User Info Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                {user.isPremium && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        Premium
                                    </span>
                                )}
                                <span className="text-gray-600 text-sm">ID: {user.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="text-gray-900">{user.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="text-gray-900">{user.location || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Wallet Balance</p>
                                <p className="text-gray-900 font-semibold">₹{user.walletBalance}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                            Bookings ({user.bookings?.length || 0})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        {user.bookings && user.bookings.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {user.bookings.map((booking: any) => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{booking.serviceName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{booking.date} {booking.timeSlot}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' || booking.status === 'Upcoming'
                                                    ? 'bg-green-100 text-green-800'
                                                    : booking.status === 'Completed'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{booking.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-6 text-center text-gray-600">No bookings found</div>
                        )}
                    </div>
                </div>

                {/* Transactions */}
                {user.transactions && user.transactions.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                Transactions ({user.transactions.length})
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {user.transactions.map((transaction: any) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{transaction.title}</p>
                                            <p className="text-sm text-gray-600">{transaction.date}</p>
                                        </div>
                                        <span className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
