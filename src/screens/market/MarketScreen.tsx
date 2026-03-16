/**
 * Market Screen — Tab 2: The Market (Handcrafts & Artifacts)
 *
 * Product grid with category filters, infinite scroll,
 * pull-to-refresh, QuickView modal, and add-to-cart.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer, ProductCard, Button, AppHeader } from '../../components';
import ProductQuickView from '../../components/ProductQuickView';
import { useMarketProducts, useMarketCategories } from '../../api/market';
import { useCartStore } from '../../stores/cartStore';
import { colors, textStyles, spacing } from '../../theme';
import type { WCProduct } from '../../types/woocommerce';

export default function MarketScreen() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<WCProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<WCProduct | null>(null);

  const { data: products, isLoading, refetch, isRefetching, isFetching } = useMarketProducts({
    category: selectedCategory,
    page,
    perPage: 12,
  });
  const { data: categories } = useMarketCategories();
  const addItem = useCartStore((s) => s.addItem);

  // Merge products when new page loads
  React.useEffect(() => {
    if (products) {
      if (page === 1) {
        setAllProducts(products);
      } else {
        setAllProducts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const newItems = products.filter((p) => !ids.has(p.id));
          return [...prev, ...newItems];
        });
      }
      setHasMore(products.length >= 12);
    }
  }, [products, page]);

  function handleAddToCart(product: WCProduct) {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images?.[0]?.src || '',
      site: 'market',
    });
  }

  function handleLoadMore() {
    if (!isFetching && hasMore) {
      setPage((p) => p + 1);
    }
  }

  function handleCategoryChange(id: number | undefined) {
    setSelectedCategory(id);
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
  }

  function handleRefresh() {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
    refetch();
  }

  return (
    <ScreenContainer site="market" scrollable={false}>
      <AppHeader backgroundColor={colors.market.primary} />
      {/* Category Chips */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={[{ id: 0, name: 'All', slug: 'all', count: 0 }, ...(categories || [])]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                (item.id === 0 && !selectedCategory) || item.id === selectedCategory
                  ? styles.categoryActive
                  : null,
              ]}
              onPress={() => handleCategoryChange(item.id === 0 ? undefined : item.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  (item.id === 0 && !selectedCategory) || item.id === selectedCategory
                    ? styles.categoryTextActive
                    : null,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product Grid */}
      {isLoading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.market.accent} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={allProducts}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching && page === 1}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductCard
              name={item.name}
              price={`$${item.price}`}
              imageUrl={item.images?.[0]?.src || ''}
              site="market"
              saleBadge={item.on_sale}
              onPress={() => setSelectedProduct(item)}
              onAddToCart={() => handleAddToCart(item)}
            />
          )}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator size="small" color={colors.market.accent} style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛍</Text>
              <Text style={[textStyles.h2, styles.emptyTitle]}>Products Coming Soon</Text>
              <Text style={styles.emptyDesc}>
                Our artisans are preparing their finest handcrafts for you.
              </Text>
              <Button
                title="Contact Us on WhatsApp"
                onPress={() => Linking.openURL('https://wa.me/255786454999?text=Hello!%20I%20am%20looking%20for%20handcrafts%20and%20artifacts')}
                variant="outline"
                color={colors.market.accent}
                style={{ marginTop: spacing.lg }}
              />
            </View>
          }
        />
      )}

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        site="market"
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    backgroundColor: colors.market.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.market.border,
  },
  categoriesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.market.border,
    backgroundColor: colors.shared.white,
  },
  categoryActive: {
    backgroundColor: colors.market.primary,
    borderColor: colors.market.primary,
  },
  categoryText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 11,
    color: colors.market.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryTextActive: {
    color: colors.shared.white,
  },
  productGrid: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  productRow: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing['4xl'],
  },
  loadingText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: colors.market.textMuted,
    marginTop: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.market.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: colors.market.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
