import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';

type BookingInstructionsRouteProp = RouteProp<RootStackParamList, 'BookingInstructions'>;

const BookingInstructionsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingInstructionsRouteProp>();
    const { item, date, slot, location } = route.params;
    const insets = useSafeAreaInsets();

    const [instructions, setInstructions] = useState('');

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.activeStep]} />
                    <View style={styles.progressStep} />
                    <View style={styles.progressStep} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.titleContainer}>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>4</Text>
                    </View>
                    <View>
                        <Text style={styles.pageTitle}>Direct</Text>
                        <Text style={styles.pageTitle}>Instructions</Text>
                        <Text style={styles.subTitle}>Any specific notes for the professional?</Text>
                    </View>
                </View>

                {/* Instructions Input */}
                <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Gate code 4291, park at B3, bring extra cleaning supplies..."
                    placeholderTextColor="#A0AEC0"
                    multiline
                    numberOfLines={8}
                    value={instructions}
                    onChangeText={setInstructions}
                    textAlignVertical="top"
                />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => navigation.navigate('BookingReview', {
                        item,
                        date,
                        slot,
                        location,
                        instructions
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

    content: { padding: 20, flex: 1 },

    titleContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 40 },
    stepBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.brandOrange, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 5 },
    stepText: { color: '#FFF', fontWeight: 'bold' },
    pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', lineHeight: 36, fontFamily: 'monospace' },
    subTitle: { fontSize: 16, color: '#718096', marginTop: 10, fontWeight: '600', maxWidth: 250 },

    textInput: {
        backgroundColor: '#F7FAFC',
        borderRadius: 20,
        padding: 20,
        fontSize: 16,
        color: '#1A202C',
        minHeight: 200,
        fontWeight: '500'
    },

    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center', justifyContent: 'space-between' },
    backButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', width: '30%', alignItems: 'center' },
    backButtonText: { fontWeight: 'bold', color: '#4A5568' },
    continueButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 15, borderRadius: 20, width: '65%', alignItems: 'center', shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default BookingInstructionsScreen;
