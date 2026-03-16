/**
 * NetworkError — Reusable error state with retry button
 *
 * Shows when API calls fail, with site-specific accent color.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, textStyles, spacing } from '../theme';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
  accentColor?: string;
}

export default function NetworkError({
  message = 'Unable to load content. Please check your connection.',
  onRetry,
  accentColor = colors.shared.gold,
}: NetworkErrorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[textStyles.h3, styles.title]}>Connection Issue</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.retryBtn, { borderColor: accentColor }]} onPress={onRetry}>
          <Text style={[styles.retryText, { color: accentColor }]}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.hub.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: colors.hub.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
  },
  retryText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
