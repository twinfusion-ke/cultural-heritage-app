/**
 * FadeIn — Animated entrance wrapper
 *
 * Fades in and optionally slides up when mounted.
 * Uses RN Animated API (works via OTA, no native rebuild).
 */

import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  slideUp?: number;
  style?: ViewStyle;
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 500,
  slideUp = 20,
  style,
}: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideUp)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
