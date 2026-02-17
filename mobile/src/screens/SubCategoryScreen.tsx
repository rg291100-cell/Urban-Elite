import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { Theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { homeAPI } from '../services/api';

type SubCategoryRouteProp = RouteProp<RootStackParamList, 'SubCategory'>;

const SubCategoryScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<SubCategoryRouteProp>();
    // Default fallback if parameters not provided
    const { slug, name } = route.params || { slug: 'repair-maintenance', name: 'Repair & Maintenance' };

    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const response = await homeAPI.getSubCategories(slug);
                if (response.data && response.data.subcategories) {
                    setSubcategories(response.data.subcategories);
                }
            } catch (error) {
                console.error(`Failed to fetch subcategories for ${slug}`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubCategories();
    }, [slug]);

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                    <Text style={styles.logoIconText}>🛠️</Text>
                </View>
                <Text style={styles.headerTitle}>
                    <Text style={styles.titleUrban}>OLFIX</Text>
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
                    placeholder={`Search within ${name}...`}
                    placeholderTextColor={Theme.colors.textLight}
                    style={styles.searchInput}
                />
            </View>
        </View>
    );

    const renderSubCategoryItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate('ServiceListing', { slug: item.slug, name: item.name })}
        >
            <View style={styles.iconContainer}>
                <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.serviceIcon} />
            </View>
            <Text style={styles.serviceText}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.brandOrange} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                data={subcategories}
                renderItem={renderSubCategoryItem}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={styles.gridContainer}
                ListHeaderComponent={
                    <>
                        {renderHeader()}
                        {renderSearchBar()}
                        <View style={styles.pageTitleContainer}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Text style={styles.backArrow}>‹</Text>
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.pageTitle}>{name.toUpperCase()}</Text>
                                <Text style={styles.resultsText}>{subcategories.length} CATEGORIES</Text>
                            </View>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No subcategories found.</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoIcon: { width: 40, height: 40, backgroundColor: Theme.colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoIconText: { fontSize: 24 },
    headerTitle: { fontSize: 24, fontWeight: Theme.typography.weights.bold },
    titleUrban: { color: Theme.colors.navy, fontWeight: '900', letterSpacing: -0.5 },
    notificationButton: { width: 40, height: 40, backgroundColor: Theme.colors.searchBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notificationIcon: { width: 20, height: 20, tintColor: Theme.colors.textLight },
    notificationBadge: { width: 8, height: 8, backgroundColor: Theme.colors.primary, borderRadius: 4, position: 'absolute', top: 10, right: 10, borderWidth: 1, borderColor: '#FFF' },

    searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.searchBg, borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12 },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 16, color: Theme.colors.textDark },

    pageTitleContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 25 },
    backButton: { width: 45, height: 45, backgroundColor: '#F7FAFC', borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    backArrow: { fontSize: 28, color: '#2D3748', fontWeight: 'bold', marginTop: -2 },
    pageTitle: { fontSize: 24, fontWeight: '900', color: '#1A1025', fontStyle: 'italic', marginLeft: 5 },
    resultsText: { fontSize: 10, fontWeight: 'bold', color: '#A0AEC0', letterSpacing: 1, marginLeft: 5, marginTop: 5 },

    gridContainer: { paddingHorizontal: 10, paddingBottom: 20 },
    gridItem: { flex: 1, alignItems: 'center', marginBottom: 25, marginHorizontal: 5 },
    iconContainer: { width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    serviceIcon: { width: 40, height: 40, resizeMode: 'contain' },
    serviceText: { fontSize: 11, fontWeight: '700', color: Theme.colors.textDark, textAlign: 'center' },

    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#A0AEC0', fontSize: 16 }
});

export default SubCategoryScreen;
