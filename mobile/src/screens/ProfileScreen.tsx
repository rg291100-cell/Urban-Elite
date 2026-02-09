import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { userAPI } from '../services/api';
import { authService } from '../services/authService';

const MENU_ITEMS = [
    { id: 'PersonalInformation', title: 'Personal Information', icon: '👤' },
    { id: 'SavedAddresses', title: 'Saved Addresses', icon: '📍' },
    { id: 'PaymentMethods', title: 'Payment Methods', icon: '💳' },
    { id: 'PushNotifications', title: 'Push Notifications', icon: '🔔' },
    { id: 'SupportHelp', title: 'Support & Help', icon: '🎧' },
];

const ProfileScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userAPI.getProfile();
                setProfile(response.data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await authService.clearAuth();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' as any }],
        });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                    <Text style={styles.logoIconText}>⚡</Text>
                </View>
                <Text style={styles.headerTitle}>
                    <Text style={styles.titleUrban}>Urban</Text> <Text style={styles.titleElite}>Elite</Text>
                </Text>
            </View>
            <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
            >
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png' }}
                    style={styles.notificationIcon}
                />
                <View style={styles.notificationBadge} />
            </TouchableOpacity>
        </View>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Text style={{ fontSize: 18, color: Theme.colors.textLight }}>🔍</Text>
                <TextInput
                    placeholder="Search for services..."
                    placeholderTextColor={Theme.colors.textLight}
                    style={styles.searchInput}
                />
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3018/3018442.png' }}
                    style={styles.filterIcon}
                />
            </View>
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
            <ScrollView showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderSearchBar()}

                <View style={styles.contentContainer}>
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }} // Generic User Icon
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{profile?.name || 'User'}</Text>
                            <Text style={styles.userTag}>PREMIUM ELITE MEMBER</Text>
                            <Text style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>{profile?.phone}</Text>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.menuContainer}>
                        {MENU_ITEMS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => navigation.navigate(item.id as any)}
                            >
                                <View style={styles.menuIconBox}>
                                    <Text style={styles.menuIcon}>{item.icon}</Text>
                                </View>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.chevron}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout Account</Text>
                    </TouchableOpacity>

                    {/* Bottom Spacer */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },

    // Header
    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.brandOrange, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24, color: 'white' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    titleUrban: { color: Theme.colors.brandOrange, fontWeight: '900' },
    titleElite: { color: Theme.colors.brandOrange, fontWeight: '900', fontStyle: 'italic' },
    notificationButton: { width: 40, height: 40, backgroundColor: Theme.colors.searchBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notificationIcon: { width: 20, height: 20, tintColor: Theme.colors.textLight },
    notificationBadge: { width: 8, height: 8, backgroundColor: Theme.colors.brandOrange, borderRadius: 4, position: 'absolute', top: 10, right: 10, borderWidth: 1, borderColor: '#FFF' },

    // Search
    searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: '#0F172A' },
    filterIcon: { width: 20, height: 20, tintColor: Theme.colors.buttonPeach },

    contentContainer: { paddingHorizontal: 20 },

    // Profile Header
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, paddingVertical: 10 },
    avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    avatar: { width: 40, height: 40, tintColor: '#0F172A' },
    profileInfo: { flex: 1 },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#0F172A',  },
    userTag: { fontSize: 10, fontWeight: 'bold', color: Theme.colors.buttonPeach, letterSpacing: 1, marginTop: 5 },

    // Menu
    menuContainer: { marginBottom: 40 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    menuIconBox: { width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuIcon: { fontSize: 18, color: '#0F172A' },
    menuTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#0F172A',  },
    chevron: { fontSize: 24, color: '#CBD5E0', fontWeight: 'bold' },

    // Logout
    logoutButton: { paddingVertical: 18, borderRadius: 20, borderWidth: 1, borderColor: '#FEE2E2', alignItems: 'center', backgroundColor: '#FFF5F5' },
    logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});

export default ProfileScreen;
