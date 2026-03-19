/**
 * ProductDetailScreen — Immersive product view
 *
 * Image carousel, attributes, description, sticky add-to-cart bar.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Linking,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import Toast from '../../components/Toast';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useCompareStore } from '../../stores/compareStore';
import { colors, textStyles, spacing } from '../../theme';
import { formatPrice, useCurrencyCode } from '../../utils/currency';
import type { AppProduct } from '../../api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHATSAPP_NUMBER = '255786454999';

const siteNames: Record<string, string> = {
  market: 'The Market',
  jewelry: 'The Vault',
  gallery: 'Art Gallery',
};

const accentMap: Record<string, string> = {
  market: colors.market.accent,
  jewelry: colors.vault.accent,
  gallery: colors.shared.gold,
};

export default function ProductDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { product, site } = route.params as { product: AppProduct; site: string };
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.getItemCount());
  const addRecentlyViewed = useUIStore((s) => s.addRecentlyViewed);
  useCurrencyCode();

  // Track recently viewed
  useEffect(() => {
    addRecentlyViewed({ id: product.id, name: product.name, price: product.price, imageUrl: images[0]?.src || '', site });
  }, [product.id]);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFav = useFavoritesStore((s) => s.isFavorite(product.id, site));
  const addCompare = useCompareStore((s) => s.add);
  const isComparing = useCompareStore((s) => s.isComparing(product.id));
  const compareCount = useCompareStore((s) => s.items.length);

  const accent = accentMap[site] || colors.shared.gold;
  const images = product.images?.length ? product.images : [{ src: '', alt: '' }];
  const attrs = product.attributes?.filter((a) => a.visible !== false) || [];

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: images[0]?.src || '',
        site: site as any,
      });
    }
    setShowToast(true);
  }

  function handleToggleFavorite() {
    toggle({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: images[0]?.src || '',
      site,
    });
  }

  function handleWhatsApp() {
    const attrLines = attrs.map((a) => `${a.name}: ${a.options.join(', ')}`).join('\n');
    const msg = `Hello! I'm interested in:\n\n${product.name}\nPrice: $${product.price}\n${attrLines}\n\nFrom ${siteNames[site] || 'Cultural Heritage'}.\nPlease provide more details.`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  }

  async function handleShare() {
    try {
      await Share.share({ message: `${product.name} — $${product.price} at Cultural Heritage Centre` });
    } catch {}
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Toast message={`${quantity}x ${product.name} added to cart!`} visible={showToast} onHide={() => setShowToast(false)} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.hub.text} />
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity onPress={() => {
            if (isComparing) { navigation.navigate('Compare'); }
            else {
              const added = addCompare(product, site);
              if (!added) Alert.alert('Compare Full', 'You can compare up to 3 products. Remove one first.');
              else setShowToast(false); // reset
            }
          }} style={styles.topBtn}>
            <Ionicons name={isComparing ? 'git-compare' : 'git-compare-outline'} size={22} color={isComparing ? colors.shared.gold : colors.hub.text} />
            {compareCount > 0 && <View style={styles.compareBadge}><Text style={styles.compareBadgeText}>{compareCount}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.topBtn}>
            <Ionicons name="share-outline" size={22} color={colors.hub.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.topBtn}>
            <Ionicons name="bag-outline" size={22} color={colors.hub.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveImageIndex(idx);
          }}
          renderItem={({ item }) => (
            <View style={styles.imageSlide}>
              {item.src ? (
                <Image source={{ uri: item.src }} style={styles.productImage} contentFit="cover" cachePolicy="disk" />
              ) : (
                <View style={[styles.productImage, styles.imagePlaceholder]}>
                  <Ionicons name="image-outline" size={48} color={colors.hub.border} />
                </View>
              )}
            </View>
          )}
        />

        {/* Image Dots */}
        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImageIndex && { backgroundColor: accent }]} />
            ))}
          </View>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={[textStyles.label, { color: accent }]}>
            {(siteNames[site] || 'CULTURAL HERITAGE').toUpperCase()}
          </Text>
          <Text style={[textStyles.h1, styles.productName]}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            {product.on_sale && product.regular_price ? (
              <>
                <Text style={[styles.price, { color: accent }]}>{formatPrice(product.sale_price || product.price)}</Text>
                <Text style={styles.oldPrice}>{formatPrice(product.regular_price)}</Text>
              </>
            ) : (
              <Text style={[styles.price, { color: accent }]}>{formatPrice(product.price)}</Text>
            )}
          </View>

          {/* Favorite */}
          <TouchableOpacity style={styles.favRow} onPress={handleToggleFavorite}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? colors.shared.error : colors.hub.textMuted} />
            <Text style={styles.favText}>{isFav ? 'Saved to Favorites' : 'Add to Favorites'}</Text>
          </TouchableOpacity>
        </View>

        {/* Attributes */}
        {attrs.length > 0 && (
          <View style={styles.attrsSection}>
            <Text style={[textStyles.label, { color: colors.hub.textMuted, marginBottom: 12 }]}>DETAILS</Text>
            {attrs.map((attr, i) => (
              <View key={i} style={styles.attrRow}>
                <Text style={styles.attrLabel}>{attr.name}</Text>
                <Text style={styles.attrValue}>{attr.options.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        {(product.description || product.short_description) && (
          <View style={styles.descSection}>
            <Text style={[textStyles.label, { color: colors.hub.textMuted, marginBottom: 12 }]}>DESCRIPTION</Text>
            <Text style={styles.descText}>
              {(product.short_description || product.description || '').replace(/<[^>]+>/g, '').trim()}
            </Text>
          </View>
        )}

        {/* WhatsApp Enquiry */}
        <TouchableOpacity style={styles.waRow} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.waTitle}>Have questions?</Text>
            <Text style={styles.waSubtitle}>Chat with us on WhatsApp</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.hub.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom — Quantity + Add to Cart */}
      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.qtyControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Ionicons name="remove" size={18} color={colors.hub.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add" size={18} color={colors.hub.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, { backgroundColor: accent }]}
          onPress={handleAddToCart}
          disabled={product.stock_status === 'outofstock'}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-add-outline" size={18} color={site === 'jewelry' ? '#fff' : colors.hub.primary} />
          <Text style={[styles.addToCartText, { color: site === 'jewelry' ? '#fff' : colors.hub.primary }]}>
            Add to Cart — {formatPrice(parseFloat(product.price || '0') * quantity)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.sm, height: 48, backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  topBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topRight: { flexDirection: 'row' },
  compareBadge: { position: 'absolute', top: 2, right: 0, backgroundColor: colors.shared.gold, borderRadius: 7, minWidth: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  compareBadgeText: { fontFamily: 'Montserrat-Bold', fontSize: 8, color: colors.hub.primary },
  cartBadge: {
    position: 'absolute', top: 2, right: 0, backgroundColor: colors.shared.gold,
    borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontFamily: 'Montserrat-Bold', fontSize: 9, color: colors.hub.primary },
  scroll: { flex: 1 },
  imageSlide: { width: SCREEN_WIDTH },
  productImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.85, backgroundColor: '#F5F5F5' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD' },
  infoSection: { padding: spacing.lg },
  productName: { color: colors.hub.text, marginTop: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  price: { fontFamily: 'Montserrat-Bold', fontSize: 24 },
  oldPrice: {
    fontFamily: 'Montserrat-Regular', fontSize: 16, color: colors.hub.textMuted,
    textDecorationLine: 'line-through',
  },
  favRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16,
    paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hub.border,
  },
  favText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.hub.textMuted },
  attrsSection: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderTopWidth: 6, borderTopColor: '#F5F5F5',
  },
  attrRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  attrLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: colors.hub.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  attrValue: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.text },
  descSection: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderTopWidth: 6, borderTopColor: '#F5F5F5',
  },
  descText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#555', lineHeight: 24 },
  waRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, padding: 16, borderRadius: 8,
    backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: '#C6F6D5',
  },
  waTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.hub.text },
  waSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, marginTop: 1 },
  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', paddingHorizontal: spacing.md, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.hub.border,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.hub.border, borderRadius: 8 },
  qtyBtn: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: colors.hub.text, paddingHorizontal: 8 },
  addToCartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 8,
  },
  addToCartText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, letterSpacing: 0.5 },
});
