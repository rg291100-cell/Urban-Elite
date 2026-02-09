import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { userAPI } from '../../services/api';

const MENU_ITEMS = [
    { id: 'VendorPersonalInformation', title: 'Business Information', icon: '🏢' },
    { id: 'VendorNotificationSettings', title: 'Notifications', icon: '🔔' },
    { id: 'VendorSupportHelp', title: 'Support & Help', icon: '🎧' },
    { id: 'VendorQuestionnaire', title: 'Vendor Questionnaire', icon: '📝' },
];

const VendorProfileScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

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

    const handleLogout = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
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
            <ScrollView showsVerticalScrollIndicator={false}>
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
                </View>

                <View style={styles.contentContainer}>
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{profile?.name || 'Vendor'}</Text>
                            <Text style={styles.userTag}>VERIFIED VENDOR</Text>
                            <Text style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>{profile?.phone}</Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>4.8</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>127</Text>
                            <Text style={styles.statLabel}>Completed</Text>
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

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },

    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.brandOrange, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24, color: 'white' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    titleUrban: { color: Theme.colors.brandOrange, fontWeight: '900' },
    titleElite: { color: Theme.colors.brandOrange, fontWeight: '900', fontStyle: 'italic' },

    contentContainer: { paddingHorizontal: 20 },

    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingVertical: 10 },
    avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 20, borderWidth: 2, borderColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    avatar: { width: 40, height: 40, tintColor: Theme.colors.brandOrange },
    profileInfo: { flex: 1 },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#1A202C',  },
    userTag: { fontSize: 10, fontWeight: 'bold', color: Theme.colors.brandOrange, letterSpacing: 1, marginTop: 5 },

    statsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#F3F4F6' },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.textDark },
    statLabel: { fontSize: 12, color: Theme.colors.textLight, marginTop: 5 },
    statDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 15 },

    menuContainer: { marginBottom: 40 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 15 },
    menuIconBox: { width: 40, height: 40, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuIcon: { fontSize: 18, color: '#4A5568' },
    menuTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#2D3748',  },
    chevron: { fontSize: 24, color: '#CBD5E0', fontWeight: 'bold' },

    logoutButton: { paddingVertical: 18, borderRadius: 20, borderWidth: 1, borderColor: '#FED7D7', alignItems: 'center', backgroundColor: '#FFF5F5' },
    logoutText: { color: '#F56565', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});

export default VendorProfileScreen;
