'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { DashboardStats } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Calendar, UserCog, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      href: '/users'
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'bg-green-500',
      href: '/bookings'
    },
    {
      title: 'Professionals',
      value: stats?.totalProfessionals || 0,
      icon: UserCog,
      color: 'bg-purple-500',
      href: '/professionals'
    },
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue ? (stats.totalRevenue.toString().includes('₹') ? stats.totalRevenue : `₹${stats.totalRevenue}`) : '₹0',
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/revenue'
    },
    {
      title: 'Upcoming',
      value: stats?.upcomingBookings || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      href: '/bookings?status=Upcoming'
    },
    {
      title: 'Completed',
      value: stats?.completedBookings || 0,
      icon: CheckCircle,
      color: 'bg-teal-500',
      href: '/bookings?status=Completed'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to Urban Elite Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href} className="block">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentBookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.date} {booking.timeSlot}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' || booking.status === 'Upcoming'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bookings by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings by Service</h2>
          <div className="space-y-3">
            {stats?.bookingsByCategory.map((category) => (
              <div key={category.serviceName} className="flex items-center justify-between">
                <span className="text-gray-700">{category.serviceName}</span>
                <span className="font-semibold text-gray-900">{category._count.serviceName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
