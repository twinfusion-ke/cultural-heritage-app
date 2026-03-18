/**
 * More Screen — Settings, Information, Admin
 *
 * Clean menu with only pages that have actual content.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { colors, textStyles, spacing } from '../../theme';
import { useUIStore } from '../../stores/uiStore';
import { useEnvStore } from '../../stores/envStore';
import { useCartStore } from '../../stores/cartStore';
import { triggerSync } from '../../services/syncService';
import { ENVIRONMENTS } from '../../config/environment';

export default function MoreScreen() {
  const navigation = useNavigation<any>();
  const isOnline = useUIStore((s) => s.isOnline);
  const pendingSyncCount = useUIStore((s) => s.pendingSyncCount);
  const [showAdmin, setShowAdmin] = useState(false);
  const [versionPressCount, setVersionPressCount] = useState(0);

  const activeEnvKey = useEnvStore((s) => s.activeEnvKey);
  const setEnvironment = useEnvStore((s) => s.setEnvironment);
  const updateCredentials = useEnvStore((s) => s.updateCredentials);
  const env = useEnvStore((s) => s.env);
  const itemCount = useCartStore((s) => s.getItemCount());

  function handleVersionPress() {
    const count = versionPressCount + 1;
    setVersionPressCount(count);
    if (count >= 5) { setShowAdmin(true); setVersionPressCount(0); }
  }

  async function handleManualSync() {
    try { await triggerSync(); Alert.alert('Sync Complete', 'All pending items have been synced.'); }
    catch { Alert.alert('Sync Failed', 'Please check your connection and try again.'); }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AppHeader backgroundColor={colors.hub.primary} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[textStyles.h1, { color: colors.shared.parchment }]}>More</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isOnline ? styles.online : styles.offline]} />
            <Text style={styles.statusText}>{isOnline ? 'Connected to server' : 'Working offline'}</Text>
          </View>
          {pendingSyncCount > 0 && (
            <TouchableOpacity style={styles.syncBar} onPress={handleManualSync}>
              <Text style={styles.syncText}>{pendingSyncCount} pending — Tap to sync</Text>
            </TouchableOpacity>
          )}
          {itemCount > 0 && (
            <View style={styles.cartBar}>
              <Ionicons name="bag-outline" size={14} color={colors.shared.parchment} />
              <Text style={styles.cartText}>{itemCount} items in cart</Text>
            </View>
          )}
        </View>

        {/* Discover */}
        <Section title="DISCOVER">
          <MenuItem icon="information-circle-outline" label="About Us" onPress={() => navigation.navigate('About')} />
          <MenuItem icon="time-outline" label="Our Legacy" onPress={() => navigation.navigate('Legacy')} />
          <MenuItem icon="newspaper-outline" label="Heritage Journal" onPress={() => navigation.navigate('Blog')} />
          <MenuItem icon="map-outline" label="Plan Your Visit" onPress={() => navigation.navigate('Content', { slug: 'visit', title: 'Plan Your Visit' })} />
          <MenuItem icon="call-outline" label="Contact Us" onPress={() => navigation.navigate('Contact')} />
          <MenuItem icon="mail-outline" label="Newsletter" onPress={() => navigation.navigate('Content', { slug: 'newsletter', title: 'Newsletter' })} />
          <MenuItem icon="logo-whatsapp" label="WhatsApp Us" onPress={() => Linking.openURL('https://wa.me/255786454999')} />
        </Section>

        {/* Knowledge */}
        <Section title="KNOWLEDGE">
          <MenuItem icon="diamond-outline" label="Tanzanite Guide" onPress={() => navigation.navigate('Content', { slug: 'about', title: 'About Tanzanite', site: 'jewelry' })} />
          <MenuItem icon="color-palette-outline" label="About the Gallery" onPress={() => navigation.navigate('Content', { slug: 'about', title: 'About the Gallery', site: 'gallery' })} />
          <MenuItem icon="basket-outline" label="About the Market" onPress={() => navigation.navigate('Content', { slug: 'about', title: 'About the Market', site: 'market' })} />
        </Section>

        {/* Legal */}
        <Section title="LEGAL & POLICIES">
          <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => navigation.navigate('Content', { slug: 'sample-page', title: 'Privacy Policy' })} />
          <MenuItem icon="document-text-outline" label="Terms & Conditions" onPress={() => navigation.navigate('Content', { slug: 'sample-page', title: 'Terms & Conditions' })} />
        </Section>

        <TouchableOpacity onPress={handleVersionPress} activeOpacity={1}>
          <Text style={styles.version}>
            Cultural Heritage v1.0.0{'\n'}
            {isOnline ? `Connected: ${env.baseDomain}` : 'Offline mode'}
          </Text>
        </TouchableOpacity>

        {/* Admin Panel (hidden) */}
        {showAdmin && (
          <View style={styles.adminSection}>
            <Text style={[textStyles.label, { color: colors.shared.warning, textAlign: 'center' }]}>SERVER SETTINGS (ADMIN)</Text>
            <Text style={styles.adminLabel}>Environment</Text>
            <View style={styles.envButtons}>
              {Object.keys(ENVIRONMENTS).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.envButton, activeEnvKey === key && styles.envButtonActive]}
                  onPress={() => { setEnvironment(key); Alert.alert('Environment Changed', `Switched to ${ENVIRONMENTS[key].name}.`); }}
                >
                  <Text style={[styles.envButtonText, activeEnvKey === key && styles.envButtonTextActive]}>{ENVIRONMENTS[key].name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.adminLabel}>WC Consumer Key</Text>
            <TextInput style={styles.adminInput} value={env.wcConsumerKey} onChangeText={(t) => updateCredentials({ wcConsumerKey: t })} placeholder="ck_..." placeholderTextColor={colors.hub.textMuted} autoCapitalize="none" />
            <Text style={styles.adminLabel}>WC Consumer Secret</Text>
            <TextInput style={styles.adminInput} value={env.wcConsumerSecret} onChangeText={(t) => updateCredentials({ wcConsumerSecret: t })} placeholder="cs_..." placeholderTextColor={colors.hub.textMuted} autoCapitalize="none" secureTextEntry />
            <TouchableOpacity style={styles.closeAdmin} onPress={() => setShowAdmin(false)}>
              <Text style={{ color: colors.shared.error, fontFamily: 'Montserrat-SemiBold', fontSize: 13 }}>Close Admin Panel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Ionicons name={icon as any} size={20} color={colors.shared.gold} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.hub.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.primary },
  scroll: { paddingBottom: 60 },
  header: { backgroundColor: colors.hub.primary, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  online: { backgroundColor: colors.shared.success },
  offline: { backgroundColor: colors.shared.error },
  statusText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(245,242,237,0.7)' },
  syncBar: { backgroundColor: colors.shared.warning, marginTop: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  syncText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.shared.white, textAlign: 'center' },
  cartBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  cartText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, letterSpacing: 2, color: colors.hub.textMuted, textTransform: 'uppercase', marginBottom: 12 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border },
  menuLabel: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: colors.hub.text },
  version: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, textAlign: 'center', marginTop: spacing.xl, lineHeight: 18 },
  adminSection: { margin: spacing.lg, padding: spacing.lg, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: colors.shared.warning, borderRadius: 8 },
  adminLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: colors.shared.warning, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  adminInput: { backgroundColor: '#2a2a2a', color: colors.shared.white, fontFamily: 'Montserrat-Regular', fontSize: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#444', borderRadius: 6 },
  envButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  envButton: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#444', alignItems: 'center', borderRadius: 6 },
  envButtonActive: { borderColor: colors.shared.success, backgroundColor: 'rgba(22,163,74,0.15)' },
  envButtonText: { fontFamily: 'Montserrat-Medium', fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  envButtonTextActive: { color: colors.shared.success },
  closeAdmin: { marginTop: spacing.lg, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#333' },
});
