/**
 * ContentScreen — Loads the exact website page inside the app
 *
 * Full reproduction: header, footer, menus, animations, everything.
 * Uses WebView to render the production website page as-is.
 */

import React, { useState } from 'react';
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
import { useEnvStore } from '../../stores/envStore';
import { colors, textStyles, spacing } from '../../theme';

interface ContentScreenProps {
  route: {
    params: {
      slug: string;
      title: string;
      site?: string;
      url?: string;
    };
  };
  navigation: any;
}

export default function ContentScreen({ route, navigation }: ContentScreenProps) {
  const { slug, title, site, url } = route.params;
  const [loading, setLoading] = useState(true);

  const env = useEnvStore.getState();
  const baseDomain = env.env.baseDomain;
  const protocol = baseDomain.startsWith('localhost') ? 'http' : 'https';

  const sitePathMap: Record<string, string> = {
    hub: '',
    market: '/market',
    jewelry: '/jewelry',
    gallery: '/gallery',
  };

  const sitePath = sitePathMap[site || 'hub'] || '';
  const pageUrl = url || `${protocol}://${baseDomain}${sitePath}/${slug}/`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.hub.primary} />

      {/* Minimal header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h3, styles.headerTitle]} numberOfLines={1}>{title}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.shared.gold} />
          <Text style={styles.loadingText}>Loading page...</Text>
        </View>
      )}

      {/* Full website page in WebView */}
      <WebView
        source={{ uri: pageUrl }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState={false}
        scalesPageToFit
      />
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
  webview: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 56, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8', zIndex: 10,
  },
  loadingText: {
    fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted, marginTop: 12,
  },
});
