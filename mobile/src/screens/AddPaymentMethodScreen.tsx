import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react-native';
import { Theme } from '../theme';
import { userAPI } from '../services/api';

const AddPaymentMethodScreen = () => {
    const navigation = useNavigation();

    const [methodType, setMethodType] = useState<'card' | 'upi'>('card');
    const [loading, setLoading] = useState(false);

    // Card fields
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    // UPI fields
    const [upiId, setUpiId] = useState('');
    const [upiName, setUpiName] = useState('');

    const [isDefault, setIsDefault] = useState(false);

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\s/g, '');
        const chunks = cleaned.match(/.{1,4}/g);
        return chunks ? chunks.join(' ') : cleaned;
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    };

    const handleSave = async () => {
        if (methodType === 'card') {
            if (!cardNumber || !cardName || !expiryDate || !cvv) {
                Alert.alert('Error', 'Please fill all card details');
                return;
            }
            if (cardNumber.replace(/\s/g, '').length !== 16) {
                Alert.alert('Error', 'Card number must be 16 digits');
                return;
            }
        } else {
            if (!upiId || !upiName) {
                Alert.alert('Error', 'Please fill all UPI details');
                return;
            }
            if (!upiId.includes('@')) {
                Alert.alert('Error', 'Please enter a valid UPI ID');
                return;
            }
        }

        setLoading(true);
        try {
            if (methodType === 'card') {
                const last4 = cardNumber.replace(/\s/g, '').slice(-4);
                await userAPI.addPaymentMethod({
                    type: 'card',
                    label: cardName,
                    detail: last4,
                    isDefault
                });
            } else {
                await userAPI.addPaymentMethod({
                    type: 'upi',
                    label: upiName,
                    detail: upiId,
                    isDefault
                });
            }
            Alert.alert('Success', 'Payment method added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save payment method');
        } finally {
            setLoading(false);
        }
    };

    const TypeButton = ({ label, icon: Icon, value }: any) => (
        <TouchableOpacity
            style={[styles.typeButton, methodType === value && styles.typeButtonActive]}
            onPress={() => setMethodType(value)}
        >
            <Icon size={20} color={methodType === value ? 'white' : Theme.colors.textDark} />
            <Text style={[styles.typeText, methodType === value && styles.typeTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Payment Method</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Method Type */}
                <Text style={styles.label}>Payment Type</Text>
                <View style={styles.typesContainer}>
                    <TypeButton label="Card" icon={CreditCard} value="card" />
                    <TypeButton label="UPI" icon={Smartphone} value="upi" />
                </View>

                {methodType === 'card' ? (
                    <>
                        {/* Card Number */}
                        <Text style={styles.label}>Card Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1234 5678 9012 3456"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            maxLength={19}
                            value={cardNumber}
                            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                        />

                        {/* Cardholder Name */}
                        <Text style={styles.label}>Cardholder Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor="#94A3B8"
                            value={cardName}
                            onChangeText={setCardName}
                            autoCapitalize="words"
                        />

                        {/* Expiry and CVV */}
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>Expiry Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MM/YY"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numeric"
                                    maxLength={5}
                                    value={expiryDate}
                                    onChangeText={(text) => setExpiryDate(formatExpiry(text))}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>CVV</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="123"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numeric"
                                    maxLength={3}
                                    secureTextEntry
                                    value={cvv}
                                    onChangeText={setCvv}
                                />
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        {/* UPI ID */}
                        <Text style={styles.label}>UPI ID</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="yourname@upi"
                            placeholderTextColor="#94A3B8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={upiId}
                            onChangeText={setUpiId}
                        />

                        {/* UPI Name */}
                        <Text style={styles.label}>Account Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor="#94A3B8"
                            value={upiName}
                            onChangeText={setUpiName}
                            autoCapitalize="words"
                        />
                    </>
                )}

                {/* Default Toggle */}
                <View style={styles.defaultRow}>
                    <Text style={styles.labelRow}>Set as Default Payment Method</Text>
                    <Switch
                        trackColor={{ false: '#E2E8F0', true: '#FFEDD5' }}
                        thumbColor={isDefault ? Theme.colors.brandOrange : '#f4f3f4'}
                        onValueChange={setIsDefault}
                        value={isDefault}
                    />
                </View>

            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Payment Method</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: 'white' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },
    content: { padding: 20 },

    label: { fontSize: 14, fontWeight: '600', color: Theme.colors.textDark, marginBottom: 12, marginTop: 10 },

    typesContainer: { flexDirection: 'row', gap: 10, marginBottom: 25 },
    typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
    typeButtonActive: { backgroundColor: Theme.colors.brandOrange, borderColor: Theme.colors.brandOrange },
    typeText: { fontSize: 14, fontWeight: '500', color: Theme.colors.textDark },
    typeTextActive: { color: 'white' },

    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, fontSize: 16, color: Theme.colors.textDark, marginBottom: 15 },

    row: { flexDirection: 'row', marginBottom: 15 },

    defaultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 10 },
    labelRow: { fontSize: 16, fontWeight: '500', color: Theme.colors.textDark },

    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    saveButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default AddPaymentMethodScreen;
