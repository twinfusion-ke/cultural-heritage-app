/**
 * SearchScreen — Global search across all sites
 *
 * Uses the custom PHP API for unified search.
 */

import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { appApi } from '../../api/appApi';
import { colors, textStyles, spacing } from '../../theme';
import type { AppSearchResult } from '../../api/types';

export default function SearchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: results, isLoading } = useQuery<AppSearchResult[]>({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      return appApi<AppSearchResult[]>('search', { q: searchTerm });
    },
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 60 * 2,
  });

  function handleSearch() {
    Keyboard.dismiss();
    setSearchTerm(query.trim());
  }

  function handleResultPress(item: AppSearchResult) {
    if (item.type === 'page') {
      navigation.navigate('Content', { slug: item.slug, title: item.title, site: item.site });
    } else if (item.type === 'post') {
      navigation.navigate('PostDetail', {
        title: item.title,
        content: '',
        imageUrl: item.image,
        date: '',
      });
    } else if (item.type === 'product') {
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="arrow-back" size={20} color={colors.shared.parchment} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h3, { color: colors.shared.parchment }]}>Search</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color={colors.hub.textMuted} />
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
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.shared.gold} />
          <Text style={styles.loadingText}>Searching across all sites...</Text>
        </View>
      ) : searchTerm && results && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color={colors.hub.textMuted} />
          <Text style={[textStyles.h2, { color: colors.hub.text, textAlign: 'center', marginTop: 16 }]}>
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
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.resultImage}
                  contentFit="cover"
                  cachePolicy="disk"
                />
              )}
              <View style={styles.resultInfo}>
                <Text style={[styles.resultSite, { color: siteAccents[item.site] || colors.shared.gold }]}>
                  {item.site_name.toUpperCase()} · {item.type.toUpperCase()}
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
  searchInputWrap: {
    flex: 1, backgroundColor: colors.shared.white, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, borderRadius: 8,
  },
  searchInput: {
    flex: 1, fontFamily: 'Montserrat-Regular',
    fontSize: 14, color: colors.hub.text, paddingVertical: 12, marginLeft: 8,
  },
  searchBtn: {
    backgroundColor: colors.shared.gold, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 8,
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
  resultImage: { width: 64, height: 64, backgroundColor: '#F5F5F5', marginRight: 12, borderRadius: 4 },
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
