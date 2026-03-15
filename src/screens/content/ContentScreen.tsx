/**
 * ContentScreen — Renders WP page content natively
 *
 * Fetches page by slug from any site's REST API
 * and renders the HTML content inside a styled WebView.
 * No external browser — everything stays in-app.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import WebView from 'react-native-webview';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useEnvStore } from '../../stores/envStore';
import { colors, textStyles, spacing } from '../../theme';

// Props handled via React Navigation's `any` type

/** Wrap page content in branded mobile-optimized HTML */
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
        h2 { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #0e382c; margin: 28px 0 12px; }
        h3 { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 500; color: #0e382c; margin: 20px 0 8px; }
        p { margin-bottom: 16px; color: #444; }
        a { color: #C5A059; text-decoration: none; font-weight: 500; }
        strong { font-weight: 600; color: #1A1A1A; }
        em { font-style: italic; }
        ul, ol { margin-bottom: 16px; padding-left: 20px; }
        li { margin-bottom: 8px; color: #444; }
        blockquote { border-left: 3px solid #C5A059; padding: 12px 16px; margin: 16px 0; background: rgba(197,160,89,0.06); font-style: italic; color: #555; }
        img { max-width: 100%; height: auto; margin: 16px 0; border-radius: 2px; }
        hr { border: none; border-top: 1px solid #E5E7EB; margin: 24px 0; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { padding: 10px; border: 1px solid #E5E7EB; font-size: 13px; }
        th { background: #F5F5F5; font-weight: 600; text-align: left; }
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
  const { slug, title, site } = route.params;
  const urls = useEnvStore((s) => s.urls);

  // Determine which site's REST API to use
  const siteUrlMap: Record<string, string> = {
    hub: urls.hub.rest,
    market: urls.market.rest,
    jewelry: urls.jewelry.rest,
    gallery: urls.gallery.rest,
  };
  const restUrl = siteUrlMap[site || 'hub'] || urls.hub.rest;

  const { data: page, isLoading } = useQuery({
    queryKey: ['page', site || 'hub', slug],
    queryFn: async () => {
      const { data } = await axios.get(`${restUrl}/pages`, {
        params: { slug },
      });
      return data[0];
    },
    staleTime: 1000 * 60 * 60,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.hub.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h3, styles.headerTitle]} numberOfLines={1}>{title}</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.shared.gold} />
        </View>
      ) : page ? (
        <WebView
          source={{ html: wrapHtml(page.title.rendered, page.content.rendered) }}
          style={styles.webview}
          originWhitelist={['*']}
          scrollEnabled
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Content not available</Text>
          <Text style={styles.errorSub}>This page hasn't been created yet.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.hub.primary, paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  backBtn: { width: 60 },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
  headerTitle: { color: colors.shared.parchment, flex: 1, textAlign: 'center' },
  webview: { flex: 1, backgroundColor: '#FAFAF8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' },
  errorText: { fontFamily: 'Montserrat-Medium', fontSize: 16, color: colors.hub.text },
  errorSub: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted, marginTop: 6 },
});
