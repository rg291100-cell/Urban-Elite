import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { vendorAPI } from '../../services/api';
import { Calendar, Clock, DollarSign, Briefcase, Bell } from 'lucide-react-native';

const VendorHomeScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await vendorAPI.getDashboard();
            setDashboardData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
            </SafeAreaView>
        );
    }

    const stats = dashboardData?.stats || {};
    const recentBookings = dashboardData?.recentBookings || [];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoIconText}>⚡</Text>
                        </View>
                        <Text style={styles.headerTitle}>
                            <Text style={styles.titleUrban}>Urban</Text> <Text style={styles.titleElite}>Elite</Text>
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() => navigation.navigate('Notifications' as any)}
                        >
                            <Bell size={24} color={Theme.colors.textDark} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.notificationButton, { marginLeft: 10, backgroundColor: Theme.colors.brandOrange }]}
                            onPress={() => navigation.navigate('VendorCreateOffer' as any)}
                        >
                            <Text style={{ fontSize: 20, color: 'white' }}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Vendor Dashboard</Text>
                    <Text style={styles.welcomeSubtext}>Manage your services and bookings</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: Theme.colors.brandOrange }]}>
                                <Calendar size={20} color="#FFF" />
                            </View>
                            <Text style={styles.statValue}>{stats.todayBookings || 0}</Text>
                            <Text style={styles.statLabel}>Today's Bookings</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#F59E0B' }]}>
                                <Clock size={20} color="#FFF" />
                            </View>
                            <Text style={styles.statValue}>{stats.pendingRequests || 0}</Text>
                            <Text style={styles.statLabel}>Pending Requests</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#3B82F6' }]}>
                                <DollarSign size={20} color="#FFF" />
                            </View>
                            <Text style={styles.statValue}>{stats.totalRevenue || '₹0'}</Text>
                            <Text style={styles.statLabel}>Total Revenue</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#10B981' }]}>
                                <Briefcase size={20} color="#FFF" />
                            </View>
                            <Text style={styles.statValue}>{stats.activeServices || 0}</Text>
                            <Text style={styles.statLabel}>Active Services</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Bookings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Bookings</Text>
                    {recentBookings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No recent bookings</Text>
                        </View>
                    ) : (
                        recentBookings.slice(0, 5).map((booking: any) => (
                            <View key={booking.id} style={styles.bookingCard}>
                                <View style={styles.bookingHeader}>
                                    <Text style={styles.bookingService}>{booking.service_name}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                                        <Text style={styles.statusText}>{booking.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.bookingDate}>{booking.date} • {booking.time_slot}</Text>
                                <Text style={styles.bookingPrice}>{booking.price}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Bottom Spacer */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView >
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return '#FEF3C7';
        case 'ACCEPTED':
        case 'ACTIVE':
            return '#DBEAFE';
        case 'COMPLETED':
            return '#D1FAE5';
        case 'CANCELLED':
            return '#FEE2E2';
        default:
            return '#F3F4F6';
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.brandOrange, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24, color: 'white' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    titleUrban: { color: Theme.colors.brandOrange, fontWeight: '900' },
    titleElite: { color: Theme.colors.brandOrange, fontWeight: '900', fontStyle: 'italic' },
    notificationButton: { width: 40, height: 40, backgroundColor: Theme.colors.searchBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notificationBadge: { width: 8, height: 8, backgroundColor: Theme.colors.brandOrange, borderRadius: 4, position: 'absolute', top: 10, right: 10, borderWidth: 1, borderColor: '#FFF' },

    welcomeSection: { paddingHorizontal: 20, marginBottom: 25 },
    welcomeText: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.textDark },
    welcomeSubtext: { fontSize: 14, color: Theme.colors.textLight, marginTop: 5 },

    statsContainer: { paddingHorizontal: 20, marginBottom: 30 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    statCard: { flex: 1, padding: 20, borderRadius: 15, marginHorizontal: 5 },
    statIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 5 },
    statLabel: { fontSize: 12, color: Theme.colors.textLight, fontWeight: '600' },

    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 15 },

    bookingCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    bookingService: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark, flex: 1 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: 'bold', color: Theme.colors.textDark },
    bookingDate: { fontSize: 13, color: Theme.colors.textLight, marginBottom: 5 },
    bookingPrice: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.brandOrange },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyStateText: { fontSize: 14, color: Theme.colors.textLight },
});

export default VendorHomeScreen;
