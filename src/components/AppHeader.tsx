/**
 * AppHeader — Branded header with logo, cart, and WhatsApp
 *
 * Matches the website header: logo left, action buttons right.
 * Appears on all screens.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useEnvStore } from '../stores/envStore';
import { useCartStore } from '../stores/cartStore';
import { useUIStore } from '../stores/uiStore';
import { colors, spacing } from '../theme';

interface AppHeaderProps {
  backgroundColor?: string;
  showCart?: boolean;
}

export default function AppHeader({
  backgroundColor = colors.hub.primary,
  showCart = true,
}: AppHeaderProps) {
  const navigation = useNavigation<any>();
  const baseUrl = useEnvStore((s) => s.urls.hub.base);
  const cartCount = useCartStore((s) => s.getItemCount());
  const isOnline = useUIStore((s) => s.isOnline);

  return (
    <View style={[styles.header, { backgroundColor }]}>
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

        {/* WhatsApp */}
        <TouchableOpacity
          onPress={() => Linking.openURL('https://wa.me/255786454999')}
          style={styles.actionBtn}
        >
          <Text style={styles.actionIcon}>💬</Text>
        </TouchableOpacity>

        {/* Cart */}
        {showCart && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    height: 52,
  },
  logo: {
    width: 140,
    height: 32,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
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
