import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { Theme } from '../../theme';
import { userAPI } from '../../services/api';

const VendorQuestionnaireScreen = () => {
    const navigation = useNavigation();
    const [answers, setAnswers] = useState({
        experienceYears: '',
        teamSize: '',
        primaryService: '',
        availability: '',
        certifications: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await userAPI.updateProfile({
                experienceYears: answers.experienceYears, // Note: Schema check showed 'experience_years' column exists
                teamSize: answers.teamSize,
                primaryService: answers.primaryService,
                availability: answers.availability,
                certifications: answers.certifications
            });
            Alert.alert('Details Submitted', 'Thank you for providing your business details. Our team will review them shortly.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vendor Questionnaire</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>Please tell us more about your business to help us serve you better.</Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Years of Experience</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 5"
                        placeholderTextColor="#CBD5E0"
                        keyboardType="numeric"
                        value={answers.experienceYears}
                        onChangeText={(t) => setAnswers({ ...answers, experienceYears: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Team Size</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 2-5 employees"
                        placeholderTextColor="#CBD5E0"
                        value={answers.teamSize}
                        onChangeText={(t) => setAnswers({ ...answers, teamSize: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Primary Service Specialization</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Residential Cleaning"
                        placeholderTextColor="#CBD5E0"
                        value={answers.primaryService}
                        onChangeText={(t) => setAnswers({ ...answers, primaryService: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Weekly Availability (Hours)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 40 hours"
                        placeholderTextColor="#CBD5E0"
                        value={answers.availability}
                        onChangeText={(t) => setAnswers({ ...answers, availability: t })}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Licenses & Certifications</Text>
                    <TextInput
                        style={[styles.input, { height: 100, paddingTop: 15 }]}
                        placeholder="List any relevant IDs or Certs..."
                        placeholderTextColor="#CBD5E0"
                        multiline
                        textAlignVertical="top"
                        value={answers.certifications}
                        onChangeText={(t) => setAnswers({ ...answers, certifications: t })}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Details'}</Text>
                    {!loading && <CheckCircle size={20} color="white" style={{ marginLeft: 10 }} />}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textDark },
    content: { padding: 20 },
    subtitle: { fontSize: 14, color: Theme.colors.textLight, marginBottom: 25, lineHeight: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 10 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: Theme.colors.textDark },
    submitButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: Theme.colors.brandOrange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default VendorQuestionnaireScreen;
