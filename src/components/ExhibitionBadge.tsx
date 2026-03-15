/**
 * ExhibitionBadge — Status indicator
 *
 * Shows "Now Showing", "Upcoming", or "Past" with color-coded dot.
 * Status is calculated from exhibition start/end dates.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textStyles } from '../theme';
import { getExhibitionStatus } from '../utils/dates';
import type { ExhibitionStatus } from '../types/exhibition';

interface ExhibitionBadgeProps {
  startDate: string;
  endDate: string;
}

const statusColors: Record<ExhibitionStatus, string> = {
  'Now Showing': colors.status.nowShowing,
  'Upcoming': colors.status.upcoming,
  'Past': colors.status.past,
};

export default function ExhibitionBadge({ startDate, endDate }: ExhibitionBadgeProps) {
  const status = getExhibitionStatus(startDate, endDate);
  const dotColor = statusColors[status];

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[textStyles.label, { color: dotColor, letterSpacing: 1.5 }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
