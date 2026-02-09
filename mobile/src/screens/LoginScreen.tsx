import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { authAPI } from '../services/api';
import { authService } from '../services/authService';
import { Theme } from '../theme';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'USER' | 'VENDOR'>('USER');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            // Use authAPI to ensure we use the correct backend URL (local for emulator)
            // This prevents using stale .env variables that might point to production
            const response = await authAPI.login(email, password);
            const data = response.data;

            if (!data.success) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user data using authService
            await authService.setToken(data.token);
            await authService.setUser(data.user);

            // Navigate based on role
            const targetScreen = data.user.role === 'VENDOR' ? 'VendorTabs' : 'MainTabs';
            navigation.reset({
                index: 0,
                routes: [{ name: targetScreen as any }],
            });
        } catch (error: any) {
            console.error('Login error:', error);

            // Handle specific API errors
            const errorData = error.response?.data;
            if (errorData) {
                if (errorData.approvalStatus === 'PENDING') {
                    Alert.alert('Approval Pending', 'Your account is pending approval from admin. Please wait for approval.');
                    return;
                }
                if (errorData.approvalStatus === 'REJECTED') {
                    Alert.alert('Account Rejected', 'Your account has been rejected. Please contact support for more information.');
                    return;
                }
                Alert.alert('Login Failed', errorData.error || 'Invalid credentials');
                return;
            }

            Alert.alert(
                'Login Failed',
                error.message || 'An error occurred. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.form}>
                    {/* Role Selector */}
                    <View style={styles.roleSelector}>
                        <TouchableOpacity
                            style={[styles.roleButton, selectedRole === 'USER' && styles.roleButtonActive]}
                            onPress={() => setSelectedRole('USER')}
                            disabled={loading}
                        >
                            <Text style={[styles.roleButtonText, selectedRole === 'USER' && styles.roleButtonTextActive]}>
                                User
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleButton, selectedRole === 'VENDOR' && styles.roleButtonActive]}
                            onPress={() => setSelectedRole('VENDOR')}
                            disabled={loading}
                        >
                            <Text style={[styles.roleButtonText, selectedRole === 'VENDOR' && styles.roleButtonTextActive]}>
                                Vendor
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        editable={!loading}
                    />

                    <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                        onPress={() => navigation.navigate('ForgotPassword' as any, { email })}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In as {selectedRole === 'USER' ? 'User' : 'Vendor'}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register' as any)}>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={() => {
                            setEmail('rishabh@example.com');
                            setPassword('password123');
                        }}
                    >
                        <Text style={styles.testButtonText}>Use Test Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 32,
    },
    form: {
        width: '100%',
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    roleButtonActive: {
        backgroundColor: '#0F172A',
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    roleButtonTextActive: {
        color: '#FFFFFF',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    button: {
        backgroundColor: Theme.colors.buttonPeach,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: Theme.colors.buttonPeach,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerText: {
        color: '#64748B',
        fontSize: 14,
    },
    linkText: {
        color: '#0F172A',
        fontSize: 14,
        fontWeight: 'bold',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#D4AF37',
        fontSize: 14,
        fontWeight: '600',
    },
    testButton: {
        marginTop: 24,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    testButtonText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default LoginScreen;