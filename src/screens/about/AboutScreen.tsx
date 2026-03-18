/**
 * AboutScreen — Comprehensive About Us
 *
 * Hero, Centre story, all 4 divisions with images,
 * videos, stats, team, timeline link, contact CTA.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { appApi } from '../../api/appApi';
import { cacheSet, cacheGet } from '../../db/contentCache';
import AppHeader from '../../components/AppHeader';
import YouTubeCard from '../../components/YouTubeCard';
import { Divider } from '../../components';
import { FadeIn } from '../../components/animated';
import { colors, textStyles, spacing } from '../../theme';
import { useEnvStore } from '../../stores/envStore';

export default function AboutScreen({ navigation }: any) {
  const baseUrl = useEnvStore((s) => s.urls.hub.base);

  const { data: page, isLoading } = useQuery({
    queryKey: ['hub', 'page', 'about'],
    queryFn: async () => {
      try {
        const data = await appApi('page', { site: 'hub', slug: 'about' });
        if (data) await cacheSet('hub', 'pages', data, 'about');
        return data;
      } catch (error: any) {
        const cached = await cacheGet('hub', 'pages', 'about');
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  return (
    <View style={styles.container}>
      <AppHeader backgroundColor={colors.hub.primary} />

      <View style={styles.backBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.shared.parchment} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/hero-centre.jpg` }}
            style={StyleSheet.absoluteFillObject} contentFit="cover" cachePolicy="disk" />
          <View style={styles.heroOverlay} />
          <FadeIn delay={200} slideUp={25}>
            <View style={styles.heroContent}>
              <Image source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/logo-white.png` }}
                style={{ width: 200, height: 55 }} contentFit="contain" cachePolicy="disk" />
              <Text style={styles.heroTitle}>About Cultural{'\n'}Heritage Centre</Text>
              <Text style={styles.heroSub}>East Africa's Premier Cultural Destination — Since 1994</Text>
            </View>
          </FadeIn>
        </View>

        {/* Our Story */}
        <FadeIn delay={300} slideUp={20}>
          <View style={styles.section}>
            <Text style={[textStyles.label, styles.sectionLabel]}>OUR STORY</Text>
            <Text style={[textStyles.h1, styles.sectionTitle]}>Three Decades of Heritage</Text>
            <Divider />
            <Text style={styles.bodyText}>
              Since 1994, the Cultural Heritage Centre has stood as a beacon of African art, culture, and craftsmanship on Dodoma Road in Arusha, Tanzania — the gateway to the Serengeti, Ngorongoro Crater, and Mount Kilimanjaro.
            </Text>
            <Text style={styles.bodyText}>
              What began as a small gallery has grown into a sprawling cultural campus that welcomes over 100,000 visitors annually from around the world. The Centre houses four distinct divisions, each celebrating a different facet of East African heritage.
            </Text>
          </View>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={200} slideUp={20}>
          <View style={styles.statsSection}>
            <StatCard number="30+" label="Years" icon="time-outline" />
            <StatCard number="2,000+" label="Artisans" icon="people-outline" />
            <StatCard number="100K+" label="Annual Visitors" icon="walk-outline" />
            <StatCard number="15" label="African Nations" icon="globe-outline" />
          </View>
        </FadeIn>

        {/* Video */}
        <YouTubeCard videoId="z9wh0prnkpo" title="Discover the Centre" subtitle="Take a virtual tour of the Cultural Heritage Centre." />

        {/* Division 1: The Market */}
        <FadeIn delay={100} slideUp={20}>
          <View style={[styles.divisionCard, { borderLeftColor: colors.market.accent }]}>
            <View style={styles.divisionHero}>
              <Image source={{ uri: `${baseUrl}/wp-content/themes/ch-market/assets/images/market-hero.jpg` }}
                style={StyleSheet.absoluteFillObject} contentFit="cover" cachePolicy="disk" />
              <View style={[styles.divisionHeroOverlay, { backgroundColor: 'rgba(61,43,31,0.7)' }]} />
              <View style={styles.divisionHeroContent}>
                <Ionicons name="basket" size={28} color={colors.market.accent} />
                <Text style={styles.divisionName}>The Market</Text>
                <Text style={styles.divisionTagline}>Handcrafts & Artifacts</Text>
              </View>
            </View>
            <View style={styles.divisionBody}>
              <Text style={styles.bodyText}>
                Browse thousands of handcrafted items from across the African continent: Makonde carvings, Maasai beadwork, traditional textiles, spices from Zanzibar, and one-of-a-kind artifacts that tell the story of Africa's diverse cultures.
              </Text>
              <View style={styles.divisionFeatures}>
                <FeatureTag label="Wood Carvings" />
                <FeatureTag label="Textiles & Kanga" />
                <FeatureTag label="Zanzibar Spices" />
                <FeatureTag label="Maasai Beadwork" />
                <FeatureTag label="African Masks" />
              </View>
              <TouchableOpacity style={[styles.divisionCta, { backgroundColor: colors.market.accent }]}
                onPress={() => navigation.navigate('Market')}>
                <Text style={styles.divisionCtaText}>Visit The Market</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>

        {/* Division 2: The Vault */}
        <FadeIn delay={150} slideUp={20}>
          <View style={[styles.divisionCard, { borderLeftColor: colors.vault.accent, backgroundColor: '#0A0A14' }]}>
            <View style={styles.divisionHero}>
              <Image source={{ uri: `${baseUrl}/wp-content/themes/ch-jewelry/assets/images/tanzanite-slide-1-scaled.jpg` }}
                style={StyleSheet.absoluteFillObject} contentFit="cover" cachePolicy="disk" />
              <View style={[styles.divisionHeroOverlay, { backgroundColor: 'rgba(10,10,20,0.7)' }]} />
              <View style={styles.divisionHeroContent}>
                <Ionicons name="diamond" size={28} color={colors.vault.accent} />
                <Text style={styles.divisionName}>The Vault</Text>
                <Text style={styles.divisionTagline}>Tanzanite & Fine Jewelry</Text>
              </View>
            </View>
            <View style={styles.divisionBody}>
              <Text style={[styles.bodyText, { color: 'rgba(255,255,255,0.7)' }]}>
                Home to one of the world's finest collections of tanzanite — the rare gemstone found only within a few square kilometers near Arusha. Our master jewelers create bespoke pieces using ethically sourced stones with full certification.
              </Text>
              <View style={styles.divisionFeatures}>
                <FeatureTag label="Tanzanite" dark />
                <FeatureTag label="Tsavorite" dark />
                <FeatureTag label="Ruby & Sapphire" dark />
                <FeatureTag label="Custom Design" dark />
                <FeatureTag label="Certification" dark />
              </View>
              <TouchableOpacity style={[styles.divisionCta, { backgroundColor: colors.vault.accent }]}
                onPress={() => navigation.navigate('Vault')}>
                <Text style={[styles.divisionCtaText, { color: colors.vault.primary }]}>Visit The Vault</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.vault.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>

        {/* Video 2 */}
        <YouTubeCard videoId="z_kLkxaQHNg" title="Our Heritage" subtitle="Three decades of preserving Africa's cultural treasures." />

        {/* Division 3: Art Gallery */}
        <FadeIn delay={100} slideUp={20}>
          <View style={[styles.divisionCard, { borderLeftColor: colors.shared.gold }]}>
            <View style={styles.divisionHero}>
              <Image source={{ uri: `${baseUrl}/wp-content/themes/ch-gallery/assets/images/gallery-hero.jpg` }}
                style={StyleSheet.absoluteFillObject} contentFit="cover" cachePolicy="disk" />
              <View style={[styles.divisionHeroOverlay, { backgroundColor: 'rgba(26,26,26,0.7)' }]} />
              <View style={styles.divisionHeroContent}>
                <Ionicons name="color-palette" size={28} color={colors.shared.gold} />
                <Text style={styles.divisionName}>The Art Gallery</Text>
                <Text style={styles.divisionTagline}>Contemporary & Traditional Art</Text>
              </View>
            </View>
            <View style={styles.divisionBody}>
              <Text style={styles.bodyText}>
                Three exhibition halls showcase the finest contemporary and traditional African art. From emerging Tanzanian painters to internationally acclaimed sculptors, our curated exhibitions celebrate African artistic expression.
              </Text>
              <View style={styles.divisionFeatures}>
                <FeatureTag label="Paintings" />
                <FeatureTag label="Sculpture" />
                <FeatureTag label="Tingatinga Art" />
                <FeatureTag label="Photography" />
                <FeatureTag label="Limited Prints" />
              </View>
              <TouchableOpacity style={[styles.divisionCta, { backgroundColor: colors.shared.gold }]}
                onPress={() => navigation.navigate('Gallery')}>
                <Text style={[styles.divisionCtaText, { color: colors.gallery.primary }]}>Visit The Gallery</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.gallery.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>

        {/* Division 4: The Hub */}
        <FadeIn delay={100} slideUp={20}>
          <View style={[styles.divisionCard, { borderLeftColor: colors.hub.accent }]}>
            <View style={styles.divisionHero}>
              <Image source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/experience-1.jpg` }}
                style={StyleSheet.absoluteFillObject} contentFit="cover" cachePolicy="disk" />
              <View style={[styles.divisionHeroOverlay, { backgroundColor: 'rgba(14,56,44,0.7)' }]} />
              <View style={styles.divisionHeroContent}>
                <Ionicons name="business" size={28} color={colors.shared.gold} />
                <Text style={styles.divisionName}>The Heritage Hub</Text>
                <Text style={styles.divisionTagline}>Culture, Education & Events</Text>
              </View>
            </View>
            <View style={styles.divisionBody}>
              <Text style={styles.bodyText}>
                The heart of Cultural Heritage Centre hosts cultural events, educational programs, the Jane Goodall Roots & Shoots museum, and our courtyard café. A meeting point for art lovers, collectors, and cultural enthusiasts.
              </Text>
              <View style={styles.divisionFeatures}>
                <FeatureTag label="Cultural Events" />
                <FeatureTag label="Jane Goodall Museum" />
                <FeatureTag label="Courtyard Café" />
                <FeatureTag label="Heritage Garden" />
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Mission */}
        <View style={styles.missionSection}>
          <Ionicons name="heart" size={28} color={colors.shared.gold} />
          <Text style={[textStyles.h2, { color: '#fff', textAlign: 'center', marginTop: 12 }]}>Our Mission</Text>
          <Divider color={colors.shared.gold} />
          <Text style={styles.missionText}>
            To preserve, celebrate, and share Africa's cultural heritage with the world — creating economic opportunities for local artisans while educating visitors about the rich traditions that define this remarkable continent.
          </Text>
        </View>

        {/* Timeline Link */}
        <FadeIn delay={100} slideUp={15}>
          <TouchableOpacity style={styles.timelineLink} onPress={() => navigation.navigate('Legacy')}>
            <Ionicons name="time-outline" size={22} color={colors.shared.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timelineLinkTitle}>Our Legacy (1994–2024)</Text>
              <Text style={styles.timelineLinkSub}>Explore 30 years of milestones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.shared.gold} />
          </TouchableOpacity>
        </FadeIn>

        {/* Contact CTA */}
        <FadeIn delay={200} slideUp={20}>
          <View style={styles.contactCta}>
            <Text style={[textStyles.h2, { color: '#fff', textAlign: 'center' }]}>Visit Us</Text>
            <Divider color={colors.shared.gold} />
            <Text style={styles.contactText}>Dodoma Road, Arusha, Tanzania</Text>
            <Text style={styles.contactText}>Mon–Sat 8am–8pm · Sun 10am–7pm</Text>
            <View style={styles.contactBtns}>
              <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('Visit')}>
                <Ionicons name="calendar-outline" size={16} color="#fff" />
                <Text style={styles.contactBtnText}>Plan Visit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('Contact')}>
                <Ionicons name="call-outline" size={16} color="#fff" />
                <Text style={styles.contactBtnText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('https://wa.me/255786454999')}>
                <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                <Text style={styles.contactBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeIn>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={20} color={colors.shared.gold} />
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FeatureTag({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <View style={[styles.featureTag, dark && { backgroundColor: 'rgba(201,169,98,0.15)', borderColor: 'rgba(201,169,98,0.3)' }]}>
      <Text style={[styles.featureTagText, dark && { color: colors.vault.accent }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.primary },
  backBar: { paddingHorizontal: spacing.md, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.shared.parchment },
  scroll: { flex: 1, backgroundColor: colors.hub.background },

  hero: { height: 280, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,56,44,0.8)' },
  heroContent: { zIndex: 1, alignItems: 'center', paddingHorizontal: 24 },
  heroTitle: { fontFamily: 'CormorantGaramond-Bold', fontSize: 30, color: '#fff', textAlign: 'center', marginTop: 12, lineHeight: 36 },
  heroSub: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'center' },

  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  sectionLabel: { color: colors.hub.textMuted, textAlign: 'center', marginBottom: 4 },
  sectionTitle: { color: colors.hub.text, textAlign: 'center' },
  bodyText: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: colors.hub.textMuted, lineHeight: 26, marginBottom: 12 },

  statsSection: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: 8, marginBottom: spacing.md },
  statCard: {
    flex: 1, backgroundColor: colors.shared.white, padding: 14, borderRadius: 10, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  statNumber: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: colors.hub.text, marginTop: 6 },
  statLabel: { fontFamily: 'Montserrat-Regular', fontSize: 10, color: colors.hub.textMuted, marginTop: 2 },

  divisionCard: {
    marginHorizontal: spacing.lg, marginVertical: spacing.sm, borderRadius: 12, overflow: 'hidden',
    borderLeftWidth: 4, backgroundColor: colors.shared.white,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  divisionHero: { height: 160, justifyContent: 'flex-end' },
  divisionHeroOverlay: { ...StyleSheet.absoluteFillObject },
  divisionHeroContent: { padding: 16, zIndex: 1 },
  divisionName: { fontFamily: 'CormorantGaramond-Bold', fontSize: 26, color: '#fff', marginTop: 4 },
  divisionTagline: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  divisionBody: { padding: 16 },
  divisionFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 12 },
  featureTag: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    borderWidth: 1, borderColor: colors.hub.border, backgroundColor: '#F5F5F5',
  },
  featureTagText: { fontFamily: 'Montserrat-Medium', fontSize: 11, color: colors.hub.text },
  divisionCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 8, marginTop: 4,
  },
  divisionCtaText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' },

  missionSection: {
    backgroundColor: colors.hub.primary, padding: spacing.lg, paddingVertical: spacing.xl,
    alignItems: 'center', marginTop: spacing.md,
  },
  missionText: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 26, maxWidth: 340 },

  timelineLink: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: spacing.lg, marginVertical: spacing.md,
    backgroundColor: colors.shared.white, padding: 16, borderRadius: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  timelineLinkTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: colors.hub.text },
  timelineLinkSub: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, marginTop: 2 },

  contactCta: { backgroundColor: colors.hub.primary, padding: spacing.lg, paddingVertical: spacing.xl, alignItems: 'center' },
  contactText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4 },
  contactBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6,
  },
  contactBtnText: { fontFamily: 'Montserrat-Medium', fontSize: 12, color: colors.shared.parchment },
});
