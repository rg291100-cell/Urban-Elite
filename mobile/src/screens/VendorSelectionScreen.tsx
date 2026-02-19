import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image,
    TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Theme } from '../theme';
import { vendorListingAPI } from '../services/api';

interface Vendor {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    jobs: number;
    verified: boolean;
    specialty: string;
    businessName?: string;
    serviceCategory?: string;
    experienceYears?: number;
}

const SPECIALTY_CONFIG: Record<string, { color: string; bg: string }> = {
    Expert: { color: '#6B46C1', bg: '#EDE9FE' },
    Professional: { color: '#2B6CB0', bg: '#EBF8FF' },
    Standard: { color: '#276749', bg: '#F0FFF4' },
    New: { color: '#744210', bg: '#FFFAF0' },
};

const VendorSelectionScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { item } = route.params || {};

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Derive category name from the service item
    const categoryName: string =
        typeof item?.category === 'object'
            ? item.category?.name
            : item?.category || item?.categoryName || '';

    const fetchVendors = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const response = await vendorListingAPI.getVendors(
                categoryName ? { categoryName, limit: 30 } : { limit: 30 }
            );
            const data = response.data;
            if (data?.success) {
                setVendors(data.vendors || []);
            } else {
                setError('Could not load professionals.');
            }
        } catch (err) {
            console.error('Vendor fetch error:', err);
            setError('Failed to load professionals. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [categoryName]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const handleSelectVendor = (vendor: Vendor) => {
        if (!item) {
            console.error('No service item found in params');
            return;
        }
        const bookingItem = {
            ...item,
            provider: {
                name: vendor.name,
                image: vendor.image,
                rating: vendor.rating,
                services: `${vendor.jobs} Jobs`,
                verified: vendor.verified,
            },
        };
        navigation.navigate('BookingOverview', { item: bookingItem, vendor });
    };

    const renderVendorItem = ({ item: vendor }: { item: Vendor }) => {
        const cfg = SPECIALTY_CONFIG[vendor.specialty] || SPECIALTY_CONFIG.Professional;
        return (
            <View style={styles.card}>
                <View style={styles.avatarWrapper}>
                    <Image source={{ uri: vendor.image }} style={styles.avatar} />
                    {vendor.verified && (
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedIcon}>✓</Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
                        <View style={[styles.specialtyBadge, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.specialtyText, { color: cfg.color }]}>{vendor.specialty}</Text>
                        </View>
                    </View>

                    <Text style={styles.businessName} numberOfLines={1}>
                        {vendor.businessName || vendor.serviceCategory || 'Service Professional'}
                    </Text>

                    <View style={styles.statsRow}>
                        <Text style={styles.star}>★</Text>
                        <Text style={styles.rating}>{vendor.rating.toFixed(1)}</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.statText}>{vendor.reviews} reviews</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.statText}>{vendor.jobs} jobs</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelectVendor(vendor)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.selectButtonText}>Book</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No professionals found</Text>
            <Text style={styles.emptySubtitle}>
                {categoryName
                    ? `No approved vendors for "${categoryName}" yet.`
                    : 'No approved vendors available right now.'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchVendors()}>
                <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Select Professional</Text>
            </View>

            {/* Service context */}
            <View style={styles.serviceHeader}>
                <Text style={styles.serviceTitle} numberOfLines={1}>
                    {item?.title || 'Service'}
                </Text>
                <Text style={styles.serviceSub}>
                    {loading
                        ? 'Finding top-rated professionals...'
                        : `${vendors.length} professional${vendors.length !== 1 ? 's' : ''} available`}
                    {categoryName ? ` for ${categoryName}` : ''}
                </Text>
            </View>

            {/* Error banner */}
            {error && !loading && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => fetchVendors()}>
                        <Text style={styles.retryLink}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
                    <Text style={styles.loadingText}>Finding professionals...</Text>
                </View>
            ) : (
                <FlatList
                    data={vendors}
                    renderItem={renderVendorItem}
                    keyExtractor={v => v.id}
                    contentContainerStyle={[styles.listContent, vendors.length === 0 && styles.listEmpty]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchVendors(true)}
                            colors={[Theme.colors.brandOrange]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    backArrow: { fontSize: 26, fontWeight: 'bold', color: Theme.colors.textDark, lineHeight: 30 },
    pageTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.textDark },

    // Service sub-header
    serviceHeader: { paddingHorizontal: 20, marginBottom: 16 },
    serviceTitle: { fontSize: 26, fontWeight: '900', color: Theme.colors.brandOrange },
    serviceSub: { fontSize: 13, color: '#A0AEC0', marginTop: 4, fontWeight: '500' },

    // Error
    errorBanner: { marginHorizontal: 20, marginBottom: 10, backgroundColor: '#FFF5F5', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#FED7D7' },
    errorText: { color: '#C53030', fontSize: 13, flex: 1 },
    retryLink: { color: Theme.colors.brandOrange, fontWeight: '700', marginLeft: 10 },

    // List
    listContent: { paddingHorizontal: 20, paddingBottom: 30 },
    listEmpty: { flex: 1 },

    // Vendor card
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        marginBottom: 14,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    avatarWrapper: { position: 'relative', marginRight: 14 },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EDF2F7' },
    verifiedBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: '#48BB78', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#FFF',
    },
    verifiedIcon: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    infoContainer: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
    name: { fontSize: 15, fontWeight: '700', color: '#1A202C', flex: 1 },
    specialtyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 6 },
    specialtyText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

    businessName: { fontSize: 12, color: '#718096', marginBottom: 6 },

    statsRow: { flexDirection: 'row', alignItems: 'center' },
    star: { color: '#ECC94B', fontSize: 13 },
    rating: { fontSize: 13, fontWeight: '700', color: '#1A202C', marginLeft: 2 },
    dot: { marginHorizontal: 5, color: '#CBD5E0', fontWeight: 'bold' },
    statText: { fontSize: 12, color: '#718096' },

    selectButton: {
        backgroundColor: Theme.colors.brandOrange,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 14,
        marginLeft: 10,
        shadowColor: Theme.colors.brandOrange,
        shadowOpacity: 0.35,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    selectButtonText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

    // Loading
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 14, fontSize: 15, color: '#A0AEC0', fontWeight: '500' },

    // Empty state
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 40 },
    emptyIcon: { fontSize: 52, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', lineHeight: 20 },
    retryButton: { marginTop: 20, backgroundColor: Theme.colors.brandOrange, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

export default VendorSelectionScreen;
