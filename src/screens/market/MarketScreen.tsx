/**
 * Market Screen — Full redesign
 *
 * Hero slider, category chips, products in groups of 4 with
 * breaker banners + video between, load more at bottom.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import HeroCarousel, { type SliderItem } from '../../components/HeroCarousel';
import YouTubeCard from '../../components/YouTubeCard';
import { FadeIn } from '../../components/animated';
import { ProductCard, Button, Divider, AppHeader } from '../../components';
import { useMarketProducts, useMarketCategories } from '../../api/market';
import { useCartStore } from '../../stores/cartStore';
import { useEnvStore } from '../../stores/envStore';
import { colors, textStyles, spacing } from '../../theme';
import type { AppProduct } from '../../api/types';

const { width: SCREEN_W } = Dimensions.get('window');

const BREAKER_BANNERS = [
  { title: 'Authentic African Craftsmanship', subtitle: 'Every piece tells a story of tradition and artistry', icon: 'hand-left-outline' },
  { title: 'Ethically Sourced', subtitle: 'Supporting artisan communities across 15 African nations', icon: 'earth-outline' },
  { title: 'Worldwide Shipping', subtitle: 'We deliver heritage to your doorstep', icon: 'airplane-outline' },
];

export default function MarketScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<AppProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const baseUrl = useEnvStore((s) => s.urls.hub.base);

  const { data: products, isLoading, refetch, isRefetching, isFetching } = useMarketProducts({
    category: selectedCategory, page, perPage: 12,
  });
  const { data: categories } = useMarketCategories();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (products) {
      if (page === 1) setAllProducts(products);
      else setAllProducts((prev) => { const ids = new Set(prev.map((p) => p.id)); return [...prev, ...products.filter((p) => !ids.has(p.id))]; });
      setHasMore(products.length >= 12);
    }
  }, [products, page]);

  const heroSlides: SliderItem[] = [
    { id: 1, image: `${baseUrl}/wp-content/themes/ch-market/assets/images/market-hero.jpg`, title: 'The Market', subtitle: 'Handcrafts, Artifacts & African Treasures', label: 'HANDCRAFTS & ARTIFACTS', labelColor: colors.market.accent },
    { id: 2, image: `${baseUrl}/wp-content/themes/ch-market/assets/images/carousel-image04.jpg`, title: 'Artisan Treasures', subtitle: 'Handmade with love from across the continent', label: 'NEW ARRIVALS', labelColor: colors.market.accent },
    { id: 3, image: `${baseUrl}/wp-content/themes/ch-market/assets/images/african-coffee.jpg`, title: 'Taste of Africa', subtitle: 'Premium spices, coffee & natural oils from East Africa', label: 'SPICES & OILS', labelColor: colors.market.accent },
  ];

  // Build sections: groups of 4 products with breakers
  function renderProductSections() {
    if (allProducts.length === 0) return null;

    const sections: React.ReactNode[] = [];
    let bannerIdx = 0;

    for (let i = 0; i < allProducts.length; i += 4) {
      const group = allProducts.slice(i, i + 4);

      // Product group
      sections.push(
        <View key={`group-${i}`} style={styles.productGroup}>
          {group.map((item) => (
            <ProductCard
              key={item.id}
              name={item.name} price={`$${item.price}`}
              imageUrl={item.images?.[0]?.src || ''} site="market"
              saleBadge={item.on_sale}
              onPress={() => navigation.navigate('ProductDetail', { product: item, site: 'market' })}
              onAddToCart={() => addItem({ productId: item.id, name: item.name, price: item.price, imageUrl: item.images?.[0]?.src || '', site: 'market' })}
            />
          ))}
        </View>
      );

      // Breaker banner after every 4 products
      if (i + 4 < allProducts.length && bannerIdx < BREAKER_BANNERS.length) {
        const banner = BREAKER_BANNERS[bannerIdx];
        sections.push(
          <FadeIn key={`banner-${i}`} delay={100} slideUp={20}>
            <View style={styles.breakerBanner}>
              <Ionicons name={banner.icon as any} size={28} color={colors.market.accent} />
              <Text style={styles.breakerTitle}>{banner.title}</Text>
              <Text style={styles.breakerSubtitle}>{banner.subtitle}</Text>
            </View>
          </FadeIn>
        );
        bannerIdx++;
      }

      // Video after 8 products
      if (i === 4) {
        sections.push(
          <YouTubeCard
            key="video-market"
            videoId="z9wh0prnkpo"
            title="Inside The Market"
            subtitle="Discover the stories behind our handcrafted collections."
            accentColor={colors.market.accent}
          />
        );
      }
    }

    return sections;
  }

  return (
    <View style={styles.root}>
      <AppHeader backgroundColor={colors.market.primary} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <View />
        }
      >
        {/* Hero Slider */}
        <HeroCarousel slides={heroSlides} height={SCREEN_W * 0.7} autoPlayInterval={4000} />

        {/* Title Bar */}
        <FadeIn delay={100} slideUp={15}>
          <View style={styles.titleBar}>
            <View>
              <Text style={styles.titleLabel}>THE MARKET</Text>
              <Text style={[textStyles.h2, { color: colors.market.primary }]}>Handcrafts & Artifacts</Text>
            </View>
            <Ionicons name="basket" size={24} color={colors.market.accent} />
          </View>
        </FadeIn>

        {/* Category Chips */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {[{ id: 0, name: 'All', slug: 'all', count: 0 }, ...(categories || [])].map((item) => {
              const active = (item.id === 0 && !selectedCategory) || item.id === selectedCategory;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.categoryChip, active && styles.categoryActive]}
                  onPress={() => { setSelectedCategory(item.id === 0 ? undefined : item.id); setPage(1); setAllProducts([]); setHasMore(true); }}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products in groups of 4 with breakers */}
        {isLoading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.market.accent} />
            <Text style={styles.loadingText}>Loading handcrafts...</Text>
          </View>
        ) : allProducts.length > 0 ? (
          <View style={styles.productsSection}>
            {renderProductSections()}

            {/* Load More */}
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => { if (!isFetching) setPage((p) => p + 1); }}
                disabled={isFetching}
              >
                {isFetching ? (
                  <ActivityIndicator size="small" color={colors.market.accent} />
                ) : (
                  <>
                    <Text style={styles.loadMoreText}>Load More Products</Text>
                    <Ionicons name="chevron-down" size={18} color={colors.market.accent} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={48} color={colors.market.border} />
            <Text style={[textStyles.h2, { color: colors.market.text, marginTop: 16 }]}>Products Coming Soon</Text>
            <Button title="Contact via WhatsApp" onPress={() => Linking.openURL('https://wa.me/255786454999')} variant="outline" color={colors.market.accent} style={{ marginTop: spacing.lg }} />
          </View>
        )}

        {/* Bottom Banner */}
        <View style={styles.bottomBanner}>
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-market/assets/images/market-hero.jpg` }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={styles.bottomBannerOverlay} />
          <View style={styles.bottomBannerContent}>
            <Text style={[textStyles.label, { color: colors.market.accent }]}>CAN'T FIND WHAT YOU'RE LOOKING FOR?</Text>
            <Text style={[textStyles.h2, { color: '#fff', marginTop: 8, textAlign: 'center' }]}>Custom Orders Welcome</Text>
            <Text style={styles.bottomBannerDesc}>Tell us what you need and our artisans will craft it for you.</Text>
            <TouchableOpacity style={styles.waCta} onPress={() => Linking.openURL('https://wa.me/255786454999?text=Hello!%20I%20have%20a%20custom%20order%20request.')}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.waCtaText}>Chat on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.market.background },
  titleBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.market.background,
  },
  titleLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.market.accent, letterSpacing: 2.5, marginBottom: 4 },
  categoriesContainer: { backgroundColor: colors.market.background, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.market.border },
  categoriesList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: colors.market.border, backgroundColor: colors.shared.white, borderRadius: 20 },
  categoryActive: { backgroundColor: colors.market.primary, borderColor: colors.market.primary },
  categoryText: { fontFamily: 'Montserrat-Medium', fontSize: 12, color: colors.market.text, textTransform: 'uppercase', letterSpacing: 1 },
  categoryTextActive: { color: colors.shared.white },
  productsSection: { paddingBottom: spacing.md },
  productGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  breakerBanner: {
    backgroundColor: colors.market.primary, marginHorizontal: spacing.lg, marginVertical: spacing.md,
    padding: spacing.lg, borderRadius: 10, alignItems: 'center',
  },
  breakerTitle: { fontFamily: 'CormorantGaramond-Bold', fontSize: 22, color: '#fff', marginTop: 10, textAlign: 'center' },
  breakerSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6, textAlign: 'center' },
  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginVertical: spacing.lg,
    paddingVertical: 16, borderWidth: 1, borderColor: colors.market.accent, borderRadius: 8,
  },
  loadMoreText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.market.accent, letterSpacing: 0.5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing['4xl'] },
  loadingText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.market.textMuted, marginTop: spacing.md },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing['3xl'], paddingHorizontal: spacing.xl },
  bottomBanner: { height: 260, justifyContent: 'flex-end', position: 'relative' },
  bottomBannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(61,43,31,0.85)' },
  bottomBannerContent: { padding: spacing.lg, paddingBottom: spacing.xl, alignItems: 'center', zIndex: 1 },
  bottomBannerDesc: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  waCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#25D366', paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 8, marginTop: 20,
  },
  waCtaText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#fff', letterSpacing: 0.5 },
});
