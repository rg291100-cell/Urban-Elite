import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';

type BookingLocationRouteProp = RouteProp<RootStackParamList, 'BookingLocation'>;

interface Location {
    type: 'Home' | 'Work';
    address: string;
}

const BookingLocationScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingLocationRouteProp>();
    const { item, date, slot } = route.params;
    const insets = useSafeAreaInsets();

    const [selectedLocation, setSelectedLocation] = useState<Location>({
        type: 'Home',
        address: 'Flat 402, Elite Tower, Powai, Mumbai'
    });

    const locations: Location[] = [
        { type: 'Home', address: 'Flat 402, Elite Tower, Powai, Mumbai' },
        { type: 'Work', address: 'Tech Hub B-Side, MIDC, Mumbai' }
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.activeStep]} />
                    <View style={styles.progressStep} />
                    <View style={styles.progressStep} />
                    <View style={styles.progressStep} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.titleContainer}>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>3</Text>
                    </View>
                    <View>
                        <Text style={styles.pageTitle}>Service Hub</Text>
                        <Text style={styles.pageTitle}>Location</Text>
                        <Text style={styles.subTitle}>Where should the professional arrive?</Text>
                    </View>
                </View>

                {/* Location Options */}
                {locations.map((location, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.locationCard,
                            selectedLocation.type === location.type && styles.selectedCard
                        ]}
                        onPress={() => setSelectedLocation(location)}
                    >
                        <View style={[
                            styles.iconContainer,
                            selectedLocation.type === location.type && styles.selectedIcon
                        ]}>
                            <Text style={styles.iconText}>
                                {location.type === 'Home' ? '🏠' : '💼'}
                            </Text>
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={[
                                styles.locationType,
                                selectedLocation.type === location.type && styles.selectedText
                            ]}>
                                {location.type}
                            </Text>
                            <Text style={[
                                styles.locationAddress,
                                selectedLocation.type === location.type && styles.selectedAddressText
                            ]}>
                                {location.address}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => navigation.navigate('BookingInstructions', {
                        item,
                        date,
                        slot,
                        location: selectedLocation
                    })}
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
    progressStep: { flex: 1, borderRadius: 2, marginRight: 5, backgroundColor: '#EDF2F7' },
    completedStep: { backgroundColor: Theme.colors.brandOrange },
    activeStep: { backgroundColor: Theme.colors.brandOrange },

    content: { padding: 20 },

    titleContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 40 },
    stepBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.brandOrange, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 5 },
    stepText: { color: '#FFF', fontWeight: 'bold' },
    pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', lineHeight: 36, fontFamily: 'monospace' },
    subTitle: { fontSize: 16, color: '#718096', marginTop: 10, fontWeight: '600', maxWidth: 250 },

    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    selectedCard: {
        backgroundColor: Theme.colors.brandOrange,
        borderColor: Theme.colors.brandOrange
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Theme.colors.brandOrange,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    selectedIcon: {
        backgroundColor: '#FFFFFF'
    },
    iconText: { fontSize: 24 },
    locationInfo: { flex: 1 },
    locationType: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 5 },
    selectedText: { color: '#FFFFFF' },
    locationAddress: { fontSize: 14, color: '#718096', lineHeight: 20 },
    selectedAddressText: { color: '#FFFFFF', opacity: 0.9 },

    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center', justifyContent: 'space-between' },
    backButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', width: '30%', alignItems: 'center' },
    backButtonText: { fontWeight: 'bold', color: '#4A5568' },
    continueButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 15, borderRadius: 20, width: '65%', alignItems: 'center', shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default BookingLocationScreen;
