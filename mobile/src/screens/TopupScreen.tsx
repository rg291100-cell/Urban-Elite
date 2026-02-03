import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useIsFocused } from '@react-navigation/native';
import { ArrowLeft, Check, Smartphone, CreditCard, Plus } from 'lucide-react-native';
import { Theme } from '../theme';
import { userAPI } from '../services/api';
import { RootStackParamList } from '../types/navigation';
import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFSession, CFEnvironment, CFWebCheckoutPayment, CFThemeBuilder } from 'cashfree-pg-api-contract';
import { paymentAPI } from '../services/api';

const TopupScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingMethods, setFetchingMethods] = useState(true);

    const currentOrderId = React.useRef<string | null>(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadPaymentMethods();
        });
        return () => {
            unsubscribe();
            // Cleanup callback on unmount
            CFPaymentGatewayService.setCallback({
                onVerify: async () => { },
                onError: () => { }
            });
        };
    }, [navigation]);

    const loadPaymentMethods = async () => {
        try {
            const response = await userAPI.getPaymentMethods();
            setPaymentMethods(response.data);
            // Auto-select first method or default
            const defaultMethod = response.data.find((m: any) => m.isDefault);
            if (defaultMethod) setSelectedMethod(defaultMethod);
            else if (response.data.length > 0) setSelectedMethod(response.data[0]);
        } catch (error) {
            console.error(error);
        } finally {
            setFetchingMethods(false);
        }
    };

    const handleTopUp = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order on Backend
            const orderResponse = await paymentAPI.createOrder({
                orderAmount: amount,
                orderCurrency: 'INR',
                customerId: 'USER_ID_HERE', // In real app, get from auth service
                customerPhone: '9999999999',
                customerName: 'Urban Elite User',
                customerEmail: 'user@example.com'
            });

            const { payment_session_id, order_id } = orderResponse.data;
            currentOrderId.current = order_id;

            // 2. Initiate Cashfree SDK
            CFPaymentGatewayService.setCallback({
                onVerify: async (orderID: string) => {
                    // Guard: Only process if order ID matches current request
                    if (orderID !== currentOrderId.current) {
                        console.log('Ignoring callback for old/mismatched order:', orderID);
                        return;
                    }

                    // 3. Verify Payment on Backend
                    try {
                        await paymentAPI.verifyPayment({ orderId: orderID, type: 'TOPUP' });
                        // 4. Update Wallet (Topup)
                        await userAPI.topupWallet(amount); // Removed method ID logic for now as it's a direct gateway payment
                        Alert.alert('Success', `₹${amount} added to wallet successfully!`, [
                            { text: 'OK', onPress: () => navigation.goBack() }
                        ]);
                    } catch (error) {
                        Alert.alert('Error', 'Payment verification failed');
                    }
                },
                onError: (error: any, orderID: string) => {
                    if (orderID !== currentOrderId.current) return;
                    Alert.alert('Error', error.message || 'Payment failed');
                }
            });

            const session = new CFSession(payment_session_id, order_id, CFEnvironment.SANDBOX);
            // Use WebCheckout for better Sandbox compatibility
            CFPaymentGatewayService.doWebPayment(session);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    const PRESET_AMOUNTS = ['100', '500', '1000', '2000'];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Top Up Wallet</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.label}>Enter Amount</Text>
                <View style={styles.inputWrapper}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor="#CBD5E0"
                        autoFocus
                    />
                </View>

                <View style={styles.presetsContainer}>
                    {PRESET_AMOUNTS.map((amt) => (
                        <TouchableOpacity
                            key={amt}
                            style={styles.presetChip}
                            onPress={() => setAmount(amt)}
                        >
                            <Text style={styles.presetText}>₹{amt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.label, { marginTop: 30 }]}>Select Payment Method</Text>

                {fetchingMethods ? (
                    <ActivityIndicator color={Theme.colors.brandOrange} style={{ marginVertical: 20 }} />
                ) : paymentMethods.length === 0 ? (
                    <View style={{ alignItems: 'center', marginVertical: 20 }}>
                        <Text style={{ color: '#94A3B8', marginBottom: 15 }}>No payment methods saved</Text>
                    </View>
                ) : (
                    paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[styles.paymentOption, selectedMethod?.id === method.id && styles.selectedOption]}
                            onPress={() => setSelectedMethod(method)}
                        >
                            <View style={styles.optionLeft}>
                                <View style={styles.iconBox}>
                                    {method.type === 'card' ? (
                                        <CreditCard size={20} color={Theme.colors.brandOrange} />
                                    ) : (
                                        <Smartphone size={20} color={Theme.colors.brandOrange} />
                                    )}
                                </View>
                                <View>
                                    <Text style={styles.optionTitle}>{method.label}</Text>
                                    <Text style={styles.optionSubtitle}>
                                        {method.type === 'card' ? `**** ${method.detail}` : method.detail}
                                    </Text>
                                </View>
                            </View>
                            {selectedMethod?.id === method.id && (
                                <View style={styles.checkCircle}>
                                    <View style={styles.innerCircle} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                )}

                {/* Add New Payment Method */}
                <TouchableOpacity
                    style={styles.addNewButton}
                    onPress={() => navigation.navigate('AddPaymentMethod')}
                >
                    <Plus size={20} color={Theme.colors.brandOrange} />
                    <Text style={styles.addNewText}>Add New Payment Method</Text>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <View style={{ marginBottom: 10, padding: 10, backgroundColor: '#FFF5F5', borderRadius: 8, borderWidth: 1, borderColor: '#FEB2B2' }}>
                    <Text style={{ color: '#C53030', fontSize: 12, fontWeight: 'bold' }}>SANDBOX MODE ACTIVE</Text>
                    <Text style={{ color: '#2D3748', fontSize: 10, marginTop: 4 }}>Use Test UPI: <Text style={{ fontWeight: 'bold' }}>testsuccess@gocashfree</Text></Text>
                    <Text style={{ color: '#2D3748', fontSize: 10 }}>Use Test Card: <Text style={{ fontWeight: 'bold' }}>Any valid format (e.g. 4111 1111 1111 1111)</Text></Text>
                </View>
                <TouchableOpacity
                    style={[styles.payButton, (!amount || !selectedMethod) && styles.disabledButton]}
                    onPress={handleTopUp}
                    disabled={!amount || !selectedMethod || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.payButtonText}>PROCEED TO PAY {amount ? `₹${amount}` : ''}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },
    content: { padding: 20, flex: 1 },

    label: { fontSize: 14, fontWeight: 'bold', color: '#64748B', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },

    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: Theme.colors.brandOrange, paddingBottom: 10, marginHorizontal: 20 },
    currencySymbol: { fontSize: 40, fontWeight: 'bold', color: Theme.colors.textDark, marginRight: 10 },
    input: { flex: 1, fontSize: 40, fontWeight: 'bold', color: Theme.colors.textDark },

    presetsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20, justifyContent: 'center' },
    presetChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7D7' },
    presetText: { color: Theme.colors.brandOrange, fontWeight: 'bold' },

    paymentOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0' },
    selectedOption: { borderColor: Theme.colors.brandOrange, backgroundColor: '#FFFAF0' },
    optionLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, backgroundColor: '#F7FAFC', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    optionTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark },
    optionSubtitle: { fontSize: 12, color: '#94A3B8' },

    checkCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Theme.colors.brandOrange, alignItems: 'center', justifyContent: 'center' },
    innerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: Theme.colors.brandOrange },

    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 15,
        marginTop: 10,
        borderWidth: 2,
        borderColor: Theme.colors.brandOrange,
        borderStyle: 'dashed',
        backgroundColor: '#FFF7ED'
    },
    addNewText: { color: Theme.colors.brandOrange, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: 'white' },
    payButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    disabledButton: { backgroundColor: '#CBD5E0' },
    payButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});

export default TopupScreen;
