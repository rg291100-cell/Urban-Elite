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
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { Camera, Image as ImageIcon, FileText, CheckCircle2, Upload, X } from 'lucide-react-native';
import { storageService } from '../services/storage';
import { authService } from '../services/authService';
import { Theme } from '../theme';
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';

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
    const [aadhaarUrl, setAadhaarUrl] = useState('');
    const [panUrl, setPanUrl] = useState('');
    const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);
    const [isUploadingPan, setIsUploadingPan] = useState(false);
    const [showAadhaarOptions, setShowAadhaarOptions] = useState(false);
    const [showPanOptions, setShowPanOptions] = useState(false);

    // Service categories from API
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);



    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '473322533502-dheriad0mjmdiq6a9e191ui11sknp230.apps.googleusercontent.com', // From .env
            offlineAccess: true,
        });
    }, []);

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



    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const response = await GoogleSignin.signIn();

            // Check for success or data property depending on library version
            // For newer versions, response might contain user info directly or in data property
            const idToken = response.data ? response.data.idToken : (response as any).idToken;

            if (idToken) {
                // Determine role based on selection
                // Note: For Vendors, this will create a PENDING account if they don't exist
                // Ideally we might want to redirect them to fill details, but for now we follow the backend logic
                const apiResponse = await authAPI.googleLogin(idToken, selectedRole);
                const data = apiResponse.data;

                if (!data.success) {
                    throw new Error(data.error || 'Google Sign Up failed');
                }

                await authService.setToken(data.token);
                await authService.setUser(data.user);

                const targetScreen = data.user.role === 'VENDOR' ? 'VendorTabs' : 'MainTabs';
                navigation.reset({
                    index: 0,
                    routes: [{ name: targetScreen as any }],
                });
            } else {
                // If response was cancelled or other status, handle gracefully
                if (response.type === 'cancelled') {
                    console.log('Google Sign in cancelled');
                    return;
                }
                throw new Error('No ID token received from Google');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('Google Sign in cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Google Sign in in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services not available');
            } else {
                console.error('Google login error:', error);
                const errorData = error.response?.data;
                if (errorData) {
                    Alert.alert('Sign Up Failed', errorData.error || 'Google sign up failed');
                } else {
                    Alert.alert('Google Sign Up Failed', error.message || 'An error occurred');
                }
            }
        } finally {
            setLoading(false);
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
            if (!serviceCategory || !businessName || !businessAddress || !aadhaarUrl || !panUrl) {
                Alert.alert('Error', 'Please fill in all vendor details including KYC (Aadhaar & PAN)');
                return;
            }
        }

        setLoading(true);
        try {
            // Use authAPI directly to ensure we use the hardcoded local URL defined in api.ts
            // This prevents stale .env variables (pointing to production) from causing issues
            const response = await authAPI.register({
                name, email, phone, password, role: selectedRole,
                serviceCategory, businessName, businessAddress, experienceYears,
                aadhaarUrl, panUrl
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

    const handleFileUpload = async (type: 'aadhaar' | 'pan', source: 'camera' | 'library' | 'pdf') => {
        try {
            let fileData: any = null;

            if (source === 'pdf') {
                const results = await pick({
                    type: [types.pdf],
                });
                fileData = results[0];
            } else {
                const options: any = {
                    mediaType: 'photo',
                    includeBase64: true,
                    quality: 0.7,
                };

                const result = source === 'camera'
                    ? await launchCamera(options)
                    : await launchImageLibrary(options);

                if (result.didCancel) return;
                if (result.assets && result.assets.length > 0) {
                    fileData = {
                        uri: result.assets[0].uri,
                        base64: result.assets[0].base64,
                        type: result.assets[0].type,
                        name: result.assets[0].fileName,
                    };
                }
            }

            if (!fileData) return;

            if (type === 'aadhaar') {
                setIsUploadingAadhaar(true);
                setShowAadhaarOptions(false);
            } else {
                setIsUploadingPan(true);
                setShowPanOptions(false);
            }

            // If PDF, we need to convert to base64 or use another method. 
            // For simplicity in this demo, let's stick to images if possible, 
            // or use a base64 reader if PDF is picked.
            let base64 = fileData.base64;
            if (source === 'pdf') {
                // In a real app, you'd use react-native-fs to read the file as base64
                // For now, let's assume images for the best visual experience
                Alert.alert('Info', 'PDF support requires additional setup. Please upload an image for now.');
                setIsUploadingAadhaar(false);
                setIsUploadingPan(false);
                return;
            }

            const fileName = `${type}_${Date.now()}_${fileData.name}`;
            const uploadResult = await storageService.uploadFile(
                'kyc-documents',
                `${type}/${fileName}`,
                base64,
                fileData.type || 'image/jpeg'
            );

            if (uploadResult.error) {
                Alert.alert('Upload Failed', uploadResult.error);
            } else if (uploadResult.url) {
                if (type === 'aadhaar') setAadhaarUrl(uploadResult.url);
                else setPanUrl(uploadResult.url);
            }
        } catch (err) {
            console.error('File pick error:', err);
            const isCancel = isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED;
            if (!isCancel) {
                Alert.alert('Error', 'Failed to pick file');
            }
        } finally {
            setIsUploadingAadhaar(false);
            setIsUploadingPan(false);
        }
    };

    const renderFileSelector = (type: 'aadhaar' | 'pan', label: string, currentUrl: string, isUploading: boolean) => (
        <View style={styles.fileSelectorContainer}>
            <Text style={styles.fileLabel}>{label} *</Text>
            {currentUrl ? (
                <View style={styles.uploadedContainer}>
                    <CheckCircle2 size={20} color="#48BB78" />
                    <Text style={styles.uploadedText} numberOfLines={1}>Document Uploaded</Text>
                    <TouchableOpacity onPress={() => type === 'aadhaar' ? setAadhaarUrl('') : setPanUrl('')}>
                        <X size={20} color="#A0AEC0" />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => type === 'aadhaar' ? setShowAadhaarOptions(true) : setShowPanOptions(true)}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <ActivityIndicator size="small" color="#FF6B6B" />
                    ) : (
                        <>
                            <Upload size={20} color="#FF6B6B" />
                            <Text style={styles.uploadButtonText}>Attach Document</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );

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
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            editable={!loading}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email *"
                            placeholderTextColor="#94A3B8"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Phone (Optional)"
                            placeholderTextColor="#94A3B8"
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
                                    style={styles.dropdownButton}
                                    onPress={() => setShowDropdown(true)}
                                    disabled={loading || loadingCategories}
                                >
                                    <Text style={serviceCategory ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                                        {loadingCategories ? 'Loading categories...' : (serviceCategory || 'Service Category *')}
                                    </Text>
                                    <Text style={styles.dropdownButtonText}>▼</Text>
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Business Name *"
                                    placeholderTextColor="#94A3B8"
                                    value={businessName}
                                    onChangeText={setBusinessName}
                                    autoCapitalize="words"
                                    editable={!loading}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Business Address *"
                                    placeholderTextColor="#94A3B8"
                                    value={businessAddress}
                                    onChangeText={setBusinessAddress}
                                    editable={!loading}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Years of Experience (Optional)"
                                    placeholderTextColor="#94A3B8"
                                    value={experienceYears}
                                    onChangeText={setExperienceYears}
                                    keyboardType="numeric"
                                    editable={!loading}
                                />

                                <Text style={styles.sectionTitle}>KYC Details (Required)</Text>

                                {renderFileSelector('aadhaar', 'Aadhaar Card', aadhaarUrl, isUploadingAadhaar)}
                                {renderFileSelector('pan', 'PAN Card', panUrl, isUploadingPan)}
                            </>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Password *"
                            placeholderTextColor="#94A3B8"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password *"
                            placeholderTextColor="#94A3B8"
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
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.buttonText}>Register</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.googleButton, loading && styles.buttonDisabled]}
                            onPress={handleGoogleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login' as any)}>
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

            {/* File Options Modal */}
            <Modal
                visible={showAadhaarOptions || showPanOptions}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setShowAadhaarOptions(false);
                    setShowPanOptions(false);
                }}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        setShowAadhaarOptions(false);
                        setShowPanOptions(false);
                    }}
                >
                    <View style={styles.optionsModal}>
                        <Text style={styles.modalTitle}>Choose {showAadhaarOptions ? 'Aadhaar' : 'PAN'} Source</Text>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => handleFileUpload(showAadhaarOptions ? 'aadhaar' : 'pan', 'camera')}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#F0FFF4' }]}>
                                <Camera size={24} color="#48BB78" />
                            </View>
                            <Text style={styles.optionText}>Take a Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => handleFileUpload(showAadhaarOptions ? 'aadhaar' : 'pan', 'library')}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#EBF8FF' }]}>
                                <ImageIcon size={24} color="#4299E1" />
                            </View>
                            <Text style={styles.optionText}>Choose from Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => handleFileUpload(showAadhaarOptions ? 'aadhaar' : 'pan', 'pdf')}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#FFF5F5' }]}>
                                <FileText size={24} color="#F56565" />
                            </View>
                            <Text style={styles.optionText}>Attach PDF Document</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => {
                                setShowAadhaarOptions(false);
                                setShowPanOptions(false);
                            }}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
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
        backgroundColor: Theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Theme.colors.textDark,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Theme.colors.textLight,
        marginBottom: 32,
    },
    form: {
        width: '100%',
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.searchBg,
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    roleButtonActive: {
        backgroundColor: Theme.colors.navy,
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Theme.colors.textLight,
    },
    roleButtonTextActive: {
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Theme.colors.textDark,
        marginTop: 16,
        marginBottom: 12,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Theme.colors.inputBg,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        color: Theme.colors.textDark,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Theme.colors.inputBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: Theme.colors.textDark,
    },
    dropdownPlaceholder: {
        fontSize: 16,
        color: Theme.colors.textLight,
    },
    fileSelectorContainer: {
        marginBottom: 16,
    },
    fileLabel: {
        fontSize: 13,
        color: Theme.colors.textLight,
        marginBottom: 6,
        marginLeft: 4,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDFCF0',
        borderWidth: 1,
        borderColor: Theme.colors.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
    },
    uploadButtonText: {
        marginLeft: 8,
        fontSize: 15,
        color: Theme.colors.primary,
        fontWeight: '600',
    },
    uploadedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FFF4',
        borderWidth: 1,
        borderColor: '#48BB78',
        borderRadius: 12,
        padding: 16,
    },
    uploadedText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#48BB78',
        fontWeight: '500',
    },
    button: {
        backgroundColor: Theme.colors.primary,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 8,
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

    googleButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    googleButtonText: {
        color: Theme.colors.textDark,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 40,
    },
    loginText: {
        color: Theme.colors.textLight,
        fontSize: 14,
    },
    loginLink: {
        color: Theme.colors.textDark,
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdownModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxHeight: '70%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    dropdownTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
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
        borderBottomColor: '#F1F5F9',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#0F172A',
    },
    checkmark: {
        fontSize: 18,
        color: '#D4AF37',
        fontWeight: 'bold',
    },
    dropdownCancel: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        alignItems: 'center',
    },
    dropdownCancelText: {
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '600',
    },
    optionsModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 20,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 4,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#F8FAFC',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
    },
    cancelBtn: {
        marginTop: 16,
        padding: 16,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '700',
    },
});

export default RegisterScreen;
