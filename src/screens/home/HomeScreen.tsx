/**
 * Home Screen — Tab 1: Cultural Heritage Centre
 *
 * All content fetched from the custom PHP API.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHubPosts } from '../../api/hub';
import { BlogCard, Divider } from '../../components';
import AppHeader from '../../components/AppHeader';
import { colors, textStyles, spacing } from '../../theme';
import { useEnvStore } from '../../stores/envStore';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data: posts, isLoading: postsLoading, refetch, isRefetching } = useHubPosts(6);
  const urls = useEnvStore((s) => s.urls);
  const baseUrl = urls.hub.base;

  return (
    <View style={{ flex: 1, backgroundColor: colors.hub.primary }}>
      <AppHeader backgroundColor={colors.hub.primary} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.shared.gold}
            colors={[colors.shared.gold]}
          />
        }
      >
      {/* HERO */}
      <View style={styles.hero}>
        <Image
          source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/hero-centre.jpg` }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="disk"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>ARUSHA, TANZANIA — EST. 1994</Text>
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/logo-white.png` }}
            style={styles.heroLogo}
            contentFit="contain"
            cachePolicy="disk"
          />
          <Divider color={colors.shared.gold} width={60} marginVertical={16} />
          <Text style={styles.heroTagline}>
            Where Art, Heritage & Discovery Converge
          </Text>
        </View>
      </View>

      {/* THREE PILLARS */}
      <View style={styles.pillarsSection}>
        <Text style={[textStyles.label, styles.sectionLabel]}>OUR WORLD</Text>
        <Divider />

        <TouchableOpacity
          style={styles.pillarCard}
          onPress={() => navigation.navigate('Market')}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-market/assets/images/market-hero.jpg` }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={styles.pillarOverlay} />
          <View style={styles.pillarContent}>
            <Text style={[textStyles.label, { color: colors.market.accent }]}>THE MARKET</Text>
            <Text style={[textStyles.h2, styles.pillarTitle]}>Handcrafts & Artifacts</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillarCard}
          onPress={() => navigation.navigate('Vault')}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-jewelry/assets/images/tanzanite-slide-1-scaled.jpg` }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={styles.pillarOverlay} />
          <View style={styles.pillarContent}>
            <Text style={[textStyles.label, { color: colors.vault.accent }]}>THE VAULT</Text>
            <Text style={[textStyles.h2, styles.pillarTitle]}>Tanzanite & Fine Jewelry</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillarCard}
          onPress={() => navigation.navigate('Gallery')}
          activeOpacity={0.85}
        >
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-gallery/assets/images/gallery-hero.jpg` }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={styles.pillarOverlay} />
          <View style={styles.pillarContent}>
            <Text style={[textStyles.label, { color: colors.shared.gold }]}>THE GALLERY</Text>
            <Text style={[textStyles.h2, styles.pillarTitle]}>Contemporary & Traditional Art</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* HERITAGE STORIES */}
      <View style={styles.section}>
        <Text style={[textStyles.label, styles.sectionLabel]}>THE JOURNAL</Text>
        <Text style={[textStyles.h1, styles.sectionTitle]}>Heritage Stories</Text>
        <Divider />

        {postsLoading ? (
          <ActivityIndicator size="large" color={colors.shared.gold} style={{ marginTop: 24 }} />
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              excerpt={post.excerpt}
              imageUrl={post.image || undefined}
              date={post.date}
              accentColor={colors.shared.gold}
              onPress={() => navigation.navigate('PostDetail', {
                title: post.title,
                content: post.content,
                imageUrl: post.image,
                date: post.date,
              })}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>Stories loading...</Text>
        )}
      </View>

      {/* QUICK LINKS */}
      <View style={styles.linksSection}>
        <QuickLink
          label="About Cultural Heritage"
          icon="information-circle-outline"
          onPress={() => navigation.navigate('Content', { slug: 'about', title: 'About Cultural Heritage' })}
        />
        <QuickLink
          label="Our Legacy"
          icon="time-outline"
          onPress={() => navigation.navigate('Content', { slug: 'our-legacy', title: 'Our Legacy' })}
        />
        <QuickLink
          label="Newsletter"
          icon="mail-outline"
          onPress={() => navigation.navigate('Content', { slug: 'newsletter', title: 'Newsletter' })}
        />
        <QuickLink
          label="Contact Us"
          icon="call-outline"
          onPress={() => navigation.navigate('Content', { slug: 'contact', title: 'Contact Us', site: 'market' })}
        />
      </View>

      {/* CONTACT BAR */}
      <View style={styles.contactBar}>
        <Text style={[textStyles.label, { color: colors.shared.gold, textAlign: 'center', marginBottom: 16 }]}>
          VISIT US
        </Text>
        <Text style={styles.contactText}>Dodoma Road, Arusha, Tanzania</Text>
        <Text style={styles.contactText}>Mon–Sat 8am–8pm · Sun 10am–7pm</Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('tel:+255786454999')}>
            <Ionicons name="call-outline" size={16} color={colors.shared.parchment} />
            <Text style={styles.contactBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('https://wa.me/255786454999')}>
            <Ionicons name="logo-whatsapp" size={16} color={colors.shared.parchment} />
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('https://maps.google.com/?q=-3.3869,36.6830')}>
            <Ionicons name="navigate-outline" size={16} color={colors.shared.parchment} />
            <Text style={styles.contactBtnText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

function QuickLink({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name={icon as any} size={20} color={colors.shared.gold} />
        <Text style={styles.quickLinkText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.shared.gold} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.background },
  hero: {
    height: 420, justifyContent: 'flex-end', alignItems: 'center',
    paddingBottom: 40,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,56,44,0.75)',
  },
  heroContent: { alignItems: 'center', zIndex: 1, paddingHorizontal: 32 },
  heroEyebrow: {
    fontFamily: 'Montserrat-SemiBold', fontSize: 9, letterSpacing: 3,
    color: colors.shared.gold, textTransform: 'uppercase', marginBottom: 16,
  },
  heroLogo: { width: 260, height: 117 },
  heroTagline: {
    fontFamily: 'Montserrat-Regular', fontSize: 12,
    color: 'rgba(245,242,237,0.6)', textAlign: 'center', letterSpacing: 0.5,
  },
  pillarsSection: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.xl,
    backgroundColor: colors.shared.white,
  },
  sectionLabel: { color: colors.hub.textMuted, textAlign: 'center', marginBottom: 4 },
  pillarCard: {
    height: 160, marginTop: 12, overflow: 'hidden',
    justifyContent: 'flex-end', borderRadius: 4,
  },
  pillarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pillarContent: { padding: 20, zIndex: 1 },
  pillarTitle: { color: '#fff', marginTop: 4 },
  section: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing['2xl'],
    backgroundColor: colors.hub.background,
  },
  sectionTitle: { color: colors.hub.text, textAlign: 'center' },
  emptyText: {
    fontFamily: 'Montserrat-Regular', fontSize: 13,
    color: colors.hub.textMuted, textAlign: 'center', marginTop: 24,
  },
  linksSection: {
    backgroundColor: colors.shared.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  quickLink: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hub.border,
  },
  quickLinkText: { fontFamily: 'Montserrat-Medium', fontSize: 15, color: colors.hub.text },
  contactBar: {
    backgroundColor: colors.hub.primary, padding: spacing.lg, paddingVertical: spacing.xl,
  },
  contactText: {
    fontFamily: 'Montserrat-Regular', fontSize: 13,
    color: 'rgba(245,242,237,0.6)', textAlign: 'center', lineHeight: 22,
  },
  contactButtons: {
    flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 20,
  },
  contactBtn: {
    borderWidth: 1, borderColor: 'rgba(245,242,237,0.2)',
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  contactBtnText: {
    fontFamily: 'Montserrat-Medium', fontSize: 12, color: colors.shared.parchment,
  },
});
