import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { API_URL } from '@env';
import { serviceAPI, authAPI } from '../services/api';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
    navigation: RegisterScreenNavigationProp;
}

interface ServiceCategory {
    id: string;
    name: string;
    slug: string;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'USER' | 'VENDOR'>('USER');

    // Vendor-specific fields
    const [serviceCategory, setServiceCategory] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [experienceYears, setExperienceYears] = useState('');

    // Service categories from API
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (selectedRole === 'VENDOR') {
            fetchServiceCategories();
        }
    }, [selectedRole]);

    const fetchServiceCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await serviceAPI.getCategories();
            if (response.data.success && response.data.categories) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to default categories if API fails
            setCategories([
                { id: '1', name: 'Cleaning', slug: 'cleaning' },
                { id: '2', name: 'Electrician', slug: 'electrician' },
                { id: '3', name: 'Plumbing', slug: 'plumbing' },
                { id: '4', name: 'Carpentry', slug: 'carpentry' },
                { id: '5', name: 'Painting', slug: 'painting' },
            ]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleRegister = async () => {
        // Validation
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        // Validate vendor-specific fields
        if (selectedRole === 'VENDOR') {
            if (!serviceCategory || !businessName || !businessAddress) {
                Alert.alert('Error', 'Please fill in all vendor details (service category, business name, and address)');
                return;
            }
        }

        setLoading(true);
        try {
            // Use authAPI directly to ensure we use the hardcoded local URL defined in api.ts
            // This prevents stale .env variables (pointing to production) from causing issues
            const response = await authAPI.register({
                name, email, phone, password, role: selectedRole,
                serviceCategory, businessName, businessAddress, experienceYears
            });

            const data = response.data;

            if (!data.success) {
                throw new Error(data.error || 'Registration failed');
            }

            const successMessage = data.requiresApproval
                ? 'Vendor registration successful! Your account is pending admin approval. You will be notified once approved.'
                : 'Account created successfully! Please login.';

            Alert.alert(
                'Success',
                successMessage,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Registration error:', error);
            Alert.alert(
                'Registration Failed',
                error.message || 'An error occurred. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const selectCategory = (category: ServiceCategory) => {
        setServiceCategory(category.name);
        setShowDropdown(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>

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
                            placeholder="Full Name *"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            editable={!loading}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email *"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Phone (Optional)"
                            placeholderTextColor="#999"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            editable={!loading}
                        />

                        {/* Vendor-specific fields */}
                        {selectedRole === 'VENDOR' && (
                            <>
                                {/* Service Category Dropdown */}
                                <TouchableOpacity
                                    style={styles.dropdown}
                                    onPress={() => setShowDropdown(true)}
                                    disabled={loading || loadingCategories}
                                >
                                    <Text style={serviceCategory ? styles.dropdownTextSelected : styles.dropdownText}>
                                        {loadingCategories ? 'Loading categories...' : (serviceCategory || 'Service Category *')}
                                    </Text>
                                    <Text style={styles.dropdownIcon}>▼</Text>
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Business Name *"
                                    placeholderTextColor="#999"
                                    value={businessName}
                                    onChangeText={setBusinessName}
                                    autoCapitalize="words"
                                    editable={!loading}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Business Address *"
                                    placeholderTextColor="#999"
                                    value={businessAddress}
                                    onChangeText={setBusinessAddress}
                                    editable={!loading}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Years of Experience (Optional)"
                                    placeholderTextColor="#999"
                                    value={experienceYears}
                                    onChangeText={setExperienceYears}
                                    keyboardType="numeric"
                                    editable={!loading}
                                />
                            </>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Password *"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password *"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Register</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Dropdown Modal */}
            <Modal
                visible={showDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDropdown(false)}
                >
                    <View style={styles.dropdownModal}>
                        <Text style={styles.dropdownTitle}>Select Service Category</Text>
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => selectCategory(item)}
                                >
                                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                                    {serviceCategory === item.name && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.dropdownCancel}
                            onPress={() => setShowDropdown(false)}
                        >
                            <Text style={styles.dropdownCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    form: {
        width: '100%',
    },
    roleSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 4,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    roleButtonActive: {
        backgroundColor: '#FF6B6B',
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    roleButtonTextActive: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        color: '#1a1a1a',
    },
    dropdown: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#999',
    },
    dropdownTextSelected: {
        fontSize: 16,
        color: '#1a1a1a',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#666',
    },
    button: {
        backgroundColor: '#FF6B6B',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdownModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxHeight: '70%',
        padding: 20,
    },
    dropdownTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
        textAlign: 'center',
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#1a1a1a',
    },
    checkmark: {
        fontSize: 18,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    dropdownCancel: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        alignItems: 'center',
    },
    dropdownCancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});

export default RegisterScreen;
