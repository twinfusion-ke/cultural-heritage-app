/**
 * SafeLayout — Reusable wrapper that uses useSafeAreaInsets()
 * to prevent system bar overlap without "white jump" artifacts.
 *
 * Instead of wrapping in SafeAreaView, this applies precise
 * paddingTop and paddingBottom via the insets hook, letting the
 * background color bleed edge-to-edge into system bars.
 */

import React, { type ReactNode } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeLayoutProps {
  children: ReactNode;
  /** Background color that bleeds into system bars */
  backgroundColor?: string;
  /** Whether to apply top padding for the status bar area */
  padTop?: boolean;
  /** Whether to apply bottom padding for the navigation bar area */
  padBottom?: boolean;
  /** Status bar text style */
  statusBarStyle?: 'light-content' | 'dark-content';
}

export default function SafeLayout({
  children,
  backgroundColor = '#0e382c',
  padTop = true,
  padBottom = false,
  statusBarStyle = 'light-content',
}: SafeLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor,
          paddingTop: padTop ? insets.top : 0,
          paddingBottom: padBottom ? insets.bottom : 0,
        },
      ]}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor="transparent"
        translucent
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
