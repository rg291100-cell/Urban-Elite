import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';

type BookingScheduleRouteProp = RouteProp<RootStackParamList, 'BookingSchedule'>;

const BookingScheduleScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingScheduleRouteProp>();

    // We can use this item to pass to the next step (Payment)
    const { item } = route.params;

    const insets = useSafeAreaInsets();

    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedSlot, setSelectedSlot] = useState('');

    const days = [
        { label: 'Today', value: 'Today' },
        { label: 'Tomorrow', value: 'Tomorrow' },
        { label: 'Monday, 24th', value: 'Mon 24' },
        { label: 'Tuesday, 25th', value: 'Tue 25' },
    ];

    const slots = [
        '09:00 AM', '11:00 AM',
        '01:00 PM', '03:00 PM',
        '05:00 PM', '07:00 PM'
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressStep, styles.completedStep]} />
                    <View style={[styles.progressStep, styles.activeStep]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.titleContainer}>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepText}>2</Text>
                    </View>
                    <View>
                        <Text style={styles.pageTitle}>Schedule</Text>
                        <Text style={styles.pageTitle}>Appointment</Text>
                        <Text style={styles.subTitle}>Select your preferred availability</Text>
                    </View>
                </View>

                {/* Date Selection */}
                <Text style={styles.sectionLabel}>PICK A DAY</Text>
                <View style={styles.gridContainer}>
                    {days.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dateButton, selectedDate === day.value && styles.selectedButton]}
                            onPress={() => setSelectedDate(day.value)}
                        >
                            <Text style={[styles.dateText, selectedDate === day.value && styles.selectedText]}>{day.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Time Selection */}
                <Text style={[styles.sectionLabel, { marginTop: 30 }]}>AVAILABLE SLOTS</Text>
                <View style={styles.gridContainer}>
                    {slots.map((slot, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.slotButton, selectedSlot === slot && styles.selectedButton]}
                            onPress={() => setSelectedSlot(slot)}
                        >
                            <Text style={[styles.slotText, selectedSlot === slot && styles.selectedText]}>{slot}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedSlot && styles.disabledButton]}
                    disabled={!selectedSlot}
                    onPress={() => {
                        navigation.navigate('BookingLocation', {
                            item,
                            date: selectedDate,
                            slot: selectedSlot
                        });
                    }}
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
    progressStep: { flex: 1, borderRadius: 2, marginRight: 5 },
    completedStep: { backgroundColor: Theme.colors.brandOrange },
    activeStep: { backgroundColor: Theme.colors.brandOrange }, // Or a lighter shade if indicating 'current'

    content: { padding: 20 },

    titleContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 40 },
    stepBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.brandOrange, justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 5 },
    stepText: { color: '#FFF', fontWeight: 'bold' },
    pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', lineHeight: 36, fontFamily: 'monospace' },
    subTitle: { fontSize: 16, color: '#718096', marginTop: 10, fontWeight: '600', maxWidth: 200 },

    sectionLabel: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 15, textTransform: 'uppercase' },

    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    dateButton: { width: '48%', backgroundColor: '#F7FAFC', paddingVertical: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
    dateText: { fontSize: 16, fontWeight: 'bold', color: '#4A5568' },

    slotButton: { width: '48%', backgroundColor: '#F7FAFC', paddingVertical: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
    slotText: { fontSize: 16, fontWeight: 'bold', color: '#4A5568' },

    selectedButton: { backgroundColor: '#2D3748' }, // Dark selection as per design looks almost black or very dark grey? Or maybe orange?
    // User image shows White text on "Today" but button background is white? Wait.
    // In "Image 2", "Today" is selected? No, it looks like just buttons.
    // Wait, the user image shows "Today" and "Tomorrow" button backgrounds are white/light-grey.
    // Let's stick to a clear selection state. I'll use Dark Blue/Black for selected as per "Elite" theme or Orange.
    // The design has "Continue" as Orange.
    // I will use Theme.brandOrange for active selection too to be consistent, or keeping the dark text if unselected.
    // Let's check "Image 2" again. The buttons are light grey. None seem selected in the screenshot except maybe they are all capable of selection.

    // Correction: "Image 2" shows "Continue" disabled (light orange) maybe?
    // I'll implement selection logic: Unselected = Light Grey (#F7FAFC), Selected = Theme Orange or Dark.
    // Let's go with Theme Orange for selected state to match the brand.

    // Oh wait, looking closer at Image 2 crop 2:
    // "Today" background is #F7FAFC (light).
    // The "Continue" button is disabled-ish (light orange).
    // So default state is light grey.
    // I will make selected state Text White and Background Orange.

    selectedText: { color: '#FFF' },

    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center', justifyContent: 'space-between' },
    backButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', width: '30%', alignItems: 'center' },
    backButtonText: { fontWeight: 'bold', color: '#4A5568' },
    continueButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 15, borderRadius: 20, width: '65%', alignItems: 'center', shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    disabledButton: { opacity: 0.5 },
});

export default BookingScheduleScreen;
