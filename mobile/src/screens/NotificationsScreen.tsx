import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Theme } from '../theme';
import { notificationsAPI } from '../services/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string; // Display formatted time e.g., "09:03" or "2h ago"
    actionLabel?: string;
    actionData?: any;
    icon: string;
    unread: boolean;
    createdAt?: string; // ISO string for sorting if needed
    timeAgo?: string;
}

const NotificationsScreen = () => {
    const navigation = useNavigation<any>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await notificationsAPI.getNotifications();
            if (res.data.success) {
                // Map API response to UI model if fields differ slightly (controller uses camelCase now, so likely direct match)
                setNotifications(res.data.notifications.map((n: any) => ({
                    ...n,
                    time: n.timeAgo || 'Just now', // Using backend computed relative time
                    action: n.actionLabel || (n.type === 'JOB' ? 'VIEW JOB →' : n.type === 'OFFER' ? 'CLAIM NOW →' : 'VIEW →')
                })));
            }
        } catch (error) {
            console.warn('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleClose = () => {
        navigation.goBack();
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markRead(undefined, true);
            // Optimistically update UI
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        } catch (error) {
            console.error('Failed to mark all read', error);
            Alert.alert('Error', 'Failed to mark notifications as read');
        }
    };

    const handleNotificationPress = async (item: Notification) => {
        // Mark individual as read
        if (item.unread) {
            try {
                await notificationsAPI.markRead([item.id]);
                setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
            } catch (e) {
                console.warn('Mark read failed', e);
            }
        }

        // Handle action navigation
        if (item.actionData?.screen === 'Ads' && item.actionData?.offerId) {
            // Navigate to Ads tab or specific Offer/Job details screen
            // For now, assume 'Ads' tab handles listing. If deep linking is needed, we'd need a specific route logic.
            // Let's navigate to the Ads tab (which is typically part of the main tabs)
            navigation.navigate('MainTabs', { screen: 'Ads' });
        } else if (item.actionData?.screen) {
            navigation.navigate(item.actionData.screen, item.actionData.params);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.card, item.unread && styles.unreadCard]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.8}
        >
            {item.unread && <View style={styles.unreadDot} />}
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, item.unread && styles.unreadIconContainer]}>
                    <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <View style={styles.content}>
                    <Text style={[styles.title, item.unread && styles.unreadTitle]}>{item.title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.time}>{item.time}</Text>
                {item.actionLabel && (
                    <Text style={styles.action}>{item.actionLabel}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>ALERTS</Text>
                    <Text style={styles.headerSubtitle}>DIRECT UPDATES</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.colors.brandOrange]} />
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.5 }}>
                            <Text style={{ fontSize: 40, marginBottom: 10 }}>🔕</Text>
                            <Text style={{ fontWeight: 'bold', color: '#A0AEC0' }}>No notifications yet</Text>
                        </View>
                    }
                />
            )}

            {/* Footer Button */}
            {notifications.length > 0 && notifications.some(n => n.unread) && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.markReadButton} onPress={handleMarkAllRead}>
                        <Text style={styles.markReadText}>MARK ALL AS READ</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' }, // Assuming light gray/white bg

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 20, backgroundColor: 'white' },
    headerTitle: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', color: '#1A202C' },
    headerSubtitle: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 2, marginTop: 2 },
    closeButton: { width: 40, height: 40, backgroundColor: '#F7FAFC', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    closeText: { fontSize: 18, color: '#A0AEC0', fontWeight: 'bold' },

    // List
    listContent: { padding: 20 },
    card: {
        backgroundColor: 'white', borderRadius: 25, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EDF2F7',
        shadowColor: '#A0AEC0', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 1
    },
    unreadCard: {
        borderColor: '#FFF5F0',
        backgroundColor: '#FFFFFE',
        shadowColor: '#FF6B00', shadowOpacity: 0.08, elevation: 3
    },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.brandOrange, position: 'absolute', top: 20, right: 20 },

    cardHeader: { flexDirection: 'row', marginBottom: 15 },
    iconContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#F7FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    unreadIconContainer: { backgroundColor: '#FFFBEB' },
    icon: { fontSize: 24 },

    content: { flex: 1, paddingRight: 10 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginBottom: 5 },
    unreadTitle: { color: '#1A202C', fontWeight: '800' },
    message: { fontSize: 14, color: '#718096', lineHeight: 20, fontWeight: '500' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 65 }, // Indent to align with text
    time: { fontSize: 11, color: '#A0AEC0', fontWeight: 'bold' },
    action: { fontSize: 10, color: Theme.colors.brandOrange, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },

    // Footer
    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F7FAFC' },
    markReadButton: { backgroundColor: '#F7FAFC', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
    markReadText: { color: '#718096', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
});

export default NotificationsScreen;
