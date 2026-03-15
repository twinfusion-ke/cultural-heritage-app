/**
 * Market Screen — Tab 2: The Market (Handcrafts & Artifacts)
 *
 * Product grid with category filters, pull-to-refresh,
 * WhatsApp enquiry, and add-to-cart.
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
import { ScreenContainer, ProductCard, Button } from '../../components';
import { useMarketProducts, useMarketCategories } from '../../api/market';
import { useCartStore } from '../../stores/cartStore';
import { colors, textStyles, spacing } from '../../theme';
import type { WCProduct } from '../../types/woocommerce';

export default function MarketScreen() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [page, setPage] = useState(1);

  const { data: products, isLoading, refetch, isRefetching } = useMarketProducts({
    category: selectedCategory,
    page,
    perPage: 12,
  });
  const { data: categories } = useMarketCategories();
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart(product: WCProduct) {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images?.[0]?.src || '',
      site: 'market',
    });
  }

  function handleWhatsAppEnquiry(product: WCProduct) {
    const message = `Hello! I'm interested in: ${product.name} ($${product.price})`;
    Linking.openURL(`https://wa.me/255786454999?text=${encodeURIComponent(message)}`);
  }

  return (
    <ScreenContainer site="market" title="The Market" scrollable={false}>
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
              onPress={() => {
                setSelectedCategory(item.id === 0 ? undefined : item.id);
                setPage(1);
              }}
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.market.accent} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products || []}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductCard
              name={item.name}
              price={`$${item.price}`}
              imageUrl={item.images?.[0]?.src || ''}
              site="market"
              saleBadge={item.on_sale}
              onPress={() => handleWhatsAppEnquiry(item)}
            />
          )}
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
