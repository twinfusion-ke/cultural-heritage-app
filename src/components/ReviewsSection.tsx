/**
 * ReviewsSection — Traveler reviews
 *
 * Shows curated reviews with star ratings, reviewer info,
 * and a TripAdvisor-style layout. Reviews are hardcoded
 * initially but can be replaced with API data later.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Divider } from '../components';
import { colors, textStyles, spacing } from '../theme';

interface Review {
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
  source: string;
}

const REVIEWS: Review[] = [
  {
    name: 'Sarah M.',
    location: 'London, UK',
    rating: 5,
    text: 'An absolute treasure trove of African art and culture. The tanzanite collection at The Vault is world-class. Spent 3 hours here and could have stayed longer!',
    date: 'Feb 2026',
    source: 'TripAdvisor',
  },
  {
    name: 'James K.',
    location: 'New York, USA',
    rating: 5,
    text: 'Best stop on our Tanzania safari. The Makonde carvings are museum-quality, and the staff are incredibly knowledgeable about each piece\'s history.',
    date: 'Jan 2026',
    source: 'Google',
  },
  {
    name: 'Akiko T.',
    location: 'Tokyo, Japan',
    rating: 5,
    text: 'The art gallery exhibitions were breathtaking. Contemporary African art at its finest. We bought a beautiful Tingatinga painting that now hangs in our living room.',
    date: 'Mar 2026',
    source: 'TripAdvisor',
  },
  {
    name: 'Marco D.',
    location: 'Milan, Italy',
    rating: 4,
    text: 'Stunning jewelry selection. My wife\'s tanzanite ring from The Vault gets compliments everywhere. The certification process gave us full confidence.',
    date: 'Dec 2025',
    source: 'Google',
  },
  {
    name: 'Amara O.',
    location: 'Nairobi, Kenya',
    rating: 5,
    text: 'A cultural jewel of East Africa. The Heritage Centre perfectly bridges traditional craftsmanship with contemporary art. The Zanzibar spice collection is wonderful.',
    date: 'Mar 2026',
    source: 'TripAdvisor',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= count ? 'star' : 'star-outline'}
          size={14}
          color={i <= count ? '#F59E0B' : '#DDD'}
        />
      ))}
    </View>
  );
}

export default function ReviewsSection() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Text style={[textStyles.label, styles.sectionLabel]}>WHAT VISITORS SAY</Text>
      <Text style={[textStyles.h1, styles.sectionTitle]}>Traveler Reviews</Text>
      <Divider />

      {/* Rating Summary */}
      <View style={styles.summaryRow}>
        <Text style={styles.avgRating}>{avgRating}</Text>
        <View>
          <Stars count={5} />
          <Text style={styles.reviewCount}>{REVIEWS.length} reviews</Text>
        </View>
        <View style={styles.sourceBadges}>
          <View style={styles.sourceBadge}>
            <Ionicons name="logo-google" size={12} color="#4285F4" />
            <Text style={styles.sourceText}>Google</Text>
          </View>
          <View style={styles.sourceBadge}>
            <Ionicons name="earth" size={12} color="#00AF87" />
            <Text style={styles.sourceText}>TripAdvisor</Text>
          </View>
        </View>
      </View>

      {/* Review Cards — Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.reviewsList}
        decelerationRate="fast"
        snapToInterval={300}
      >
        {REVIEWS.map((review, i) => (
          <View key={i} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{review.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewerName}>{review.name}</Text>
                <Text style={styles.reviewerLocation}>{review.location}</Text>
              </View>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            <Stars count={review.rating} />
            <Text style={styles.reviewText} numberOfLines={4}>{review.text}</Text>
            <View style={styles.sourceRow}>
              <Ionicons name={review.source === 'Google' ? 'logo-google' : 'earth'} size={12} color={review.source === 'Google' ? '#4285F4' : '#00AF87'} />
              <Text style={styles.sourceLabel}>via {review.source}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Write Review CTA */}
      <TouchableOpacity
        style={styles.writeReviewBtn}
        onPress={() => Linking.openURL('https://wa.me/255786454999?text=Hello!%20I%20visited%20Cultural%20Heritage%20Centre%20and%20would%20like%20to%20share%20my%20experience.')}
      >
        <Ionicons name="chatbubble-outline" size={16} color={colors.shared.gold} />
        <Text style={styles.writeReviewText}>Share Your Experience</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.hub.background,
  },
  sectionLabel: { color: colors.hub.textMuted, textAlign: 'center', marginBottom: 4 },
  sectionTitle: { color: colors.hub.text, textAlign: 'center' },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  avgRating: { fontFamily: 'Montserrat-Bold', fontSize: 40, color: colors.hub.text },
  reviewCount: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, marginTop: 2 },
  sourceBadges: { gap: 6 },
  sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  sourceText: { fontFamily: 'Montserrat-Medium', fontSize: 10, color: colors.hub.textMuted },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewsList: { paddingHorizontal: spacing.lg, gap: 12 },
  reviewCard: {
    width: 288,
    backgroundColor: colors.shared.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.hub.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: colors.shared.gold },
  reviewerName: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.hub.text },
  reviewerLocation: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: colors.hub.textMuted },
  reviewDate: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: colors.hub.textMuted },
  reviewText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#555', lineHeight: 20, marginTop: 8 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  sourceLabel: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: colors.hub.textMuted },
  writeReviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    paddingVertical: 14, borderWidth: 1, borderColor: colors.shared.gold, borderRadius: 8,
  },
  writeReviewText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: colors.shared.gold, letterSpacing: 0.5 },
});
