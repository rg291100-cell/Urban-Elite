import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Theme } from '../theme';

const MOCK_VENDORS = [
    {
        id: 'v1',
        name: 'Rajesh Kumar',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4.8,
        reviews: 124,
        jobs: 312,
        verified: true,
        specialty: 'Expert',
    },
    {
        id: 'v2',
        name: 'Sunita Sharma',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 4.9,
        reviews: 89,
        jobs: 156,
        verified: true,
        specialty: 'Professional',
    },
    {
        id: 'v3',
        name: 'Amit Verma',
        image: 'https://randomuser.me/api/portraits/men/86.jpg',
        rating: 4.6,
        reviews: 45,
        jobs: 98,
        verified: false,
        specialty: 'Standard',
    },
    {
        id: 'v4',
        name: 'Priya Singh',
        image: 'https://randomuser.me/api/portraits/women/68.jpg',
        rating: 4.7,
        reviews: 210,
        jobs: 540,
        verified: true,
        specialty: 'Expert',
    },
    {
        id: 'v5',
        name: 'Vikram Malhotra',
        image: 'https://randomuser.me/api/portraits/men/22.jpg',
        rating: 4.5,
        reviews: 15,
        jobs: 42,
        verified: false,
        specialty: 'New',
    }
];

const VendorSelectionScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { item } = route.params;

    const handleSelectVendor = (vendor: any) => {
        // Pass both service item and selected vendor to Booking Overview
        // Update the item to include vendor info if needed, or pass separately
        const bookingItem = {
            ...item,
            provider: {
                name: vendor.name,
                image: vendor.image,
                rating: vendor.rating,
                services: `${vendor.jobs} Jobs`,
                verified: vendor.verified
            }
        };
        navigation.navigate('BookingOverview', { item: bookingItem, vendor });
    };

    const renderVendorItem = ({ item: vendor }: { item: typeof MOCK_VENDORS[0] }) => (
        <View style={styles.card}>
            <Image source={{ uri: vendor.image }} style={styles.avatar} />
            <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{vendor.name}</Text>
                    {vendor.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                </View>
                <Text style={styles.specialty}>{vendor.specialty} • {vendor.jobs} Jobs</Text>
                <View style={styles.ratingRow}>
                    <Text style={styles.star}>★</Text>
                    <Text style={styles.rating}>{vendor.rating} ({vendor.reviews})</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleSelectVendor(vendor)}
            >
                <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Select Professional</Text>
            </View>

            <View style={styles.serviceHeader}>
                <Text style={styles.serviceTitle}>{item?.title || 'Service'}</Text>
                <Text style={styles.serviceSub}>Choose from our top rated professionals</Text>
            </View>

            <FlatList
                data={MOCK_VENDORS}
                renderItem={renderVendorItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    backArrow: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.textDark },
    pageTitle: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.textDark },
    serviceHeader: { paddingHorizontal: 20, marginBottom: 20 },
    serviceTitle: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.brandOrange },
    serviceSub: { fontSize: 14, color: '#A0AEC0', marginTop: 5 },
    listContent: { paddingHorizontal: 20, paddingBottom: 20 },
    card: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
    infoContainer: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    name: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
    verifiedBadge: { marginLeft: 5, color: '#48BB78', fontWeight: 'bold', fontSize: 14 },
    specialty: { fontSize: 12, color: '#A0AEC0', marginVertical: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    star: { color: '#ECC94B', fontSize: 12, marginRight: 2 },
    rating: { fontSize: 12, fontWeight: 'bold', color: '#4A5568' },
    selectButton: { backgroundColor: Theme.colors.brandOrange, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    selectButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});

export default VendorSelectionScreen;
