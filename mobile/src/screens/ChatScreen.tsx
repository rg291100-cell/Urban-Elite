import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../theme';
import { ArrowLeft, Send, Phone, RefreshCcw } from 'lucide-react-native';
import { chatAPI } from '../services/api';
import { authService } from '../services/authService';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
    id: string;
    content: string;
    sender_id: string;
    booking_id: string;
    created_at: string;
    is_read: boolean;
}

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<ChatScreenRouteProp>();
    const { bookingId, professionalName, professionalImage } = route.params;
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);

    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const init = async () => {
            const user = await authService.getUser();
            setCurrentUserId(user?.id || null);
            fetchMessages();
        };
        init();

        // Poll for new messages every 5 seconds
        const intervalId = setInterval(fetchMessages, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await chatAPI.getMessages(bookingId);
            if (response.data.success) {
                setMessages(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim()) return;

        const textToSend = messageText.trim();
        setMessageText(''); // Clear immediately for UX
        setSending(true);

        try {
            const response = await chatAPI.sendMessage(bookingId, textToSend);
            if (response.data.success) {
                // Add message locally or fetch fresh
                // Ideally append immediately, then replace with server response
                fetchMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
            setMessageText(textToSend); // Restore text on failure
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender_id === currentUserId;
        const timeString = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[
                styles.messageContainer,
                isMe ? styles.userMessageContainer : styles.profMessageContainer
            ]}>
                {!isMe && professionalImage && (
                    <Image source={{ uri: professionalImage }} style={styles.messageAvatar} />
                )}
                {!isMe && !professionalImage && (
                    <View style={[styles.messageAvatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 12 }}>{professionalName.charAt(0)}</Text>
                    </View>
                )}

                <View style={[
                    styles.messageBubble,
                    isMe ? styles.userBubble : styles.profBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMe ? styles.userMessageText : styles.profMessageText
                    ]}>{item.content}</Text>
                    <Text style={[
                        styles.messageTime,
                        isMe ? styles.userMessageTime : styles.profMessageTime
                    ]}>{timeString}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Theme.colors.textDark} />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Image
                        source={{ uri: professionalImage || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                        style={styles.headerAvatar}
                    />
                    <View>
                        <Text style={styles.headerName}>{professionalName}</Text>
                        <Text style={styles.headerStatus}>Chat</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={fetchMessages}>
                    <RefreshCcw size={20} color={Theme.colors.brandOrange} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.messagesList, { paddingBottom: 20 }]}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
                        </View>
                    }
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                        editable={!sending}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!messageText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Send size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        elevation: 2,
    },
    backButton: { padding: 5, marginRight: 10 },
    headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#eee' },
    headerName: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark },
    headerStatus: { fontSize: 12, color: '#48BB78' },
    actionButton: { padding: 8, borderRadius: 20 },

    messagesList: { padding: 20 },
    messageContainer: { flexDirection: 'row', marginBottom: 15, maxWidth: '80%' },
    userMessageContainer: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
    profMessageContainer: { alignSelf: 'flex-start' },

    messageAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8, marginTop: 5 },

    messageBubble: { padding: 12, borderRadius: 20, maxWidth: '100%' },
    userBubble: { backgroundColor: Theme.colors.brandOrange, borderBottomRightRadius: 4 },
    profBubble: { backgroundColor: 'white', borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#EDF2F7' },

    messageText: { fontSize: 15, lineHeight: 22 },
    userMessageText: { color: 'white' },
    profMessageText: { color: Theme.colors.textDark },

    messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    userMessageTime: { color: 'rgba(255,255,255,0.8)' },
    profMessageTime: { color: '#A0AEC0' },

    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#aaa' },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0'
    },
    input: {
        flex: 1,
        backgroundColor: '#F7FAFC',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        color: Theme.colors.textDark,
        maxHeight: 100,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#EDF2F7'
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: Theme.colors.brandOrange,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2
    },
    sendButtonDisabled: { backgroundColor: '#CBD5E0' }
});

export default ChatScreen;
