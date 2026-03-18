/**
 * Navigation — Tab bar visible on ALL screens
 *
 * Detail screens are nested inside each tab's stack so the
 * bottom tab bar remains visible everywhere.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import MarketScreen from '../screens/market/MarketScreen';
import VaultScreen from '../screens/vault/VaultScreen';
import GalleryScreen from '../screens/gallery/GalleryScreen';
import MoreScreen from '../screens/more/MoreScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';

// Shared detail screens
import CartScreen from '../screens/cart/CartScreen';
import ContentScreen from '../screens/content/ContentScreen';
import PostDetailScreen from '../screens/content/PostDetailScreen';
import ExhibitionDetailScreen from '../screens/content/ExhibitionDetailScreen';
import SearchScreen from '../screens/search/SearchScreen';
import BlogScreen from '../screens/blog/BlogScreen';
import AboutScreen from '../screens/about/AboutScreen';
import ContactScreen from '../screens/contact/ContactScreen';
import LegacyScreen from '../screens/legacy/LegacyScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import VisitScreen from '../screens/visit/VisitScreen';
import AuthScreen from '../screens/auth/AuthScreen';

import { useFavoritesStore } from '../stores/favoritesStore';
import { ACTIVE_TAB_GOLD } from '../theme';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_CONTENT_HEIGHT = 56;

const TAB_CONFIG: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Market: { active: 'basket', inactive: 'basket-outline' },
  Vault: { active: 'diamond', inactive: 'diamond-outline' },
  Gallery: { active: 'color-palette', inactive: 'color-palette-outline' },
  Favorites: { active: 'heart', inactive: 'heart-outline' },
  More: { active: 'menu', inactive: 'menu-outline' },
};

/** Shared detail screens added to every tab stack */
function addSharedScreens(S: any) {
  return (
    <>
      <S.Screen name="Cart" component={CartScreen} options={{ animation: 'slide_from_bottom' }} />
      <S.Screen name="ProductDetail" component={ProductDetailScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="Content" component={ContentScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="PostDetail" component={PostDetailScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="ExhibitionDetail" component={ExhibitionDetailScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="Search" component={SearchScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="Blog" component={BlogScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="About" component={AboutScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="Contact" component={ContactScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="Legacy" component={LegacyScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="Visit" component={VisitScreen} options={{ animation: 'slide_from_right' }} />
      <S.Screen name="Auth" component={AuthScreen} options={{ animation: 'slide_from_bottom' }} />
    </>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function MarketStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketMain" component={MarketScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function VaultStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VaultMain" component={VaultScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function GalleryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GalleryMain" component={GalleryScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesMain" component={FavoritesScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const favCount = useFavoritesStore((s) => s.items.length);

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icons = TAB_CONFIG[route.name] || { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal-outline' };
        const iconName = focused ? icons.active : icons.inactive;
        const showBadge = route.name === 'Favorites' && favCount > 0;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          >
            <View>
              <Ionicons name={iconName as any} size={22} color={focused ? ACTIVE_TAB_GOLD : 'rgba(255,255,255,0.6)'} />
              {showBadge && (
                <View style={styles.badge}><Text style={styles.badgeText}>{favCount}</Text></View>
              )}
            </View>
            {focused && <View style={styles.activeIndicator} />}
            <Text style={[styles.tabLabel, { color: focused ? ACTIVE_TAB_GOLD : 'rgba(255,255,255,0.6)' }]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Market" component={MarketStack} />
      <Tab.Screen name="Vault" component={VaultStack} />
      <Tab.Screen name="Gallery" component={GalleryStack} />
      <Tab.Screen name="Favorites" component={FavoritesStack} />
      <Tab.Screen name="More" component={MoreStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderTopWidth: 0, elevation: 0, backgroundColor: colors.hub.primary },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: TAB_CONTENT_HEIGHT },
  activeIndicator: { width: 20, height: 2, backgroundColor: ACTIVE_TAB_GOLD, marginTop: 2, borderRadius: 1 },
  tabLabel: { fontSize: 9, letterSpacing: 0.5, fontFamily: 'Montserrat-Medium', marginTop: 2 },
  badge: { position: 'absolute', top: -4, right: -8, backgroundColor: colors.shared.error, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: 'Montserrat-Bold', fontSize: 9, color: '#fff' },
});
