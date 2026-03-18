/**
 * ExhibitionCard — Animated exhibition list item
 *
 * Fades in + scales up on mount.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, textStyles, shadows } from '../theme';
import ExhibitionBadge from './ExhibitionBadge';
import { formatDateRange } from '../utils/dates';

interface ExhibitionCardProps {
  title: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  excerpt?: string;
  onPress: () => void;
}

export default function ExhibitionCard({
  title, imageUrl, startDate, endDate, excerpt, onPress,
}: ExhibitionCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay: 150, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay: 150, useNativeDriver: true, tension: 50, friction: 7 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <TouchableOpacity style={[styles.card, shadows.sm]} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={300} cachePolicy="disk" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="color-palette-outline" size={40} color="#CCC" />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <ExhibitionBadge startDate={startDate} endDate={endDate} />
          <Text style={[textStyles.caption, styles.dates]}>{formatDateRange(startDate, endDate)}</Text>
          <Text style={[textStyles.h2, styles.title]} numberOfLines={2}>{title}</Text>
          {excerpt && <Text style={[textStyles.bodySmall, styles.excerpt]} numberOfLines={2}>{excerpt}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.shared.white, marginBottom: 20, overflow: 'hidden', borderRadius: 8 },
  imageContainer: { width: '100%', aspectRatio: 4 / 3, backgroundColor: '#F0F0F0' },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8E5E0' },
  info: { padding: 16 },
  dates: { color: colors.hub.textMuted, marginTop: 8 },
  title: { color: colors.hub.text, marginTop: 4 },
  excerpt: { color: colors.hub.textMuted, marginTop: 6 },
});
