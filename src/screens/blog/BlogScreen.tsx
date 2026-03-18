/**
 * BlogScreen — Consolidated blog from all 4 sites
 *
 * Pulls posts from Hub, Market, Jewelry, and Gallery
 * and displays them in a unified feed with site badges.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { appApi } from '../../api/appApi';
import { cacheSet, cacheGet } from '../../db/contentCache';
import AppHeader from '../../components/AppHeader';
import { colors, textStyles, spacing } from '../../theme';
import type { AppPost } from '../../api/hub';

interface SitedPost extends AppPost {
  site: string;
  siteName: string;
  siteColor: string;
}

const SITE_CONFIG = [
  { key: 'hub', name: 'Heritage Centre', color: colors.hub.accent },
  { key: 'market', name: 'The Market', color: colors.market.accent },
  { key: 'jewelry', name: 'The Vault', color: colors.vault.accent },
  { key: 'gallery', name: 'Art Gallery', color: colors.shared.gold },
];

export default function BlogScreen() {
  const navigation = useNavigation<any>();

  const { data: posts, isLoading, refetch, isRefetching } = useQuery<SitedPost[]>({
    queryKey: ['blog', 'all-posts'],
    queryFn: async () => {
      try {
        const results = await Promise.allSettled(
          SITE_CONFIG.map(async (site) => {
            const data = await appApi<AppPost[]>('posts', { site: site.key, per_page: 6 });
            return data.map((p) => ({
              ...p,
              site: site.key,
              siteName: site.name,
              siteColor: site.color,
            }));
          })
        );

        const allPosts: SitedPost[] = [];
        for (const result of results) {
          if (result.status === 'fulfilled') {
            allPosts.push(...result.value);
          }
        }

        // Sort by date descending
        allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        await cacheSet('hub', 'posts', allPosts, 'all-sites');
        return allPosts;
      } catch (error: any) {
        const cached = await cacheGet<SitedPost[]>('hub', 'posts', 'all-sites');
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  return (
    <View style={styles.container}>
      <AppHeader backgroundColor={colors.hub.primary} />

      <View style={styles.titleBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.hub.text} />
        </TouchableOpacity>
        <Text style={[textStyles.h2, { color: colors.hub.text }]}>Heritage Journal</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.shared.gold} />
        </View>
      ) : (
        <FlatList
          data={posts || []}
          keyExtractor={(item) => `${item.site}-${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.shared.gold} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.postCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PostDetail', {
                title: item.title,
                content: item.content,
                imageUrl: item.image,
                date: item.date,
                category: item.siteName,
              })}
            >
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.postImage}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={200}
                />
              )}
              <View style={styles.postContent}>
                <View style={[styles.siteBadge, { backgroundColor: item.siteColor }]}>
                  <Text style={styles.siteBadgeText}>{item.siteName.toUpperCase()}</Text>
                </View>
                <Text style={[textStyles.h3, styles.postTitle]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.postExcerpt} numberOfLines={2}>
                  {(item.excerpt || '').replace(/<[^>]+>/g, '')}
                </Text>
                <Text style={styles.postDate}>{formatDate(item.date)}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={48} color={colors.hub.textMuted} />
              <Text style={[textStyles.h2, { color: colors.hub.text, marginTop: 16 }]}>No stories yet</Text>
              <Text style={styles.emptyDesc}>Check back soon for heritage stories and art journal entries.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.background },
  titleBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.hub.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 40 },
  postCard: {
    backgroundColor: colors.shared.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  postImage: { width: '100%', height: 180 },
  postContent: { padding: spacing.md },
  siteBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4, marginBottom: 8,
  },
  siteBadgeText: {
    fontFamily: 'Montserrat-SemiBold', fontSize: 9, color: '#fff', letterSpacing: 1,
  },
  postTitle: { color: colors.hub.text, marginBottom: 6 },
  postExcerpt: {
    fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted, lineHeight: 20,
  },
  postDate: {
    fontFamily: 'Montserrat-Regular', fontSize: 11, color: colors.hub.textMuted, marginTop: 8,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, marginTop: spacing['3xl'] },
  emptyDesc: {
    fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted,
    textAlign: 'center', marginTop: 8,
  },
});
