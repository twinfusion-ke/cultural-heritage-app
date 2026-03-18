/**
 * LegacyScreen — Our Legacy Timeline (1994–2024)
 *
 * Animated vertical timeline with staggered reveals and
 * a continuous gold line drawn as the user scrolls.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeIn } from '../../components/animated';
import { Divider } from '../../components';
import { colors, textStyles, spacing } from '../../theme';
import { useEnvStore } from '../../stores/envStore';

const { width: SCREEN_W } = Dimensions.get('window');

const MILESTONES = [
  { year: '1994', title: 'The Beginning', desc: 'Cultural Heritage Centre opens on Dodoma Road, Arusha — a small gallery of African art and craftsmanship.', icon: 'flag-outline' },
  { year: '1998', title: 'The Vault Opens', desc: 'Tanzanite gallery established, showcasing the rare gemstone found only near Arusha.', icon: 'diamond-outline' },
  { year: '2003', title: 'Gallery Expansion', desc: 'Art Gallery expands to three exhibition halls for contemporary and traditional African art.', icon: 'color-palette-outline' },
  { year: '2008', title: 'Continental Reach', desc: 'The Market grows to feature artisans from 15 African nations, becoming East Africa\'s largest craft collection.', icon: 'globe-outline' },
  { year: '2012', title: 'Cultural Campus', desc: 'The Centre campus expands with landscaped gardens, a courtyard café, and visitor facilities.', icon: 'leaf-outline' },
  { year: '2015', title: 'Roots & Shoots', desc: 'Jane Goodall Roots & Shoots museum opens on campus, bringing conservation education.', icon: 'earth-outline' },
  { year: '2020', title: 'Digital Transformation', desc: 'Online collections launched, bringing African heritage to a global digital audience.', icon: 'laptop-outline' },
  { year: '2024', title: '30th Anniversary', desc: 'Three decades of preserving African culture. Over 100,000 annual visitors. Mobile app launched.', icon: 'sparkles-outline' },
];

export default function LegacyScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const baseUrl = useEnvStore((s) => s.urls.hub.base);
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.shared.parchment} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h3, { color: colors.shared.parchment }]}>Our Legacy</Text>
        <View style={{ width: 60 }} />
      </View>

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/hero-centre.jpg` }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={styles.heroOverlay} />
          <FadeIn delay={200} slideUp={30}>
            <View style={styles.heroContent}>
              <Text style={[textStyles.label, { color: colors.shared.gold }]}>EST. 1994</Text>
              <Text style={[textStyles.h1, { color: '#fff', textAlign: 'center', marginTop: 8 }]}>
                Three Decades of{'\n'}Cultural Preservation
              </Text>
              <Divider color={colors.shared.gold} width={40} marginVertical={16} />
              <Text style={styles.heroSub}>
                From a small gallery to East Africa's premier cultural destination
              </Text>
            </View>
          </FadeIn>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <FadeIn delay={400}>
            <Text style={[textStyles.label, { color: colors.hub.textMuted, textAlign: 'center' }]}>OUR JOURNEY</Text>
            <Text style={[textStyles.h2, { color: colors.hub.text, textAlign: 'center', marginTop: 4 }]}>Milestones</Text>
            <Divider />
          </FadeIn>

          <View style={styles.timeline}>
            {/* Vertical Line */}
            <Animated.View
              style={[
                styles.timelineLine,
                {
                  height: scrollY.interpolate({
                    inputRange: [0, 300, 1200],
                    outputRange: [0, 200, 1200],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            />

            {MILESTONES.map((item, index) => (
              <FadeIn key={item.year} delay={500 + index * 150} slideUp={30}>
                <View style={[styles.milestoneRow, index % 2 === 0 ? styles.milestoneLeft : styles.milestoneRight]}>
                  {/* Dot */}
                  <View style={styles.milestoneDot}>
                    <Ionicons name={item.icon as any} size={16} color={colors.shared.gold} />
                  </View>

                  {/* Card */}
                  <View style={[styles.milestoneCard, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
                    <Text style={styles.milestoneYear}>{item.year}</Text>
                    <Text style={styles.milestoneTitle}>{item.title}</Text>
                    <Text style={styles.milestoneDesc}>{item.desc}</Text>
                  </View>
                </View>
              </FadeIn>
            ))}
          </View>
        </View>

        {/* Impact Section */}
        <FadeIn delay={300} slideUp={20}>
          <View style={styles.impactSection}>
            <Text style={[textStyles.label, { color: colors.shared.gold, textAlign: 'center' }]}>OUR IMPACT</Text>
            <Text style={[textStyles.h2, { color: '#fff', textAlign: 'center', marginTop: 8 }]}>By the Numbers</Text>
            <Divider color={colors.shared.gold} />

            <View style={styles.statsRow}>
              <StatCard number="30+" label="Years" />
              <StatCard number="2,000+" label="Artisans Supported" />
              <StatCard number="100K+" label="Annual Visitors" />
            </View>
          </View>
        </FadeIn>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  backBtn: { width: 60, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.shared.parchment },
  scroll: { flex: 1, backgroundColor: colors.hub.background },

  hero: { height: 300, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,56,44,0.8)' },
  heroContent: { zIndex: 1, alignItems: 'center', paddingHorizontal: 32 },
  heroSub: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  timelineSection: { paddingVertical: spacing.xl },

  timeline: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, position: 'relative' },
  timelineLine: {
    position: 'absolute', left: spacing.lg + 16, top: 0, width: 2,
    backgroundColor: colors.shared.gold, opacity: 0.3,
  },

  milestoneRow: {
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, paddingLeft: 8,
  },
  milestoneLeft: {},
  milestoneRight: {},

  milestoneDot: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.hub.primary,
    alignItems: 'center', justifyContent: 'center', zIndex: 2,
    borderWidth: 2, borderColor: colors.shared.gold,
  },

  milestoneCard: {
    flex: 1, marginLeft: 14, backgroundColor: colors.shared.white,
    padding: 16, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.shared.gold,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardLeft: {},
  cardRight: {},

  milestoneYear: {
    fontFamily: 'Montserrat-Bold', fontSize: 22, color: colors.shared.gold, marginBottom: 4,
  },
  milestoneTitle: {
    fontFamily: 'CormorantGaramond-Medium', fontSize: 20, color: colors.hub.text, marginBottom: 6,
  },
  milestoneDesc: {
    fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, lineHeight: 22,
  },

  impactSection: {
    backgroundColor: colors.hub.primary, padding: spacing.lg, paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md },
  statCard: { alignItems: 'center', flex: 1 },
  statNumber: { fontFamily: 'Montserrat-Bold', fontSize: 28, color: colors.shared.gold },
  statLabel: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, textAlign: 'center' },
});
