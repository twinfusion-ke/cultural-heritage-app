/**
 * PostDetailScreen — Full blog post view
 *
 * Renders blog post with featured image, metadata,
 * and rich HTML content. Supports all 4 sites.
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
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import WebView from 'react-native-webview';
import { colors, textStyles, spacing } from '../../theme';
import { readingTime } from '../../utils/dates';

function wrapPostHtml(html: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px; line-height: 1.8; color: #333;
          padding: 0 24px 40px;
          background: #fff;
        }
        h2 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; margin: 28px 0 12px; color: #0e382c; }
        h3 { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 500; margin: 20px 0 8px; color: #0e382c; }
        p { margin-bottom: 16px; }
        a { color: #C5A059; }
        strong { font-weight: 600; color: #1A1A1A; }
        blockquote { border-left: 2px solid #C5A059; padding-left: 16px; margin: 16px 0; font-style: italic; color: #666; }
        ul, ol { margin-bottom: 16px; padding-left: 20px; }
        li { margin-bottom: 6px; }
        img { max-width: 100%; height: auto; margin: 12px 0; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `;
}

export default function PostDetailScreen({ route, navigation }: any) {
  const { title, content, imageUrl, date, category } = route.params;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const readTime = readingTime(content);

  async function handleShare() {
    try {
      await Share.share({
        message: `${title} — Cultural Heritage Centre`,
      });
    } catch {}
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.hub.primary} />

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
        {/* Hero Image */}
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="disk"
          />
        )}

        {/* Meta */}
        <View style={styles.meta}>
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
          <Text style={styles.metaText}>{formattedDate} · {readTime} min read</Text>
        </View>

        {/* Title */}
        <Text style={[textStyles.h1, styles.title]}>{title}</Text>

        {/* Content */}
        <WebView
          source={{ html: wrapPostHtml(content) }}
          style={styles.content}
          originWhitelist={['*']}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          onMessage={() => {}}
          injectedJavaScript={`
            setTimeout(() => {
              window.ReactNativeWebView.postMessage(document.body.scrollHeight.toString());
            }, 500);
            true;
          `}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.hub.primary, paddingHorizontal: spacing.lg, paddingVertical: 12,
  },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
  shareText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.gold },
  scroll: { flex: 1 },
  heroImage: { width: '100%', height: 220 },
  meta: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg,
  },
  categoryBadge: {
    backgroundColor: colors.shared.gold, paddingHorizontal: 10, paddingVertical: 3,
  },
  categoryText: {
    fontFamily: 'Montserrat-SemiBold', fontSize: 9, color: colors.hub.primary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  metaText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted },
  title: {
    color: colors.hub.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  content: { flex: 1, minHeight: 400, backgroundColor: '#fff' },
});
