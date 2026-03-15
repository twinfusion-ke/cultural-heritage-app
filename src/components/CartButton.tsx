/**
 * CartButton — Floating cart icon with badge count
 *
 * Opens the Cart modal screen. Shows item count badge.
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../stores/cartStore';
import { colors } from '../theme';

interface CartButtonProps {
  tintColor?: string;
}

export default function CartButton({ tintColor = colors.shared.parchment }: CartButtonProps) {
  const navigation = useNavigation<any>();
  const count = useCartStore((s) => s.getItemCount());

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Cart')}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { color: tintColor }]}>🛒</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: colors.shared.gold,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 9,
    color: colors.hub.primary,
  },
});
