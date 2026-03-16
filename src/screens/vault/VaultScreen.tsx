/**
 * Vault Screen — Tab 3: Jewelry / The Vault
 *
 * Luxury product grid with infinite scroll, QuickView modal,
 * deep-zoom ready images, WhatsApp enquiry.
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
import { ScreenContainer, ProductCard, Button, Divider, AppHeader } from '../../components';
import ProductQuickView from '../../components/ProductQuickView';
import { useJewelryProducts } from '../../api/jewelry';
import { useCartStore } from '../../stores/cartStore';
import { colors, textStyles, spacing } from '../../theme';
import type { WCProduct } from '../../types/woocommerce';

export default function VaultScreen() {
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<WCProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<WCProduct | null>(null);

  const { data: products, isLoading, refetch, isRefetching, isFetching } = useJewelryProducts({
    page,
    perPage: 12,
  });
  const addItem = useCartStore((s) => s.addItem);

  React.useEffect(() => {
    if (products) {
      if (page === 1) {
        setAllProducts(products);
      } else {
        setAllProducts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...products.filter((p) => !ids.has(p.id))];
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
      site: 'jewelry',
    });
  }

  function handleLoadMore() {
    if (!isFetching && hasMore) setPage((p) => p + 1);
  }

  function handleRefresh() {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
    refetch();
  }

  const ListHeader = (
    <View style={styles.heroBanner}>
      <Text style={[textStyles.label, { color: colors.vault.accentBlue }]}>
        FOUND ONLY IN TANZANIA
      </Text>
      <Text style={[textStyles.h1, styles.heroTitle]}>
        Rare Gemstones{'\n'}& Fine Jewelry
      </Text>
      <Divider color={colors.vault.accentBlue} width={40} marginVertical={12} />
      <Text style={styles.heroSub}>
        Each piece certified, ethically sourced, and handcrafted in Arusha
      </Text>
    </View>
  );

  return (
    <ScreenContainer site="jewelry" scrollable={false}>
      <AppHeader backgroundColor={colors.vault.primary} />

      {isLoading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.vault.accent} />
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
          ListHeaderComponent={ListHeader}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const stoneType = item.attributes?.find((a) => a.name.toLowerCase().includes('stone'))?.options?.[0];
            const carat = item.attributes?.find((a) => a.name.toLowerCase().includes('carat'))?.options?.[0];
            const subtitle = [stoneType, carat].filter(Boolean).join(' · ');

            return (
              <ProductCard
                name={item.name}
                price={`$${item.price}`}
                imageUrl={item.images?.[0]?.src || ''}
                site="jewelry"
                subtitle={subtitle}
                saleBadge={item.on_sale}
                onPress={() => setSelectedProduct(item)}
                onAddToCart={() => handleAddToCart(item)}
              />
            );
          }}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator size="small" color={colors.vault.accent} style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💎</Text>
              <Text style={[textStyles.h2, styles.emptyTitle]}>The Collection</Text>
              <Text style={styles.emptyDesc}>
                Our curated selection of tanzanite and precious gemstones will be available here soon.
              </Text>
              <Button
                title="Book Private Viewing"
                onPress={() => Linking.openURL('https://wa.me/255786454999?text=I%20would%20like%20to%20book%20a%20private%20consultation')}
                variant="primary"
                color={colors.vault.accentBlue}
                style={{ marginTop: spacing.lg }}
              />
              <Button
                title="Contact Us on WhatsApp"
                onPress={() => Linking.openURL('https://wa.me/255786454999?text=Hello!%20I%20am%20interested%20in%20tanzanite%20and%20fine%20jewelry')}
                variant="outline"
                color={colors.vault.accent}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          }
        />
      )}

      {/* Consultation CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => Linking.openURL('https://wa.me/255786454999?text=I%20would%20like%20a%20private%20consultation')}
        >
          <Text style={styles.ctaText}>Book Private Consultation</Text>
        </TouchableOpacity>
      </View>

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        site="jewelry"
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    backgroundColor: colors.vault.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FAFAFA',
    textAlign: 'center',
    marginTop: 8,
  },
  heroSub: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: 'rgba(250,250,250,0.5)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  productGrid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
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
    color: colors.vault.text,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: colors.vault.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.vault.primary,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(250,250,250,0.05)',
  },
  ctaButton: {
    backgroundColor: colors.vault.accentBlue,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
    color: colors.shared.white,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
