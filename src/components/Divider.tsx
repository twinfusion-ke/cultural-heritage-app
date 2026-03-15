/**
 * Divider — Gold accent line (matches website heritage divider)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface DividerProps {
  color?: string;
  width?: number;
  marginVertical?: number;
}

export default function Divider({
  color = colors.shared.gold,
  width = 60,
  marginVertical = 24,
}: DividerProps) {
  return (
    <View
      style={[
        styles.line,
        { backgroundColor: color, width, marginVertical },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    alignSelf: 'center',
  },
});
