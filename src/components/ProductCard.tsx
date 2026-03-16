/**
 * ProductCard — Unified product display
 *
 * Used across Market, Vault, and Gallery tabs.
 * Adapts accent color based on site context.
 * Includes add-to-cart button overlay.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors, textStyles, shadows } from '../theme';
import type { SiteKey } from '../config/environment';

const CARD_WIDTH = (Dimensions.get('window').width - 24 * 2 - 16) / 2;

interface ProductCardProps {
  name: string;
  price: string;
  imageUrl: string;
  site: SiteKey;
  onPress: () => void;
  onAddToCart?: () => void;
  saleBadge?: boolean;
  subtitle?: string;
}

const accentMap: Record<string, string> = {
  market: colors.market.accent,
  jewelry: colors.vault.accent,
  gallery: colors.gallery.accent,
};

export default function ProductCard({
  name,
  price,
  imageUrl,
  site,
  onPress,
  onAddToCart,
  saleBadge,
  subtitle,
}: ProductCardProps) {
  const accent = accentMap[site] || colors.shared.gold;

  return (
    <TouchableOpacity style={[styles.card, shadows.sm]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="disk"
        />
        {saleBadge && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
        {onAddToCart && (
          <TouchableOpacity
            style={[styles.addToCartBtn, { backgroundColor: accent }]}
            onPress={(e) => {
              e.stopPropagation?.();
              onAddToCart();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.addToCartText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        {subtitle && (
          <Text style={[textStyles.caption, { color: colors.hub.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        <Text style={[textStyles.h3, styles.name]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[textStyles.price, { color: accent }]}>
          {price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.shared.white,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.shared.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  saleBadgeText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 9,
    color: colors.shared.white,
    letterSpacing: 1,
  },
  addToCartBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addToCartText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#fff',
    marginTop: -1,
  },
  info: {
    padding: 12,
  },
  name: {
    color: colors.hub.text,
    marginTop: 2,
    marginBottom: 6,
  },
});
