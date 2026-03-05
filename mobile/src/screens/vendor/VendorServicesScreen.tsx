import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../theme';
import { vendorAPI } from '../../services/api';
import { Briefcase, CheckCircle2 } from 'lucide-react-native';

const VendorServicesScreen = () => {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<any[]>([]);
    const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await vendorAPI.getServices();
            setServices(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateService = async (serviceId: string, customPrice: string, isEnabled: boolean) => {
        setUpdatingMap(prev => ({ ...prev, [serviceId]: true }));
        try {
            const response = await vendorAPI.updateServiceItem({
                serviceItemId: serviceId,
                customPrice,
                isEnabled
            });
            if (response.data.success) {
                // Update local state
                setServices(prev => prev.map(s => s.id === serviceId ? { ...s, customPrice, isEnabled } : s));
            }
        } catch (error: any) {
            Alert.alert('Update Failed', error.response?.data?.error || 'Could not update service.');
        } finally {
            setUpdatingMap(prev => ({ ...prev, [serviceId]: false }));
        }
    };

    const onPriceChange = (serviceId: string, text: string) => {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, customPrice: text } : s));
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Services</Text>
                <Text style={styles.headerSubtitle}>Manage your offerings and pricing</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {services.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No services assigned to you yet.</Text>
                    </View>
                ) : (
                    services.map((service) => (
                        <View key={service.id} style={[styles.serviceCard, !service.isEnabled && styles.disabledCard]}>
                            <View style={styles.serviceMain}>
                                <View style={styles.serviceTop}>
                                    <View style={styles.serviceIconContainer}>
                                        {service.image ? (
                                            <Image source={{ uri: service.image }} style={styles.serviceImage} />
                                        ) : (
                                            <Briefcase size={24} color={Theme.colors.brandOrange} />
                                        )}
                                    </View>
                                    <View style={styles.serviceInfo}>
                                        <Text style={styles.serviceName}>{service.name}</Text>
                                        <Text style={styles.basePriceBadge}>Base Price: {service.basePrice || 'N/A'}</Text>
                                    </View>
                                    <Switch
                                        value={service.isEnabled}
                                        onValueChange={(val) => handleUpdateService(service.id, service.customPrice, val)}
                                        trackColor={{ false: '#E2E8F0', true: Theme.colors.brandOrange }}
                                        thumbColor="#FFF"
                                    />
                                </View>

                                <View style={styles.priceSection}>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.currencyPrefix}>₹</Text>
                                        <TextInput
                                            style={styles.priceInput}
                                            value={service.customPrice}
                                            placeholder="Set your price"
                                            keyboardType="numeric"
                                            onChangeText={(text) => onPriceChange(service.id, text)}
                                            editable={!updatingMap[service.id]}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.saveButton, updatingMap[service.id] && styles.buttonDisabled]}
                                        onPress={() => handleUpdateService(service.id, service.customPrice, service.isEnabled)}
                                        disabled={updatingMap[service.id]}
                                    >
                                        {updatingMap[service.id] ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} color="#FFF" />
                                                <Text style={styles.saveButtonText}>Save</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingHorizontal: 20, paddingTop: 24, marginBottom: 20 },
    headerTitle: { fontSize: 32, fontWeight: '900', color: Theme.colors.textDark, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 6, fontWeight: '500' },

    content: { flex: 1, paddingHorizontal: 20 },

    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    disabledCard: {
        opacity: 0.6,
        backgroundColor: '#F1F5F9',
    },
    serviceMain: { width: '100%' },
    serviceTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    serviceIconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#FFF7ED',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    serviceImage: { width: 40, height: 40, borderRadius: 8 },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    basePriceBadge: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 48,
        marginRight: 12
    },
    currencyPrefix: { fontSize: 16, color: '#64748B', fontWeight: '700', marginRight: 4 },
    priceInput: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '700', padding: 0 },

    saveButton: {
        backgroundColor: Theme.colors.brandOrange,
        paddingHorizontal: 20,
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90
    },
    buttonDisabled: { backgroundColor: '#94A3B8' },
    saveButtonText: { color: '#FFF', fontWeight: '800', marginLeft: 6, fontSize: 14 },

    emptyState: { padding: 60, alignItems: 'center' },
    emptyStateText: { fontSize: 15, color: '#94A3B8', textAlign: 'center', fontWeight: '500' },
});

export default VendorServicesScreen;
