/**
 * HeroCarousel — Full-screen swipeable hero slider
 *
 * Auto-scrolls every 5 seconds, swipeable, dot indicators,
 * gradient overlay for text readability. Pure native — no WebView.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, textStyles, spacing } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_H * 0.52;

export interface SliderItem {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  label?: string;
  labelColor?: string;
  cta?: string;
  onPress?: () => void;
}

interface HeroCarouselProps {
  slides: SliderItem[];
  height?: number;
  autoPlayInterval?: number;
}

export default function HeroCarousel({
  slides,
  height = HERO_HEIGHT,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Auto-scroll
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, autoPlayInterval);
    return () => clearInterval(timerRef.current);
  }, [slides.length, autoPlayInterval]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (!slides.length) return null;

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={() => clearInterval(timerRef.current)}
        onScrollEndDrag={() => {
          if (slides.length <= 1) return;
          timerRef.current = setInterval(() => {
            setActiveIndex((prev) => {
              const next = (prev + 1) % slides.length;
              flatListRef.current?.scrollToIndex({ index: next, animated: true });
              return next;
            });
          }, autoPlayInterval);
        }}
        getItemLayout={(_, index) => ({ length: SCREEN_W, offset: SCREEN_W * index, index })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_W, height }]}>
            <Image
              source={{ uri: item.image }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              cachePolicy="disk"
              transition={300}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.slideContent}>
              {item.label && (
                <View style={[styles.labelBadge, { backgroundColor: item.labelColor || colors.shared.gold }]}>
                  <Text style={styles.labelText}>{item.label}</Text>
                </View>
              )}
              <Text style={styles.slideTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              )}
              {item.cta && item.onPress && (
                <TouchableOpacity style={styles.ctaButton} onPress={item.onPress} activeOpacity={0.8}>
                  <Text style={styles.ctaText}>{item.cta}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.hub.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  slide: { position: 'relative', justifyContent: 'flex-end' },
  slideContent: {
    padding: spacing.lg,
    paddingBottom: 40,
    zIndex: 2,
  },
  labelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    marginBottom: 12,
  },
  labelText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  slideTitle: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 32,
    color: '#fff',
    lineHeight: 38,
    marginBottom: 8,
  },
  slideSubtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
    marginBottom: 16,
    maxWidth: '85%',
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.shared.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  ctaText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
    color: colors.hub.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    right: spacing.lg,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 3,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.shared.gold,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
