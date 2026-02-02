import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../theme';

const NOTIFICATIONS = [
    {
        id: '1',
        title: 'Summer Sale!',
        message: 'Get 20% off on your next deep cleaning service. Use code SUMMER20.',
        time: '09:03',
        action: 'CLAIM NOW →',
        icon: '🎁', // Placeholder for the gift icon
        unread: true,
    }
];

const NotificationsScreen = () => {
    const navigation = useNavigation();

    const handleClose = () => {
        navigation.goBack();
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            {item.unread && <View style={styles.unreadDot} />}
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.time}>{item.time}</Text>
                <TouchableOpacity>
                    <Text style={styles.action}>{item.action}</Text>
                </TouchableOpacity>
            </View>
        </View>
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
            <FlatList 
                data={NOTIFICATIONS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />

            {/* Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.markReadButton}>
                    <Text style={styles.markReadText}>MARK ALL AS READ</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background }, // Assuming light gray/white bg
    
    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 20, backgroundColor: 'white' },
    headerTitle: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', color: '#1A202C' },
    headerSubtitle: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 2, marginTop: 2 },
    closeButton: { width: 40, height: 40, backgroundColor: '#F7FAFC', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    closeText: { fontSize: 18, color: '#A0AEC0', fontWeight: 'bold' },

    // List
    listContent: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 25, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#FFF5F0', 
            shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.brandOrange, position: 'absolute', top: 20, right: 20 },
    cardHeader: { flexDirection: 'row', marginBottom: 20 },
    iconContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#FFFBEB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    icon: { fontSize: 24 },
    content: { flex: 1, paddingRight: 10 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#1A202C', fontFamily: 'monospace', marginBottom: 5 },
    message: { fontSize: 14, color: '#718096', lineHeight: 22, fontWeight: '500', fontFamily: 'monospace' },
    
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 65 }, // Indent to align with text
    time: { fontSize: 10, color: '#A0AEC0', fontWeight: 'bold', fontFamily: 'monospace' },
    action: { fontSize: 10, color: Theme.colors.brandOrange, fontWeight: '900', letterSpacing: 1 },

    // Footer
    footer: { padding: 20, backgroundColor: 'white' },
    markReadButton: { backgroundColor: '#F7FAFC', paddingVertical: 20, borderRadius: 20, alignItems: 'center' },
    markReadText: { color: '#718096', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
});

export default NotificationsScreen;
