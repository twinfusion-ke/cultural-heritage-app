/**
 * Market Screen — Warm earthy tones, handcraft feel
 *
 * Terracotta accents, warm cream background, rounded category chips.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { ScreenContainer, ProductCard, Button, AppHeader } from '../../components';
import { useMarketProducts, useMarketCategories } from '../../api/market';
import { useCartStore } from '../../stores/cartStore';
import { colors, textStyles, spacing } from '../../theme';
import type { AppProduct } from '../../api/types';

export default function MarketScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<AppProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: products, isLoading, refetch, isRefetching, isFetching } = useMarketProducts({
    category: selectedCategory, page, perPage: 12,
  });
  const { data: categories } = useMarketCategories();
  const addItem = useCartStore((s) => s.addItem);

  React.useEffect(() => {
    if (products) {
      if (page === 1) setAllProducts(products);
      else setAllProducts((prev) => { const ids = new Set(prev.map((p) => p.id)); return [...prev, ...products.filter((p) => !ids.has(p.id))]; });
      setHasMore(products.length >= 12);
    }
  }, [products, page]);

  function handleAddToCart(p: AppProduct) {
    addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0]?.src || '', site: 'market' });
  }

  return (
    <View style={styles.root}>
      <AppHeader backgroundColor={colors.market.primary} />

      {/* Market Title Bar */}
      <View style={styles.titleBar}>
        <View>
          <Text style={styles.titleLabel}>THE MARKET</Text>
          <Text style={[textStyles.h2, { color: colors.market.primary }]}>Handcrafts & Artifacts</Text>
        </View>
        <Ionicons name="basket" size={24} color={colors.market.accent} />
      </View>

      {/* Category Chips */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={[{ id: 0, name: 'All', slug: 'all', count: 0 }, ...(categories || [])]}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const active = (item.id === 0 && !selectedCategory) || item.id === selectedCategory;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, active && styles.categoryActive]}
                onPress={() => { setSelectedCategory(item.id === 0 ? undefined : item.id); setPage(1); setAllProducts([]); setHasMore(true); }}
              >
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Product Grid */}
      {isLoading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.market.accent} />
          <Text style={styles.loadingText}>Loading handcrafts...</Text>
        </View>
      ) : (
        <FlatList
          data={allProducts}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching && page === 1}
          onRefresh={() => { setPage(1); setAllProducts([]); setHasMore(true); refetch(); }}
          onEndReached={() => { if (!isFetching && hasMore) setPage((p) => p + 1); }}
          onEndReachedThreshold={0.3}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductCard
              name={item.name} price={`$${item.price}`}
              imageUrl={item.images?.[0]?.src || ''} site="market"
              saleBadge={item.on_sale}
              onPress={() => navigation.navigate('ProductDetail', { product: item, site: 'market' })}
              onAddToCart={() => handleAddToCart(item)}
            />
          )}
          ListFooterComponent={isFetching && page > 1 ? <ActivityIndicator size="small" color={colors.market.accent} style={{ marginVertical: 20 }} /> : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={48} color={colors.market.border} />
              <Text style={[textStyles.h2, styles.emptyTitle]}>Products Coming Soon</Text>
              <Text style={styles.emptyDesc}>Our artisans are preparing their finest handcrafts for you.</Text>
              <Button title="Contact via WhatsApp" onPress={() => Linking.openURL('https://wa.me/255786454999?text=Hello!%20I%20am%20looking%20for%20handcrafts')} variant="outline" color={colors.market.accent} style={{ marginTop: spacing.lg }} />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.market.background },
  titleBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.market.background,
  },
  titleLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: colors.market.accent, letterSpacing: 2, marginBottom: 2 },
  categoriesContainer: { backgroundColor: colors.market.background, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.market.border },
  categoriesList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: colors.market.border, backgroundColor: colors.shared.white, borderRadius: 20 },
  categoryActive: { backgroundColor: colors.market.primary, borderColor: colors.market.primary },
  categoryText: { fontFamily: 'Montserrat-Medium', fontSize: 12, color: colors.market.text, textTransform: 'uppercase', letterSpacing: 1 },
  categoryTextActive: { color: colors.shared.white },
  productGrid: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing['2xl'] },
  productRow: { gap: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['4xl'] },
  loadingText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.market.textMuted, marginTop: spacing.md },
  emptyContainer: { alignItems: 'center', paddingTop: spacing['3xl'], paddingHorizontal: spacing.xl },
  emptyTitle: { color: colors.market.text, textAlign: 'center', marginTop: 16 },
  emptyDesc: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.market.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
});
