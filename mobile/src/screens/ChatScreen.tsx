import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, // turbo-all
    FlatList, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../theme';
import { ArrowLeft, Send, Phone } from 'lucide-react-native';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'professional';
    timestamp: string;
    isRead: boolean;
}

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<ChatScreenRouteProp>();
    const { professionalName, professionalImage } = route.params;
    const insets = useSafeAreaInsets();

    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am on my way to your location.',
            sender: 'professional',
            timestamp: '12:30 PM',
            isRead: true
        },
        {
            id: '2',
            text: 'Okay, thanks for the update.',
            sender: 'user',
            timestamp: '12:31 PM',
            isRead: true
        }
    ]);

    const sendMessage = () => {
        if (!messageText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageText('');

        // Simulate reply
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                text: 'See you soon!',
                sender: 'professional',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: false
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.messageContainer,
                isUser ? styles.userMessageContainer : styles.profMessageContainer
            ]}>
                {!isUser && professionalImage && (
                    <Image source={{ uri: professionalImage }} style={styles.messageAvatar} />
                )}
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.profBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.profMessageText
                    ]}>{item.text}</Text>
                    <Text style={[
                        styles.messageTime,
                        isUser ? styles.userMessageTime : styles.profMessageTime
                    ]}>{item.timestamp}</Text>
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
                        <Text style={styles.headerStatus}>Online</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Phone size={22} color={Theme.colors.brandOrange} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.messagesList, { paddingBottom: 20 }]}
                showsVerticalScrollIndicator={false}
            />

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
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!messageText.trim()}
                    >
                        <Send size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    backButton: { padding: 5, marginRight: 10 },
    headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    headerName: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textDark },
    headerStatus: { fontSize: 12, color: '#48BB78' },
    headerActions: { flexDirection: 'row' },
    actionButton: { padding: 8, backgroundColor: '#FFF7ED', borderRadius: 20 },

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
