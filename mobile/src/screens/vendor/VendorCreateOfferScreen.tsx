import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { offersAPI } from '../../services/api';
import { ArrowLeft, Tag, Calendar, Image as ImageIcon } from 'lucide-react-native';

const VendorCreateOfferScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'PROMOTION' | 'JOB'>('PROMOTION');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountAmount: '',
        discountCode: '',
        imageUrl: '',
        validUntil: '', // YYYY-MM-DD
    });

    const handleCreate = async () => {
        if (!formData.title || !formData.discountAmount) {
            Alert.alert('Error', 'Title and Amount are required');
            return;
        }

        setLoading(true);
        try {
            await offersAPI.createOffer({
                ...formData,
                type,
                validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined
            });
            Alert.alert('Success', `${type === 'JOB' ? 'Job Opening' : 'Offer'} created successfully!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Create offer error:', error);
            Alert.alert('Error', 'Failed to create offer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{type === 'JOB' ? 'Post Job Opening' : 'Create New Offer'}</Text>
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                {/* Type Selector */}
                <View style={styles.typeContainer}>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'PROMOTION' && styles.activeTypeButton]}
                        onPress={() => setType('PROMOTION')}
                    >
                        <Text style={[styles.typeText, type === 'PROMOTION' && styles.activeTypeText]}>Promotion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'JOB' && styles.activeTypeButton]}
                        onPress={() => setType('JOB')}
                    >
                        <Text style={[styles.typeText, type === 'JOB' && styles.activeTypeText]}>Job Opening</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>{type === 'JOB' ? 'Job Title *' : 'Offer Title *'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={type === 'JOB' ? "e.g. Senior Hairstylist" : "e.g. Summer Sale 20% Off"}
                    value={formData.title}
                    onChangeText={t => setFormData({ ...formData, title: t })}
                />

                <Text style={styles.label}>{type === 'JOB' ? 'Job Description' : 'Description'}</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={type === 'JOB' ? "Describe the role, responsibilities, and requirements..." : "Describe the offer details..."}
                    multiline
                    numberOfLines={4}
                    value={formData.description}
                    onChangeText={t => setFormData({ ...formData, description: t })}
                />

                <Text style={styles.label}>{type === 'JOB' ? 'Salary / Compensation *' : 'Discount Amount *'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={type === 'JOB' ? "e.g. ₹25,000 - ₹35,000 / month" : "e.g. 20% OFF or ₹500 OFF"}
                    value={formData.discountAmount}
                    onChangeText={t => setFormData({ ...formData, discountAmount: t })}
                />

                <Text style={styles.label}>{type === 'JOB' ? 'Job ID / Reference (Optional)' : 'Discount Code (Optional)'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={type === 'JOB' ? "e.g. JOB-2024-001" : "e.g. SAVE20"}
                    autoCapitalize="characters"
                    value={formData.discountCode}
                    onChangeText={t => setFormData({ ...formData, discountCode: t })}
                />

                <Text style={styles.label}>{type === 'JOB' ? 'Application Deadline (YYYY-MM-DD)' : 'Valid Until (YYYY-MM-DD)'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="2024-12-31"
                    value={formData.validUntil}
                    onChangeText={t => setFormData({ ...formData, validUntil: t })}
                />

                <Text style={styles.label}>{type === 'JOB' ? 'Company/Job Image URL (Optional)' : 'Image URL (Optional)'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChangeText={t => setFormData({ ...formData, imageUrl: t })}
                />

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.createButtonText}>{type === 'JOB' ? 'Post Job' : 'Create Offer'}</Text>
                    )}
                </TouchableOpacity>
                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: 'white' },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.textDark },

    content: { padding: 20 },

    label: { fontSize: 14, fontWeight: '600', color: Theme.colors.textDark, marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: 'white', borderRadius: 10, padding: 15, fontSize: 16, color: Theme.colors.textDark, borderWidth: 1, borderColor: '#E2E8F0' },
    textArea: { height: 100, textAlignVertical: 'top' },

    createButton: { backgroundColor: Theme.colors.brandOrange, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30, shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    createButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    typeContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#EDF2F7', borderRadius: 10, padding: 5 },
    typeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    activeTypeButton: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    typeText: { fontSize: 14, fontWeight: 'bold', color: '#A0AEC0' },
    activeTypeText: { color: Theme.colors.brandOrange }
});

export default VendorCreateOfferScreen;
