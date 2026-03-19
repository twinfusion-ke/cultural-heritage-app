/**
 * Vault Screen — Luxury dark, tanzanite accents
 *
 * Hero slider, products in groups of 4, breaker banners,
 * video, consultation CTA, load more.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import HeroCarousel, { type SliderItem } from '../../components/HeroCarousel';
import YouTubeCard from '../../components/YouTubeCard';
import { FadeIn } from '../../components/animated';
import { Button, Divider, AppHeader } from '../../components';
import FormModal from '../../components/FormModal';
import { useJewelryProducts } from '../../api/jewelry';
import { useCartStore } from '../../stores/cartStore';
import { useEnvStore } from '../../stores/envStore';
import { colors, textStyles, spacing } from '../../theme';
import { formatPrice } from '../../utils/currency';
import type { AppProduct } from '../../api/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - spacing.lg * 2 - 10) / 2;

export default function VaultScreen() {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<AppProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const baseUrl = useEnvStore((s) => s.urls.hub.base);

  const { data: products, isLoading, refetch, isFetching } = useJewelryProducts({ page, perPage: 12 });
  const addItem = useCartStore((s) => s.addItem);
  const [showConsult, setShowConsult] = useState(false);

  useEffect(() => {
    if (products) {
      if (page === 1) setAllProducts(products);
      else setAllProducts((prev) => { const ids = new Set(prev.map((p) => p.id)); return [...prev, ...products.filter((p) => !ids.has(p.id))]; });
      setHasMore(products.length >= 12);
    }
  }, [products, page]);

  const heroSlides: SliderItem[] = [
    { id: 1, image: `${baseUrl}/wp-content/themes/ch-jewelry/assets/images/tanzanite-slide-1-scaled.jpg`, title: 'The Vault', subtitle: 'Rare tanzanite, precious gemstones & fine jewelry', label: 'FOUND ONLY IN TANZANIA', labelColor: '#1E2F97' },
    { id: 2, image: `${baseUrl}/wp-content/themes/ch-jewelry/assets/images/design-jewellery.jpg`, title: 'Bespoke Jewelry', subtitle: 'Custom designs crafted by our master jewelers in Arusha', label: 'CUSTOM DESIGN', labelColor: colors.vault.accent },
    { id: 3, image: `${baseUrl}/wp-content/themes/ch-jewelry/assets/images/gems-beads.jpg`, title: 'Precious Gemstones', subtitle: 'Certified stones — tanzanite, tsavorite, ruby, sapphire', label: 'CERTIFIED & ETHICAL', labelColor: '#1E2F97' },
  ];

  function renderProductSections() {
    if (allProducts.length === 0) return null;
    const sections: React.ReactNode[] = [];

    for (let i = 0; i < allProducts.length; i += 4) {
      const group = allProducts.slice(i, i + 4);
      sections.push(
        <View key={`group-${i}`} style={styles.productGroup}>
          {group.map((item) => {
            const stone = item.attributes?.find((a) => a.name.toLowerCase().includes('stone'))?.options?.[0];
            const carat = item.attributes?.find((a) => a.name.toLowerCase().includes('carat'))?.options?.[0];
            const subtitle = [stone, carat].filter(Boolean).join(' · ');
            return (
              <TouchableOpacity key={item.id} style={styles.vaultCard} activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetail', { product: item, site: 'jewelry' })}>
                {item.images?.[0]?.src ? (
                  <Image source={{ uri: item.images[0].src }} style={styles.vaultImage} contentFit="cover" cachePolicy="disk" transition={200} />
                ) : (
                  <View style={[styles.vaultImage, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="diamond-outline" size={28} color="#333" />
                  </View>
                )}
                <View style={styles.vaultInfo}>
                  {subtitle ? <Text style={styles.vaultSubtitle}>{subtitle}</Text> : null}
                  <Text style={styles.vaultName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.vaultPrice}>{formatPrice(item.price)}</Text>
                </View>
                <TouchableOpacity style={styles.vaultAddBtn}
                  onPress={() => addItem({ productId: item.id, name: item.name, price: item.price, imageUrl: item.images?.[0]?.src || '', site: 'jewelry' })}>
                  <Ionicons name="bag-add-outline" size={14} color={colors.vault.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      );

      // Breaker after first group
      if (i === 0 && allProducts.length > 4) {
        sections.push(
          <FadeIn key="breaker-1" delay={100} slideUp={20}>
            <View style={styles.breakerBanner}>
              <Ionicons name="shield-checkmark-outline" size={28} color={colors.vault.accent} />
              <Text style={styles.breakerTitle}>Certified & Ethically Sourced</Text>
              <Text style={styles.breakerSub}>Every gemstone comes with a certificate of authenticity from the Tanzanite Foundation</Text>
            </View>
          </FadeIn>
        );
      }

      // Video after second group
      if (i === 4) {
        sections.push(
          <YouTubeCard key="video-vault" videoId="z_kLkxaQHNg" title="The Art of Tanzanite" subtitle="From the Merelani Hills to the world's finest jewelry."
            accentColor={colors.vault.accent} />
        );
      }
    }
    return sections;
  }

  return (
    <View style={styles.root}>
      <AppHeader backgroundColor={colors.vault.primary} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hero Slider */}
        <HeroCarousel slides={heroSlides} height={SCREEN_W * 0.75} autoPlayInterval={5000} />

        {/* Consultation CTA */}
        <View style={styles.consultBar}>
          <TouchableOpacity style={styles.consultBtn}
            onPress={() => setShowConsult(true)}>
            <Ionicons name="diamond" size={16} color={colors.vault.primary} />
            <Text style={styles.consultText}>Book Private Consultation</Text>
          </TouchableOpacity>
        </View>

        {/* Products */}
        {isLoading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.vault.accent} />
          </View>
        ) : allProducts.length > 0 ? (
          <View>
            {renderProductSections()}
            {hasMore && (
              <TouchableOpacity style={styles.loadMoreBtn} disabled={isFetching}
                onPress={() => { if (!isFetching) setPage((p) => p + 1); }}>
                {isFetching ? <ActivityIndicator size="small" color={colors.vault.accent} /> : (
                  <>
                    <Text style={styles.loadMoreText}>View More Pieces</Text>
                    <Ionicons name="chevron-down" size={18} color={colors.vault.accent} />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="diamond-outline" size={48} color="#333" />
            <Text style={[textStyles.h2, { color: '#FAFAFA', marginTop: 16 }]}>The Collection</Text>
            <Button title="Book Private Viewing" onPress={() => Linking.openURL('https://wa.me/255786454999')} variant="primary" color={colors.vault.accentBlue} style={{ marginTop: spacing.lg }} />
          </View>
        )}

        {/* Bottom Banner */}
        <View style={styles.bottomBanner}>
          <Ionicons name="diamond" size={32} color={colors.vault.accent} />
          <Text style={[textStyles.h2, { color: '#fff', marginTop: 12, textAlign: 'center' }]}>Private Viewings Available</Text>
          <Text style={styles.bottomDesc}>Experience our collection in an exclusive one-on-one session with our gemologists.</Text>
          <TouchableOpacity style={styles.bottomCta}
            onPress={() => Linking.openURL('https://wa.me/255786454999?text=I%20would%20like%20to%20book%20a%20private%20viewing')}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.bottomCtaText}>Book Now via WhatsApp</Text>
          </TouchableOpacity>
        </View>
        {/* Consultation Form Modal */}
        <FormModal
          visible={showConsult}
          onClose={() => setShowConsult(false)}
          title="Private Consultation"
          subtitle="Meet our gemologists for an exclusive viewing of our finest pieces."
          formType="consultation"
          accentColor={colors.vault.accent}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.vault.primary },
  consultBar: { backgroundColor: colors.vault.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, alignItems: 'center' },
  consultBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.vault.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6 },
  consultText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.vault.primary, letterSpacing: 1, textTransform: 'uppercase' },
  productGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  vaultCard: {
    width: CARD_W, backgroundColor: '#12121F', borderRadius: 8, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(201,169,98,0.1)', marginBottom: 4,
  },
  vaultImage: { width: '100%', aspectRatio: 0.85, backgroundColor: '#12121F' },
  vaultInfo: { padding: 10 },
  vaultSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 10, color: colors.vault.accentBlue, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  vaultName: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#E0E0E0', lineHeight: 17 },
  vaultPrice: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: colors.vault.accent, marginTop: 6 },
  vaultAddBtn: { position: 'absolute', bottom: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.vault.accent, alignItems: 'center', justifyContent: 'center' },
  breakerBanner: { backgroundColor: '#0F0F1A', marginHorizontal: spacing.lg, marginVertical: spacing.md, padding: spacing.lg, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,169,98,0.15)' },
  breakerTitle: { fontFamily: 'CormorantGaramond-Bold', fontSize: 22, color: '#FAFAFA', marginTop: 10, textAlign: 'center' },
  breakerSub: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, textAlign: 'center', lineHeight: 20 },
  loadMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: spacing.lg, marginVertical: spacing.lg, paddingVertical: 16, borderWidth: 1, borderColor: colors.vault.accent, borderRadius: 8 },
  loadMoreText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.vault.accent },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing['4xl'] },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  bottomBanner: { backgroundColor: '#0A0A14', padding: spacing.lg, paddingVertical: spacing.xl, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(201,169,98,0.1)' },
  bottomDesc: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 8, lineHeight: 20, maxWidth: 300 },
  bottomCta: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#25D366', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, marginTop: 20 },
  bottomCtaText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#fff' },
});
