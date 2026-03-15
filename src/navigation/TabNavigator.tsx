/**
 * Navigation — Full app with all screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import MarketScreen from '../screens/market/MarketScreen';
import VaultScreen from '../screens/vault/VaultScreen';
import GalleryScreen from '../screens/gallery/GalleryScreen';
import MoreScreen from '../screens/more/MoreScreen';
import CartScreen from '../screens/cart/CartScreen';
import ContentScreen from '../screens/content/ContentScreen';
import PostDetailScreen from '../screens/content/PostDetailScreen';
import ExhibitionDetailScreen from '../screens/content/ExhibitionDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏛', Market: '🛍', Vault: '💎', Gallery: '🖼', More: '≡',
  };
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[label] || '•'}</Text>;
}

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: '#C5A059',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#0e382c', borderTopWidth: 0,
          height: 60, paddingBottom: 8, paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 9, letterSpacing: 0.5 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Content" component={ContentScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ExhibitionDetail" component={ExhibitionDetailScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
