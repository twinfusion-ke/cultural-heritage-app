/**
 * Home Screen — Tab 1: Cultural Heritage Centre
 *
 * Hero, Three Pillars (Market/Vault/Gallery), Heritage Stories,
 * Visit Info. Data from live production Main Hub API.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer, BlogCard, Button, Divider } from '../../components';
import { useHubPosts } from '../../api/hub';
import { colors, textStyles, spacing, shadows } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { data: posts, isLoading, refetch, isRefetching } = useHubPosts(3);
  const navigation = useNavigation<any>();

  return (
    <ScreenContainer
      site="hub"
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      {/* ═══ HERO ═══ */}
      <View style={styles.hero}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={[textStyles.label, styles.heroEyebrow]}>
            ARUSHA, TANZANIA — EST. 1994
          </Text>
          <Text style={[textStyles.heroTitle, styles.heroTitle]}>
            Cultural{'\n'}Heritage{'\n'}Centre
          </Text>
          <Divider color={colors.shared.gold} width={60} marginVertical={20} />
          <Text style={styles.heroTagline}>
            Where Art, Heritage & Discovery Converge
          </Text>
          <View style={styles.heroCtas}>
            <Button
              title="Explore"
              onPress={() => navigation.navigate('More')}
              variant="primary"
              size="md"
              color={colors.shared.gold}
              textColor={colors.hub.primary}
            />
            <Button
              title="Plan Your Visit"
              onPress={() => Linking.openURL('https://wa.me/255786454999?text=I%20would%20like%20to%20plan%20a%20visit')}
              variant="outline"
              size="md"
              color={colors.shared.parchment}
            />
          </View>
        </View>
      </View>

      {/* ═══ STATS ═══ */}
      <View style={styles.statsBar}>
        <StatItem value="30+" label="Years" />
        <View style={styles.statDivider} />
        <StatItem value="50K+" label="Visitors" />
        <View style={styles.statDivider} />
        <StatItem value="5K+" label="Artworks" />
      </View>

      {/* ═══ THREE PILLARS ═══ */}
      <View style={styles.section}>
        <Text style={[textStyles.label, styles.sectionLabel]}>OUR WORLD</Text>
        <Text style={[textStyles.h1, styles.sectionTitle]}>Three Pillars</Text>
        <Divider />

        <TouchableOpacity
          style={[styles.pillarCard, { backgroundColor: colors.market.primary }]}
          onPress={() => navigation.navigate('Market')}
          activeOpacity={0.9}
        >
          <Text style={[textStyles.label, { color: colors.market.accent }]}>THE MARKET</Text>
          <Text style={[textStyles.h2, styles.pillarTitle]}>Handcrafts & Artifacts</Text>
          <Text style={styles.pillarDesc}>
            Ethically sourced Maasai beadwork, Makonde carvings, textiles, spices, and artisan treasures.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pillarCard, { backgroundColor: colors.vault.primary }]}
          onPress={() => navigation.navigate('Vault')}
          activeOpacity={0.9}
        >
          <Text style={[textStyles.label, { color: colors.vault.accentBlue }]}>THE VAULT</Text>
          <Text style={[textStyles.h2, styles.pillarTitle]}>Tanzanite & Fine Jewelry</Text>
          <Text style={styles.pillarDesc}>
            The world's rarest gemstone, found only in Tanzania. Certified, ethically sourced, investment-grade.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pillarCard, { backgroundColor: colors.gallery.primary }]}
          onPress={() => navigation.navigate('Gallery')}
          activeOpacity={0.9}
        >
          <Text style={[textStyles.label, { color: colors.shared.gold }]}>THE GALLERY</Text>
          <Text style={[textStyles.h2, styles.pillarTitle]}>Contemporary & Traditional Art</Text>
          <Text style={styles.pillarDesc}>
            Curated exhibitions celebrating East African artistic heritage. Over 12 shows annually.
          </Text>
        </TouchableOpacity>
      </View>

      {/* ═══ HERITAGE STORIES ═══ */}
      <View style={styles.section}>
        <Text style={[textStyles.label, styles.sectionLabel]}>THE JOURNAL</Text>
        <Text style={[textStyles.h1, styles.sectionTitle]}>Heritage Stories</Text>
        <Divider />

        {isLoading ? (
          <Text style={styles.loadingText}>Loading stories...</Text>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => {
            const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
            return (
              <BlogCard
                key={post.id}
                title={post.title.rendered}
                excerpt={post.excerpt.rendered}
                imageUrl={imageUrl}
                date={post.date}
                accentColor={colors.shared.gold}
                onPress={() => {}}
              />
            );
          })
        ) : (
          <Text style={styles.emptyText}>Stories coming soon</Text>
        )}
      </View>

      {/* ═══ VISIT INFO ═══ */}
      <View style={[styles.section, styles.visitSection]}>
        <Text style={[textStyles.label, { color: colors.shared.gold, textAlign: 'center' }]}>
          PLAN YOUR VISIT
        </Text>
        <Text style={[textStyles.h1, styles.visitTitle]}>Visit Us</Text>
        <Divider color={colors.shared.gold} />

        <View style={styles.visitGrid}>
          <View style={styles.visitItem}>
            <Text style={styles.visitIcon}>📍</Text>
            <Text style={styles.visitLabel}>Location</Text>
            <Text style={styles.visitValue}>Dodoma Road{'\n'}Arusha, Tanzania</Text>
          </View>
          <View style={styles.visitItem}>
            <Text style={styles.visitIcon}>⏰</Text>
            <Text style={styles.visitLabel}>Hours</Text>
            <Text style={styles.visitValue}>Mon–Sat 8am–8pm{'\n'}Sun 10am–7pm</Text>
          </View>
          <View style={styles.visitItem}>
            <Text style={styles.visitIcon}>📞</Text>
            <Text style={styles.visitLabel}>Phone</Text>
            <TouchableOpacity onPress={() => Linking.openURL('tel:+255786454999')}>
              <Text style={[styles.visitValue, { color: colors.shared.gold }]}>
                +255 786 454 999
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="WhatsApp Us"
          onPress={() => Linking.openURL('https://wa.me/255786454999')}
          variant="outline"
          size="lg"
          color={colors.shared.gold}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </ScreenContainer>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 500,
    backgroundColor: colors.hub.primary,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,56,44,0.85)',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroEyebrow: {
    color: colors.shared.gold,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    color: colors.shared.parchment,
    textAlign: 'center',
  },
  heroTagline: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: 'rgba(245,242,237,0.6)',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  heroCtas: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.lg,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.shared.parchment,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 28,
    color: colors.hub.primary,
  },
  statLabel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 10,
    color: colors.hub.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.hub.border,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['3xl'],
    backgroundColor: colors.shared.white,
  },
  sectionLabel: {
    color: colors.hub.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.hub.text,
    textAlign: 'center',
  },
  pillarCard: {
    padding: spacing.lg,
    marginTop: spacing.md,
    minHeight: 140,
    justifyContent: 'center',
  },
  pillarTitle: {
    color: colors.shared.parchment,
    marginTop: 6,
    marginBottom: 8,
  },
  pillarDesc: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: 'rgba(245,242,237,0.6)',
    lineHeight: 20,
  },
  loadingText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: colors.hub.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  emptyText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: colors.hub.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  visitSection: {
    backgroundColor: colors.hub.primary,
  },
  visitTitle: {
    color: colors.shared.parchment,
    textAlign: 'center',
  },
  visitGrid: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  visitItem: {
    flex: 1,
    alignItems: 'center',
  },
  visitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  visitLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 10,
    color: colors.shared.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  visitValue: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: 'rgba(245,242,237,0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
