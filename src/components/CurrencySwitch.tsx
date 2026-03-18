/**
 * CurrencySwitch — Floating currency toggle button
 *
 * Sits above the bottom tab bar on the right side.
 * Cycles through KES, TZS, USD on tap.
 * Expands to show all options on long press.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useUIStore } from '../stores/uiStore';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1 },
  { code: 'KES', symbol: 'KSh', label: 'Kenya Shilling', rate: 129 },
  { code: 'TZS', symbol: 'TSh', label: 'Tanzania Shilling', rate: 2650 },
];

export function useCurrency() {
  const currencyCode = useUIStore((s) => s.currency);
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  function formatPrice(usdPrice: string | number): string {
    const usd = typeof usdPrice === 'string' ? parseFloat(usdPrice) : usdPrice;
    if (isNaN(usd)) return `${currency.symbol}0`;
    const converted = usd * currency.rate;
    if (currency.code === 'USD') return `$${converted.toFixed(2)}`;
    return `${currency.symbol} ${converted.toLocaleString('en', { maximumFractionDigits: 0 })}`;
  }

  return { currency, formatPrice };
}

export default function CurrencySwitch() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const currencyCode = useUIStore((s) => s.currency);
  const setCurrency = useUIStore((s) => s.setCurrency);

  const expandAnim = useRef(new Animated.Value(0)).current;
  const current = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  }, [expanded]);

  function handleSelect(code: string) {
    setCurrency(code);
    setExpanded(false);
  }

  const tabBarHeight = 56 + Math.max(insets.bottom, 4);

  return (
    <View style={[styles.container, { bottom: tabBarHeight + 12 }]} pointerEvents="box-none">
      {/* Expanded Options */}
      {CURRENCIES.filter((c) => c.code !== currencyCode).map((c, i) => {
        const translateY = expandAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(50 * (i + 1))],
        });
        const opacity = expandAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        return (
          <Animated.View key={c.code} style={[styles.optionWrap, { transform: [{ translateY }], opacity }]}>
            <TouchableOpacity style={styles.optionBtn} onPress={() => handleSelect(c.code)} activeOpacity={0.8}>
              <Text style={styles.optionCode}>{c.code}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main Button */}
      <TouchableOpacity
        style={styles.mainBtn}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.85}
      >
        <Text style={styles.mainCode}>{current.code}</Text>
        <Text style={styles.mainSymbol}>{current.symbol}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  mainBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.hub.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: colors.shared.gold,
  },
  mainCode: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 11,
    color: colors.shared.gold,
    letterSpacing: 0.5,
  },
  mainSymbol: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 9,
    color: 'rgba(245,242,237,0.6)',
    marginTop: -1,
  },
  optionWrap: {
    position: 'absolute',
    bottom: 0,
  },
  optionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.shared.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.hub.border,
  },
  optionCode: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 11,
    color: colors.hub.primary,
    letterSpacing: 0.5,
  },
});
