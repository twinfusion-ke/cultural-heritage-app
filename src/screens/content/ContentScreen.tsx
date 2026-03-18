/**
 * ContentScreen — Renders WP page content natively
 *
 * Fetches page via the custom PHP API and renders HTML in WebView.
 * Cached to SQLite for offline access.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HtmlRenderer from '../../components/HtmlRenderer';
import { useQuery } from '@tanstack/react-query';
import { appApi } from '../../api/appApi';
import { cacheSet, cacheGet } from '../../db/contentCache';
import { colors, textStyles, spacing } from '../../theme';

function wrapHtml(title: string, html: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px; line-height: 1.75; color: #333;
          padding: 24px; background: #FAFAF8;
          -webkit-font-smoothing: antialiased;
        }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; color: #0e382c; margin-bottom: 20px; line-height: 1.2; }
        h2 { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #0e382c; margin: 28px 0 12px; }
        h3 { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #0e382c; margin: 20px 0 8px; }
        p { margin-bottom: 16px; color: #444; }
        a { color: #C5A059; text-decoration: none; font-weight: 500; }
        strong { font-weight: 600; color: #1A1A1A; }
        ul, ol { margin-bottom: 16px; padding-left: 20px; }
        li { margin-bottom: 8px; color: #444; }
        blockquote { border-left: 3px solid #C5A059; padding: 12px 16px; margin: 16px 0; background: rgba(197,160,89,0.06); font-style: italic; }
        img { max-width: 100%; height: auto; margin: 16px 0; }
        hr { border: none; border-top: 1px solid #E5E7EB; margin: 24px 0; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { padding: 10px; border: 1px solid #E5E7EB; font-size: 13px; }
        th { background: #F5F5F5; font-weight: 600; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${html}
    </body>
    </html>
  `;
}

export default function ContentScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { slug, title, site } = route.params;
  const siteKey = site || 'hub';

  const { data: page, isLoading, isError, refetch } = useQuery({
    queryKey: ['page', siteKey, slug],
    queryFn: async () => {
      try {
        const data = await appApi('page', { site: siteKey, slug });
        if (data) await cacheSet(siteKey, 'pages', data, slug);
        return data;
      } catch (error: any) {
        const cached = await cacheGet(siteKey, 'pages', slug);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.shared.parchment} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h3, styles.headerTitle]} numberOfLines={1}>{title}</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.shared.gold} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      ) : page ? (
        <HtmlRenderer
          html={wrapHtml(page.title, page.content)}
          style={styles.webview}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Ionicons name="document-text-outline" size={48} color={colors.hub.textMuted} />
          <Text style={styles.errorText}>Content not available</Text>
          <Text style={styles.errorSub}>
            {isError ? 'Check your connection and try again.' : "This page hasn't been created yet."}
          </Text>
          {isError && (
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.hub.primary, paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  backBtn: { width: 60, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
  headerTitle: { color: colors.shared.parchment, flex: 1, textAlign: 'center' },
  webview: { flex: 1, backgroundColor: '#FAFAF8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' },
  loadingText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted, marginTop: 12 },
  errorText: { fontFamily: 'Montserrat-Medium', fontSize: 16, color: colors.hub.text, marginTop: 16 },
  errorSub: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  retryBtn: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.shared.gold, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.shared.gold, textTransform: 'uppercase', letterSpacing: 1 },
});
