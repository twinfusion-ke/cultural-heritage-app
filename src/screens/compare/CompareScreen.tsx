/**
 * CompareScreen — Side-by-side product comparison
 *
 * Shows up to 3 products in columns with attributes, prices.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { useCompareStore } from '../../stores/compareStore';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice, useCurrencyCode } from '../../utils/currency';
import { colors, textStyles, spacing } from '../../theme';

const siteNames: Record<string, string> = { market: 'Market', jewelry: 'Vault', gallery: 'Gallery' };
const accentMap: Record<string, string> = { market: colors.market.accent, jewelry: colors.vault.accent, gallery: colors.shared.gold };

export default function CompareScreen({ navigation }: any) {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const addToCart = useCartStore((s) => s.addItem);
  useCurrencyCode();

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader backgroundColor={colors.hub.primary} />
        <View style={styles.emptyWrap}>
          <Ionicons name="git-compare-outline" size={56} color={colors.hub.border} />
          <Text style={[textStyles.h2, { color: colors.hub.text, marginTop: 16 }]}>No Products to Compare</Text>
          <Text style={styles.emptyDesc}>Tap the compare icon on product pages to add up to 3 products.</Text>
        </View>
      </View>
    );
  }

  // Collect all unique attribute names
  const allAttrs: string[] = [];
  items.forEach(({ product }) => {
    (product.attributes || []).forEach((a) => {
      if (!allAttrs.includes(a.name)) allAttrs.push(a.name);
    });
  });

  return (
    <View style={styles.container}>
      <AppHeader backgroundColor={colors.hub.primary} />

      <View style={styles.titleBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.hub.text} />
        </TouchableOpacity>
        <Text style={[textStyles.h2, { color: colors.hub.text }]}>Compare ({items.length})</Text>
        <TouchableOpacity onPress={clear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.row}>
          {items.map(({ product, site }) => (
            <View key={product.id} style={styles.col}>
              <TouchableOpacity style={styles.removeBtn} onPress={() => remove(product.id)}>
                <Ionicons name="close-circle" size={22} color={colors.shared.error} />
              </TouchableOpacity>
              {product.images?.[0]?.src ? (
                <Image source={{ uri: product.images[0].src }} style={styles.productImage} contentFit="cover" cachePolicy="disk" />
              ) : (
                <View style={[styles.productImage, { backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="image-outline" size={24} color="#CCC" />
                </View>
              )}
              <Text style={[styles.siteBadge, { color: accentMap[site] || colors.shared.gold }]}>
                {(siteNames[site] || '').toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Names */}
        <CompareRow label="Product">
          {items.map(({ product }) => (
            <Text key={product.id} style={styles.cellName} numberOfLines={2}>{product.name}</Text>
          ))}
        </CompareRow>

        {/* Prices */}
        <CompareRow label="Price" highlight>
          {items.map(({ product }) => (
            <Text key={product.id} style={styles.cellPrice}>{formatPrice(product.price)}</Text>
          ))}
        </CompareRow>

        {/* Stock */}
        <CompareRow label="Availability">
          {items.map(({ product }) => (
            <View key={product.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: product.stock_status === 'instock' ? colors.shared.success : colors.shared.error }} />
              <Text style={styles.cellText}>{product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}</Text>
            </View>
          ))}
        </CompareRow>

        {/* Attributes */}
        {allAttrs.map((attrName) => (
          <CompareRow key={attrName} label={attrName}>
            {items.map(({ product }) => {
              const attr = product.attributes?.find((a) => a.name === attrName);
              return <Text key={product.id} style={styles.cellText}>{attr ? attr.options.join(', ') : '—'}</Text>;
            })}
          </CompareRow>
        ))}

        {/* Add to Cart buttons */}
        <View style={styles.row}>
          {items.map(({ product, site }) => (
            <View key={product.id} style={styles.col}>
              <TouchableOpacity
                style={[styles.cartBtn, { backgroundColor: accentMap[site] || colors.shared.gold }]}
                onPress={() => addToCart({ productId: product.id, name: product.name, price: product.price, imageUrl: product.images?.[0]?.src || '', site: site as any })}
              >
                <Ionicons name="bag-add-outline" size={16} color="#fff" />
                <Text style={styles.cartBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function CompareRow({ label, children, highlight }: { label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <View style={[styles.compareRow, highlight && { backgroundColor: 'rgba(197,160,89,0.06)' }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.row}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.background },
  titleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  clearText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.shared.error },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyDesc: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, textAlign: 'center', marginTop: 8 },
  row: { flexDirection: 'row' },
  col: { flex: 1, alignItems: 'center', padding: 8, position: 'relative' },
  removeBtn: { position: 'absolute', top: 4, right: 4, zIndex: 2 },
  productImage: { width: '100%', aspectRatio: 0.85, borderRadius: 8 },
  siteBadge: { fontFamily: 'Montserrat-SemiBold', fontSize: 9, letterSpacing: 1.5, marginTop: 6 },
  compareRow: { paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border },
  rowLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: colors.hub.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  cellName: { flex: 1, fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.hub.text, paddingHorizontal: 4, textAlign: 'center' },
  cellPrice: { flex: 1, fontFamily: 'Montserrat-Bold', fontSize: 16, color: colors.shared.gold, textAlign: 'center' },
  cellText: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.text, textAlign: 'center' },
  cartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  cartBtnText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#fff' },
});
