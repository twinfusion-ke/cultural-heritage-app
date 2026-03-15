/**
 * ExhibitionCard — Gallery exhibition list item
 *
 * Displays exhibition image, title, dates, and status badge.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
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
  title,
  imageUrl,
  startDate,
  endDate,
  excerpt,
  onPress,
}: ExhibitionCardProps) {
  return (
    <TouchableOpacity style={[styles.card, shadows.sm]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🖼</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <ExhibitionBadge startDate={startDate} endDate={endDate} />

        <Text style={[textStyles.caption, styles.dates]}>
          {formatDateRange(startDate, endDate)}
        </Text>

        <Text style={[textStyles.h2, styles.title]} numberOfLines={2}>
          {title}
        </Text>

        {excerpt && (
          <Text style={[textStyles.bodySmall, styles.excerpt]} numberOfLines={2}>
            {excerpt}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.shared.white,
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E5E0',
  },
  placeholderIcon: {
    fontSize: 40,
    opacity: 0.3,
  },
  info: {
    padding: 16,
  },
  dates: {
    color: colors.hub.textMuted,
    marginTop: 8,
  },
  title: {
    color: colors.hub.text,
    marginTop: 4,
  },
  excerpt: {
    color: colors.hub.textMuted,
    marginTop: 6,
  },
});
