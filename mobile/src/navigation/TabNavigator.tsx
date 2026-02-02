import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import BookingsScreen from '../screens/BookingsScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdsScreen from '../screens/AdsScreen';
import { Theme } from '../theme';

import { Home, Calendar, Wallet, User, Megaphone } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
    const color = focused ? Theme.colors.activeTab : Theme.colors.inactiveTab;
    const size = 24;

    if (name === 'Explore') return <Home size={size} color={color} />;
    if (name === 'Bookings') return <Calendar size={size} color={color} />;
    if (name === 'Wallet') return <Wallet size={size} color={color} />;
    if (name === 'Profile') return <User size={size} color={color} />;
    if (name === 'Ads') return <Megaphone size={size} color={color} />;

    return <Home size={size} color={color} />;
};

const TabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: Theme.colors.activeTab,
                tabBarInactiveTintColor: Theme.colors.inactiveTab,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 5,
                    elevation: 0,
                },
                tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name={route.name} focused={focused} />,
            })}
        >
            <Tab.Screen name="Explore" component={HomeScreen} />
            <Tab.Screen name="Bookings" component={BookingsScreen} />
            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Ads" component={AdsScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
