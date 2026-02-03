import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { bookingAPI } from '../services/api';
import { MapPin, Calendar, Clock, MessageCircle, Navigation, XCircle } from 'lucide-react-native';

type BookingDetailsRouteProp = RouteProp<RootStackParamList, 'BookingDetails'>;

const BookingDetailsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingDetailsRouteProp>();
    const { bookingId } = route.params;

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<any>(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchBookingDetails();
    }, []);

    const fetchBookingDetails = async () => {
        try {
            const response = await bookingAPI.getBooking(bookingId);
            setBooking(response.data.booking);
        } catch (error) {
            console.error('Failed to fetch booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await bookingAPI.cancelBooking(bookingId);
            Alert.alert('Booking cancelled successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Failed to cancel booking');
            console.error(error);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
            </SafeAreaView>
        );
    }

    if (!booking) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text>Booking not found</Text>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return '#F59E0B';
            case 'CONFIRMED': return '#F59E0B'; // Treat as PENDING
            case 'ACCEPTED': return '#3B82F6';
            case 'ACTIVE': return '#10B981';
            case 'COMPLETED': return '#059669';
            case 'CANCELLED': return '#EF4444';
            default: return '#6B7280';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Status Section */}
                <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                            {booking.status?.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.priceText}>{booking.price}</Text>
                </View>

                {/* Service Card */}
                <View style={styles.card}>
                    <Text style={styles.serviceName}>{booking.service}</Text>
                    <View style={styles.row}>
                        <Calendar size={16} color={Theme.colors.textLight} />
                        <Text style={styles.rowText}>{booking.date}</Text>
                    </View>
                    <View style={styles.row}>
                        <Clock size={16} color={Theme.colors.textLight} />
                        <Text style={styles.rowText}>{booking.timeSlot}</Text>
                    </View>
                </View>

                {/* Professional Section */}
                {booking.professional && booking.professional.name && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Professional</Text>
                        <View style={styles.proRow}>
                            <View style={styles.proAvatar}>
                                <Text style={styles.proInitials}>{booking.professional.name[0]}</Text>
                            </View>
                            <View style={styles.proInfo}>
                                <Text style={styles.proName}>{booking.professional.name}</Text>
                                <Text style={styles.proSub}>Verified Professional</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.chatBtn}
                                onPress={() => navigation.navigate('Chat', {
                                    bookingId: bookingId,
                                    professionalName: booking.professional.name
                                })}
                            >
                                <MessageCircle size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Location */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <View style={styles.row}>
                        <MapPin size={16} color={Theme.colors.textLight} />
                        <Text style={styles.rowText}>{booking.location?.address}</Text>
                    </View>
                </View>

                {/* Actions - Debugging: Force Show if Status Exists */}
                {booking.status && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: Theme.colors.brandOrange }]}
                            onPress={() => navigation.navigate('BookingTracking', { bookingId: bookingId })}
                        >
                            <Navigation size={20} color="white" />
                            <Text style={styles.actionBtnText}>Track Order</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#FEE2E2', marginTop: 15 }]}
                            onPress={handleCancel}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <>
                                    <XCircle size={20} color="#EF4444" />
                                    <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Cancel Booking</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: 'white' },
    backButton: { padding: 10 },
    backIcon: { fontSize: 24, color: '#1A202C' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20 },

    statusSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontWeight: 'bold', fontSize: 12 },
    priceText: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.brandOrange },

    card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    serviceName: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#1A202C' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    rowText: { marginLeft: 10, color: '#4A5568', fontSize: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#2D3748' },

    proRow: { flexDirection: 'row', alignItems: 'center' },
    proAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    proInitials: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.brandOrange },
    proInfo: { flex: 1 },
    proName: { fontSize: 16, fontWeight: 'bold' },
    proSub: { fontSize: 13, color: '#718096' },
    chatBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Theme.colors.brandOrange, justifyContent: 'center', alignItems: 'center' },

    actions: { marginTop: 10 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 },
    actionBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
});

export default BookingDetailsScreen;
