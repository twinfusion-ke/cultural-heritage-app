/**
 * Home Screen — Tab 1: Cultural Heritage Centre (Main Hub)
 *
 * Phase 1: Placeholder with brand identity.
 * Phase 3: Hero, timeline, 3 pillars, blog posts, visit info.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../../theme/colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.hub.primary} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>ARUSHA, TANZANIA — EST. 1994</Text>
        <Text style={styles.title}>Cultural{'\n'}Heritage{'\n'}Centre</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>
          Where Art, Heritage{'\n'}& Discovery Converge
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.hub.primary,
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
    color: colors.shared.gold,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 48,
    color: colors.shared.parchment,
    textAlign: 'center',
    lineHeight: 52,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.shared.gold,
    marginVertical: 24,
  },
  tagline: {
    fontFamily: 'Montserrat',
    fontSize: 13,
    color: 'rgba(245, 242, 237, 0.6)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
});
