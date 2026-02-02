import React from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';

const AdsScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                    <Text style={styles.logoIconText}>⚡</Text>
                </View>
                <Text style={styles.headerTitle}>
                    <Text style={styles.titleUrban}>Urban</Text> <Text style={styles.titleElite}>Elite</Text>
                </Text>
            </View>
            <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
            >
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png' }}
                    style={styles.notificationIcon}
                />
                <View style={styles.notificationBadge} />
            </TouchableOpacity>
        </View>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Text style={{ fontSize: 18, color: Theme.colors.textLight }}>🔍</Text>
                <TextInput
                    placeholder="Search for services..."
                    placeholderTextColor={Theme.colors.textLight}
                    style={styles.searchInput}
                />
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3018/3018442.png' }}
                    style={styles.filterIcon}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}
            {renderSearchBar()}

            <View style={styles.contentContainer}>
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1182/1182718.png' }}
                    style={styles.mainIcon}
                />
                <Text style={styles.title}>ELITE</Text><Text style={styles.title}>Offers</Text>
                <Text style={styles.subtitle}>
                    Exclusive lifestyle deals curated for{'\n'}our premium members. Coming soon.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },

    // Header
    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.brandOrange, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24, color: 'white' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    titleUrban: { color: Theme.colors.brandOrange, fontWeight: '900' },
    titleElite: { color: Theme.colors.brandOrange, fontWeight: '900', fontStyle: 'italic' },
    notificationButton: { width: 40, height: 40, backgroundColor: Theme.colors.searchBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notificationIcon: { width: 20, height: 20, tintColor: Theme.colors.textLight },
    notificationBadge: { width: 8, height: 8, backgroundColor: Theme.colors.brandOrange, borderRadius: 4, position: 'absolute', top: 10, right: 10, borderWidth: 1, borderColor: '#FFF' },

    // Search
    searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.searchBg, borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12 },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: Theme.colors.textDark },
    filterIcon: { width: 20, height: 20, tintColor: Theme.colors.textLight },

    // Content
    contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: -100 },
    mainIcon: { width: 100, height: 100, marginBottom: 30, resizeMode: 'contain' },
    title: { fontSize: 22, fontWeight: '900', color: '#1A202C', fontStyle: 'italic', marginBottom: 15, letterSpacing: 1 },
    subtitle: { textAlign: 'center', color: '#718096', fontSize: 14, fontWeight: '600', lineHeight: 22, letterSpacing: 0.5 },
});

export default AdsScreen;
