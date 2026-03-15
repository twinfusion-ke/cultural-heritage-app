/**
 * More Screen — Tab 5: Settings, Legal, Profile, Admin
 *
 * Full menu with: discover, knowledge, legal, settings.
 * Shows online/offline status and pending sync count.
 * Long-press on version reveals admin server settings.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { colors, textStyles, spacing } from '../../theme';
import { useUIStore } from '../../stores/uiStore';
import { useEnvStore } from '../../stores/envStore';
import { useCartStore } from '../../stores/cartStore';
import { triggerSync } from '../../services/syncService';
import { ENVIRONMENTS } from '../../config/environment';

export default function MoreScreen() {
  const isOnline = useUIStore((s) => s.isOnline);
  const pendingSyncCount = useUIStore((s) => s.pendingSyncCount);
  const [showAdmin, setShowAdmin] = useState(false);
  const [versionPressCount, setVersionPressCount] = useState(0);

  const activeEnvKey = useEnvStore((s) => s.activeEnvKey);
  const setEnvironment = useEnvStore((s) => s.setEnvironment);
  const updateCredentials = useEnvStore((s) => s.updateCredentials);
  const env = useEnvStore((s) => s.env);

  const itemCount = useCartStore((s) => s.getItemCount());

  // Long-press or 5 taps on version opens admin
  function handleVersionPress() {
    const count = versionPressCount + 1;
    setVersionPressCount(count);
    if (count >= 5) {
      setShowAdmin(true);
      setVersionPressCount(0);
    }
  }

  async function handleManualSync() {
    try {
      await triggerSync();
      Alert.alert('Sync Complete', 'All pending items have been synced.');
    } catch {
      Alert.alert('Sync Failed', 'Please check your connection and try again.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.hub.primary} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[textStyles.h1, { color: colors.shared.parchment }]}>More</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isOnline ? styles.online : styles.offline]} />
            <Text style={styles.statusText}>
              {isOnline ? 'Connected to server' : 'Working offline'}
            </Text>
          </View>
          {pendingSyncCount > 0 && (
            <TouchableOpacity style={styles.syncBar} onPress={handleManualSync}>
              <Text style={styles.syncText}>
                {pendingSyncCount} pending — Tap to sync
              </Text>
            </TouchableOpacity>
          )}
          {itemCount > 0 && (
            <View style={styles.cartBar}>
              <Text style={styles.cartText}>🛒 {itemCount} items in cart</Text>
            </View>
          )}
        </View>

        {/* Discover */}
        <Section title="DISCOVER">
          <MenuItem label="About Cultural Heritage" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/')} />
          <MenuItem label="Our Legacy" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/our-legacy/')} />
          <MenuItem label="Plan Your Visit" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/visit/')} />
          <MenuItem label="Contact Us" onPress={() => Linking.openURL('tel:+255786454999')} />
          <MenuItem label="WhatsApp" onPress={() => Linking.openURL('https://wa.me/255786454999')} />
        </Section>

        {/* Knowledge */}
        <Section title="KNOWLEDGE">
          <MenuItem label="Tanzanite Guide" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/jewelry/tanzanite/')} />
          <MenuItem label="Collecting Art Guide" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/gallery/blog/')} />
          <MenuItem label="Gemstone Certification" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/jewelry/certification/')} />
          <MenuItem label="Jewelry Care" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/jewelry/jewelry-care/')} />
        </Section>

        {/* Legal */}
        <Section title="LEGAL">
          <MenuItem label="Privacy Policy" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/privacy-policy/')} />
          <MenuItem label="Terms & Conditions" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/terms/')} />
          <MenuItem label="Shipping Policy" onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage/jewelry/shipping/')} />
        </Section>

        {/* App Info */}
        <Section title="APP">
          <MenuItem label="Notifications" onPress={() => Alert.alert('Coming Soon', 'Push notifications will be available in a future update.')} />
          <MenuItem label="Language" onPress={() => Alert.alert('Language', 'English (default). Multi-language support coming soon.')} />
          <MenuItem label="Currency" onPress={() => Alert.alert('Currency', 'Prices shown in USD. Currency switching coming soon.')} />
        </Section>

        <TouchableOpacity onPress={handleVersionPress} activeOpacity={1}>
          <Text style={styles.version}>
            Cultural Heritage v1.0.0{'\n'}
            {isOnline ? `Connected: ${env.baseDomain}` : 'Offline mode'}
          </Text>
        </TouchableOpacity>

        {/* ═══ ADMIN SERVER SETTINGS (hidden) ═══ */}
        {showAdmin && (
          <View style={styles.adminSection}>
            <Text style={[textStyles.label, { color: colors.shared.warning, textAlign: 'center' }]}>
              SERVER SETTINGS (ADMIN)
            </Text>

            <Text style={styles.adminLabel}>Environment</Text>
            <View style={styles.envButtons}>
              {Object.keys(ENVIRONMENTS).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.envButton, activeEnvKey === key && styles.envButtonActive]}
                  onPress={() => {
                    setEnvironment(key);
                    Alert.alert('Environment Changed', `Switched to ${ENVIRONMENTS[key].name}. Cache cleared.`);
                  }}
                >
                  <Text style={[styles.envButtonText, activeEnvKey === key && styles.envButtonTextActive]}>
                    {ENVIRONMENTS[key].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.adminLabel}>WC Consumer Key</Text>
            <TextInput
              style={styles.adminInput}
              value={env.wcConsumerKey}
              onChangeText={(text) => updateCredentials({ wcConsumerKey: text })}
              placeholder="ck_..."
              placeholderTextColor={colors.hub.textMuted}
              autoCapitalize="none"
            />

            <Text style={styles.adminLabel}>WC Consumer Secret</Text>
            <TextInput
              style={styles.adminInput}
              value={env.wcConsumerSecret}
              onChangeText={(text) => updateCredentials({ wcConsumerSecret: text })}
              placeholder="cs_..."
              placeholderTextColor={colors.hub.textMuted}
              autoCapitalize="none"
              secureTextEntry
            />

            <Text style={styles.adminLabel}>POS API Key</Text>
            <TextInput
              style={styles.adminInput}
              value={env.posApiKey}
              onChangeText={(text) => updateCredentials({ posApiKey: text })}
              placeholder="pos_..."
              placeholderTextColor={colors.hub.textMuted}
              autoCapitalize="none"
              secureTextEntry
            />

            <TouchableOpacity style={styles.closeAdmin} onPress={() => setShowAdmin(false)}>
              <Text style={{ color: colors.shared.error, fontFamily: 'Montserrat-SemiBold', fontSize: 12 }}>
                Close Admin Panel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.background },
  scroll: { paddingBottom: 60 },
  header: {
    backgroundColor: colors.hub.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  online: { backgroundColor: colors.shared.success },
  offline: { backgroundColor: colors.shared.error },
  statusText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: 'rgba(245,242,237,0.7)',
  },
  syncBar: {
    backgroundColor: colors.shared.warning,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  syncText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 11,
    color: colors.shared.white,
    textAlign: 'center',
  },
  cartBar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  cartText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: colors.shared.parchment,
  },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
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
  menuLabel: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: colors.hub.text },
  menuArrow: { fontSize: 20, color: colors.hub.textMuted },
  version: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 11,
    color: colors.hub.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  adminSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: colors.shared.warning,
  },
  adminLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 10,
    color: colors.shared.warning,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 6,
  },
  adminInput: {
    backgroundColor: '#2a2a2a',
    color: colors.shared.white,
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  envButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  envButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  envButtonActive: {
    borderColor: colors.shared.success,
    backgroundColor: 'rgba(22,163,74,0.15)',
  },
  envButtonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  envButtonTextActive: {
    color: colors.shared.success,
  },
  closeAdmin: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});
