/**
 * VisitScreen — Plan Your Visit (dedicated native screen)
 *
 * Hero image, visit info sections, opening hours, getting here,
 * what to expect, CTA buttons, and booking form popup.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { Divider } from '../../components';
import { FadeIn } from '../../components/animated';
import FormModal from '../../components/FormModal';
import { colors, textStyles, spacing } from '../../theme';
import { useEnvStore } from '../../stores/envStore';

export default function VisitScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const baseUrl = useEnvStore((s) => s.urls.hub.base);
  const [showVisitForm, setShowVisitForm] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader backgroundColor={colors.hub.primary} />

      <View style={styles.backBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.shared.parchment} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/experience-2.jpg` }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={styles.heroOverlay} />
          <FadeIn delay={200} slideUp={25}>
            <View style={styles.heroContent}>
              <Text style={[textStyles.label, { color: colors.shared.gold }]}>PLAN YOUR VISIT</Text>
              <Text style={[textStyles.h1, { color: '#fff', textAlign: 'center', marginTop: 8 }]}>
                Visit Cultural{'\n'}Heritage Centre
              </Text>
              <Text style={styles.heroSub}>East Africa's premier cultural destination</Text>
            </View>
          </FadeIn>
        </View>

        {/* Quick Info Cards */}
        <FadeIn delay={300} slideUp={20}>
          <View style={styles.quickInfoRow}>
            <InfoCard icon="location" label="Location" value="Dodoma Road, Arusha" />
            <InfoCard icon="time" label="Open" value="Mon–Sat 8am–8pm" />
            <InfoCard icon="ticket" label="Admission" value="Free Entry" />
          </View>
        </FadeIn>

        {/* Opening Hours */}
        <FadeIn delay={400} slideUp={20}>
          <View style={styles.section}>
            <Text style={[textStyles.label, styles.sectionLabel]}>OPENING HOURS</Text>
            <Text style={[textStyles.h2, styles.sectionTitle]}>When to Visit</Text>
            <Divider />

            <View style={styles.hoursCard}>
              <HoursRow day="Monday – Saturday" time="8:00 AM – 8:00 PM" />
              <HoursRow day="Sunday" time="10:00 AM – 7:00 PM" />
              <HoursRow day="Public Holidays" time="10:00 AM – 6:00 PM" />
              <View style={styles.hoursDivider} />
              <View style={styles.hoursNote}>
                <Ionicons name="information-circle-outline" size={16} color={colors.shared.gold} />
                <Text style={styles.hoursNoteText}>The Vault jewelry viewings are available by appointment. Gallery exhibitions may have separate hours.</Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Getting Here */}
        <FadeIn delay={500} slideUp={20}>
          <View style={[styles.section, { backgroundColor: colors.shared.white }]}>
            <Text style={[textStyles.label, styles.sectionLabel]}>GETTING HERE</Text>
            <Text style={[textStyles.h2, styles.sectionTitle]}>How to Find Us</Text>
            <Divider />

            <DirectionCard
              icon="car-outline"
              title="From Arusha City"
              desc="Head west on Dodoma Road from the Clock Tower. The Centre is on the right-hand side, approximately 3km. Look for the large Cultural Heritage sign."
            />
            <DirectionCard
              icon="airplane-outline"
              title="From KIA Airport"
              desc="Take the main highway towards Arusha. Turn right onto Dodoma Road at the roundabout. Total drive: approximately 45 minutes."
            />
            <DirectionCard
              icon="bus-outline"
              title="From Safari Lodges"
              desc="Most safari operators include a Cultural Heritage visit as part of their Arusha day itinerary. Ask your guide to arrange a stop!"
            />

            <TouchableOpacity
              style={styles.directionsBtn}
              onPress={() => Linking.openURL('https://maps.google.com/?q=-3.3869,36.6830')}
            >
              <Ionicons name="navigate" size={18} color={colors.hub.primary} />
              <Text style={styles.directionsBtnText}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* What to Expect */}
        <FadeIn delay={300} slideUp={20}>
          <View style={styles.section}>
            <Text style={[textStyles.label, styles.sectionLabel]}>YOUR EXPERIENCE</Text>
            <Text style={[textStyles.h2, styles.sectionTitle]}>What to Expect</Text>
            <Divider />

            <ExpectCard
              icon="time-outline"
              title="Allow 2+ Hours"
              desc="Explore four divisions: The Market, The Vault, The Art Gallery, and our heritage exhibitions."
            />
            <ExpectCard
              icon="people-outline"
              title="Expert Guides"
              desc="Our knowledgeable staff can guide you through the collections and help you find the perfect piece."
            />
            <ExpectCard
              icon="cafe-outline"
              title="Courtyard Café"
              desc="Complimentary tea and coffee available in our beautiful courtyard between the galleries."
            />
            <ExpectCard
              icon="card-outline"
              title="Payment Options"
              desc="We accept cash (TZS, USD, EUR), Visa, Mastercard, and mobile money (M-Pesa, Tigo Pesa)."
            />
            <ExpectCard
              icon="camera-outline"
              title="Photography Welcome"
              desc="Feel free to photograph the Centre and our collections. Ask permission for close-ups of specific artworks."
            />
          </View>
        </FadeIn>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Image
            source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/experience-3.jpg` }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={styles.ctaOverlay} />
          <FadeIn delay={200} slideUp={20}>
            <View style={styles.ctaContent}>
              <Ionicons name="calendar-outline" size={32} color={colors.shared.gold} />
              <Text style={[textStyles.h2, { color: '#fff', textAlign: 'center', marginTop: 12 }]}>Plan Your Visit</Text>
              <Text style={styles.ctaDesc}>Book ahead to ensure a guided tour and skip the queue. We'll have everything ready for your arrival.</Text>

              <TouchableOpacity style={styles.bookBtn} onPress={() => setShowVisitForm(true)}>
                <Ionicons name="calendar" size={18} color={colors.hub.primary} />
                <Text style={styles.bookBtnText}>Book Your Visit</Text>
              </TouchableOpacity>

              <View style={styles.ctaActions}>
                <TouchableOpacity style={styles.ctaActionBtn} onPress={() => Linking.openURL('tel:+255786454999')}>
                  <Ionicons name="call-outline" size={18} color="#fff" />
                  <Text style={styles.ctaActionText}>Call Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctaActionBtn} onPress={() => Linking.openURL('https://wa.me/255786454999?text=Hello!%20I%20would%20like%20to%20plan%20a%20visit.')}>
                  <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                  <Text style={styles.ctaActionText}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctaActionBtn} onPress={() => Linking.openURL('https://maps.google.com/?q=-3.3869,36.6830')}>
                  <Ionicons name="navigate-outline" size={18} color="#fff" />
                  <Text style={styles.ctaActionText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </FadeIn>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Visit Form Modal */}
      <FormModal
        visible={showVisitForm}
        onClose={() => setShowVisitForm(false)}
        title="Book Your Visit"
        subtitle="Fill in your details and we'll prepare for your arrival."
        formType="visit"
        accentColor={colors.shared.gold}
      />
    </View>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Ionicons name={icon as any} size={22} color={colors.shared.gold} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function HoursRow({ day, time }: { day: string; time: string }) {
  return (
    <View style={styles.hoursRow}>
      <Text style={styles.hoursDay}>{day}</Text>
      <Text style={styles.hoursTime}>{time}</Text>
    </View>
  );
}

function DirectionCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.directionCard}>
      <View style={styles.directionIcon}>
        <Ionicons name={icon as any} size={20} color={colors.shared.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.directionTitle}>{title}</Text>
        <Text style={styles.directionDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function ExpectCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.expectCard}>
      <View style={styles.expectIcon}>
        <Ionicons name={icon as any} size={20} color={colors.shared.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.expectTitle}>{title}</Text>
        <Text style={styles.expectDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.primary },
  backBar: { paddingHorizontal: spacing.md, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.shared.parchment },
  scroll: { flex: 1, backgroundColor: colors.hub.background },

  hero: { height: 260, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,56,44,0.75)' },
  heroContent: { zIndex: 1, alignItems: 'center', paddingHorizontal: 24 },
  heroSub: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8 },

  quickInfoRow: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  infoCard: {
    flex: 1, backgroundColor: colors.shared.white, padding: 14, borderRadius: 10, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  infoLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 10, color: colors.hub.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
  infoValue: { fontFamily: 'Montserrat-Medium', fontSize: 12, color: colors.hub.text, textAlign: 'center', marginTop: 4 },

  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, backgroundColor: colors.hub.background },
  sectionLabel: { color: colors.hub.textMuted, textAlign: 'center', marginBottom: 4 },
  sectionTitle: { color: colors.hub.text, textAlign: 'center' },

  hoursCard: {
    backgroundColor: colors.shared.white, padding: spacing.lg, borderRadius: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border },
  hoursDay: { fontFamily: 'Montserrat-Medium', fontSize: 15, color: colors.hub.text },
  hoursTime: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: colors.shared.gold },
  hoursDivider: { height: 1, backgroundColor: colors.hub.border, marginVertical: 8 },
  hoursNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
  hoursNoteText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted, flex: 1, lineHeight: 20 },

  directionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20 },
  directionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.hub.primary, alignItems: 'center', justifyContent: 'center' },
  directionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: colors.hub.text },
  directionDesc: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, lineHeight: 22, marginTop: 4 },

  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.shared.gold, paddingVertical: 14, borderRadius: 8, marginTop: 8,
  },
  directionsBtnText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.hub.primary, letterSpacing: 0.5 },

  expectCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20 },
  expectIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(197,160,89,0.12)', alignItems: 'center', justifyContent: 'center' },
  expectTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: colors.hub.text },
  expectDesc: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, lineHeight: 22, marginTop: 4 },

  ctaSection: { height: 380, position: 'relative', justifyContent: 'flex-end' },
  ctaOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,56,44,0.85)' },
  ctaContent: { padding: spacing.lg, paddingBottom: spacing.xl, alignItems: 'center', zIndex: 1 },
  ctaDesc: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8, lineHeight: 22, maxWidth: 320 },

  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.shared.gold, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 8, marginTop: 20,
  },
  bookBtnText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: colors.hub.primary, letterSpacing: 0.5, textTransform: 'uppercase' },

  ctaActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  ctaActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
  ctaActionText: { fontFamily: 'Montserrat-Medium', fontSize: 12, color: colors.shared.parchment },
});
