import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { homeAPI } from '../services/api';

type ServiceDetailRouteProp = RouteProp<RootStackParamList, 'ServiceDetail'>;

const ServiceDetailScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<ServiceDetailRouteProp>();
    const { item } = route.params || {};

    // Fallback if item is totally missing (should not happen if nav is correct)
    const initialItem = item || {
        id: '1',
        title: 'Service',
        image: 'https://via.placeholder.com/400',
        rating: '0.0',
        price: '₹0'
    };
    const [serviceDetail, setServiceDetail] = React.useState<any>(initialItem);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await homeAPI.getServiceDetail(item.id);
                setServiceDetail(response.data);
            } catch (error) {
                console.error('Failed to fetch service details', error);
            } finally {
                setLoading(false);
            }
        };
        if (item?.id) {
            fetchDetails();
        } else {
            setLoading(false);
        }
    }, [item?.id]);

    const insets = useSafeAreaInsets();

    // Default fallback features if loading
    const defaultFeatures = [
        'Certified Professional',
        'Insurance Covered',
        '100% Guaranteed',
        'Post-Service Support'
    ];

    const features = serviceDetail?.features || defaultFeatures;

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
                {/* Search Bar Placeholder */}
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <Text style={styles.searchText}>Search for services...</Text>
                    <Text style={styles.filterIcon}>⚖️</Text>
                </View>
                {/* Notification Icon */}
                <TouchableOpacity style={styles.notificationButton}>
                    <Text style={styles.bellIcon}>🔔</Text>
                    <View style={styles.badge} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Image Section */}
                <ImageBackground
                    source={{ uri: serviceDetail.image }}
                    style={styles.heroImage}
                    imageStyle={styles.heroImageStyle}
                >
                    <View style={styles.overlay}>
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>WOMEN'S SALON & SPA</Text>
                        </View>
                        <Text style={styles.heroTitle}>{serviceDetail.title}</Text>
                    </View>
                </ImageBackground>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{serviceDetail.rating}</Text>
                        <Text style={styles.statLabel}>STARS</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{serviceDetail.duration || '1 hour'}</Text>
                        <Text style={styles.statLabel}>TIME</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValueCost}>{serviceDetail.price}</Text>
                        <Text style={styles.statLabel}>ENTRY</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Provider Profile Card */}
                {serviceDetail.provider && (
                    <View style={styles.providerCard}>
                        <View style={styles.providerRow}>
                            <View>
                                <Image
                                    source={{ uri: serviceDetail.provider.image || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                                    style={styles.providerImage}
                                />
                                {serviceDetail.provider.verified && (
                                    <View style={styles.verifiedBadge}>
                                        <Text style={styles.checkMark}>✓</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.providerInfo}>
                                <Text style={styles.providerName}>{serviceDetail.provider.name}</Text>
                                <Text style={styles.providerName}>{serviceDetail.provider.surname}</Text>
                                <View style={styles.providerMeta}>
                                    <Text style={styles.star}>★</Text>
                                    <Text style={styles.ratingText}>{serviceDetail.provider.rating}</Text>
                                    <Text style={styles.metaDot}>•</Text>
                                    <Text style={styles.serviceCount}>{serviceDetail.provider.services}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.profileButton}>
                                <Text style={styles.profileButtonText}>PROFILE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Elite Specifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Elite Specifications</Text>
                    <Text style={styles.descriptionText}>
                        {serviceDetail.specifications || "Premium service with top-tier professionals."}
                    </Text>
                </View>

                {/* Features List */}
                <View style={styles.featuresContainer}>
                    {features.map((feature: string, index: number) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={styles.featureIcon}>
                                <Text style={styles.featureCheck}>✓</Text>
                            </View>
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>

                {/* User Feedback Header */}
                <View style={[styles.section, styles.reviewsHeader]}>
                    <Text style={styles.sectionTitle}>User Feedback</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>SEE ALL</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.spacer} />
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => navigation.navigate('BookingOverview', { item: serviceDetail })}
                >
                    <Text style={styles.bookButtonText}>Book Service</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 10, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF' },
    searchBar: { flex: 1, flexDirection: 'row', backgroundColor: '#F7FAFC', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, marginRight: 15, alignItems: 'center' },
    searchIcon: { marginRight: 10, fontSize: 16 },
    searchText: { color: '#A0AEC0', flex: 1, fontSize: 14 },
    filterIcon: { fontSize: 16 },
    notificationButton: { padding: 10, backgroundColor: '#F7FAFC', borderRadius: 15 },
    bellIcon: { fontSize: 18 },
    badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: Theme.colors.brandOrange, borderRadius: 4, borderWidth: 1, borderColor: '#FFF' },

    scrollContent: { paddingBottom: 100 },

    heroImage: { width: '100%', height: 350, justifyContent: 'flex-end' },
    heroImageStyle: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    overlay: { padding: 25, justifyContent: 'flex-end', height: '100%', backgroundColor: 'rgba(0,0,0,0.1)' },
    tagContainer: { backgroundColor: Theme.colors.brandOrange, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
    tagText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    heroTitle: { color: '#000', fontSize: 32, fontWeight: 'bold', textShadowColor: 'rgba(255, 255, 255, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10 },

    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 25, paddingHorizontal: 20 },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1A202C' },
    statValueCost: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.brandOrange },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 1.5, marginTop: 5 },

    divider: { height: 1, backgroundColor: '#EDF2F7', marginHorizontal: 20, marginBottom: 25 },

    // Provider Card
    providerCard: { backgroundColor: '#F7FAFC', marginHorizontal: 20, borderRadius: 25, padding: 20, marginBottom: 30 },
    providerRow: { flexDirection: 'row', alignItems: 'center' },
    providerImage: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#DDD' },
    verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#48BB78', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
    checkMark: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    providerInfo: { flex: 1, marginLeft: 15 },
    providerName: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', lineHeight: 22 },
    providerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    ratingText: { fontSize: 12, fontWeight: 'bold', color: '#D69E2E', marginLeft: 4 },
    star: { color: '#ECC94B', fontSize: 12 },
    metaDot: { marginHorizontal: 5, color: '#A0AEC0' },
    serviceCount: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 0.5 },
    profileButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    profileButtonText: { fontSize: 10, fontWeight: 'bold', color: '#1A202C', letterSpacing: 1 },

    // Section
    section: { paddingHorizontal: 20, marginBottom: 25 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A202C', marginBottom: 15, fontFamily: 'monospace' },
    descriptionText: { fontSize: 16, lineHeight: 24, color: '#4A5568', fontWeight: '500' },

    // Features
    featuresContainer: { paddingHorizontal: 20, marginBottom: 30 },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    featureIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#C6F6D5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    featureCheck: { color: '#48BB78', fontSize: 12, fontWeight: 'bold' },
    featureText: { fontSize: 16, color: '#2D3748', fontWeight: '600' },

    reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    seeAllText: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.brandOrange, letterSpacing: 1 },

    spacer: { height: 100 },

    // Fixed Bottom Button
    bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F7FAFC' },
    bookButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 18, borderRadius: 20, alignItems: 'center', shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    bookButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
});

export default ServiceDetailScreen;
