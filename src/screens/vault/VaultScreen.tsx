/**
 * Vault Screen — Tab 3: Jewelry / The Vault
 *
 * Phase 1: Placeholder with brand identity.
 * Phase 3: Luxury product grid, deep-zoom, filters.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../../theme/colors';

export default function VaultScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.vault.primary} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>EST. TANZANIA</Text>
        <Text style={styles.title}>The Vault</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>
          Rare gemstones & fine jewelry{'\n'}
          from the heart of East Africa
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.vault.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  eyebrow: {
    fontFamily: 'Montserrat',
    fontSize: 10,
    letterSpacing: 3,
    color: colors.vault.accent,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 42,
    color: '#FAFAFA',
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.vault.accentBlue,
    marginVertical: 24,
  },
  tagline: {
    fontFamily: 'Montserrat',
    fontSize: 13,
    color: 'rgba(250, 250, 250, 0.5)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
});
