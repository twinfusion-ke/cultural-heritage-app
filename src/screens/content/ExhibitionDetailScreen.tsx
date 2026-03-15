/**
 * ExhibitionDetailScreen — Full exhibition view
 *
 * Hero image, status badge, dates, content, details sidebar, share.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import WebView from 'react-native-webview';
import { ExhibitionBadge } from '../../components';
import { colors, textStyles, spacing } from '../../theme';
import { formatDateRange } from '../../utils/dates';

function wrapExhHtml(html: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Montserrat', sans-serif; font-size: 15px; line-height: 1.8; color: #444; padding: 0 24px 40px; background: #fff; }
        h2 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; margin: 28px 0 12px; color: #1A1A1A; }
        h3 { font-family: 'Cormorant Garamond', serif; font-size: 18px; margin: 20px 0 8px; color: #1A1A1A; }
        p { margin-bottom: 16px; }
        strong { font-weight: 600; color: #1A1A1A; }
        em { font-style: italic; }
        a { color: #C5A059; }
        ul, ol { margin-bottom: 16px; padding-left: 20px; }
        li { margin-bottom: 6px; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;
}

export default function ExhibitionDetailScreen({ route, navigation }: any) {
  const { title, content, imageUrl, startDate, endDate, excerpt } = route.params;

  async function handleShare() {
    try {
      await Share.share({ message: `${title} — Cultural Heritage Art Gallery` });
    } catch {}
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.gallery.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.heroImage} contentFit="cover" cachePolicy="disk" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={{ fontSize: 48, opacity: 0.3 }}>🖼</Text>
            </View>
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <ExhibitionBadge startDate={startDate} endDate={endDate} />
            <Text style={[textStyles.h1, styles.heroTitle]}>{title}</Text>
            <Text style={styles.heroDates}>{formatDateRange(startDate, endDate)}</Text>
          </View>
        </View>

        {/* Excerpt */}
        {excerpt && (
          <View style={styles.excerptBox}>
            <Text style={styles.excerptText}>{excerpt}</Text>
          </View>
        )}

        {/* Content */}
        <WebView
          source={{ html: wrapExhHtml(content) }}
          style={styles.content}
          originWhitelist={['*']}
          scrollEnabled={false}
        />

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={[textStyles.label, { color: colors.hub.textMuted, marginBottom: 16 }]}>
            EXHIBITION DETAILS
          </Text>

          <DetailRow label="Opens" value={new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <DetailRow label="Closes" value={new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <DetailRow label="Location" value="Cultural Heritage Art Gallery\nDodoma Road, Arusha" />
          <DetailRow label="Hours" value="Mon–Fri: 9am–6pm\nSaturday: 10am–4pm" />
          <DetailRow label="Admission" value="Free" />
        </View>

        {/* CTAs */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => Linking.openURL('https://maps.google.com/?q=-3.3869,36.6830')}
          >
            <Text style={styles.ctaText}>Get Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaButton, styles.ctaOutline]}
            onPress={() => Linking.openURL('tel:+255786454999')}
          >
            <Text style={[styles.ctaText, { color: colors.shared.parchment }]}>Call +255 786 454 999</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.gallery.primary, paddingHorizontal: spacing.lg, paddingVertical: 12,
  },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
  shareText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.gold },
  scroll: { flex: 1 },
  hero: { height: 300, position: 'relative', justifyContent: 'flex-end' },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroPlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  heroContent: { padding: spacing.lg, zIndex: 1 },
  heroTitle: { color: '#fff', marginTop: 8 },
  heroDates: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  excerptBox: { padding: spacing.lg, backgroundColor: '#F5F5F5', borderLeftWidth: 3, borderLeftColor: colors.shared.gold, margin: spacing.lg },
  excerptText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#555', lineHeight: 22, fontStyle: 'italic' },
  content: { minHeight: 300, backgroundColor: '#fff' },
  detailsCard: { margin: spacing.lg, padding: spacing.lg, backgroundColor: '#F5F5F5' },
  detailRow: { marginBottom: 14 },
  detailLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 10, color: colors.hub.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.text, lineHeight: 20 },
  ctaSection: { padding: spacing.lg, backgroundColor: colors.gallery.primary, gap: 10 },
  ctaButton: { backgroundColor: colors.shared.gold, paddingVertical: 14, alignItems: 'center' },
  ctaOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  ctaText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.gallery.primary, textTransform: 'uppercase', letterSpacing: 1.5 },
});
