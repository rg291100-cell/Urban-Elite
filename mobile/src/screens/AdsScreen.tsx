import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { offersAPI } from '../services/api';
import { Tag, Clock } from 'lucide-react-native';

const AdsScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await offersAPI.getOffers();
            if (response.data.success) {
                setOffers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
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
            </TouchableOpacity>
        </View>
    );

    const renderOffer = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.offerCard} activeOpacity={0.9}>
            <Image
                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80' }}
                style={styles.offerImage}
            />
            <View style={styles.offerContent}>
                <View style={styles.vendorBadge}>
                    <Text style={styles.vendorName}>{item.vendor?.business_name || 'Urban Elite Official'}</Text>
                </View>
                <Text style={styles.offerTitle}>{item.title}</Text>
                <Text style={styles.offerDescription} numberOfLines={2}>{item.description}</Text>

                <View style={styles.offerFooter}>
                    <View style={styles.discountBadge}>
                        <Tag size={14} color="#FFF" />
                        <Text style={styles.discountText}>{item.discount_amount}</Text>
                    </View>
                    {item.discount_code && (
                        <View style={styles.codeContainer}>
                            <Text style={styles.codeLabel}>Code:</Text>
                            <Text style={styles.codeText}>{item.discount_code}</Text>
                        </View>
                    )}
                </View>
                {item.valid_until && (
                    <View style={styles.expiryContainer}>
                        <Clock size={12} color="#718096" />
                        <Text style={styles.expiryText}>Valid until: {new Date(item.valid_until).toLocaleDateString()}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            <View style={styles.titleContainer}>
                <Text style={styles.title}>Exclusive <Text style={{ color: Theme.colors.brandOrange }}>Offers</Text></Text>
                <Text style={styles.subtitle}>Curated deals just for you</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
                </View>
            ) : offers.length === 0 ? (
                <View style={styles.center}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1182/1182718.png' }}
                        style={styles.emptyIcon}
                    />
                    <Text style={styles.emptyText}>No active offers right now.</Text>
                    <Text style={styles.emptySubtext}>Check back later!</Text>
                </View>
            ) : (
                <FlatList
                    data={offers}
                    renderItem={renderOffer}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={fetchOffers}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.brandOrange, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24, color: 'white' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    titleUrban: { color: Theme.colors.brandOrange, fontWeight: '900' },
    titleElite: { color: Theme.colors.brandOrange, fontWeight: '900', fontStyle: 'italic' },
    notificationButton: { width: 40, height: 40, backgroundColor: Theme.colors.searchBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notificationIcon: { width: 20, height: 20, tintColor: Theme.colors.textLight },

    titleContainer: { paddingHorizontal: 20, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.textDark },
    subtitle: { fontSize: 14, color: Theme.colors.textLight },

    listContent: { paddingHorizontal: 20, paddingBottom: 20 },

    offerCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden'
    },
    offerImage: { width: '100%', height: 180 },
    offerContent: { padding: 15 },
    vendorBadge: { position: 'absolute', top: -165, left: 15, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    vendorName: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    offerTitle: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 5 },
    offerDescription: { fontSize: 14, color: Theme.colors.textLight, marginBottom: 15, lineHeight: 20 },

    offerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    discountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F56565', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 5 },
    discountText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

    codeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E0' },
    codeLabel: { fontSize: 12, color: '#718096', marginRight: 5 },
    codeText: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.textDark, letterSpacing: 1 },

    expiryContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5 },
    expiryText: { fontSize: 12, color: '#A0AEC0' },

    emptyIcon: { width: 80, height: 80, marginBottom: 20, opacity: 0.5 },
    emptyText: { fontSize: 18, color: '#A0AEC0', fontWeight: 'bold' },
    emptySubtext: { fontSize: 14, color: '#CBD5E0' }
});

export default AdsScreen;
