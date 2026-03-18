/**
 * AboutScreen — Consolidated About Us
 *
 * Fetches the About page from the Hub API and renders it natively
 * with brand styling. Shows the Centre's story, mission, and divisions.
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { appApi } from '../../api/appApi';
import { cacheSet, cacheGet } from '../../db/contentCache';
import { Divider } from '../../components';
import { FadeIn } from '../../components/animated';
import AppHeader from '../../components/AppHeader';
import HtmlRenderer from '../../components/HtmlRenderer';
import { colors, textStyles, spacing } from '../../theme';
import { useEnvStore } from '../../stores/envStore';

function wrapHtml(html: string): string {
  return `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Montserrat', sans-serif; font-size: 15px; line-height: 1.75; color: #444; padding: 0 24px 40px; background: #FAFAF8; }
      h2 { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #0e382c; margin: 28px 0 12px; }
      h3 { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #0e382c; margin: 20px 0 8px; }
      p { margin-bottom: 16px; }
      a { color: #C5A059; }
      strong { font-weight: 600; color: #1A1A1A; }
      ul, ol { margin-bottom: 16px; padding-left: 20px; }
      li { margin-bottom: 6px; }
      img { max-width: 100%; height: auto; margin: 12px 0; }
      blockquote { border-left: 3px solid #C5A059; padding: 12px 16px; margin: 16px 0; background: rgba(197,160,89,0.06); font-style: italic; }
    </style>
  </head><body>${html}</body></html>`;
}

export default function AboutScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
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

  const divisions = [
    { name: 'The Market', desc: 'Handcrafts & Artifacts', icon: 'basket-outline', color: colors.market.accent },
    { name: 'The Vault', desc: 'Tanzanite & Fine Jewelry', icon: 'diamond-outline', color: colors.vault.accent },
    { name: 'Art Gallery', desc: 'Contemporary & Traditional Art', icon: 'color-palette-outline', color: colors.shared.gold },
  ];

  return (
    <View style={[styles.container]}>
      <AppHeader backgroundColor={colors.hub.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.shared.parchment} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h3, { color: colors.shared.parchment }]}>About Us</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/hero-centre.jpg` }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={[textStyles.label, { color: colors.shared.gold }]}>EST. 1994</Text>
            <Text style={[textStyles.h1, { color: '#fff', textAlign: 'center', marginTop: 8 }]}>
              Cultural Heritage Centre
            </Text>
            <Text style={styles.heroSub}>Arusha, Tanzania</Text>
          </View>
        </View>

        {/* Divisions */}
        <FadeIn delay={200} slideUp={25}>
        <View style={styles.divisionsSection}>
          <Text style={[textStyles.label, { color: colors.hub.textMuted, textAlign: 'center' }]}>OUR DIVISIONS</Text>
          <Divider />
          {divisions.map((d) => (
            <View key={d.name} style={styles.divisionRow}>
              <View style={[styles.divisionIcon, { backgroundColor: d.color }]}>
                <Ionicons name={d.icon as any} size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[textStyles.body, { fontFamily: 'Montserrat-SemiBold', color: colors.hub.text }]}>{d.name}</Text>
                <Text style={[textStyles.bodySmall, { color: colors.hub.textMuted }]}>{d.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        </FadeIn>

        {/* Page Content */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.shared.gold} style={{ marginVertical: 40 }} />
        ) : page?.content ? (
          <HtmlRenderer html={wrapHtml(page.content)} style={styles.contentView} scrollEnabled={false} />
        ) : null}

        {/* Contact CTA */}
        <FadeIn delay={400} slideUp={25}>
        <View style={styles.ctaSection}>
          <Text style={[textStyles.h2, { color: '#fff', textAlign: 'center' }]}>Visit Us</Text>
          <Text style={styles.ctaText}>Dodoma Road, Arusha, Tanzania</Text>
          <Text style={styles.ctaText}>Mon–Sat 8am–8pm · Sun 10am–7pm</Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => Linking.openURL('tel:+255786454999')}>
              <Ionicons name="call-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => Linking.openURL('https://wa.me/255786454999')}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => Linking.openURL('https://maps.google.com/?q=-3.3869,36.6830')}>
              <Ionicons name="navigate-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  backBtn: { width: 60, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
  scroll: { flex: 1, backgroundColor: colors.hub.background },
  hero: { height: 260, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,56,44,0.7)' },
  heroContent: { zIndex: 1, alignItems: 'center' },
  heroSub: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  divisionsSection: { padding: spacing.lg, backgroundColor: colors.shared.white },
  divisionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  divisionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  contentView: { minHeight: 300, backgroundColor: '#FAFAF8' },
  ctaSection: { backgroundColor: colors.hub.primary, padding: spacing.lg, alignItems: 'center', paddingVertical: spacing.xl },
  ctaText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4 },
  ctaButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  ctaBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 4,
  },
  ctaBtnText: { fontFamily: 'Montserrat-Medium', fontSize: 12, color: colors.shared.parchment },
});
