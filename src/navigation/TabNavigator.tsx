/**
 * Navigation — Full app with all screens
 *
 * Custom bottom tab bar uses useSafeAreaInsets() for bottom padding,
 * and dynamically themes based on the active tab's division.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import MarketScreen from '../screens/market/MarketScreen';
import VaultScreen from '../screens/vault/VaultScreen';
import GalleryScreen from '../screens/gallery/GalleryScreen';
import MoreScreen from '../screens/more/MoreScreen';
import CartScreen from '../screens/cart/CartScreen';
import ContentScreen from '../screens/content/ContentScreen';
import PostDetailScreen from '../screens/content/PostDetailScreen';
import ExhibitionDetailScreen from '../screens/content/ExhibitionDetailScreen';
import SearchScreen from '../screens/search/SearchScreen';

import { divisionThemes, routeToDivision, ACTIVE_TAB_GOLD } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_CONTENT_HEIGHT = 50;

const TAB_ICONS: Record<string, string> = {
  Home: '\u{1F3DB}',    // 🏛
  Market: '\u{1F6CD}',  // 🛍
  Vault: '\u{1F48E}',   // 💎
  Gallery: '\u{1F5BC}', // 🖼
  More: '\u{2261}',     // ≡
};

/** Custom Tab Bar — applies insets.bottom and dynamic theme color */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index].name;
  const division = routeToDivision[activeRoute] || 'hub';
  const theme = divisionThemes[division];

  return (
    <View style={[
      styles.tabBar,
      {
        backgroundColor: theme.primary,
        paddingBottom: Math.max(insets.bottom, 4),
      },
    ]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icon = TAB_ICONS[route.name] || '\u{2022}';

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            onLongPress={() => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            }}
          >
            <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.5 }]}>
              {icon}
            </Text>
            {focused && <View style={styles.activeIndicator} />}
            <Text style={[
              styles.tabLabel,
              { color: focused ? ACTIVE_TAB_GOLD : 'rgba(255,255,255,0.5)' },
            ]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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
      <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0,
    elevation: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_CONTENT_HEIGHT,
  },
  tabIcon: {
    fontSize: 20,
  },
  activeIndicator: {
    width: 20,
    height: 2,
    backgroundColor: ACTIVE_TAB_GOLD,
    marginTop: 2,
    borderRadius: 1,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    fontFamily: 'Montserrat-Medium',
    marginTop: 2,
  },
});
