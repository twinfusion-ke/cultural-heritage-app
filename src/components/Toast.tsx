/**
 * Toast — Brief "Added to cart" notification
 *
 * Shows at the top of the screen, auto-dismisses after 2 seconds.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  icon?: string;
  color?: string;
}

export default function Toast({ message, visible, onHide, icon = 'checkmark-circle', color = colors.shared.success }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
      const timer = setTimeout(() => {
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => onHide());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { top: insets.top + 8, transform: [{ translateY }] }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', left: 16, right: 16, zIndex: 999,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.hub.primary, paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 10, elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  text: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: '#fff', flex: 1 },
});
