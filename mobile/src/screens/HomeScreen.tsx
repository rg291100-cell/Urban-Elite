import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, Animated, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { homeAPI } from '../services/api';
import { Bell, User, Search, X } from 'lucide-react-native';
import { AutoIcon } from '../utils/autoIcon';

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [services, setServices] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const searchInputRef = useRef<TextInput>(null);
    const searchAnim = useRef(new Animated.Value(0)).current;

    // Filtering — runs every render, always fresh
    const filteredServices = searchQuery.trim()
        ? services.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        : services;

    useEffect(() => {
        homeAPI.getHomeData()
            .then(res => setServices(res.data.services || []))
            .catch(err => console.error('HomeScreen fetch error:', err))
            .finally(() => setLoading(false));
    }, []);

    const openSearch = () => {
        setSearchOpen(true);
        Animated.spring(searchAnim, { toValue: 1, useNativeDriver: false, tension: 80, friction: 10 })
            .start(() => searchInputRef.current?.focus());
    };

    const closeSearch = () => {
        Keyboard.dismiss();
        setSearchQuery('');
        Animated.spring(searchAnim, { toValue: 0, useNativeDriver: false, tension: 80, friction: 10 })
            .start(() => setSearchOpen(false));
    };

    const searchBarWidth = searchAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '72%'] });

    // renderItem is stable — no state deps that change on search
    const renderServiceItem = useCallback(({ item }: { item: any }) => {
        if (!item?.name) return null;
        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => {
                    const slug = item.slug || item.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    navigation.navigate('SubCategory', { slug, name: item.name });
                }}
            >
                <View style={styles.iconContainer}>
                    <AutoIcon name={item.name} size={34} color={Theme.colors.brandOrange} />
                </View>
                <Text style={styles.serviceText}>{item.name}</Text>
            </TouchableOpacity>
        );
    }, [navigation]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* ── HEADER (always mounted, never inside FlatList) ── */}
            <View style={styles.header}>
                {!searchOpen && (
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoIconText}>🛠️</Text>
                        </View>
                        <Text style={styles.headerTitle}>
                            <Text style={styles.titleUrban}>OLFIX</Text>
                        </Text>
                    </View>
                )}

                <View style={styles.headerRight}>
                    {/* Animated search input — always mounted when searchOpen */}
                    {searchOpen && (
                        <Animated.View style={[styles.inlineSearchBar, { width: searchBarWidth }]}>
                            <Search size={16} color={Theme.colors.textLight} />
                            <TextInput
                                ref={searchInputRef}
                                placeholder="Search services..."
                                placeholderTextColor={Theme.colors.textLight}
                                style={styles.inlineSearchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                                autoCorrect={false}
                                autoCapitalize="none"
                            />
                        </Animated.View>
                    )}

                    <TouchableOpacity style={styles.iconButton} onPress={searchOpen ? closeSearch : openSearch}>
                        {searchOpen ? <X size={20} color={Theme.colors.textDark} /> : <Search size={20} color={Theme.colors.textDark} />}
                    </TouchableOpacity>

                    {!searchOpen && (
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
                            <Bell size={22} color={Theme.colors.textDark} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── HERO BANNER (always mounted, never inside FlatList) ── */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>One call</Text>
                    <Text style={styles.heroSubtitle}>Fixes all</Text>
                    <TouchableOpacity style={styles.bookNowButton}>
                        <Text style={styles.bookNowText}>BOOK SERVICE</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.heroImageContainer}>
                    <User size={80} color="#0F172A" />
                </View>
            </View>

            {/* ── SECTION TITLE ── */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Services</Text>
                {searchQuery.trim() ? (
                    <Text style={styles.resultCount}>{filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''}</Text>
                ) : null}
            </View>

            {/* ── FLAT LIST — only renders grid items, no header inside ── */}
            <FlatList
                data={filteredServices}
                renderItem={renderServiceItem}
                keyExtractor={item => String(item.id)}
                numColumns={3}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <View style={styles.emptySearch}>
                        <Search size={40} color="#CBD5E0" />
                        <Text style={styles.emptySearchTitle}>
                            {searchQuery.trim() ? `No results for "${searchQuery}"` : 'No services available'}
                        </Text>
                        <Text style={styles.emptySearchSub}>Try a different keyword</Text>
                    </View>
                }
                ListFooterComponent={<View style={{ height: 80 }} />}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24 },
    headerTitle: { fontSize: 24, fontWeight: Theme.typography.weights.bold },
    titleUrban: { color: Theme.colors.navy, fontWeight: '900', letterSpacing: -0.5 },

    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconButton: {
        width: 40, height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    notificationBadge: { width: 8, height: 8, backgroundColor: Theme.colors.primary, borderRadius: 4, position: 'absolute', top: 8, right: 8, borderWidth: 1, borderColor: '#FFF' },

    inlineSearchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12, paddingHorizontal: 10,
        height: 40,
        borderWidth: 1, borderColor: Theme.colors.brandOrange,
        overflow: 'hidden',
    },
    inlineSearchInput: { flex: 1, marginLeft: 6, fontSize: 14, color: Theme.colors.textDark, height: 40 },

    // Hero
    heroBanner: {
        backgroundColor: Theme.colors.primary,
        marginHorizontal: 20, marginBottom: 16,
        borderRadius: 20, padding: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        height: 160, overflow: 'hidden',
    },
    heroContent: { flex: 1, zIndex: 10 },
    heroTitle: { fontSize: 24, color: '#FFF', fontWeight: 'bold', fontStyle: 'italic' },
    heroSubtitle: { fontSize: 32, color: '#FFF', fontWeight: '900', marginBottom: 10 },
    bookNowButton: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
    bookNowText: { color: Theme.colors.primary, fontWeight: 'bold', fontSize: 12 },
    heroImageContainer: { position: 'absolute', right: -10, bottom: -10, opacity: 0.9 },

    // Section header
    sectionHeader: { paddingHorizontal: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },
    resultCount: { fontSize: 12, color: Theme.colors.brandOrange, fontWeight: '700' },

    // Grid
    gridContainer: { paddingHorizontal: 10, paddingBottom: 20 },
    gridItem: { flex: 1, alignItems: 'center', marginBottom: 25, marginHorizontal: 5 },
    iconContainer: { width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    serviceText: { fontSize: 11, fontWeight: '700', color: Theme.colors.textDark, textAlign: 'center' },

    // Empty
    emptySearch: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
    emptySearchTitle: { fontSize: 16, fontWeight: '700', color: '#4A5568', marginTop: 12, marginBottom: 4 },
    emptySearchSub: { fontSize: 13, color: '#A0AEC0' },
});

export default HomeScreen;
