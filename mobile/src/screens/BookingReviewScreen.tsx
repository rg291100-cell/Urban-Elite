import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { bookingAPI, paymentAPI } from '../services/api';
import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFSession as CFSessionContract, CFEnvironment as CFEnvironmentContract, CFWebCheckoutPayment as CFWebCheckoutPaymentContract, CFThemeBuilder as CFThemeBuilderContract } from 'cashfree-pg-api-contract';

type BookingReviewRouteProp = RouteProp<RootStackParamList, 'BookingReview'>;

const BookingReviewScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingReviewRouteProp>();
    const { item, date, slot, location, instructions } = route.params;
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState<boolean>(false);
    const currentOrderId = React.useRef<string | null>(null);

    const [paymentMode, setPaymentMode] = useState<'PREPAID' | 'POSTPAID'>('PREPAID');

    // Cleanup callback on unmount
    React.useEffect(() => {
        return () => {
            CFPaymentGatewayService.setCallback({
                onVerify: async () => { },
                onError: () => { }
            });
        };
    }, []);

    const handleConfirm = async () => {
        setLoading(true);

        if (paymentMode === 'POSTPAID') {
            await createBooking('POSTPAID');
            return;
        }

        try {
            // Prepaid Flow (Cashfree)
            const priceValue = parseFloat(item.price.replace(/[₹,]/g, ''));
            const orderResponse = await paymentAPI.createOrder({
                orderAmount: priceValue,
                orderCurrency: 'INR',
                customerId: 'USER_123',
                customerPhone: '9999999999',
                customerName: 'Urban Elite User',
                customerEmail: 'user@example.com'
            });

            const { payment_session_id, order_id } = orderResponse.data;
            currentOrderId.current = order_id;

            CFPaymentGatewayService.setCallback({
                onVerify: async (orderID: string) => {
                    if (orderID !== currentOrderId.current) return;
                    try {
                        await paymentAPI.verifyPayment({ orderId: orderID });
                        await createBooking('PREPAID');
                    } catch (error) {
                        console.error('Payment verification failed', error);
                        Alert.alert('Error', 'Payment verification failed.');
                        setLoading(false);
                    }
                },
                onError: (error: any, orderID: string) => {
                    if (orderID !== currentOrderId.current) return;
                    Alert.alert('Error', error.message || 'Payment failed');
                    setLoading(false);
                }
            });

            const session = new CFSessionContract(payment_session_id, order_id, CFEnvironmentContract.SANDBOX);
            CFPaymentGatewayService.doWebPayment(session);

        } catch (error) {
            console.error('Payment initiation error:', error);
            Alert.alert('Error', 'Failed to initiate payment.');
            setLoading(false);
        }
    };

    const createBooking = async (mode: 'PREPAID' | 'POSTPAID') => {
        try {
            const response = await bookingAPI.createBooking({
                serviceId: item.id,
                serviceName: item.title,
                date,
                timeSlot: slot,
                location,
                instructions: instructions || '',
                price: item.price,
                paymentMode: mode
            });

            navigation.navigate('BookingTracking', {
                bookingId: response.data.bookingId,
                item,
                date,
                slot,
                location
            });
        } catch (error) {
            console.error('Booking creation error:', error);
            Alert.alert('Error', 'Booking failed. Please contact support.');
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
                        <Text style={styles.subTitle}>Select payment preferred option</Text>
                    </View>
                </View>

                {/* Service Info Mini Card */}
                <View style={styles.miniCard}>
                    <View>
                        <Text style={styles.detailLabel}>SERVICE</Text>
                        <Text style={styles.detailValue}>{item.title}</Text>
                        <Text style={styles.detailSub}>{date} @ {slot}</Text>
                    </View>
                    <Text style={styles.miniPrice}>{item.price}</Text>
                </View>

                {/* Payment Mode Selection */}
                <Text style={styles.sectionTitle}>Payment Method</Text>

                <TouchableOpacity
                    style={[styles.paymentOption, paymentMode === 'PREPAID' && styles.selectedOption]}
                    onPress={() => setPaymentMode('PREPAID')}
                >
                    <View style={[styles.radio, paymentMode === 'PREPAID' && styles.radioActive]} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, paymentMode === 'PREPAID' && styles.selectedOptionText]}>Pay Now</Text>
                        <Text style={[styles.optionDesc, paymentMode === 'PREPAID' && styles.selectedOptionText]}>Secure online payment via Cashfree</Text>
                    </View>
                    <Text style={styles.optionPrice}>{item.price}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.paymentOption, paymentMode === 'POSTPAID' && styles.selectedOption]}
                    onPress={() => setPaymentMode('POSTPAID')}
                >
                    <View style={[styles.radio, paymentMode === 'POSTPAID' && styles.radioActive]} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.optionTitle, paymentMode === 'POSTPAID' && styles.selectedOptionText]}>Pay After Service</Text>
                        <Text style={[styles.optionDesc, paymentMode === 'POSTPAID' && styles.selectedOptionText]}>Pay directly to the professional later</Text>
                    </View>
                    <Text style={styles.optionPrice}>{item.price}</Text>
                </TouchableOpacity>

                {/* Note */}
                <View style={styles.noteContainer}>
                    <View style={styles.noteIcon}>
                        <Text style={styles.noteIconText}>ℹ️</Text>
                    </View>
                    <Text style={styles.noteText}>
                        {paymentMode === 'PREPAID' ? (
                            <Text>Full payment of <Text style={styles.noteBold}>{item.price}</Text> will be charged now to confirm booking.</Text>
                        ) : (
                            <Text>No immediate payment required. You can pay after job completion.</Text>
                        )}
                    </Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                {paymentMode === 'PREPAID' && (
                    <View style={{ position: 'absolute', top: -70, left: 20, right: 20, padding: 10, backgroundColor: '#FFF5F5', borderRadius: 8, borderWidth: 1, borderColor: '#FEB2B2', zIndex: 10 }}>
                        <Text style={{ color: '#C53030', fontSize: 12, fontWeight: 'bold' }}>SANDBOX MODE</Text>
                        <Text style={{ color: '#2D3748', fontSize: 10 }}>Test UPI: <Text style={{ fontWeight: 'bold' }}>testsuccess@gocashfree</Text></Text>
                    </View>
                )}
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
                        <Text style={styles.confirmButtonText}>
                            {paymentMode === 'PREPAID' ? 'Pay & Confirm' : 'Confirm Booking'}
                        </Text>
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
    pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', lineHeight: 36,  },
    subTitle: { fontSize: 16, color: '#718096', marginTop: 10, fontWeight: '600' },

    detailsContainer: { marginBottom: 30 },
    detailRow: { marginBottom: 20 },
    detailLabel: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 8 },
    detailValue: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
    detailSub: { fontSize: 14, color: '#A0AEC0', marginTop: 2 },

    miniCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#EDF2F7' },
    miniPrice: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.brandOrange },

    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A202C', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },

    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#EDF2F7'
    },
    selectedOption: {
        borderColor: Theme.colors.brandOrange,
        backgroundColor: '#FFFAF0'
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#CBD5E0',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    radioActive: {
        borderColor: Theme.colors.brandOrange,
        backgroundColor: '#FFF'
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Theme.colors.brandOrange
    },
    optionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 2 },
    optionDesc: { fontSize: 12, color: '#718096' },
    optionPrice: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginLeft: 10 },
    selectedOptionText: { color: '#1A202C' },

    priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    priceLabel: { fontSize: 20, fontWeight: 'bold', color: '#1A202C' },
    priceValue: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.brandOrange },

    noteContainer: { flexDirection: 'row', backgroundColor: '#FFF5F0', borderRadius: 15, padding: 15, alignItems: 'flex-start' },
    noteIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.brandOrange, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    noteIconText: { fontSize: 16 },
    noteText: { flex: 1, fontSize: 13, color: '#1A202C', lineHeight: 20 },
    noteBold: { fontWeight: 'bold', color: '#C05621' },

    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center', justifyContent: 'space-between' },
    backButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', width: '30%', alignItems: 'center' },
    backButtonText: { fontWeight: 'bold', color: '#4A5568' },
    confirmButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 15, borderRadius: 20, width: '65%', alignItems: 'center', shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    confirmButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    disabledButton: { opacity: 0.6 }
});

export default BookingReviewScreen;
