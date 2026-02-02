import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Phone, Mail, MessageCircle, ChevronRight, HelpCircle } from 'lucide-react-native';
import { Theme } from '../theme';

const SupportHelpScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Support & Help</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                <View style={styles.banner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>How can we help you?</Text>
                        <Text style={styles.bannerSubtitle}>Our team is available 24/7 to assist you with any issues.</Text>
                    </View>
                    <HelpCircle size={60} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
                </View>

                <Text style={styles.sectionTitle}>Contact Us</Text>

                <View style={styles.contactGrid}>
                    <TouchableOpacity style={styles.contactCard}>
                        <View style={[styles.contactIconBox, { backgroundColor: '#E0F2FE' }]}>
                            <Phone size={24} color="#0EA5E9" />
                        </View>
                        <Text style={styles.contactLabel}>Call Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard}>
                        <View style={[styles.contactIconBox, { backgroundColor: '#DCFCE7' }]}>
                            <MessageCircle size={24} color="#22C55E" />
                        </View>
                        <Text style={styles.contactLabel}>Chat with Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard}>
                        <View style={[styles.contactIconBox, { backgroundColor: '#F3E8FF' }]}>
                            <Mail size={24} color="#A855F7" />
                        </View>
                        <Text style={styles.contactLabel}>Email Us</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Frequently Asked Questions</Text>

                <View style={styles.faqList}>
                    {[
                        'How do I reschedule a booking?',
                        'What is the cancellation policy?',
                        'How do I update my profile?',
                        'Payment methods handled?',
                        'Service warranty policy'
                    ].map((question, index) => (
                        <TouchableOpacity key={index} style={styles.faqItem}>
                            <Text style={styles.faqText}>{question}</Text>
                            <ChevronRight size={20} color="#CBD5E0" />
                        </TouchableOpacity>
                    ))}
                </View>

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

    banner: { backgroundColor: Theme.colors.brandOrange, borderRadius: 20, padding: 25, position: 'relative', overflow: 'hidden', marginBottom: 30 },
    bannerContent: { zIndex: 1 },
    bannerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 8 },
    bannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
    bannerIcon: { position: 'absolute', right: -10, bottom: -10 },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark, marginBottom: 15 },

    contactGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    contactCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    contactIconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    contactLabel: { fontSize: 14, fontWeight: '600', color: Theme.colors.textDark },

    faqList: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
    faqItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    faqText: { fontSize: 15, color: Theme.colors.textDark, fontWeight: '500' }
});

export default SupportHelpScreen;
