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
                    <Text style={styles.welcomeSubtext}>Manage your professional bookings</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9' }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#F1F5F9' }]}>
                                <Calendar size={20} color="#0F172A" />
                            </View>
                            <Text style={styles.statValue}>{stats.todayBookings || 0}</Text>
                            <Text style={styles.statLabel}>Today's Bookings</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9' }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#FDFCF0' }]}>
                                <Clock size={20} color="#D4AF37" />
                            </View>
                            <Text style={styles.statValue}>{stats.pendingRequests || 0}</Text>
                            <Text style={styles.statLabel}>Pending Requests</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#0F172A', flex: 1 }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                <DollarSign size={20} color="#D4AF37" />
                            </View>
                            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{stats.totalRevenue || '₹0'}</Text>
                            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Total Revenue</Text>
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
            return '#F1F5F9'; // Light gray
        case 'ACCEPTED':
        case 'ACTIVE':
            return '#E0F2FE'; // Light blue
        case 'COMPLETED':
            return '#F0FDF4'; // Light green
        case 'CANCELLED':
            return '#FEF2F2'; // Light red
        default:
            return '#F8FAFC';
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.brandOrange, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24, color: 'white' },
    headerTitle: { fontSize: 22, fontWeight: Theme.typography.weights.bold },
    titleUrban: { color: Theme.colors.brandOrange, fontWeight: '900', letterSpacing: -0.5 },
    titleElite: { color: Theme.colors.brandOrange, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.5 },
    notificationButton: { width: 40, height: 40, backgroundColor: Theme.colors.searchBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notificationBadge: { width: 8, height: 8, backgroundColor: Theme.colors.brandOrange, borderRadius: 4, position: 'absolute', top: 10, right: 10, borderWidth: 1, borderColor: '#FFF' },

    welcomeSection: { paddingHorizontal: 20, marginBottom: 25 },
    welcomeText: { fontSize: 28, fontWeight: Theme.typography.weights.bold, color: Theme.colors.textDark, letterSpacing: -0.8 },
    welcomeSubtext: { fontSize: 14, color: Theme.colors.textLight, marginTop: 5, fontWeight: Theme.typography.weights.medium },

    statsContainer: { paddingHorizontal: 20, marginBottom: 30 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    statCard: { flex: 1, padding: 20, borderRadius: 15, marginHorizontal: 5 },
    statIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 24, fontWeight: Theme.typography.weights.bold, color: Theme.colors.textDark, marginBottom: 5, letterSpacing: -0.5 },
    statLabel: { fontSize: 12, color: Theme.colors.textLight, fontWeight: Theme.typography.weights.medium },

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
