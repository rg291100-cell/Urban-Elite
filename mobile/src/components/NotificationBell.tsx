/**
 * NotificationBell — reusable bell icon with a live unread badge.
 *
 * Usage:
 *   <NotificationBell navigation={navigation} />
 *
 * Polls the unread-count endpoint on mount and whenever the screen is focused.
 * Tapping it navigates to the Notifications screen.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import { Theme } from '../theme';
import { notificationsAPI } from '../services/api';

interface Props {
    navigation: any;
    color?: string;
    size?: number;
}

const NotificationBell: React.FC<Props> = ({ navigation, color, size = 22 }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationsAPI.getUnreadCount();
            if (res.data?.success) {
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch {
            // Silently fail — badge simply won't update
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    // Refresh every time screen comes into focus (e.g. returning from Notifications screen)
    useFocusEffect(
        useCallback(() => {
            fetchUnreadCount();
        }, [])
    );

    const handlePress = () => {
        navigation.navigate('Notifications');
        // Optimistically clear badge immediately
        setUnreadCount(0);
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.75}>
            <Bell size={size} color={color || Theme.colors.textDark} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        backgroundColor: Theme.colors.searchBg,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Theme.colors.brandOrange,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
        lineHeight: 11,
    },
});

export default NotificationBell;
