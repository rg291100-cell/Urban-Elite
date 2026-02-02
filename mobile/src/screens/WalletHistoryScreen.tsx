import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Theme } from '../theme';

const WalletHistoryScreen = () => {
    const navigation = useNavigation();

    const HISTORY_DATA = [
        {
            title: 'Today',
            data: [
                { id: '1', title: 'Deep Home Cleaning', type: 'debit', amount: '₹1999', time: '10:30 AM', status: 'Success' },
                { id: '2', title: 'Wallet Top-up', type: 'credit', amount: '₹2000', time: '09:00 AM', status: 'Success' },
            ]
        },
        {
            title: 'Yesterday',
            data: [
                { id: '3', title: 'AC Service Booking', type: 'debit', amount: '₹599', time: '04:15 PM', status: 'Success' },
            ]
        },
        {
            title: '28 May 2024',
            data: [
                { id: '4', title: 'Refund - Cancellation', type: 'credit', amount: '₹150', time: '02:00 PM', status: 'Success' },
                { id: '5', title: 'Electrician Visit', type: 'debit', amount: '₹350', time: '11:00 AM', status: 'Success' },
            ]
        }
    ];

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.transactionCard}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'credit' ? '#F0FFF4' : '#FFF5F5' }]}>
                {item.type === 'credit' ? (
                    <ArrowDownLeft size={24} color="#48BB78" />
                ) : (
                    <ArrowUpRight size={24} color="#F56565" />
                )}
            </View>
            <View style={styles.details}>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txTime}>{item.time} • {item.status}</Text>
                {item.type === 'debit' && <Text style={styles.debitLabel}>Paid for service</Text>}
            </View>
            <Text style={[styles.amount, { color: item.type === 'credit' ? '#48BB78' : '#1A202C' }]}>
                {item.type === 'credit' ? '+' : '-'}{item.amount}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction History</Text>
                <View style={{ width: 40 }} />
            </View>

            <SectionList
                sections={HISTORY_DATA}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: 'white' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },
    listContent: { padding: 20 },

    sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8', marginTop: 15, marginBottom: 10 },

    transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    details: { flex: 1 },
    txTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark },
    txTime: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
    debitLabel: { fontSize: 10, color: '#CBD5E0', marginTop: 2 },
    amount: { fontSize: 16, fontWeight: 'bold' }
});

export default WalletHistoryScreen;
