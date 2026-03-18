/**
 * BlogCard — Animated blog post card
 *
 * Fades in + slides up on mount.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { colors, textStyles, shadows } from '../theme';

interface BlogCardProps {
  title: string;
  excerpt: string;
  imageUrl?: string;
  date: string;
  category?: string;
  accentColor?: string;
  onPress: () => void;
}

export default function BlogCard({
  title, excerpt, imageUrl, date, category,
  accentColor = colors.shared.gold, onPress,
}: BlogCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TouchableOpacity style={[styles.card, shadows.sm]} onPress={onPress} activeOpacity={0.9}>
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={300} cachePolicy="disk" />
            {category && (
              <View style={[styles.categoryBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.info}>
          <Text style={[textStyles.h3, styles.title]} numberOfLines={2}>{title}</Text>
          <Text style={[textStyles.bodySmall, styles.excerpt]} numberOfLines={2}>{excerpt.replace(/<[^>]+>/g, '')}</Text>
          <Text style={[textStyles.caption, styles.date]}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.shared.white, marginBottom: 16, overflow: 'hidden', borderRadius: 8 },
  imageContainer: { width: '100%', aspectRatio: 16 / 10, backgroundColor: '#F0F0F0' },
  image: { width: '100%', height: '100%' },
  categoryBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  categoryText: { fontFamily: 'Montserrat-SemiBold', fontSize: 9, color: colors.shared.white, letterSpacing: 1, textTransform: 'uppercase' },
  info: { padding: 16 },
  title: { color: colors.hub.text, marginBottom: 6 },
  excerpt: { color: colors.hub.textMuted, marginBottom: 8 },
  date: { color: colors.hub.textMuted },
});
