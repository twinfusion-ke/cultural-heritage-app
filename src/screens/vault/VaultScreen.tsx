/**
 * Vault Screen — Luxury dark theme, tanzanite blue accents
 *
 * Near-black background, gold/blue accents, premium card styling.
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
import { ScreenContainer, ProductCard, Button, Divider, AppHeader } from '../../components';
import { useJewelryProducts } from '../../api/jewelry';
import { useCartStore } from '../../stores/cartStore';
import { colors, textStyles, spacing } from '../../theme';
import type { AppProduct } from '../../api/types';

export default function VaultScreen() {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<AppProduct[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: products, isLoading, refetch, isRefetching, isFetching } = useJewelryProducts({ page, perPage: 12 });
  const addItem = useCartStore((s) => s.addItem);

  React.useEffect(() => {
    if (products) {
      if (page === 1) setAllProducts(products);
      else setAllProducts((prev) => { const ids = new Set(prev.map((p) => p.id)); return [...prev, ...products.filter((p) => !ids.has(p.id))]; });
      setHasMore(products.length >= 12);
    }
  }, [products, page]);

  function handleAddToCart(p: AppProduct) {
    addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.images?.[0]?.src || '', site: 'jewelry' });
  }

  const ListHeader = (
    <View style={styles.heroBanner}>
      <View style={styles.heroAccent} />
      <Text style={[textStyles.label, { color: colors.vault.accentBlue, letterSpacing: 3 }]}>FOUND ONLY IN TANZANIA</Text>
      <Text style={[textStyles.h1, styles.heroTitle]}>Rare Gemstones{'\n'}& Fine Jewelry</Text>
      <Divider color={colors.vault.accentBlue} width={40} marginVertical={12} />
      <Text style={styles.heroSub}>Each piece certified, ethically sourced, and handcrafted in Arusha</Text>
      <TouchableOpacity style={styles.consultBtn} onPress={() => Linking.openURL('https://wa.me/255786454999?text=I%20would%20like%20a%20private%20consultation')}>
        <Ionicons name="diamond" size={16} color={colors.vault.primary} />
        <Text style={styles.consultBtnText}>Book Private Viewing</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
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
          style={{ backgroundColor: colors.vault.primary }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching && page === 1}
          onRefresh={() => { setPage(1); setAllProducts([]); setHasMore(true); refetch(); }}
          onEndReached={() => { if (!isFetching && hasMore) setPage((p) => p + 1); }}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={ListHeader}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const stoneType = item.attributes?.find((a) => a.name.toLowerCase().includes('stone'))?.options?.[0];
            const carat = item.attributes?.find((a) => a.name.toLowerCase().includes('carat'))?.options?.[0];
            const subtitle = [stoneType, carat].filter(Boolean).join(' · ');
            return (
              <View style={styles.vaultCard}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('ProductDetail', { product: item, site: 'jewelry' })}
                >
                  {item.images?.[0]?.src ? (
                    <Image source={{ uri: item.images[0].src }} style={styles.vaultImage} contentFit="cover" cachePolicy="disk" transition={200} />
                  ) : (
                    <View style={[styles.vaultImage, { backgroundColor: '#12121F', alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="diamond-outline" size={28} color="#333" />
                    </View>
                  )}
                  <View style={styles.vaultInfo}>
                    {subtitle ? <Text style={styles.vaultSubtitle}>{subtitle}</Text> : null}
                    <Text style={styles.vaultName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.vaultPrice}>${item.price}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vaultAddBtn} onPress={() => handleAddToCart(item)}>
                  <Ionicons name="bag-add-outline" size={16} color={colors.vault.primary} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListFooterComponent={isFetching && page > 1 ? <ActivityIndicator size="small" color={colors.vault.accent} style={{ marginVertical: 20 }} /> : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="diamond-outline" size={48} color="#333" />
              <Text style={[textStyles.h2, { color: '#FAFAFA', textAlign: 'center', marginTop: 16 }]}>The Collection</Text>
              <Text style={styles.emptyDesc}>Our curated selection of tanzanite and precious gemstones will be available here soon.</Text>
              <Button title="Book Private Viewing" onPress={() => Linking.openURL('https://wa.me/255786454999?text=I%20would%20like%20a%20private%20consultation')} variant="primary" color={colors.vault.accentBlue} style={{ marginTop: spacing.lg }} />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.vault.primary },
  heroBanner: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, alignItems: 'center', backgroundColor: colors.vault.primary },
  heroAccent: { width: 1, height: 30, backgroundColor: colors.vault.accentBlue, marginBottom: 16, opacity: 0.5 },
  heroTitle: { color: '#FAFAFA', textAlign: 'center', marginTop: 8 },
  heroSub: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(250,250,250,0.4)', textAlign: 'center', letterSpacing: 0.3 },
  consultBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.vault.accent, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 6, marginTop: 20,
  },
  consultBtnText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.vault.primary, letterSpacing: 1, textTransform: 'uppercase' },
  productGrid: { paddingHorizontal: spacing.lg, paddingBottom: 80 },
  productRow: { gap: 10, marginTop: 10 },
  vaultCard: {
    flex: 1, backgroundColor: '#12121F', borderRadius: 8, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(201,169,98,0.1)',
  },
  vaultImage: { width: '100%', aspectRatio: 0.85 },
  vaultInfo: { padding: 10 },
  vaultSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 10, color: colors.vault.accentBlue, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  vaultName: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#E0E0E0', lineHeight: 17 },
  vaultPrice: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: colors.vault.accent, marginTop: 6 },
  vaultAddBtn: {
    position: 'absolute', bottom: 10, right: 10,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.vault.accent, alignItems: 'center', justifyContent: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.vault.primary },
  emptyContainer: { alignItems: 'center', paddingTop: spacing['3xl'], paddingHorizontal: spacing.xl },
  emptyDesc: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: 'rgba(250,250,250,0.4)', textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
});
