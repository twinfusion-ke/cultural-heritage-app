/**
 * Gallery Screen — Tab 4: Art Gallery + Exhibitions
 *
 * Phase 1: Placeholder with brand identity.
 * Phase 3: Exhibitions list, art grid, journal.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../../theme/colors';

export default function GalleryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.gallery.primary} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CULTURAL HERITAGE CENTRE</Text>
        <Text style={styles.title}>The Art{'\n'}Gallery</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>
          Contemporary & traditional fine art{'\n'}
          curated from East Africa
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gallery.primary,
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
    fontSize: 42,
    color: '#FAFAF8',
    textAlign: 'center',
    lineHeight: 46,
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
    color: 'rgba(250, 250, 248, 0.5)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
});
