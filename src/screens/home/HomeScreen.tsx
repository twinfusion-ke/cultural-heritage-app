/**
 * Home Screen — Cultural Heritage Centre
 *
 * Full-height hero carousel, division banners with products,
 * blog posts with video cards, traveler reviews, quick links.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { appApi } from '../../api/appApi';
import HeroCarousel, { type SliderItem } from '../../components/HeroCarousel';
import YouTubeCard from '../../components/YouTubeCard';
import ReviewsSection from '../../components/ReviewsSection';
import { useHubPosts } from '../../api/hub';
import { useMarketProducts } from '../../api/market';
import { useJewelryProducts } from '../../api/jewelry';
import { useGalleryProducts } from '../../api/gallery';
import { BlogCard, Divider } from '../../components';
import { FadeIn } from '../../components/animated';
import AppHeader from '../../components/AppHeader';
import { colors, textStyles, spacing } from '../../theme';
import { formatPrice, useCurrencyCode } from '../../utils/currency';
import { useEnvStore } from '../../stores/envStore';
import { useCartStore } from '../../stores/cartStore';

const { width: SCREEN_W } = Dimensions.get('window');

/** Fade-in hook */
function useFadeIn(delay: number = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data: posts, isLoading: postsLoading, refetch, isRefetching } = useHubPosts(4);
  // Fetch more products and randomize which 2 show each time
  const { data: marketAll } = useMarketProducts({ perPage: 8 });
  const { data: jewelryAll } = useJewelryProducts({ perPage: 8 });
  const { data: galleryAll } = useGalleryProducts({ perPage: 8 });

  const marketProducts = React.useMemo(() => {
    if (!marketAll || marketAll.length <= 2) return marketAll;
    const shuffled = [...marketAll].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }, [marketAll]);

  const jewelryProducts = React.useMemo(() => {
    if (!jewelryAll || jewelryAll.length <= 2) return jewelryAll;
    const shuffled = [...jewelryAll].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }, [jewelryAll]);

  const galleryProducts = React.useMemo(() => {
    if (!galleryAll || galleryAll.length <= 2) return galleryAll;
    const shuffled = [...galleryAll].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }, [galleryAll]);
  const urls = useEnvStore((s) => s.urls);
  const baseUrl = urls.hub.base;
  const addItem = useCartStore((s) => s.addItem);
  useCurrencyCode();

  // Fetch slider data from API
  const { data: slidesData } = useQuery<any[]>({
    queryKey: ['sliders'],
    queryFn: () => appApi('sliders'),
    staleTime: 1000 * 60 * 5,
  });

  const marketAnim = useFadeIn(100);
  const vaultAnim = useFadeIn(200);
  const galleryAnim = useFadeIn(300);

  // Map API slides to carousel items
  const slides: SliderItem[] = (slidesData || []).map((s: any) => ({
    id: s.id,
    image: s.image,
    title: s.title,
    subtitle: s.subtitle,
    label: s.label,
    labelColor: s.label_color,
    cta: s.cta,
    onPress: s.tab ? () => navigation.navigate(s.tab) : undefined,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.hub.primary }}>
      <AppHeader backgroundColor={colors.hub.primary} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.shared.gold} colors={[colors.shared.gold]} />
        }
      >
      {/* ═══ HERO CAROUSEL ═══ */}
      <HeroCarousel slides={slides} />

      {/* ═══ LOGO BAR ═══ */}
      <View style={styles.logoBar}>
        <Image
          source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/logo-white.png` }}
          style={styles.logoImage}
          contentFit="contain"
          cachePolicy="disk"
        />
        <Text style={styles.logoTagline}>Arusha, Tanzania — Est. 1994</Text>
      </View>

      {/* ═══ THE MARKET ═══ */}
      <Animated.View style={marketAnim}>
        <DivisionSection
          label="THE MARKET" title="Handcrafts & Artifacts"
          labelColor={colors.market.accent} bgColor={colors.market.background}
          heroImage={`${baseUrl}/wp-content/themes/ch-market/assets/images/market-hero.jpg`}
          overlayColor="rgba(61,43,31,0.7)" products={marketProducts} site="market"
          accentColor={colors.market.accent}
          onBannerPress={() => navigation.navigate('Market')}
          onProductPress={(p: any) => navigation.navigate('ProductDetail', { product: p, site: 'market' })}
          onAddToCart={(p: any) => addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0]?.src || '', site: 'market' })}
          onViewAll={() => navigation.navigate('Market')}
        />
      </Animated.View>

      {/* ═══ THE VAULT ═══ */}
      <Animated.View style={vaultAnim}>
        <DivisionSection
          label="THE VAULT" title="Tanzanite & Fine Jewelry"
          labelColor={colors.vault.accent} bgColor="#0A0A14"
          heroImage={`${baseUrl}/wp-content/themes/ch-jewelry/assets/images/tanzanite-slide-1-scaled.jpg`}
          overlayColor="rgba(10,10,20,0.75)" products={jewelryProducts} site="jewelry"
          accentColor={colors.vault.accent} darkMode
          onBannerPress={() => navigation.navigate('Vault')}
          onProductPress={(p: any) => navigation.navigate('ProductDetail', { product: p, site: 'jewelry' })}
          onAddToCart={(p: any) => addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0]?.src || '', site: 'jewelry' })}
          onViewAll={() => navigation.navigate('Vault')}
        />
      </Animated.View>

      {/* ═══ ART GALLERY ═══ */}
      <Animated.View style={galleryAnim}>
        <DivisionSection
          label="THE GALLERY" title="Contemporary & Traditional Art"
          labelColor={colors.shared.gold} bgColor={colors.gallery.background}
          heroImage={`${baseUrl}/wp-content/themes/ch-gallery/assets/images/gallery-hero.jpg`}
          overlayColor="rgba(26,26,26,0.7)" products={galleryProducts} site="gallery"
          accentColor={colors.shared.gold}
          onBannerPress={() => navigation.navigate('Gallery')}
          onProductPress={(p: any) => navigation.navigate('ProductDetail', { product: p, site: 'gallery' })}
          onAddToCart={(p: any) => addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0]?.src || '', site: 'gallery' })}
          onViewAll={() => navigation.navigate('Gallery')}
        />
      </Animated.View>

      {/* ═══ HERITAGE STORIES + VIDEOS ═══ */}
      <View style={styles.section}>
        <Text style={[textStyles.label, styles.sectionLabel]}>THE JOURNAL</Text>
        <Text style={[textStyles.h1, styles.sectionTitle]}>Heritage Stories</Text>
        <Divider />

        {postsLoading ? (
          <ActivityIndicator size="large" color={colors.shared.gold} style={{ marginTop: 24 }} />
        ) : posts && posts.length > 0 ? (
          <>
            {posts.slice(0, 2).map((post) => (
              <BlogCard key={post.id} title={post.title} excerpt={post.excerpt} imageUrl={post.image || undefined} date={post.date} accentColor={colors.shared.gold}
                onPress={() => navigation.navigate('PostDetail', { title: post.title, content: post.content, imageUrl: post.image, date: post.date })}
              />
            ))}
            <YouTubeCard videoId="z9wh0prnkpo" title="Discover the Centre" subtitle="A virtual tour of the Cultural Heritage Centre in Arusha, Tanzania." />
            {posts.slice(2).map((post) => (
              <BlogCard key={post.id} title={post.title} excerpt={post.excerpt} imageUrl={post.image || undefined} date={post.date} accentColor={colors.shared.gold}
                onPress={() => navigation.navigate('PostDetail', { title: post.title, content: post.content, imageUrl: post.image, date: post.date })}
              />
            ))}
            <YouTubeCard videoId="z_kLkxaQHNg" title="Our Heritage" subtitle="Three decades of preserving Africa's cultural treasures." />
          </>
        ) : (
          <Text style={styles.emptyText}>Stories loading...</Text>
        )}
        <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Blog')}>
          <Text style={styles.viewAllText}>View All Stories</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.shared.gold} />
        </TouchableOpacity>
      </View>

      {/* ═══ REVIEWS ═══ */}
      <ReviewsSection />

      {/* ═══ QUICK LINKS ═══ */}
      <View style={styles.linksSection}>
        <QuickLink label="About Cultural Heritage" icon="information-circle-outline" onPress={() => navigation.navigate('About')} />
        <QuickLink label="Our Legacy (1994–2024)" icon="time-outline" onPress={() => navigation.navigate('Legacy')} />
        <QuickLink label="Plan Your Visit" icon="map-outline" onPress={() => navigation.navigate('Visit')} />
        <QuickLink label="Contact Us" icon="call-outline" onPress={() => navigation.navigate('Contact')} />
      </View>

      {/* ═══ CONTACT BAR ═══ */}
      <View style={styles.contactBar}>
        <Text style={[textStyles.label, { color: colors.shared.gold, textAlign: 'center', marginBottom: 16 }]}>VISIT US</Text>
        <Text style={styles.contactText}>Dodoma Road, Arusha, Tanzania</Text>
        <Text style={styles.contactText}>Mon–Sat 8am–8pm · Sun 10am–7pm</Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('tel:+255786454999')}>
            <Ionicons name="call-outline" size={16} color={colors.shared.parchment} />
            <Text style={styles.contactBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('https://wa.me/255786454999')}>
            <Ionicons name="logo-whatsapp" size={16} color={colors.shared.parchment} />
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('https://maps.google.com/?q=-3.3869,36.6830')}>
            <Ionicons name="navigate-outline" size={16} color={colors.shared.parchment} />
            <Text style={styles.contactBtnText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

function DivisionSection({ label, title, labelColor, bgColor, heroImage, overlayColor, products, site, accentColor, darkMode, onBannerPress, onProductPress, onAddToCart, onViewAll }: any) {
  const textColor = darkMode ? '#E8E8E8' : colors.hub.text;
  const cardBg = darkMode ? '#1A1A28' : '#fff';

  return (
    <View style={[styles.divisionSection, { backgroundColor: bgColor }]}>
      <TouchableOpacity style={styles.divisionBanner} onPress={onBannerPress} activeOpacity={0.85}>
        <Image source={{ uri: heroImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" cachePolicy="disk" />
        <View style={[styles.divisionOverlay, { backgroundColor: overlayColor }]} />
        <View style={styles.divisionBannerContent}>
          <Text style={[textStyles.label, { color: labelColor }]}>{label}</Text>
          <Text style={[textStyles.h2, { color: '#fff', marginTop: 4 }]}>{title}</Text>
          <View style={styles.shopNowRow}>
            <Text style={[styles.shopNowText, { color: labelColor }]}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={14} color={labelColor} />
          </View>
        </View>
      </TouchableOpacity>

      {products && products.length > 0 && (
        <View style={styles.productRow}>
          {products.slice(0, 2).map((p: any) => (
            <TouchableOpacity key={p.id} style={[styles.miniProductCard, { backgroundColor: cardBg }]} onPress={() => onProductPress(p)} activeOpacity={0.9}>
              {p.images?.[0]?.src ? (
                <Image source={{ uri: p.images[0].src }} style={styles.miniProductImage} contentFit="cover" cachePolicy="disk" transition={200} />
              ) : (
                <View style={[styles.miniProductImage, { backgroundColor: darkMode ? '#222' : '#F0F0F0', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="image-outline" size={24} color={darkMode ? '#555' : '#CCC'} />
                </View>
              )}
              <View style={styles.miniProductInfo}>
                <Text style={[styles.miniProductName, { color: textColor }]} numberOfLines={2}>{p.name}</Text>
                <Text style={[styles.miniProductPrice, { color: accentColor }]}>{formatPrice(p.price)}</Text>
              </View>
              <TouchableOpacity style={[styles.miniAddBtn, { backgroundColor: accentColor }]} onPress={() => onAddToCart(p)}>
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll}>
        <Text style={[styles.viewAllText, { color: accentColor }]}>View Collection</Text>
        <Ionicons name="arrow-forward" size={16} color={accentColor} />
      </TouchableOpacity>
    </View>
  );
}

function QuickLink({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name={icon as any} size={20} color={colors.shared.gold} />
        <Text style={styles.quickLinkText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.shared.gold} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.background },

  logoBar: { backgroundColor: colors.hub.primary, alignItems: 'center', paddingVertical: 20 },
  logoImage: { width: 200, height: 50 },
  logoTagline: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: 'rgba(245,242,237,0.5)', marginTop: 8, letterSpacing: 1 },

  divisionSection: { paddingBottom: spacing.md },
  divisionBanner: { height: 180, justifyContent: 'flex-end', marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: 8, overflow: 'hidden' },
  divisionOverlay: { ...StyleSheet.absoluteFillObject },
  divisionBannerContent: { padding: 20, zIndex: 1 },
  shopNowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  shopNowText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },

  productRow: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  miniProductCard: { flex: 1, borderRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  miniProductImage: { width: '100%', aspectRatio: 0.9 },
  miniProductInfo: { padding: 10 },
  miniProductName: { fontFamily: 'Montserrat-Medium', fontSize: 13, lineHeight: 17 },
  miniProductPrice: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, marginTop: 4 },
  miniAddBtn: { position: 'absolute', bottom: 10, right: 10, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  viewAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md },
  viewAllText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: colors.shared.gold, letterSpacing: 0.5 },

  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing['2xl'], backgroundColor: colors.hub.background },
  sectionLabel: { color: colors.hub.textMuted, textAlign: 'center', marginBottom: 4 },
  sectionTitle: { color: colors.hub.text, textAlign: 'center' },
  emptyText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, textAlign: 'center', marginTop: 24 },
  linksSection: { backgroundColor: colors.shared.white, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  quickLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border },
  quickLinkText: { fontFamily: 'Montserrat-Medium', fontSize: 16, color: colors.hub.text },
  contactBar: { backgroundColor: colors.hub.primary, padding: spacing.lg, paddingVertical: spacing.xl },
  contactText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: 'rgba(245,242,237,0.6)', textAlign: 'center', lineHeight: 22 },
  contactButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 20 },
  contactBtn: { borderWidth: 1, borderColor: 'rgba(245,242,237,0.2)', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 4 },
  contactBtnText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
});
