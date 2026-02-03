import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../theme';
import { vendorAPI } from '../../services/api';
import { Briefcase } from 'lucide-react-native';

const VendorServicesScreen = () => {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<any[]>([]);

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
                <Text style={styles.headerSubtitle}>Manage your service offerings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {services.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No services available</Text>
                    </View>
                ) : (
                    services.map((service) => (
                        <View key={service.id} style={styles.serviceCard}>
                            <View style={styles.serviceLeft}>
                                <View style={styles.serviceIconContainer}>
                                    <Briefcase size={24} color={Theme.colors.brandOrange} />
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    <Text style={styles.serviceDescription}>
                                        {service.description || 'Professional service'}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={true}
                                onValueChange={() => { }}
                                trackColor={{ false: '#E5E7EB', true: Theme.colors.brandOrange }}
                                thumbColor="#FFF"
                            />
                        </View>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.textDark },
    headerSubtitle: { fontSize: 14, color: Theme.colors.textLight, marginTop: 5 },

    content: { flex: 1, paddingHorizontal: 20 },

    serviceCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
    serviceLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    serviceIconContainer: { width: 50, height: 50, backgroundColor: '#FFF7ED', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 4 },
    serviceDescription: { fontSize: 13, color: Theme.colors.textLight },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyStateText: { fontSize: 14, color: Theme.colors.textLight },
});

export default VendorServicesScreen;
