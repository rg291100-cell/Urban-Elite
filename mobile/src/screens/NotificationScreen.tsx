import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../theme';

const NotificationScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>ALERTS</Text>
                    <Text style={styles.headerSubtitle}>DIRECT UPDATES</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Notification Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.cardIcon}>🎁</Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>Summer Sale!</Text>
                            <Text style={styles.cardDescription}>
                                Get 20% off on your next deep cleaning service. Use code SUMMER20.
                            </Text>
                        </View>
                        <View style={styles.dot} />
                    </View>
                    <View style={styles.cardFooter}>
                        <Text style={styles.timeText}>09:03</Text>
                        <TouchableOpacity>
                            <Text style={styles.claimText}>CLAIM NOW →</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.markReadButton}>
                    <Text style={styles.markReadText}>MARK ALL AS READ</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' }, // Using pure white as per screenshot base
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F7FAFC'
    },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#1A1025', fontStyle: 'italic', letterSpacing: 1 },
    headerSubtitle: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 2, marginTop: 5 },
    closeButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F7FAFC',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeButtonText: { fontSize: 16, color: '#4A5568', fontWeight: 'bold' },

    scrollContent: { padding: 20 },

    // Card
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 20,
        borderWidth: 1,
        borderColor: Theme.colors.brandOrange + '20', // Very light orange border
        shadowColor: Theme.colors.brandOrange,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    iconContainer: {
        width: 50,
        height: 50,
        backgroundColor: '#FEFCBF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    cardIcon: { fontSize: 24 },
    textContainer: { flex: 1, paddingRight: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1025', marginBottom: 5 },
    cardDescription: { fontSize: 14, color: '#718096', lineHeight: 22, fontFamily: 'monospace' }, // Using monospace for that technical feel in screenshot
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.brandOrange, marginTop: 5 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingLeft: 65 }, // Indent to align with text
    timeText: { fontSize: 10, fontWeight: 'bold', color: '#CBD5E0', letterSpacing: 1 },
    claimText: { fontSize: 11, fontWeight: '900', color: Theme.colors.brandOrange, letterSpacing: 2 },

    // Footer
    footer: { padding: 20, paddingBottom: 40 },
    markReadButton: {
        backgroundColor: '#F7FAFC',
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center'
    },
    markReadText: { fontSize: 11, fontWeight: '900', color: '#718096', letterSpacing: 2 }
});

export default NotificationScreen;
