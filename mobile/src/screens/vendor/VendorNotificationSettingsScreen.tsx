import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, Tag, ShieldCheck, DollarSign } from 'lucide-react-native';
import { Theme } from '../../theme';
import { userAPI } from '../../services/api';

const VendorNotificationSettingsScreen = () => {
    const navigation = useNavigation();
    const [settings, setSettings] = useState({
        bookingUpdates: true,
        offersPromotions: true,
        serviceReminders: true,
        accountSecurity: true,
        newLeads: true,
        payouts: true
    });

    useEffect(() => {
        // Load settings from API
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await userAPI.getNotificationSettings();
            if (response.data) {
                setSettings({ ...settings, ...response.data });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSwitch = async (key: string, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        try {
            await userAPI.updateNotificationSettings({ [key]: value });
        } catch (error) {
            console.error(error);
        }
    };

    const SettingItem = ({ icon, title, description, value, onValueChange, color = Theme.colors.brandOrange }: any) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                    {React.cloneElement(icon, { size: 24, color: color })}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingDesc}>{description}</Text>
                </View>
            </View>
            <Switch
                trackColor={{ false: '#767577', true: color }}
                thumbColor={value ? 'white' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Push Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <SettingItem
                    icon={<Bell />}
                    title="Booking Updates"
                    description="Get updates about new and ongoing bookings"
                    value={settings.bookingUpdates}
                    onValueChange={(val: boolean) => toggleSwitch('bookingUpdates', val)}
                />

                <SettingItem
                    icon={<DollarSign />}
                    title="New Leads & Offers"
                    description="Receive notifications for new job leads nearby"
                    value={settings.newLeads}
                    onValueChange={(val: boolean) => toggleSwitch('newLeads', val)}
                    color="#22C55E"
                />

                <SettingItem
                    icon={<Tag />}
                    title="Payout Updates"
                    description="Get notified when your weekly payout is processed"
                    value={settings.payouts}
                    onValueChange={(val: boolean) => toggleSwitch('payouts', val)}
                    color="#0EA5E9"
                />

                <SettingItem
                    icon={<ShieldCheck />}
                    title="Account Security"
                    description="Alerts for new logins and password changes"
                    value={settings.accountSecurity}
                    onValueChange={(val: boolean) => toggleSwitch('accountSecurity', val)}
                    color="#F59E0B"
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },
    content: { padding: 20 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: 'white', borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
    settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
    iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    textContainer: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 4 },
    settingDesc: { fontSize: 12, color: '#94A3B8', lineHeight: 18 }
});

export default VendorNotificationSettingsScreen;
