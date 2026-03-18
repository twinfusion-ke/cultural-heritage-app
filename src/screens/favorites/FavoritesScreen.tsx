/**
 * FavoritesScreen — Wishlist of saved items
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { useFavoritesStore, type FavoriteItem } from '../../stores/favoritesStore';
import { useCartStore } from '../../stores/cartStore';
import { colors, textStyles, spacing } from '../../theme';

const accentMap: Record<string, string> = {
  market: colors.market.accent,
  jewelry: colors.vault.accent,
  gallery: colors.shared.gold,
};

const siteNames: Record<string, string> = {
  market: 'The Market',
  jewelry: 'The Vault',
  gallery: 'Art Gallery',
};

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const items = useFavoritesStore((s) => s.items);
  const toggle = useFavoritesStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart(item: FavoriteItem) {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      site: item.site as any,
    });
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader backgroundColor={colors.hub.primary} />
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={56} color={colors.hub.border} />
          <Text style={[textStyles.h2, { color: colors.hub.text, marginTop: 16 }]}>
            No Favorites Yet
          </Text>
          <Text style={styles.emptyDesc}>
            Tap the heart icon on any product to save it here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader backgroundColor={colors.hub.primary} />
      <View style={styles.titleBar}>
        <Text style={[textStyles.h2, { color: colors.hub.text }]}>Favorites</Text>
        <Text style={styles.countText}>{items.length} items</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.site}-${item.productId}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const accent = accentMap[item.site] || colors.shared.gold;
          return (
            <View style={styles.card}>
              <TouchableOpacity activeOpacity={0.9} style={styles.cardInner}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" cachePolicy="disk" />
                ) : (
                  <View style={[styles.cardImage, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={24} color={colors.hub.border} />
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={[styles.siteBadge, { color: accent }]}>
                    {(siteNames[item.site] || '').toUpperCase()}
                  </Text>
                  <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                  <Text style={[styles.cardPrice, { color: accent }]}>${item.price}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleAddToCart(item)}>
                  <Ionicons name="bag-add-outline" size={18} color={accent} />
                  <Text style={[styles.actionText, { color: accent }]}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggle(item)}>
                  <Ionicons name="heart-dislike-outline" size={18} color={colors.shared.error} />
                  <Text style={[styles.actionText, { color: colors.shared.error }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.background },
  titleBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  countText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyDesc: {
    fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted,
    textAlign: 'center', marginTop: 8, lineHeight: 22,
  },
  list: { paddingBottom: 40 },
  card: {
    backgroundColor: colors.shared.white, marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: 8, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  cardInner: { flexDirection: 'row' },
  cardImage: { width: 100, height: 100 },
  imagePlaceholder: { backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  siteBadge: { fontFamily: 'Montserrat-SemiBold', fontSize: 9, letterSpacing: 1.5 },
  cardName: { fontFamily: 'Montserrat-Medium', fontSize: 15, color: colors.hub.text, marginTop: 4 },
  cardPrice: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, marginTop: 6 },
  cardActions: {
    flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hub.border,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
  },
  actionText: { fontFamily: 'Montserrat-Medium', fontSize: 12 },
});
