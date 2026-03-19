/**
 * ProductCard — Animated product display
 *
 * Each card fades in + slides up on mount with a staggered delay
 * based on its index in the grid.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, textStyles, shadows } from '../theme';
import { formatPrice } from '../utils/currency';
import type { SiteKey } from '../config/environment';

const CARD_WIDTH = (Dimensions.get('window').width - 24 * 2 - 10) / 2;

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
  name, price, imageUrl, site, onPress, onAddToCart, saleBadge, subtitle,
}: ProductCardProps) {
  const accent = accentMap[site] || colors.shared.gold;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const delay = Math.random() * 200;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, tension: 50, friction: 7 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <TouchableOpacity style={[styles.card, shadows.sm]} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={300} cachePolicy="disk" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Ionicons name="image-outline" size={28} color="#DDD" />
            </View>
          )}
          {saleBadge && (
            <View style={styles.saleBadge}><Text style={styles.saleBadgeText}>SALE</Text></View>
          )}
          {onAddToCart && (
            <TouchableOpacity
              style={[styles.addToCartBtn, { backgroundColor: accent }]}
              onPress={(e) => { e.stopPropagation?.(); onAddToCart(); }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.info}>
          {subtitle && <Text style={[textStyles.caption, { color: colors.hub.textMuted }]} numberOfLines={1}>{subtitle}</Text>}
          <Text style={[textStyles.h3, styles.name]} numberOfLines={2}>{name}</Text>
          <Text style={[textStyles.price, { color: accent }]}>{formatPrice(price)}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, backgroundColor: colors.shared.white, marginBottom: 16, borderRadius: 8, overflow: 'hidden' },
  imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#F5F5F5', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  saleBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.shared.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  saleBadgeText: { fontFamily: 'Montserrat-SemiBold', fontSize: 9, color: colors.shared.white, letterSpacing: 1 },
  addToCartBtn: {
    position: 'absolute', bottom: 8, right: 8, width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  info: { padding: 12 },
  name: { color: colors.hub.text, marginTop: 2, marginBottom: 6 },
});
