/**
 * ProductQuickView — Modal overlay for product details
 *
 * Shows full product info with image gallery, attributes,
 * WhatsApp enquiry, and add-to-cart in a bottom sheet modal.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../stores/cartStore';
import { colors, textStyles, spacing } from '../theme';
import type { WCProduct } from '../types/woocommerce';
import type { SiteKey } from '../config/environment';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface ProductQuickViewProps {
  product: WCProduct | null;
  site: SiteKey;
  visible: boolean;
  onClose: () => void;
}

export default function ProductQuickView({
  product,
  site,
  visible,
  onClose,
}: ProductQuickViewProps) {
  const insets = useSafeAreaInsets();
  const addItem = useCartStore((s) => s.addItem);
  const accent = accentMap[site] || colors.shared.gold;

  if (!product) return null;

  const mainImage = product.images?.[0]?.src;
  const additionalImages = product.images?.slice(1, 4) || [];
  const attrs = product.attributes?.filter((a) => a.visible !== false) || [];

  function handleAddToCart() {
    addItem({
      productId: product!.id,
      name: product!.name,
      price: product!.price,
      imageUrl: mainImage || '',
      site,
    });
    onClose();
  }

  function handleWhatsApp() {
    const attrLines = attrs
      .map((a) => `${a.name}: ${a.options.join(', ')}`)
      .join('\n');
    const message = `Hello! I'm interested in:\n\n${product!.name}\nPrice: $${product!.price}\n${attrLines}\n\nFrom ${siteNames[site] || 'Cultural Heritage'}.\nPlease provide more details.`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Close handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Main Image */}
            {mainImage && (
              <Image
                source={{ uri: mainImage }}
                style={styles.mainImage}
                contentFit="cover"
                cachePolicy="disk"
                transition={300}
              />
            )}

            {/* Thumbnail strip */}
            {additionalImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbStrip}>
                {product.images.map((img, i) => (
                  <Image
                    key={img.id || i}
                    source={{ uri: img.src }}
                    style={[styles.thumb, i === 0 && { borderColor: accent, borderWidth: 2 }]}
                    contentFit="cover"
                    cachePolicy="disk"
                  />
                ))}
              </ScrollView>
            )}

            {/* Product Info */}
            <View style={styles.infoSection}>
              <Text style={[textStyles.label, { color: accent }]}>
                {(siteNames[site] || 'Cultural Heritage').toUpperCase()}
              </Text>
              <Text style={[textStyles.h2, styles.productName]}>{product.name}</Text>

              {/* Price */}
              <View style={styles.priceRow}>
                {product.on_sale && product.regular_price ? (
                  <>
                    <Text style={[styles.salePrice, { color: accent }]}>
                      ${product.sale_price || product.price}
                    </Text>
                    <Text style={styles.regularPrice}>${product.regular_price}</Text>
                  </>
                ) : (
                  <Text style={[styles.salePrice, { color: accent }]}>${product.price}</Text>
                )}
                {product.stock_status === 'outofstock' && (
                  <View style={styles.outOfStockBadge}>
                    <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                  </View>
                )}
              </View>

              {/* Attributes */}
              {attrs.length > 0 && (
                <View style={styles.attrsSection}>
                  {attrs.map((attr) => (
                    <View key={attr.id || attr.name} style={styles.attrRow}>
                      <Text style={styles.attrLabel}>{attr.name}</Text>
                      <Text style={styles.attrValue}>{attr.options.join(', ')}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Short Description */}
              {product.short_description ? (
                <Text style={styles.description}>
                  {product.short_description.replace(/<[^>]+>/g, '').trim()}
                </Text>
              ) : null}

              {/* SKU */}
              {product.sku ? (
                <Text style={styles.sku}>SKU: {product.sku}</Text>
              ) : null}
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cartBtn, { backgroundColor: accent }]}
              onPress={handleAddToCart}
              disabled={product.stock_status === 'outofstock'}
            >
              <Text style={[styles.cartBtnText, { color: site === 'jewelry' ? '#fff' : colors.hub.primary }]}>
                Add to Cart
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
              <Text style={styles.waBtnText}>💬 Enquire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: colors.hub.textMuted,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: '#F5F5F5',
    marginTop: 12,
  },
  thumbStrip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  thumb: {
    width: 56,
    height: 56,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  productName: {
    color: colors.hub.text,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  salePrice: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
  },
  regularPrice: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: colors.hub.textMuted,
    textDecorationLine: 'line-through',
  },
  outOfStockBadge: {
    backgroundColor: colors.shared.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  outOfStockText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 1,
  },
  attrsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hub.border,
  },
  attrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  attrLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 11,
    color: colors.hub.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  attrValue: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: colors.hub.text,
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: colors.hub.textMuted,
    lineHeight: 22,
    marginTop: 12,
  },
  sku: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 11,
    color: colors.hub.textMuted,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.hub.border,
  },
  cartBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cartBtnText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  waBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.hub.border,
    alignItems: 'center',
  },
  waBtnText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 13,
    color: colors.hub.text,
  },
});
