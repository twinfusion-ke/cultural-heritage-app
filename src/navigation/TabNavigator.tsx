/**
 * Navigation — Full app with redesigned layout
 *
 * Bottom tabs: Home | Exhibitions | Favorites | More
 * Stack screens: Product detail, Cart, Content, etc.
 * Native vector icons, safe area insets, dynamic theming.
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
import CartScreen from '../screens/cart/CartScreen';
import ContentScreen from '../screens/content/ContentScreen';
import PostDetailScreen from '../screens/content/PostDetailScreen';
import ExhibitionDetailScreen from '../screens/content/ExhibitionDetailScreen';
import SearchScreen from '../screens/search/SearchScreen';
import BlogScreen from '../screens/blog/BlogScreen';
import AboutScreen from '../screens/about/AboutScreen';
import ContactScreen from '../screens/contact/ContactScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';

import { useFavoritesStore } from '../stores/favoritesStore';
import { useCartStore } from '../stores/cartStore';
import { divisionThemes, routeToDivision, ACTIVE_TAB_GOLD } from '../theme';
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

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index].name;
  const division = routeToDivision[activeRoute] || 'hub';
  const theme = divisionThemes[division];
  const favCount = useFavoritesStore((s) => s.items.length);

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.primary, paddingBottom: Math.max(insets.bottom, 4) }]}>
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
              <Ionicons name={iconName as any} size={22} color={focused ? ACTIVE_TAB_GOLD : 'rgba(255,255,255,0.4)'} />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{favCount}</Text>
                </View>
              )}
            </View>
            {focused && <View style={styles.activeIndicator} />}
            <Text style={[styles.tabLabel, { color: focused ? ACTIVE_TAB_GOLD : 'rgba(255,255,255,0.4)' }]}>
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
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Content" component={ContentScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ExhibitionDetail" component={ExhibitionDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Blog" component={BlogScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderTopWidth: 0, elevation: 0 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', height: TAB_CONTENT_HEIGHT },
  activeIndicator: { width: 20, height: 2, backgroundColor: ACTIVE_TAB_GOLD, marginTop: 2, borderRadius: 1 },
  tabLabel: { fontSize: 9, letterSpacing: 0.5, fontFamily: 'Montserrat-Medium', marginTop: 2 },
  badge: {
    position: 'absolute', top: -4, right: -8, backgroundColor: colors.shared.error,
    borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontFamily: 'Montserrat-Bold', fontSize: 9, color: '#fff' },
});
