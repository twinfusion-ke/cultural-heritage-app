/**
 * ScaleIn — Scale + fade entrance animation
 *
 * Good for cards, images, and interactive elements.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export default function ScaleIn({
  children,
  delay = 0,
  duration = 400,
  style,
}: ScaleInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}
