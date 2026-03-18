/**
 * Gallery Screen — Tab 4: Art Gallery + Exhibitions
 *
 * Exhibitions grouped by status (Now Showing / Upcoming / Past),
 * art collection grid with QuickView + add-to-cart, and gallery journal.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer, ExhibitionCard, ProductCard, BlogCard, Button, Divider, AppHeader } from '../../components';
import { useExhibitions, useGalleryProducts, useGalleryPosts } from '../../api/gallery';
import { useCartStore } from '../../stores/cartStore';
import { getExhibitionStatus } from '../../utils/dates';
import { colors, textStyles, spacing } from '../../theme';
import type { AppExhibition } from '../../api/types';
import type { AppProduct } from '../../api/types';

export default function GalleryScreen() {
  const navigation = useNavigation<any>();
  const { data: exhibitions, isLoading: exhLoading, refetch, isRefetching } = useExhibitions();
  const { data: products } = useGalleryProducts({ perPage: 6 });
  const { data: posts } = useGalleryPosts(3);
  const addItem = useCartStore((s) => s.addItem);

  // Group exhibitions by status
  const nowShowing: AppExhibition[] = [];
  const upcoming: AppExhibition[] = [];
  const past: AppExhibition[] = [];

  exhibitions?.forEach((exh) => {
    const status = getExhibitionStatus(exh.start_date || '', exh.end_date || '');
    if (status === 'Now Showing') nowShowing.push(exh);
    else if (status === 'Upcoming') upcoming.push(exh);
    else past.push(exh);
  });

  function handleAddToCart(p: AppProduct) {
    addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.images?.[0]?.src || '',
      site: 'gallery',
    });
  }

  return (
    <ScreenContainer
      site="gallery"
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      <AppHeader backgroundColor={colors.gallery.primary} />

      {/* ═══ EXHIBITIONS ═══ */}
      <View style={styles.section}>
        <Text style={[textStyles.label, styles.sectionLabel]}>EXHIBITIONS</Text>
        <Text style={[textStyles.h1, styles.sectionTitle]}>Now Showing</Text>
        <Divider color={colors.shared.gold} />

        {exhLoading ? (
          <ActivityIndicator size="large" color={colors.shared.gold} style={{ marginTop: spacing.lg }} />
        ) : nowShowing.length > 0 ? (
          nowShowing.map((exh) => (
            <ExhibitionCard
              key={exh.id}
              title={exh.title}
              imageUrl={exh.image || undefined}
              startDate={exh.start_date}
              endDate={exh.end_date}
              excerpt={exh.excerpt?.replace(/<[^>]+>/g, '')}
              onPress={() => navigation.navigate('ExhibitionDetail', {
                title: exh.title,
                content: exh.content,
                imageUrl: exh.image,
                startDate: exh.start_date,
                endDate: exh.end_date,
                excerpt: exh.excerpt?.replace(/<[^>]+>/g, ''),
              })}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No exhibitions currently showing</Text>
        )}
      </View>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={[textStyles.label, styles.sectionLabel]}>COMING SOON</Text>
          <Text style={[textStyles.h1, styles.sectionTitle]}>Upcoming</Text>
          <Divider color={colors.status.upcoming} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
            {upcoming.map((exh) => (
              <View key={exh.id} style={styles.upcomingCard}>
                <ExhibitionCard
                  title={exh.title}
                  imageUrl={exh.image || undefined}
                  startDate={exh.start_date}
                  endDate={exh.end_date}
                  onPress={() => navigation.navigate('ExhibitionDetail', {
                    title: exh.title,
                    content: exh.content,
                    imageUrl: exh.image,
                    startDate: exh.start_date,
                    endDate: exh.end_date,
                    excerpt: exh.excerpt?.replace(/<[^>]+>/g, ''),
                  })}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Past */}
      {past.length > 0 && (
        <View style={styles.section}>
          <Text style={[textStyles.label, styles.sectionLabel]}>ARCHIVE</Text>
          <Text style={[textStyles.h1, styles.sectionTitle]}>Past Exhibitions</Text>
          <Divider color={colors.status.past} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
            {past.map((exh) => (
              <View key={exh.id} style={styles.upcomingCard}>
                <ExhibitionCard
                  title={exh.title}
                  imageUrl={exh.image || undefined}
                  startDate={exh.start_date}
                  endDate={exh.end_date}
                  onPress={() => navigation.navigate('ExhibitionDetail', {
                    title: exh.title,
                    content: exh.content,
                    imageUrl: exh.image,
                    startDate: exh.start_date,
                    endDate: exh.end_date,
                    excerpt: exh.excerpt?.replace(/<[^>]+>/g, ''),
                  })}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ═══ ART COLLECTION ═══ */}
      {products && products.length > 0 && (
        <View style={styles.section}>
          <Text style={[textStyles.label, styles.sectionLabel]}>THE COLLECTION</Text>
          <Text style={[textStyles.h1, styles.sectionTitle]}>Featured Artworks</Text>
          <Divider color={colors.shared.gold} />

          <View style={styles.productGrid}>
            {products.map((item) => {
              const artist = item.attributes?.find((a) => a.name.toLowerCase() === 'artist')?.options?.[0];
              return (
                <ProductCard
                  key={item.id}
                  name={item.name}
                  price={`$${item.price}`}
                  imageUrl={item.images?.[0]?.src || ''}
                  site="gallery"
                  subtitle={artist}
                  onPress={() => navigation.navigate('ProductDetail', { product: item, site: 'gallery' })}
                  onAddToCart={() => handleAddToCart(item)}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* ═══ GALLERY JOURNAL ═══ */}
      {posts && posts.length > 0 && (
        <View style={styles.section}>
          <Text style={[textStyles.label, styles.sectionLabel]}>ART JOURNAL</Text>
          <Text style={[textStyles.h1, styles.sectionTitle]}>Gallery Stories</Text>
          <Divider color={colors.shared.gold} />

          {posts.map((post) => (
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
          ))}
        </View>
      )}

      {/* ═══ VISIT CTA ═══ */}
      <View style={[styles.section, styles.visitCta]}>
        <Text style={[textStyles.label, { color: colors.shared.gold, textAlign: 'center' }]}>
          PLAN YOUR VISIT
        </Text>
        <Text style={[textStyles.h1, { color: '#FAFAF8', textAlign: 'center', marginTop: 8 }]}>
          Visit the Gallery
        </Text>
        <Divider color={colors.shared.gold} />
        <Text style={styles.visitDesc}>
          Our exhibitions are best experienced in person. Three halls of contemporary and traditional African art await.
        </Text>
        <View style={styles.visitCtas}>
          <Button
            title="Get Directions"
            onPress={() => Linking.openURL('https://maps.google.com/?q=-3.3869,36.6830')}
            variant="primary"
            color={colors.shared.gold}
            textColor={colors.gallery.primary}
          />
          <Button
            title="Call Gallery"
            onPress={() => Linking.openURL('tel:+255786454999')}
            variant="outline"
            color={colors.shared.parchment}
          />
        </View>
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.gallery.background,
  },
  sectionLabel: {
    color: colors.gallery.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.gallery.text,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: colors.gallery.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  upcomingCard: {
    width: 280,
    marginRight: spacing.md,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  visitCta: {
    backgroundColor: colors.gallery.primary,
    alignItems: 'center',
  },
  visitDesc: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: 'rgba(250,250,248,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  visitCtas: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.lg,
  },
});
