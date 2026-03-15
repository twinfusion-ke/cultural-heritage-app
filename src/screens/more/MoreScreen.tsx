/**
 * More Screen — Tab 5: Settings, Legal, Profile
 *
 * Phase 1: Placeholder with navigation links.
 * Phase 3: Full menu with profile, orders, settings.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useUIStore } from '../../stores/uiStore';

export default function MoreScreen() {
  const isOnline = useUIStore((s) => s.isOnline);
  const pendingSyncCount = useUIStore((s) => s.pendingSyncCount);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.hub.primary} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isOnline ? styles.online : styles.offline]} />
            <Text style={styles.statusText}>
              {isOnline ? 'Connected' : 'Offline'}
            </Text>
            {pendingSyncCount > 0 && (
              <View style={styles.syncBadge}>
                <Text style={styles.syncBadgeText}>{pendingSyncCount} pending</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DISCOVER</Text>
          <MenuItem label="About Cultural Heritage" />
          <MenuItem label="Our Legacy" />
          <MenuItem label="Plan Your Visit" />
          <MenuItem label="Contact Us" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KNOWLEDGE</Text>
          <MenuItem label="Tanzanite Guide" />
          <MenuItem label="Collecting Art Guide" />
          <MenuItem label="Gemstone Certification" />
          <MenuItem label="Jewelry Care" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
          <MenuItem label="Privacy Policy" />
          <MenuItem label="Terms & Conditions" />
          <MenuItem label="Shipping Policy" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          <MenuItem label="Notifications" />
          <MenuItem label="Language" />
          <MenuItem label="Currency" />
          <Text style={styles.version}>Cultural Heritage v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ label }: { label: string }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.hub.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.hub.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 32,
    color: colors.shared.parchment,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  online: {
    backgroundColor: colors.shared.success,
  },
  offline: {
    backgroundColor: colors.shared.error,
  },
  statusText: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: 'rgba(245, 242, 237, 0.7)',
  },
  syncBadge: {
    marginLeft: 12,
    backgroundColor: colors.shared.warning,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  syncBadgeText: {
    fontFamily: 'Montserrat',
    fontSize: 10,
    color: colors.shared.white,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: 'Montserrat',
    fontSize: 10,
    letterSpacing: 2,
    color: colors.hub.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hub.border,
  },
  menuLabel: {
    fontFamily: 'Montserrat',
    fontSize: 15,
    color: colors.hub.text,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.hub.textMuted,
  },
  version: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: colors.hub.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
});
