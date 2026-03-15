/**
 * ScreenContainer — Standard screen wrapper
 *
 * Provides consistent layout with optional header,
 * scroll behavior, and branded styling per site.
 */

import React, { type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { colors, textStyles, layout } from '../theme';
import type { SiteKey } from '../config/environment';

interface ScreenContainerProps {
  children: ReactNode;
  site?: SiteKey;
  title?: string;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  headerRight?: ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
}

const siteColors: Record<SiteKey, { bg: string; headerBg: string; text: string; accent: string }> = {
  hub: { bg: colors.hub.background, headerBg: colors.hub.primary, text: colors.shared.parchment, accent: colors.shared.gold },
  market: { bg: colors.market.background, headerBg: colors.market.primary, text: '#FFF8F0', accent: colors.market.accent },
  jewelry: { bg: colors.vault.background, headerBg: colors.vault.primary, text: '#FAFAFA', accent: colors.vault.accent },
  gallery: { bg: colors.gallery.background, headerBg: colors.gallery.primary, text: '#FAFAF8', accent: colors.shared.gold },
};

export default function ScreenContainer({
  children,
  site = 'hub',
  title,
  scrollable = true,
  refreshing = false,
  onRefresh,
  headerRight,
  backgroundColor,
  statusBarStyle = 'light-content',
}: ScreenContainerProps) {
  const siteColor = siteColors[site];
  const bg = backgroundColor || siteColor.bg;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: siteColor.headerBg }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={siteColor.headerBg} />

      {/* Header */}
      {title && (
        <View style={[styles.header, { backgroundColor: siteColor.headerBg }]}>
          <Text style={[textStyles.h2, { color: siteColor.text }]}>{title}</Text>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}

      {/* Content */}
      {scrollable ? (
        <ScrollView
          style={[styles.scroll, { backgroundColor: bg }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={siteColor.accent}
                colors={[siteColor.accent]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, { backgroundColor: bg }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: layout.headerHeight,
    paddingHorizontal: layout.paddingHorizontal,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
  },
});
