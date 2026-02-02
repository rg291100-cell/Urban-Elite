import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { bookingAPI } from '../services/api';

type BookingReviewRouteProp = RouteProp<RootStackParamList, 'BookingReview'>;

const BookingReviewScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingReviewRouteProp>();
    const { item, date, slot, location, instructions } = route.params;
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState<boolean>(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const response = await bookingAPI.createBooking({
                serviceId: item.id,
                serviceName: item.title,
                date,
                timeSlot: slot,
                location,
                instructions: instructions || '',
                price: item.price
            });

            // Navigate to tracking screen with booking ID
            navigation.navigate('BookingTracking', {
                bookingId: response.data.bookingId,
                item,
                date,
                slot,
                location
            });
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Failed to confirm booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.activeStep]} />
                    <View style={styles.progressStep} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.titleContainer}>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>5</Text>
                    </View>
                    <View>
                        <Text style={styles.pageTitle}>Review & Place</Text>
                        <Text style={styles.pageTitle}>Request</Text>
                        <Text style={styles.subTitle}>Review your appointment details</Text>
                    </View>
                </View>

                {/* Booking Details */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>SCHEDULED SERVICE</Text>
                        <Text style={styles.detailValue}>{item.title}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>DATE & TIME</Text>
                        <Text style={styles.detailValue}>{date} @ {slot}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>LOCATION</Text>
                        <Text style={styles.detailValue}>{location.type}</Text>
                    </View>
                </View>

                {/* Price */}
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Estimated Total</Text>
                    <Text style={styles.priceValue}>{item.price}</Text>
                </View>

                {/* Payment Note */}
                <View style={styles.noteContainer}>
                    <View style={styles.noteIcon}>
                        <Text style={styles.noteIconText}>ℹ️</Text>
                    </View>
                    <Text style={styles.noteText}>
                        <Text style={styles.noteBold}>Note:</Text> To ensure service satisfaction, your payment will be collected{' '}
                        <Text style={styles.noteUnderline}>only after the professional completes the job</Text>.
                    </Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.confirmButton, loading && styles.disabledButton]}
                    onPress={handleConfirm}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Confirm Request</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { paddingHorizontal: 20, paddingTop: 10 },
    progressBar: { flexDirection: 'row', height: 4, backgroundColor: '#EDF2F7', borderRadius: 2 },
    progressStep: { flex: 1, borderRadius: 2, marginRight: 5, backgroundColor: '#EDF2F7' },
    completedStep: { backgroundColor: Theme.colors.brandOrange },
    activeStep: { backgroundColor: Theme.colors.brandOrange },

    content: { padding: 20 },

    titleContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 40 },
    stepBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.brandOrange, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 5 },
    stepText: { color: '#FFF', fontWeight: 'bold' },
    pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', lineHeight: 36, fontFamily: 'monospace' },
    subTitle: { fontSize: 16, color: '#718096', marginTop: 10, fontWeight: '600' },

    detailsContainer: { marginBottom: 30 },
    detailRow: { marginBottom: 20 },
    detailLabel: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 8 },
    detailValue: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },

    priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    priceLabel: { fontSize: 20, fontWeight: 'bold', color: '#1A202C' },
    priceValue: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.brandOrange },

    noteContainer: { flexDirection: 'row', backgroundColor: '#FFF5F0', borderRadius: 15, padding: 15, alignItems: 'flex-start' },
    noteIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.brandOrange, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    noteIconText: { fontSize: 16 },
    noteText: { flex: 1, fontSize: 13, color: '#1A202C', lineHeight: 20 },
    noteBold: { fontWeight: 'bold', color: '#C05621' },
    noteUnderline: { textDecorationLine: 'underline', color: '#C05621' },

    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center', justifyContent: 'space-between' },
    backButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', width: '30%', alignItems: 'center' },
    backButtonText: { fontWeight: 'bold', color: '#4A5568' },
    confirmButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 15, borderRadius: 20, width: '65%', alignItems: 'center', shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    confirmButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    disabledButton: { opacity: 0.6 }
});

export default BookingReviewScreen;
