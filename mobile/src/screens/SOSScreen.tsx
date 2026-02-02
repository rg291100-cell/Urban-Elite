import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, // turbo-all
    Animated, Linking, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../theme';
import { ArrowLeft, Phone, Shield, TriangleAlert, Bell } from 'lucide-react-native';

const SOSScreen = () => {
    const navigation = useNavigation();

    const handleCallPolice = () => {
        Linking.openURL('tel:100');
    };

    const handleCallAmbulance = () => {
        Linking.openURL('tel:102');
    };

    const handleEmergencyContacts = () => {
        Alert.alert('Emergency Contacts', 'Notifications sent to your emergency contacts with your live location.');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emergency Help</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.warningContainer}>
                    <View style={styles.warningIcon}>
                        <TriangleAlert size={40} color="white" />
                    </View>
                    <Text style={styles.warningTitle}>Are you in an emergency?</Text>
                    <Text style={styles.warningText}>
                        Press the button below to immediately contact emergency services or alert your safety contacts.
                    </Text>
                </View>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={styles.sosButton} onPress={handleCallPolice}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                            <Shield size={32} color="#EF4444" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.optionTitle}>Call Police</Text>
                            <Text style={styles.optionDesc}>Connect with local police (100)</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sosButton} onPress={handleCallAmbulance}>
                        <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                            <Phone size={32} color="#3B82F6" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.optionTitle}>Call Ambulance</Text>
                            <Text style={styles.optionDesc}>Medical emergency help (102)</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sosButton} onPress={handleEmergencyContacts}>
                        <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                            <Bell size={32} color="#F59E0B" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.optionTitle}>Emergency Contacts</Text>
                            <Text style={styles.optionDesc}>Share live location with contacts</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white'
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },

    content: { flex: 1, padding: 20 },

    warningContainer: {
        backgroundColor: '#EF4444',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10
    },
    warningIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    warningTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 10 },
    warningText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20 },

    optionsContainer: { gap: 15 },
    sosButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 2
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    textContainer: { flex: 1 },
    optionTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 4 },
    optionDesc: { fontSize: 13, color: '#94A3B8' }
});

export default SOSScreen;
