/**
 * Button — Corporate Heritage Style
 *
 * Variants: primary (solid), outline, ghost
 * Sizes: sm, md, lg
 * Each site can pass its own accent color.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, textStyles } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  textColor?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  color = colors.shared.gold,
  textColor,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const containerStyles: ViewStyle[] = [
    styles.base,
    sizeStyles[size],
  ];
  if (fullWidth) containerStyles.push(styles.fullWidth);

  let labelColor = textColor;

  if (variant === 'primary') {
    containerStyles.push({ backgroundColor: color });
    labelColor = labelColor || colors.shared.white;
  } else if (variant === 'outline') {
    containerStyles.push({ borderWidth: 1, borderColor: color, backgroundColor: 'transparent' });
    labelColor = labelColor || color;
  } else {
    containerStyles.push({ backgroundColor: 'transparent' });
    labelColor = labelColor || color;
  }

  if (disabled) {
    containerStyles.push(styles.disabled);
  }

  if (style) containerStyles.push(style);

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <Text style={[textStyles.button, { color: labelColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

const sizeStyles: Record<string, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 28 },
  lg: { paddingVertical: 18, paddingHorizontal: 36 },
};
