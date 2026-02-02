import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { bookingAPI } from '../services/api';

type BookingTrackingRouteProp = RouteProp<RootStackParamList, 'BookingTracking'>;

const BookingTrackingScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingTrackingRouteProp>();
    const { bookingId, item, date, slot, location } = route.params;
    const insets = useSafeAreaInsets();

    const [professional, setProfessional] = useState({
        name: 'Loading...',
        status: 'DISPATCHED',
        estimatedTime: '12m',
        image: 'https://randomuser.me/api/portraits/men/32.jpg'
    });

    useEffect(() => {
        // Fetch initial tracking data
        const fetchTracking = async () => {
            try {
                const response = await bookingAPI.getBookingTracking(bookingId);
                setProfessional({
                    name: response.data.professional.name,
                    status: response.data.status,
                    estimatedTime: response.data.estimatedTime,
                    image: 'https://randomuser.me/api/portraits/men/32.jpg'
                });
            } catch (error) {
                console.error('Error fetching tracking:', error);
            }
        };

        fetchTracking();

        // Poll for updates every 10 seconds
        const interval = setInterval(fetchTracking, 10000);

        return () => clearInterval(interval);
    }, [bookingId]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('MainTabs')}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.statusBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.statusText}>{professional.estimatedTime} • LIVE</Text>
                </View>
            </View>

            {/* Map Placeholder */}
            <View style={styles.mapContainer}>
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapText}>📍 Map View</Text>
                    <Text style={styles.mapSubtext}>Live tracking will appear here</Text>
                </View>

                {/* Home Delivery Hub Marker */}
                <View style={styles.hubMarker}>
                    <View style={styles.hubIcon}>
                        <Text style={styles.hubIconText}>🏠</Text>
                    </View>
                    <Text style={styles.hubLabel}>HOME</Text>
                    <Text style={styles.hubLabel}>DELIVERY</Text>
                    <Text style={styles.hubLabel}>HUB</Text>
                </View>
            </View>

            {/* Professional Card */}
            <View style={[styles.professionalCard, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.professionalInfo}>
                    <View style={styles.professionalImageContainer}>
                        <Image
                            source={{ uri: professional.image }}
                            style={styles.professionalImage}
                        />
                        <View style={styles.professionalBadge}>
                            <Text style={styles.badgeIcon}>⚡</Text>
                        </View>
                    </View>
                    <View style={styles.professionalDetails}>
                        <Text style={styles.professionalName}>{professional.name}</Text>
                        <View style={styles.statusContainer}>
                            <Text style={styles.timeText}>{professional.estimatedTime}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.statusLabel}>{professional.status}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.alertButton}
                        onPress={() => navigation.navigate('SOS', { bookingId: bookingId })}
                    >
                        <View style={styles.alertIcon}>
                            <Text style={styles.alertIconText}>⚠️</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => navigation.navigate('Chat', {
                            bookingId: bookingId,
                            professionalName: professional.name,
                            professionalImage: professional.image
                        })}
                    >
                        <Text style={styles.chatIcon}>💬</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF'
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3
    },
    backIcon: { fontSize: 24, color: '#1A202C' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#48BB78',
        marginRight: 8
    },
    statusText: { fontSize: 12, fontWeight: 'bold', color: '#1A202C' },

    mapContainer: { flex: 1, position: 'relative' },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    mapText: { fontSize: 32, marginBottom: 10 },
    mapSubtext: { fontSize: 14, color: '#718096' },

    hubMarker: {
        position: 'absolute',
        top: '30%',
        right: '20%',
        alignItems: 'center'
    },
    hubIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Theme.colors.brandOrange,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: Theme.colors.brandOrange,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    hubIconText: { fontSize: 28 },
    hubLabel: { fontSize: 10, fontWeight: 'bold', color: '#1A202C', lineHeight: 12 },

    professionalCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10
    },
    professionalInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    professionalImageContainer: { position: 'relative', marginRight: 15 },
    professionalImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: Theme.colors.brandOrange
    },
    professionalBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Theme.colors.brandOrange,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF'
    },
    badgeIcon: { fontSize: 12 },
    professionalDetails: { flex: 1 },
    professionalName: { fontSize: 20, fontWeight: 'bold', color: '#1A202C', marginBottom: 5 },
    statusContainer: { flexDirection: 'row', alignItems: 'center' },
    timeText: { fontSize: 14, fontWeight: 'bold', color: '#1A202C' },
    dot: { marginHorizontal: 8, color: '#A0AEC0' },
    statusLabel: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.brandOrange },

    actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    alertButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FED7D7',
        justifyContent: 'center',
        alignItems: 'center'
    },
    alertIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FC8181',
        justifyContent: 'center',
        alignItems: 'center'
    },
    alertIconText: { fontSize: 24 },
    chatButton: {
        flex: 1,
        marginLeft: 15,
        height: 60,
        borderRadius: 30,
        backgroundColor: Theme.colors.brandOrange,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.colors.brandOrange,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    chatIcon: { fontSize: 28 }
});

export default BookingTrackingScreen;
