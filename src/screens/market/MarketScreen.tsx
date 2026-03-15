/**
 * Market Screen — Tab 2: The Market (Handcrafts & Artifacts)
 *
 * Phase 1: Placeholder with brand identity.
 * Phase 3: Product grid, filters, WhatsApp checkout.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../../theme/colors';

export default function MarketScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.market.primary} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CULTURAL HERITAGE CENTRE</Text>
        <Text style={styles.title}>The Market</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>
          Ethically sourced handcrafts, spices,{'\n'}
          textiles & artifacts from East Africa
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.market.primary,
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
    color: colors.market.accent,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 42,
    color: '#FFF8F0',
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.market.accent,
    marginVertical: 24,
  },
  tagline: {
    fontFamily: 'Montserrat',
    fontSize: 13,
    color: 'rgba(255, 248, 240, 0.6)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
});
