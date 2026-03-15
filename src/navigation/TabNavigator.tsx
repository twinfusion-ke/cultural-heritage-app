/**
 * Bottom Tab Navigator — 5 Tabs
 *
 * Home (Main Hub) | Market | Vault (Jewelry) | Gallery | More
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import HomeScreen from '../screens/home/HomeScreen';
import MarketScreen from '../screens/market/MarketScreen';
import VaultScreen from '../screens/vault/VaultScreen';
import GalleryScreen from '../screens/gallery/GalleryScreen';
import MoreScreen from '../screens/more/MoreScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

/** Simple icon component (placeholder — replace with proper icons in Phase 2) */
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏛',
    Market: '🛍',
    Vault: '💎',
    Gallery: '🖼',
    More: '≡',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[label] || '•'}
      </Text>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
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
    fontFamily: 'Montserrat',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
