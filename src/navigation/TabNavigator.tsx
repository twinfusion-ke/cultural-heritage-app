/**
 * Navigation — Bottom Tabs + Stack for detail screens
 *
 * 5 tabs, each with a nested stack for Cart and detail views.
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
import { useCartStore } from '../stores/cartStore';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏛',
    Market: '🛍',
    Vault: '💎',
    Gallery: '🖼',
    More: '≡',
  };
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[label] || '•'}
    </Text>
  );
}

function CartBadge() {
  const count = useCartStore((s) => s.getItemCount());
  if (count === 0) return null;
  return (
    <View style={styles.cartBadge}>
      <Text style={styles.cartBadgeText}>{count}</Text>
    </View>
  );
}

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View>
            <TabIcon label={route.name} focused={focused} />
            {(route.name === 'Market' || route.name === 'Vault' || route.name === 'Gallery') && (
              <CartBadge />
            )}
          </View>
        ),
        tabBarActiveTintColor: colors.shared.gold,
        tabBarInactiveTintColor: colors.hub.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
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
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0e382c',
    borderTopWidth: 0,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
    textAlign: 'center',
  },
  iconFocused: {
    opacity: 1,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.shared.gold,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 9,
    color: colors.hub.primary,
  },
});
