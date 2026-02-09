import React, { useEffect, useState } from 'react';
import {
    StyleSheet, View, Text, TextInput, Image, TouchableOpacity, FlatList, ImageBackground, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { homeAPI } from '../services/api';

import { Zap, Scissors, User, Sparkles, Plug, Droplets, PaintRoller, Wind, Hammer, Search, Bell } from 'lucide-react-native';

const CATEGORY_ICONS: { [key: string]: any } = {
    'INSTA HELP': Zap,
    "WOMEN'S SALON": Scissors,
    "MEN'S SALON": User,
    'CLEANING': Sparkles,
    'ELECTRICIAN': Plug,
    'PURIFIERS': Droplets,
    'PAINTING': PaintRoller,
    'AC REPAIR': Wind,
    'REVAMP': Hammer,
    'NATIVE SMART HOME': Zap,
};

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await homeAPI.getHomeData();
                setServices(response.data.services);
            } catch (error) {
                console.error('Failed to fetch home data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderServiceItem = ({ item }: { item: { id: string; name: string; image: string; slug?: string } }) => {
        if (!item || !item.name) return null;

        // Case-insensitive lookup for icons
        const IconComponent = CATEGORY_ICONS[item.name.toUpperCase()] ||
            CATEGORY_ICONS[item.name] ||
            Zap;

        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => {
                    const slug = item.slug || item.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    navigation.navigate('ServiceListing', { slug, name: item.name });
                }}
            >
                <View style={styles.iconContainer}>
                    <IconComponent size={32} color={Theme.colors.brandOrange} strokeWidth={1.5} />
                </View>
                <Text style={styles.serviceText}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <Text style={styles.logoIconText}>⚡</Text>
                    </View>
                    <Text style={styles.headerTitle}>
                        <Text style={styles.titleUrban}>Urban</Text> <Text style={styles.titleElite}>Elite</Text>
                    </Text>
                </View>

                {/* Notification Icon */}
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Bell size={24} color={Theme.colors.textDark} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={Theme.colors.textLight} />
                    <TextInput
                        placeholder="Search for services..."
                        placeholderTextColor={Theme.colors.textLight}
                        style={styles.searchInput}
                    />
                </View>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footerContainer}>
            {/* Bottom Offer Cards */}
            {/* REMOVED: Native Smart Home, AC Servicing, Bridal Artistry banners as per requirement */}

            {/* Spacer for bottom tab bar */}
            <View style={{ height: 80 }} />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={styles.gridContainer}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.brandOrange, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24, color: 'white' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    titleUrban: { color: Theme.colors.brandOrange, fontWeight: '900' },
    titleElite: { color: Theme.colors.brandOrange, fontWeight: '900', fontStyle: 'italic' },
    searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.searchBg, borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12 },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: Theme.colors.textDark },
    gridContainer: { paddingHorizontal: 10, paddingBottom: 20 },
    gridItem: { flex: 1, alignItems: 'center', marginBottom: 25, marginHorizontal: 5 },
    iconContainer: { width: 80, height: 80, backgroundColor: Theme.colors.inputBg, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    serviceIcon: { width: 40, height: 40, resizeMode: 'contain' },
    serviceText: { fontSize: 11, fontWeight: '700', color: Theme.colors.textDark, textAlign: 'center' },

    // Header Inputs
    notificationButton: { width: 40, height: 40, backgroundColor: Theme.colors.searchBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notificationIcon: { width: 20, height: 20, tintColor: Theme.colors.textLight },
    notificationBadge: { width: 8, height: 8, backgroundColor: Theme.colors.brandOrange, borderRadius: 4, position: 'absolute', top: 10, right: 10, borderWidth: 1, borderColor: '#FFF' },

    // Footer / Banner Styles
    footerContainer: { paddingHorizontal: 20, marginTop: 10 },
    banner: { backgroundColor: '#1A1025', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    bannerContent: { flex: 1 },
    bannerTag: { backgroundColor: Theme.colors.brandOrange, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, color: 'white', fontSize: 10, fontWeight: 'bold', overflow: 'hidden', marginBottom: 10 },
    bannerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    bannerSubtitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    bannerImage: { width: 100, height: 100, resizeMode: 'contain' },
    upgradeButton: { backgroundColor: Theme.colors.brandOrange, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, alignSelf: 'flex-start' },
    upgradeButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

    // Offers Styles
    offersRow: { flexDirection: 'row', justifyContent: 'space-between' },
    offerCard: { flex: 1, height: 180, borderRadius: 15, overflow: 'hidden', justifyContent: 'flex-end' },
    offerTextContainer: { padding: 15 },
    overlay: { backgroundColor: 'rgba(0,0,0,0.3)', flex: 1, justifyContent: 'flex-end', padding: 15 },
    offerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 5 },
    offerSub: { fontSize: 10, fontWeight: 'bold', color: Theme.colors.brandOrange, textTransform: 'uppercase' },
    offerPrice: { fontSize: 16, fontWeight: '900', color: Theme.colors.brandOrange, marginTop: 5 }
});

export default HomeScreen;
