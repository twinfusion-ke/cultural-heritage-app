/**
 * CurrencySwitch — Floating currency toggle + price formatting
 *
 * Uses UIStore.currency which is properly typed.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../stores/uiStore';
import { colors } from '../theme';

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'KES', symbol: 'KSh', rate: 129 },
  { code: 'TZS', symbol: 'TSh', rate: 2650 },
];

export default function CurrencySwitch() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const code = useUIStore((s) => s.currency);
  const setCurrency = useUIStore((s) => s.setCurrency);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const cur = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

  useEffect(() => {
    Animated.spring(expandAnim, { toValue: expanded ? 1 : 0, useNativeDriver: true, tension: 65, friction: 8 }).start();
  }, [expanded]);

  const tabBarH = 56 + Math.max(insets.bottom, 4);

  return (
    <View style={[styles.wrap, { bottom: tabBarH + 12 }]} pointerEvents="box-none">
      {CURRENCIES.filter((c) => c.code !== code).map((c, i) => {
        const ty = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -(50 * (i + 1))] });
        const op = expandAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
        return (
          <Animated.View key={c.code} style={[styles.optWrap, { transform: [{ translateY: ty }], opacity: op }]}>
            <TouchableOpacity style={styles.optBtn} onPress={() => { setCurrency(c.code); setExpanded(false); }}>
              <Text style={styles.optCode}>{c.code}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
      <TouchableOpacity style={styles.mainBtn} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.mainCode}>{cur.code}</Text>
        <Text style={styles.mainSym}>{cur.symbol}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16, alignItems: 'center', zIndex: 100 },
  mainBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.hub.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, borderWidth: 2, borderColor: colors.shared.gold },
  mainCode: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: colors.shared.gold, letterSpacing: 0.5 },
  mainSym: { fontFamily: 'Montserrat-Regular', fontSize: 9, color: 'rgba(245,242,237,0.6)', marginTop: -1 },
  optWrap: { position: 'absolute', bottom: 0 },
  optBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, borderWidth: 1, borderColor: colors.hub.border },
  optCode: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: colors.hub.primary, letterSpacing: 0.5 },
});
