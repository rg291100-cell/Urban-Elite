import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../theme';
import { CheckCircle, Home, List } from 'lucide-react-native';

type SuccessRouteProp = RouteProp<RootStackParamList, 'OthersRequestSuccess'>;

const OthersRequestSuccessScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<SuccessRouteProp>();
    const { requestId } = route.params;

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 6,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.content}>
                {/* Animated checkmark */}
                <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.iconCircle}>
                        <CheckCircle size={60} color="#48BB78" />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>Request Submitted!</Text>
                    <Text style={styles.subtitle}>
                        Your request has been sent directly to our admin team.
                    </Text>

                    {/* Info cards */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoCardTitle}>📋 Request ID</Text>
                        <Text style={styles.infoCardValue}>#{requestId.slice(0, 8).toUpperCase()}</Text>
                    </View>

                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>What happens next?</Text>
                        <View style={styles.step}>
                            <View style={[styles.stepDot, { backgroundColor: Theme.colors.brandOrange }]} />
                            <Text style={styles.stepText}>Our team will review your request</Text>
                        </View>
                        <View style={styles.step}>
                            <View style={[styles.stepDot, { backgroundColor: '#4299E1' }]} />
                            <Text style={styles.stepText}>We'll contact you via phone/email to discuss pricing</Text>
                        </View>
                        <View style={styles.step}>
                            <View style={[styles.stepDot, { backgroundColor: '#48BB78' }]} />
                            <Text style={styles.stepText}>Service will be scheduled at your convenience</Text>
                        </View>
                    </View>

                    <Text style={styles.note}>
                        Typical response time: <Text style={styles.noteHighlight}>within 2-4 hours</Text> during business hours
                    </Text>
                </Animated.View>
            </View>

            {/* Action Buttons */}
            <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('MyOthersRequests')}
                >
                    <List size={18} color={Theme.colors.brandOrange} style={{ marginRight: 8 }} />
                    <Text style={styles.secondaryButtonText}>View My Requests</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('MainTabs')}
                >
                    <Home size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Go to Home</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },

    iconContainer: { marginBottom: 24 },
    iconCircle: {
        width: 120, height: 120,
        borderRadius: 60,
        backgroundColor: '#F0FFF4',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#48BB78',
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },

    textContainer: { alignItems: 'center', width: '100%' },

    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A202C',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },

    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 24,
        paddingVertical: 16,
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    infoCardTitle: { fontSize: 13, color: '#718096', fontWeight: '600', marginBottom: 4 },
    infoCardValue: { fontSize: 20, fontWeight: '800', color: '#2D3748', letterSpacing: 1 },

    stepsContainer: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 18,
        width: '100%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    stepsTitle: { fontSize: 14, fontWeight: '700', color: '#4A5568', marginBottom: 12 },
    step: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    stepDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    stepText: { fontSize: 13, color: '#718096', flex: 1, lineHeight: 18 },

    note: {
        fontSize: 12,
        color: '#A0AEC0',
        textAlign: 'center',
        lineHeight: 18,
    },
    noteHighlight: { color: Theme.colors.brandOrange, fontWeight: '700' },

    buttons: {
        padding: 20,
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.brandOrange,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Theme.colors.brandOrange,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
    },
    primaryButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
    secondaryButton: {
        flexDirection: 'row',
        backgroundColor: '#FFF8F0',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FDDCB5',
    },
    secondaryButtonText: { fontSize: 15, fontWeight: '700', color: Theme.colors.brandOrange },
});

export default OthersRequestSuccessScreen;
