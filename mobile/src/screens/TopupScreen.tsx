import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check, Smartphone, CreditCard } from 'lucide-react-native';
import { Theme } from '../theme';
import { userAPI } from '../services/api';

const TopupScreen = () => {
    const navigation = useNavigation();
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [loading, setLoading] = useState(false);

    const handleTopUp = async () => {
        if (!amount) return;
        setLoading(true);
        try {
            await userAPI.topupWallet(amount);
            Alert.alert('Success', `₹${amount} added to wallet successfully!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to topup wallet');
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

                <TouchableOpacity
                    style={[styles.paymentOption, selectedMethod === 'upi' && styles.selectedOption]}
                    onPress={() => setSelectedMethod('upi')}
                >
                    <View style={styles.optionLeft}>
                        <View style={styles.iconBox}>
                            <Smartphone size={20} color={Theme.colors.brandOrange} />
                        </View>
                        <View>
                            <Text style={styles.optionTitle}>UPI</Text>
                            <Text style={styles.optionSubtitle}>Google Pay, PhonePe, Paytm</Text>
                        </View>
                    </View>
                    {selectedMethod === 'upi' && (
                        <View style={styles.checkCircle}>
                            <View style={styles.innerCircle} />
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.paymentOption, selectedMethod === 'card' && styles.selectedOption]}
                    onPress={() => setSelectedMethod('card')}
                >
                    <View style={styles.optionLeft}>
                        <View style={styles.iconBox}>
                            <CreditCard size={20} color={Theme.colors.brandOrange} />
                        </View>
                        <View>
                            <Text style={styles.optionTitle}>Debit / Credit Card</Text>
                            <Text style={styles.optionSubtitle}>Visa, Mastercard, Rupay</Text>
                        </View>
                    </View>
                    {selectedMethod === 'card' && (
                        <View style={styles.checkCircle}>
                            <View style={styles.innerCircle} />
                        </View>
                    )}
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, !amount && styles.disabledButton]}
                    onPress={handleTopUp}
                    disabled={!amount}
                >
                    <Text style={styles.payButtonText}>PROCEED TO PAY {amount ? `₹${amount}` : ''}</Text>
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

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: 'white' },
    payButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    disabledButton: { backgroundColor: '#CBD5E0' },
    payButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});

export default TopupScreen;
