import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            onFinish();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.iconContainer}>
                    <Zap size={48} color="white" fill="white" />
                </View>
                <Text style={styles.title}>
                    <Text style={styles.urban}>Urban</Text> <Text style={styles.elite}>Elite</Text>
                </Text>
                <Text style={styles.tagline}>Premium Services, Delivered.</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Clean white background
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        backgroundColor: Theme.colors.brandOrange,
        borderRadius: 30, // Softer rounding
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: Theme.colors.brandOrange,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    urban: {
        color: '#1A202C', // Dark gray/black
    },
    elite: {
        color: Theme.colors.brandOrange,
        fontStyle: 'italic',
    },
    tagline: {
        fontSize: 16,
        color: '#718096', // Light gray
        letterSpacing: 1.5,
        fontWeight: '500',
    },
});

export default SplashScreen;
