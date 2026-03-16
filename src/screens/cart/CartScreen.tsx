/**
 * Cart Screen — Unified cart across Market, Vault, Gallery
 *
 * Shows all cart items grouped by site, quantity controls,
 * order summary, and WhatsApp checkout button.
 * Uses useSafeAreaInsets for edge-to-edge layout.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore, type CartItem } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { addToOutbox } from '../../db/outbox';
import { Button, Divider } from '../../components';
import { colors, textStyles, spacing } from '../../theme';
import type { SiteKey } from '../../config/environment';

const WHATSAPP_NUMBER = '255786454999';

const siteNames: Record<string, string> = {
  market: 'The Market',
  jewelry: 'The Vault',
  gallery: 'Art Gallery',
};

const siteAccents: Record<string, string> = {
  market: colors.market.accent,
  jewelry: colors.vault.accent,
  gallery: colors.shared.gold,
};

export default function CartScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const isOnline = useUIStore((s) => s.isOnline);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const total = getTotal();

  // Group items by site
  const grouped = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.site;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  async function handleCheckout() {
    if (items.length === 0) return;

    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to proceed.');
      return;
    }

    // Build WhatsApp message
    let message = `Hello! I would like to order from Cultural Heritage:\n\n`;
    message += `Name: ${name}\n`;
    if (email) message += `Email: ${email}\n`;
    if (phone) message += `Phone: ${phone}\n`;
    message += `\n`;

    for (const [site, siteItems] of Object.entries(grouped)) {
      message += `--- ${siteNames[site] || site} ---\n`;
      for (const item of siteItems) {
        message += `\u{2022} ${item.name} x${item.quantity} ($${(parseFloat(item.price) * item.quantity).toFixed(2)})\n`;
      }
      message += `\n`;
    }

    message += `Total: $${total.toFixed(2)}\n`;
    message += `\nSent from Cultural Heritage App`;

    // Queue order in outbox (works offline)
    for (const [site, siteItems] of Object.entries(grouped)) {
      const orderPayload = {
        payment_method: 'whatsapp',
        payment_method_title: 'WhatsApp Order',
        status: 'on-hold',
        billing: {
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          email: email || '',
          phone: phone || '',
        },
        line_items: siteItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        meta_data: [
          { key: '_ch_pos_order', value: 'true' },
          { key: '_ch_pos_terminal_id', value: 'MOBILE_APP' },
        ],
      };

      await addToOutbox(
        'order',
        site as SiteKey,
        '/wc/v3/orders',
        orderPayload,
        'POST'
      );
    }

    // Open WhatsApp (only if online)
    if (isOnline) {
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      await Linking.openURL(waUrl);
    } else {
      Alert.alert(
        'Order Queued',
        'Your order has been saved and will be sent via WhatsApp when you reconnect to the internet.',
        [{ text: 'OK' }]
      );
    }

    // Clear cart
    clearCart();
    navigation.goBack();
  }

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={[textStyles.h1, { color: colors.hub.text, textAlign: 'center' }]}>
            Your Cart is Empty
          </Text>
          <Text style={styles.emptyDesc}>
            Browse our collections to discover handcrafts, gemstones, and fine art from East Africa.
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => navigation.goBack()}
            variant="primary"
            color={colors.shared.gold}
            textColor={colors.hub.primary}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h2, { color: colors.hub.text }]}>Cart</Text>
        <TouchableOpacity onPress={() => Alert.alert('Clear Cart?', 'Remove all items?', [
          { text: 'Cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearCart },
        ])}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}>
        {/* Cart Items grouped by site */}
        {Object.entries(grouped).map(([site, siteItems]) => (
          <View key={site} style={styles.siteGroup}>
            <View style={[styles.siteHeader, { borderLeftColor: siteAccents[site] || colors.shared.gold }]}>
              <Text style={styles.siteName}>{siteNames[site] || site}</Text>
            </View>

            {siteItems.map((item) => (
              <View key={`${item.productId}-${item.site}`} style={styles.cartItem}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.itemImage}
                  contentFit="cover"
                  cachePolicy="disk"
                />
                <View style={styles.itemInfo}>
                  <Text style={[textStyles.body, styles.itemName]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[textStyles.price, { color: siteAccents[item.site] || colors.shared.gold }]}>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.productId, item.site, item.quantity - 1)}
                    >
                      <Text style={styles.qtyButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.productId, item.site, item.quantity + 1)}
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeItem(item.productId, item.site)}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Customer Details */}
        <View style={styles.detailsSection}>
          <Text style={[textStyles.label, styles.detailsTitle]}>YOUR DETAILS</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            placeholderTextColor={colors.hub.textMuted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email (optional)"
            placeholderTextColor={colors.hub.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone (optional)"
            placeholderTextColor={colors.hub.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={[textStyles.label, styles.detailsTitle]}>ORDER SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>Calculated after order</Text>
          </View>
          <Divider color={colors.hub.border} width={999} marginVertical={12} />
          <View style={styles.summaryRow}>
            <Text style={[textStyles.h2, { color: colors.hub.text }]}>Total</Text>
            <Text style={[textStyles.h2, { color: colors.shared.gold }]}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={[styles.checkoutBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          title={isOnline ? 'Complete via WhatsApp' : 'Queue Order (Offline)'}
          onPress={handleCheckout}
          variant="primary"
          size="lg"
          color={isOnline ? '#25D366' : colors.shared.warning}
          textColor={colors.shared.white}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.background },
  emptyContainer: { flex: 1, backgroundColor: colors.hub.background },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyIcon: { fontSize: 64, marginBottom: spacing.lg },
  emptyDesc: {
    fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted,
    textAlign: 'center', marginTop: spacing.sm, lineHeight: 22,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  backButton: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.hub.text },
  clearButton: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.error },
  scroll: { flex: 1 },
  scrollContent: {},
  siteGroup: { marginTop: spacing.md },
  siteHeader: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderLeftWidth: 3, marginLeft: spacing.lg,
  },
  siteName: {
    fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: colors.hub.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  cartItem: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  itemImage: { width: 80, height: 80, backgroundColor: '#F5F5F5' },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemName: { color: colors.hub.text, marginBottom: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  qtyButton: {
    width: 30, height: 30, borderWidth: 1, borderColor: colors.hub.border,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyButtonText: { fontFamily: 'Montserrat-Medium', fontSize: 16, color: colors.hub.text },
  qtyValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.hub.text, marginHorizontal: 8 },
  removeButton: { marginLeft: 'auto' },
  removeText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.shared.error },
  detailsSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  detailsTitle: { color: colors.hub.textMuted, marginBottom: spacing.md },
  input: {
    fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.text,
    borderWidth: 1, borderColor: colors.hub.border, paddingHorizontal: 14,
    paddingVertical: 12, marginBottom: spacing.sm, backgroundColor: colors.shared.white,
  },
  summarySection: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted },
  summaryValue: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.hub.text },
  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.shared.white, paddingHorizontal: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.hub.border,
  },
});
