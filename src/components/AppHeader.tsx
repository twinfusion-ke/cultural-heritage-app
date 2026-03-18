/**
 * AppHeader — Branded header with logo, cart, and WhatsApp
 *
 * Uses native Ionicons instead of emoji for proper Android feel.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useEnvStore } from '../stores/envStore';
import { useCartStore } from '../stores/cartStore';
import { useUIStore } from '../stores/uiStore';
import { colors, spacing } from '../theme';

const HEADER_CONTENT_HEIGHT = 52;

interface AppHeaderProps {
  backgroundColor?: string;
  showCart?: boolean;
}

export default function AppHeader({
  backgroundColor = colors.hub.primary,
  showCart = true,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const baseUrl = useEnvStore((s) => s.urls.hub.base);
  const cartCount = useCartStore((s) => s.getItemCount());
  const isOnline = useUIStore((s) => s.isOnline);

  return (
    <View style={[styles.headerOuter, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.headerInner}>
        {/* Logo */}
        <Image
          source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/logo-white.png` }}
          style={styles.logo}
          contentFit="contain"
          cachePolicy="disk"
        />

        {/* Right actions */}
        <View style={styles.actions}>
          {/* Offline indicator */}
          {!isOnline && (
            <View style={styles.offlineDot} />
          )}

          {/* Search */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.actionBtn}
          >
            <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://wa.me/255786454999')}
            style={styles.actionBtn}
          >
            <Ionicons name="logo-whatsapp" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          {/* Cart */}
          {showCart && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={styles.actionBtn}
            >
              <Ionicons name="bag-outline" size={20} color="rgba(255,255,255,0.8)" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerOuter: {},
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: HEADER_CONTENT_HEIGHT,
  },
  logo: {
    width: 140,
    height: 32,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.shared.error,
    marginRight: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: colors.shared.gold,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 9,
    color: colors.hub.primary,
  },
});
