/**
 * SearchScreen — Global search across all sites
 *
 * Searches products (Market, Vault, Gallery) and pages (Hub).
 * Results grouped by site with accent-colored headers.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEnvStore } from '../../stores/envStore';
import { useCartStore } from '../../stores/cartStore';
import { colors, textStyles, spacing } from '../../theme';
import type { WCProduct } from '../../types/woocommerce';
import type { WPPost } from '../../types/wordpress';

type SearchResult = {
  type: 'product' | 'page' | 'post';
  site: string;
  siteName: string;
  id: number;
  title: string;
  price?: string;
  imageUrl?: string;
  excerpt?: string;
  slug?: string;
  raw?: any;
};

export default function SearchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const urls = useEnvStore((s) => s.urls);
  const env = useEnvStore((s) => s.env);
  const addItem = useCartStore((s) => s.addItem);

  const auth = env.wcConsumerKey
    ? { consumer_key: env.wcConsumerKey, consumer_secret: env.wcConsumerSecret }
    : {};

  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const searches = await Promise.allSettled([
        // Hub pages
        axios.get(`${urls.hub.rest}/pages`, { params: { search: searchTerm, per_page: 5 } }),
        // Hub posts
        axios.get(`${urls.hub.rest}/posts`, { params: { search: searchTerm, per_page: 5, _embed: true } }),
        // Market products
        axios.get(`${urls.market.wc}/products`, { params: { search: searchTerm, per_page: 5, ...auth } }).catch(() => ({ data: [] })),
        // Jewelry products
        axios.get(`${urls.jewelry.wc}/products`, { params: { search: searchTerm, per_page: 5, ...auth } }).catch(() => ({ data: [] })),
        // Gallery products
        axios.get(`${urls.gallery.wc}/products`, { params: { search: searchTerm, per_page: 5, ...auth } }).catch(() => ({ data: [] })),
        // Gallery posts
        axios.get(`${urls.gallery.rest}/posts`, { params: { search: searchTerm, per_page: 5, _embed: true } }),
      ]);

      const all: SearchResult[] = [];

      // Hub pages
      if (searches[0].status === 'fulfilled') {
        for (const p of searches[0].value.data) {
          all.push({ type: 'page', site: 'hub', siteName: 'Cultural Heritage', id: p.id, title: p.title.rendered, slug: p.slug, excerpt: p.excerpt?.rendered?.replace(/<[^>]+>/g, '').slice(0, 100) });
        }
      }
      // Hub posts
      if (searches[1].status === 'fulfilled') {
        for (const p of searches[1].value.data) {
          const img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
          all.push({ type: 'post', site: 'hub', siteName: 'Heritage Stories', id: p.id, title: p.title.rendered, imageUrl: img, excerpt: p.excerpt?.rendered?.replace(/<[^>]+>/g, '').slice(0, 100), raw: p });
        }
      }
      // Market products
      if (searches[2].status === 'fulfilled') {
        for (const p of (searches[2].value as any).data || []) {
          all.push({ type: 'product', site: 'market', siteName: 'The Market', id: p.id, title: p.name, price: p.price, imageUrl: p.images?.[0]?.src, raw: p });
        }
      }
      // Jewelry products
      if (searches[3].status === 'fulfilled') {
        for (const p of (searches[3].value as any).data || []) {
          all.push({ type: 'product', site: 'jewelry', siteName: 'The Vault', id: p.id, title: p.name, price: p.price, imageUrl: p.images?.[0]?.src, raw: p });
        }
      }
      // Gallery products
      if (searches[4].status === 'fulfilled') {
        for (const p of (searches[4].value as any).data || []) {
          all.push({ type: 'product', site: 'gallery', siteName: 'Art Gallery', id: p.id, title: p.name, price: p.price, imageUrl: p.images?.[0]?.src, raw: p });
        }
      }
      // Gallery posts
      if (searches[5].status === 'fulfilled') {
        for (const p of searches[5].value.data) {
          const img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
          all.push({ type: 'post', site: 'gallery', siteName: 'Gallery Journal', id: p.id, title: p.title.rendered, imageUrl: img, excerpt: p.excerpt?.rendered?.replace(/<[^>]+>/g, '').slice(0, 100), raw: p });
        }
      }

      return all;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 60 * 2,
  });

  function handleSearch() {
    Keyboard.dismiss();
    setSearchTerm(query.trim());
  }

  function handleResultPress(item: SearchResult) {
    if (item.type === 'page') {
      navigation.navigate('Content', { slug: item.slug, title: item.title });
    } else if (item.type === 'post') {
      navigation.navigate('PostDetail', {
        title: item.title,
        content: item.raw?.content?.rendered || '',
        imageUrl: item.imageUrl,
        date: item.raw?.date,
      });
    }
    // Products: navigate to the relevant tab
    else if (item.type === 'product') {
      const tabMap: Record<string, string> = { market: 'Market', jewelry: 'Vault', gallery: 'Gallery' };
      navigation.navigate(tabMap[item.site] || 'Market');
    }
  }

  const siteAccents: Record<string, string> = {
    hub: colors.hub.accent,
    market: colors.market.accent,
    jewelry: colors.vault.accent,
    gallery: colors.shared.gold,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h3, { color: colors.shared.parchment }]}>Search</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, pages, articles..."
          placeholderTextColor={colors.hub.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.shared.gold} />
          <Text style={styles.loadingText}>Searching across all sites...</Text>
        </View>
      ) : searchTerm && results && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={[textStyles.h2, { color: colors.hub.text, textAlign: 'center' }]}>
            No results found
          </Text>
          <Text style={styles.emptyDesc}>
            Try a different search term or browse our collections.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results || []}
          keyExtractor={(item) => `${item.site}-${item.type}-${item.id}`}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleResultPress(item)} activeOpacity={0.7}>
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.resultImage}
                  contentFit="cover"
                  cachePolicy="disk"
                />
              )}
              <View style={styles.resultInfo}>
                <Text style={[styles.resultSite, { color: siteAccents[item.site] || colors.shared.gold }]}>
                  {item.siteName.toUpperCase()} · {item.type.toUpperCase()}
                </Text>
                <Text style={styles.resultTitle} numberOfLines={2}>
                  {item.title?.replace(/<[^>]+>/g, '')}
                </Text>
                {item.price && (
                  <Text style={[styles.resultPrice, { color: siteAccents[item.site] }]}>
                    ${item.price}
                  </Text>
                )}
                {item.excerpt && !item.price && (
                  <Text style={styles.resultExcerpt} numberOfLines={2}>{item.excerpt}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 12,
  },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
  searchBar: {
    flexDirection: 'row', paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: 8,
  },
  searchInput: {
    flex: 1, backgroundColor: colors.shared.white, fontFamily: 'Montserrat-Regular',
    fontSize: 14, color: colors.hub.text, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchBtn: {
    backgroundColor: colors.shared.gold, paddingHorizontal: 20, justifyContent: 'center',
  },
  searchBtnText: {
    fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.hub.primary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.hub.background, padding: spacing.xl,
  },
  loadingText: {
    fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted, marginTop: spacing.md,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyDesc: {
    fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted,
    textAlign: 'center', marginTop: spacing.sm, lineHeight: 22,
  },
  resultsList: {
    backgroundColor: colors.hub.background, paddingBottom: 40,
  },
  resultItem: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  resultImage: { width: 64, height: 64, backgroundColor: '#F5F5F5', marginRight: 12 },
  resultInfo: { flex: 1, justifyContent: 'center' },
  resultSite: {
    fontFamily: 'Montserrat-SemiBold', fontSize: 9, letterSpacing: 1.5, marginBottom: 2,
  },
  resultTitle: { fontFamily: 'Montserrat-Medium', fontSize: 15, color: colors.hub.text, lineHeight: 20 },
  resultPrice: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, marginTop: 2 },
  resultExcerpt: {
    fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, marginTop: 2, lineHeight: 18,
  },
});
