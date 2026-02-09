import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';

type BookingOverviewRouteProp = RouteProp<RootStackParamList, 'BookingOverview'>;

const BookingOverviewScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingOverviewRouteProp>();
    const { item } = route.params; // Passed from ServiceDetail
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressStep, styles.activeStep]} />
                    <View style={styles.progressStep} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.titleContainer}>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>1</Text>
                    </View>
                    <View>
                        <Text style={styles.pageTitle}>Elite Service</Text>
                        <Text style={styles.pageTitle}>Overview</Text>
                        <Text style={styles.subTitle}>Confirm your selection details</Text>
                    </View>
                </View>

                {/* Service Card */}
                <View style={styles.cardContainer}>
                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                    <View style={styles.cardOverlay}>
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>{item.category || "WOMEN'S SALON & SPA"}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.serviceTitle}>{item.title}</Text>
                    <Text style={styles.serviceDesc}>Styling by senior artists.</Text>

                    <View style={styles.statsRow}>
                        <View>
                            <Text style={styles.statLabel}>DURATION</Text>
                            <Text style={styles.statValue}>{item.duration || '1 hour'}</Text>
                        </View>
                        <View style={{ marginLeft: 40 }}>
                            <Text style={styles.statLabel}>PRICING</Text>
                            <Text style={styles.statValuePrice}>{item.price}</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => navigation.navigate('BookingSchedule', { item })}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { paddingHorizontal: 20, paddingTop: 10 },
    progressBar: { flexDirection: 'row', height: 4, backgroundColor: '#EDF2F7', borderRadius: 2 },
    progressStep: { flex: 1, borderRadius: 2 },
    activeStep: { backgroundColor: Theme.colors.brandOrange },

    content: { padding: 20 },

    titleContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 30 },
    stepBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.brandOrange, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 5 },
    stepText: { color: '#FFF', fontWeight: 'bold' },
    pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', lineHeight: 36,  },
    subTitle: { fontSize: 14, color: '#A0AEC0', marginTop: 10, fontWeight: '600' },

    cardContainer: { borderRadius: 30, overflow: 'hidden', height: 200, marginBottom: 25, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, backgroundColor: '#FFF' },
    cardImage: { width: '100%', height: '100%' },
    cardOverlay: { position: 'absolute', bottom: 20, left: 20 },
    tagContainer: { backgroundColor: Theme.colors.brandOrange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    tagText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

    detailsContainer: { paddingHorizontal: 10 },
    serviceTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 10 },
    serviceDesc: { fontSize: 16, color: '#718096', marginBottom: 25, fontWeight: '500' },

    statsRow: { flexDirection: 'row' },
    statLabel: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 1, marginBottom: 5 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    statValuePrice: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.brandOrange },

    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center', justifyContent: 'space-between' },
    backButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', width: '30%', alignItems: 'center' },
    backButtonText: { fontWeight: 'bold', color: '#4A5568' },
    continueButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 15, borderRadius: 20, width: '65%', alignItems: 'center', shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default BookingOverviewScreen;
