/**
 * Home Screen — Tab 1: Cultural Heritage Centre
 *
 * Hero banner, division cards with 2 sample products each,
 * heritage stories, quick links, and contact bar.
 */

import React from 'react';
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
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { FadeIn, ScaleIn } from '../../components/animated';
import { useHubPosts } from '../../api/hub';
import { useMarketProducts } from '../../api/market';
import { useJewelryProducts } from '../../api/jewelry';
import { useGalleryProducts } from '../../api/gallery';
import { BlogCard, Divider } from '../../components';
import AppHeader from '../../components/AppHeader';
import { colors, textStyles, spacing } from '../../theme';
import { useEnvStore } from '../../stores/envStore';
import { useCartStore } from '../../stores/cartStore';

const { width: SCREEN_W } = Dimensions.get('window');
const PRODUCT_CARD_W = (SCREEN_W - spacing.lg * 2 - 12) / 2;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data: posts, isLoading: postsLoading, refetch, isRefetching } = useHubPosts(4);
  const { data: marketProducts } = useMarketProducts({ perPage: 2 });
  const { data: jewelryProducts } = useJewelryProducts({ perPage: 2 });
  const { data: galleryProducts } = useGalleryProducts({ perPage: 2 });
  const urls = useEnvStore((s) => s.urls);
  const baseUrl = urls.hub.base;
  const addItem = useCartStore((s) => s.addItem);

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
      {/* ═══ HERO WITH VIDEO ═══ */}
      <View style={styles.hero}>
        <WebView
          source={{ uri: 'https://www.youtube.com/embed/z_kLkxaQHNg?autoplay=1&mute=1&loop=1&playlist=z_kLkxaQHNg&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1' }}
          style={StyleSheet.absoluteFillObject}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          scrollEnabled={false}
          pointerEvents="none"
        />
        <View style={styles.heroOverlay} />
        <FadeIn delay={300} slideUp={30}>
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>ARUSHA, TANZANIA — EST. 1994</Text>
            <Image
              source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/logo-white.png` }}
              style={styles.heroLogo}
              contentFit="contain"
              cachePolicy="disk"
            />
            <Divider color={colors.shared.gold} width={60} marginVertical={16} />
            <Text style={styles.heroTagline}>Where Art, Heritage & Discovery Converge</Text>
          </View>
        </FadeIn>
      </View>

      {/* ═══ THE MARKET — with 2 products ═══ */}
      <FadeIn delay={100} slideUp={20}>
      <DivisionSection
        label="THE MARKET"
        title="Handcrafts & Artifacts"
        labelColor={colors.market.accent}
        bgColor={colors.market.background}
        heroImage={`${baseUrl}/wp-content/themes/ch-market/assets/images/market-hero.jpg`}
        overlayColor="rgba(61,43,31,0.7)"
        products={marketProducts}
        site="market"
        accentColor={colors.market.accent}
        onBannerPress={() => navigation.navigate('Market')}
        onProductPress={(p: any) => navigation.navigate('ProductDetail', { product: p, site: 'market' })}
        onAddToCart={(p: any) => addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0]?.src || '', site: 'market' })}
        onViewAll={() => navigation.navigate('Market')}
      />
      </FadeIn>

      {/* ═══ THE VAULT — with 2 products ═══ */}
      <FadeIn delay={200} slideUp={20}>
      <DivisionSection
        label="THE VAULT"
        title="Tanzanite & Fine Jewelry"
        labelColor={colors.vault.accent}
        bgColor={colors.vault.background}
        heroImage={`${baseUrl}/wp-content/themes/ch-jewelry/assets/images/tanzanite-slide-1-scaled.jpg`}
        overlayColor="rgba(10,10,20,0.75)"
        products={jewelryProducts}
        site="jewelry"
        accentColor={colors.vault.accent}
        onBannerPress={() => navigation.navigate('Vault')}
        onProductPress={(p: any) => navigation.navigate('ProductDetail', { product: p, site: 'jewelry' })}
        onAddToCart={(p: any) => addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0]?.src || '', site: 'jewelry' })}
        onViewAll={() => navigation.navigate('Vault')}
      />
      </FadeIn>

      {/* ═══ ART GALLERY — with 2 products ═══ */}
      <FadeIn delay={300} slideUp={20}>
      <DivisionSection
        label="THE GALLERY"
        title="Contemporary & Traditional Art"
        labelColor={colors.shared.gold}
        bgColor={colors.gallery.background}
        heroImage={`${baseUrl}/wp-content/themes/ch-gallery/assets/images/gallery-hero.jpg`}
        overlayColor="rgba(26,26,26,0.7)"
        products={galleryProducts}
        site="gallery"
        accentColor={colors.shared.gold}
        onBannerPress={() => navigation.navigate('Gallery')}
        onProductPress={(p: any) => navigation.navigate('ProductDetail', { product: p, site: 'gallery' })}
        onAddToCart={(p: any) => addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0]?.src || '', site: 'gallery' })}
        onViewAll={() => navigation.navigate('Gallery')}
      />
      </FadeIn>

      {/* ═══ HERITAGE STORIES ═══ */}
      <View style={styles.section}>
        <Text style={[textStyles.label, styles.sectionLabel]}>THE JOURNAL</Text>
        <Text style={[textStyles.h1, styles.sectionTitle]}>Heritage Stories</Text>
        <Divider />

        {postsLoading ? (
          <ActivityIndicator size="large" color={colors.shared.gold} style={{ marginTop: 24 }} />
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
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
          ))
        ) : (
          <Text style={styles.emptyText}>Stories loading...</Text>
        )}

        <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Blog')}>
          <Text style={styles.viewAllText}>View All Stories</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.shared.gold} />
        </TouchableOpacity>
      </View>

      {/* ═══ QUICK LINKS ═══ */}
      <View style={styles.linksSection}>
        <QuickLink label="About Cultural Heritage" icon="information-circle-outline" onPress={() => navigation.navigate('About')} />
        <QuickLink label="Our Legacy (1994–2024)" icon="time-outline" onPress={() => navigation.navigate('Legacy')} />
        <QuickLink label="Plan Your Visit" icon="map-outline" onPress={() => navigation.navigate('Content', { slug: 'visit', title: 'Plan Your Visit' })} />
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

/** Division Section — Banner + 2 Product Cards */
function DivisionSection({ label, title, labelColor, bgColor, heroImage, overlayColor, products, site, accentColor, onBannerPress, onProductPress, onAddToCart, onViewAll }: any) {
  return (
    <View style={[styles.divisionSection, { backgroundColor: bgColor }]}>
      {/* Banner */}
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

      {/* 2 Product Cards */}
      {products && products.length > 0 && (
        <View style={styles.productRow}>
          {products.slice(0, 2).map((p: any) => (
            <TouchableOpacity key={p.id} style={styles.miniProductCard} onPress={() => onProductPress(p)} activeOpacity={0.9}>
              {p.images?.[0]?.src ? (
                <Image source={{ uri: p.images[0].src }} style={styles.miniProductImage} contentFit="cover" cachePolicy="disk" transition={200} />
              ) : (
                <View style={[styles.miniProductImage, { backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="image-outline" size={24} color="#CCC" />
                </View>
              )}
              <View style={styles.miniProductInfo}>
                <Text style={styles.miniProductName} numberOfLines={2}>{p.name}</Text>
                <Text style={[styles.miniProductPrice, { color: accentColor }]}>${p.price}</Text>
              </View>
              <TouchableOpacity
                style={[styles.miniAddBtn, { backgroundColor: accentColor }]}
                onPress={() => onAddToCart(p)}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* View All */}
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
  hero: { height: 380, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 36 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,56,44,0.75)' },
  heroContent: { alignItems: 'center', zIndex: 1, paddingHorizontal: 32 },
  heroEyebrow: { fontFamily: 'Montserrat-SemiBold', fontSize: 10, letterSpacing: 3, color: colors.shared.gold, textTransform: 'uppercase', marginBottom: 16 },
  heroLogo: { width: 260, height: 117 },
  heroTagline: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(245,242,237,0.6)', textAlign: 'center', letterSpacing: 0.5 },

  divisionSection: { paddingBottom: spacing.md },
  divisionBanner: { height: 180, justifyContent: 'flex-end', marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: 8, overflow: 'hidden' },
  divisionOverlay: { ...StyleSheet.absoluteFillObject },
  divisionBannerContent: { padding: 20, zIndex: 1 },
  shopNowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  shopNowText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },

  productRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.md },
  miniProductCard: { width: PRODUCT_CARD_W, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  miniProductImage: { width: '100%', aspectRatio: 1 },
  miniProductInfo: { padding: 10 },
  miniProductName: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.hub.text, lineHeight: 18 },
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
