import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { launchImageLibrary } from 'react-native-image-picker';
import { Image as ImageIcon, X, Upload } from 'lucide-react-native';
import { storageService } from '../services/storage';

type BookingInstructionsRouteProp = RouteProp<RootStackParamList, 'BookingInstructions'>;

const BookingInstructionsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BookingInstructionsRouteProp>();
    const { item, date, slot, location } = route.params || {};
    const insets = useSafeAreaInsets();

    const [instructions, setInstructions] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleAttachment = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                includeBase64: true,
                quality: 0.7,
            });

            if (result.didCancel) return;

            if (result.assets && result.assets[0].base64) {
                setIsUploading(true);
                const asset = result.assets[0];
                const fileName = `booking_att_${Date.now()}_${asset.fileName || 'file'}`;

                const uploadResult = await storageService.uploadFile(
                    'booking-attachments',
                    fileName,
                    asset.base64 || '',
                    asset.type ?? 'image/jpeg'
                );

                if (uploadResult.error) {
                    Alert.alert('Upload Failed', uploadResult.error);
                } else if (uploadResult.url) {
                    setAttachmentUrl(uploadResult.url);
                }
            }
        } catch (error) {
            console.error('Attachment error:', error);
            Alert.alert('Error', 'Failed to attach image');
        } finally {
            setIsUploading(false);
        }
    };

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

                {/* Attachment Section */}
                <View style={styles.attachmentContainer}>
                    <Text style={styles.attachmentLabel}>Add Photo (Optional)</Text>

                    {attachmentUrl ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: attachmentUrl }} style={styles.previewImage} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => setAttachmentUrl(null)}
                            >
                                <X size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleAttachment}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator color={Theme.colors.brandOrange} />
                            ) : (
                                <>
                                    <ImageIcon size={24} color={Theme.colors.brandOrange} />
                                    <Text style={styles.uploadText}>Tap to upload photo</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

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
                        instructions,
                        attachmentUrl
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
    pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#000', lineHeight: 36, },
    subTitle: { fontSize: 16, color: '#718096', marginTop: 10, fontWeight: '600', maxWidth: 250 },

    textInput: {
        backgroundColor: '#F7FAFC',
        borderRadius: 20,
        padding: 20,
        fontSize: 16,
        color: '#1A202C',
        minHeight: 150,
        fontWeight: '500',
        marginBottom: 20
    },

    attachmentContainer: {
        marginTop: 10
    },
    attachmentLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4A5568',
        marginBottom: 10
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 15,
        padding: 20,
        height: 100
    },
    uploadText: {
        marginLeft: 10,
        color: Theme.colors.brandOrange,
        fontWeight: '600'
    },
    previewContainer: {
        position: 'relative',
        height: 200,
        borderRadius: 15,
        overflow: 'hidden'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },

    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center', justifyContent: 'space-between' },
    backButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', width: '30%', alignItems: 'center' },
    backButtonText: { fontWeight: 'bold', color: '#4A5568' },
    continueButton: { backgroundColor: Theme.colors.brandOrange, paddingVertical: 15, borderRadius: 20, width: '65%', alignItems: 'center', shadowColor: Theme.colors.brandOrange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
    continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default BookingInstructionsScreen;
