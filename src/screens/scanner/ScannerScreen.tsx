/**
 * ScannerScreen — QR Code Scanner for Gallery Concierge
 *
 * Scans QR codes on artworks, fetches product data,
 * shows reserve/add-to-cart UI.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
  Modal,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appApi } from '../../api/appApi';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { formatPrice, useCurrencyCode } from '../../utils/currency';
import { colors, textStyles, spacing } from '../../theme';
import Toast from '../../components/Toast';

export default function ScannerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [showProduct, setShowProduct] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const token = useAuthStore((s) => s.token);
  useCurrencyCode();

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionWrap}>
          <Ionicons name="camera-outline" size={64} color={colors.shared.gold} />
          <Text style={[textStyles.h2, { color: '#fff', marginTop: 20, textAlign: 'center' }]}>
            Camera Access Required
          </Text>
          <Text style={styles.permDesc}>
            We need camera access to scan QR codes on artworks and exhibition items.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Ionicons name="camera" size={18} color={colors.hub.primary} />
            <Text style={styles.permBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    Vibration.vibrate(100);

    try {
      // QR data format: "CH:site:product_id" or just a product ID/SKU
      let site = 'gallery';
      let productId = '';

      if (data.startsWith('CH:')) {
        const parts = data.split(':');
        site = parts[1] || 'gallery';
        productId = parts[2] || '';
      } else if (data.match(/^\d+$/)) {
        productId = data;
      } else {
        // Try as SKU search
        productId = data;
      }

      const result = await appApi('product', { site, id: productId });

      if (result) {
        setProduct({ ...result, _site: site });
        setShowProduct(true);
      } else {
        Alert.alert('Not Found', 'This QR code does not match any artwork in our collection.', [
          { text: 'Scan Again', onPress: () => setScanned(false) },
        ]);
      }
    } catch {
      Alert.alert('Scan Error', 'Could not look up this item. Please try again.', [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReserve() {
    if (!product) return;
    if (!token) {
      Alert.alert('Login Required', 'Please login to reserve items.', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => { setShowProduct(false); navigation.navigate('Auth'); } },
      ]);
      return;
    }

    try {
      const res = await appApi('reserve', {
        token,
        product_id: product.id,
        site: product._site,
      });

      if (res.success) {
        setToastMsg(`Reserved: ${product.name} (2hr hold)`);
        setShowToast(true);
        setShowProduct(false);
        setScanned(false);
      } else {
        Alert.alert('Cannot Reserve', res.error || 'This item may already be reserved.');
      }
    } catch {
      // Fallback: add to cart
      addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.images?.[0]?.src || '', site: product._site });
      setToastMsg(`Added to cart: ${product.name}`);
      setShowToast(true);
      setShowProduct(false);
      setScanned(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.images?.[0]?.src || '', site: product._site });
    setToastMsg(`Added to cart: ${product.name}`);
    setShowToast(true);
    setShowProduct(false);
    setScanned(false);
  }

  return (
    <View style={styles.container}>
      <Toast message={toastMsg} visible={showToast} onHide={() => setShowToast(false)} />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={[styles.topOverlay, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.scanTitle}>Scan Artwork</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scan Frame */}
      <View style={styles.frameWrap}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        {loading && <ActivityIndicator size="large" color={colors.shared.gold} style={{ marginTop: 20 }} />}
      </View>

      <View style={styles.bottomOverlay}>
        <Text style={styles.instruction}>Point camera at QR code on the artwork</Text>
        {scanned && !loading && (
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product Modal */}
      <Modal visible={showProduct} transparent animationType="slide" onRequestClose={() => { setShowProduct(false); setScanned(false); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.productSheet}>
            <View style={styles.handleRow}>
              <View style={styles.handle} />
              <TouchableOpacity onPress={() => { setShowProduct(false); setScanned(false); }} style={styles.modalClose}>
                <Ionicons name="close" size={22} color={colors.hub.textMuted} />
              </TouchableOpacity>
            </View>

            {product && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {product.images?.[0]?.src && (
                  <Image source={{ uri: product.images[0].src }} style={styles.productImage} contentFit="cover" cachePolicy="disk" />
                )}
                <View style={styles.productInfo}>
                  <Text style={[textStyles.label, { color: colors.shared.gold }]}>SCANNED ARTWORK</Text>
                  <Text style={[textStyles.h2, { color: colors.hub.text, marginTop: 4 }]}>{product.name}</Text>
                  <Text style={[styles.productPrice]}>{formatPrice(product.price)}</Text>

                  {product.short_description && (
                    <Text style={styles.productDesc}>{product.short_description.replace(/<[^>]+>/g, '')}</Text>
                  )}

                  <View style={styles.productActions}>
                    <TouchableOpacity style={styles.reserveBtn} onPress={handleReserve}>
                      <Ionicons name="time-outline" size={18} color="#fff" />
                      <Text style={styles.reserveBtnText}>Reserve (2hr Hold)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
                      <Ionicons name="bag-add-outline" size={18} color={colors.shared.gold} />
                      <Text style={styles.cartBtnText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.viewDetailBtn}
                    onPress={() => { setShowProduct(false); setScanned(false); navigation.navigate('ProductDetail', { product, site: product._site }); }}>
                    <Text style={styles.viewDetailText}>View Full Details</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.shared.gold} />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: colors.hub.primary },
  permDesc: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 12, lineHeight: 24 },
  permBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.shared.gold, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8, marginTop: 24 },
  permBtnText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: colors.hub.primary },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scanTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#fff' },
  frameWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 250, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: colors.shared.gold },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  bottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 16 },
  instruction: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  rescanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  rescanText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#fff' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  productSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  handleRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: 12, paddingHorizontal: 16 },
  handle: { width: 36, height: 4, backgroundColor: '#DDD', borderRadius: 2 },
  modalClose: { position: 'absolute', right: 16, top: 8 },
  productImage: { width: '100%', height: 250, marginTop: 12 },
  productInfo: { padding: spacing.lg },
  productPrice: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: colors.shared.gold, marginTop: 8 },
  productDesc: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, lineHeight: 22, marginTop: 12 },
  productActions: { gap: 10, marginTop: 20 },
  reserveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.hub.primary, paddingVertical: 16, borderRadius: 8 },
  reserveBtnText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#fff', letterSpacing: 0.5 },
  cartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.shared.gold, paddingVertical: 14, borderRadius: 8 },
  cartBtnText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.shared.gold },
  viewDetailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  viewDetailText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.shared.gold },
});
