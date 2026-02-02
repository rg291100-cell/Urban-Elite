import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, Tag, Calendar, Shield } from 'lucide-react-native';
import { Theme } from '../theme';
import { userAPI } from '../services/api';

const PushNotificationsScreen = () => {
    const navigation = useNavigation();

    const [settings, setSettings] = useState({
        bookingUpdates: true,
        offers: true,
        reminders: true,
        security: true
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await userAPI.getNotificationSettings();
            // Assuming response matches keys, if not map them
            setSettings(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSwitch = async (key: keyof typeof settings) => {
        const newVal = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newVal }));
        try {
            await userAPI.updateNotificationSettings({ [key]: newVal });
        } catch (error) {
            console.error('Failed to update setting');
            setSettings(prev => ({ ...prev, [key]: !newVal })); // Revert
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Push Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Bell size={20} color={Theme.colors.brandOrange} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.rowTitle}>Booking Updates</Text>
                            <Text style={styles.rowSubtitle}>Get updates about your service status</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: Theme.colors.brandOrange }}
                            thumbColor="white"
                            onValueChange={() => toggleSwitch('bookingUpdates')}
                            value={settings.bookingUpdates}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Tag size={20} color={Theme.colors.brandOrange} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.rowTitle}>Offers & Promotions</Text>
                            <Text style={styles.rowSubtitle}>Receive exclusive deals and discounts</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: Theme.colors.brandOrange }}
                            thumbColor="white"
                            onValueChange={() => toggleSwitch('offers')}
                            value={settings.offers}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Calendar size={20} color={Theme.colors.brandOrange} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.rowTitle}>Service Reminders</Text>
                            <Text style={styles.rowSubtitle}>Reminders for upcoming scheduled services</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: Theme.colors.brandOrange }}
                            thumbColor="white"
                            onValueChange={() => toggleSwitch('reminders')}
                            value={settings.reminders}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Shield size={20} color={Theme.colors.brandOrange} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.rowTitle}>Account Security</Text>
                            <Text style={styles.rowSubtitle}>Alerts for new logins and password changes</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: Theme.colors.brandOrange }}
                            thumbColor="white"
                            onValueChange={() => toggleSwitch('security')}
                            value={settings.security}
                        />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },
    content: { padding: 20 },

    section: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, backgroundColor: '#FFF7ED', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    textContainer: { flex: 1, marginRight: 10 },
    rowTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 4 },
    rowSubtitle: { fontSize: 12, color: '#94A3B8', lineHeight: 18 }
});

export default PushNotificationsScreen;
