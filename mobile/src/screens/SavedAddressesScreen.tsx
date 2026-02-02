import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Home, Briefcase, MapPin, Plus, Trash2, Edit2 } from 'lucide-react-native';
import { Theme } from '../theme';
import { userAPI } from '../services/api';

const SavedAddressesScreen = () => {
    const navigation = useNavigation();

    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const response = await userAPI.getAddresses();
            setAddresses(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = () => {
        // Simple prompt for demo, ideally a modal or new screen
        // For now, we'll just simulate adding a mock address via API to verify integration
        Alert.alert('Add Address', 'Adding a demo address...', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Add', onPress: async () => {
                    try {
                        await userAPI.addAddress({ type: 'Other', address: 'New Demo Address, Bangalore', isDefault: false });
                        loadAddresses();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to add address');
                    }
                }
            }
        ]);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await userAPI.deleteAddress(id);
                        loadAddresses();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete address');
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Addresses</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Plus size={24} color={Theme.colors.brandOrange} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {addresses.map((item) => {
                    const Icon = item.type === 'Home' ? Home : item.type === 'Work' ? Briefcase : MapPin;
                    return (
                        <View key={item.id} style={styles.addressCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.typeContainer}>
                                    <Icon size={18} color={Theme.colors.brandOrange} />
                                    <Text style={styles.addressType}>{item.type}</Text>
                                    {item.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultText}>DEFAULT</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Edit2 size={16} color={Theme.colors.textLight} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
                                        <Trash2 size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.addressText}>{item.address}</Text>
                        </View>
                    );
                })}

                <TouchableOpacity style={styles.addNewButton} onPress={handleAddAddress}>
                    <Plus size={20} color="white" />
                    <Text style={styles.addNewText}>Add New Address</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },
    addButton: { padding: 5 },
    content: { padding: 20 },

    addressCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    typeContainer: { flexDirection: 'row', alignItems: 'center' },
    addressType: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark, marginLeft: 8, marginRight: 8 },
    defaultBadge: { backgroundColor: '#FFEDD5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    defaultText: { fontSize: 10, fontWeight: 'bold', color: Theme.colors.brandOrange },
    actions: { flexDirection: 'row', gap: 10 },
    actionButton: { padding: 5 },
    addressText: { fontSize: 14, color: '#64748B', lineHeight: 20 },

    addNewButton: { backgroundColor: Theme.colors.brandOrange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 15, marginTop: 10, shadowColor: Theme.colors.brandOrange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    addNewText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});

export default SavedAddressesScreen;
