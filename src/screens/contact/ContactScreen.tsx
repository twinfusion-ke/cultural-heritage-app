/**
 * ContactScreen — Consolidated contact information
 *
 * Shows contact details for all 4 divisions with action buttons.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider } from '../../components';
import { FadeIn } from '../../components/animated';
import AppHeader from '../../components/AppHeader';
import { colors, textStyles, spacing } from '../../theme';

const PHONE = '+255786454999';
const WHATSAPP = '255786454999';
const EMAIL = 'info@culturalheritage.co.tz';
const MAP_URL = 'https://maps.google.com/?q=-3.3869,36.6830';

export default function ContactScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container]}>
      <AppHeader backgroundColor={colors.hub.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.shared.parchment} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h3, { color: colors.shared.parchment }]}>Contact</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Location Card */}
        <FadeIn delay={100} slideUp={30}>
        <View style={styles.locationCard}>
          <Ionicons name="location" size={28} color={colors.shared.gold} />
          <Text style={[textStyles.h2, { color: colors.hub.text, marginTop: 12 }]}>Find Us</Text>
          <Text style={styles.locationText}>Cultural Heritage Centre</Text>
          <Text style={styles.locationText}>Dodoma Road, Arusha, Tanzania</Text>
          <Divider width={40} marginVertical={16} />
          <Text style={[textStyles.label, { color: colors.hub.textMuted }]}>OPENING HOURS</Text>
          <Text style={styles.hoursText}>Monday – Saturday: 8:00 AM – 8:00 PM</Text>
          <Text style={styles.hoursText}>Sunday: 10:00 AM – 7:00 PM</Text>

          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => Linking.openURL(MAP_URL)}
          >
            <Ionicons name="navigate" size={18} color={colors.hub.primary} />
            <Text style={styles.mapBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={250} slideUp={30}>
        <View style={styles.actionsSection}>
          <Text style={[textStyles.label, { color: colors.hub.textMuted, marginBottom: 16 }]}>GET IN TOUCH</Text>

          <ActionCard
            icon="call"
            iconColor="#16A34A"
            title="Call Us"
            subtitle={PHONE}
            onPress={() => Linking.openURL(`tel:${PHONE}`)}
          />
          <ActionCard
            icon="logo-whatsapp"
            iconColor="#25D366"
            title="WhatsApp"
            subtitle="Chat with us instantly"
            onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20Cultural%20Heritage%20Centre.`)}
          />
          <ActionCard
            icon="mail"
            iconColor={colors.shared.gold}
            title="Email"
            subtitle={EMAIL}
            onPress={() => Linking.openURL(`mailto:${EMAIL}`)}
          />
          <ActionCard
            icon="globe"
            iconColor={colors.hub.accent}
            title="Website"
            subtitle="twinfusion.co.ke/cultural-heritage"
            onPress={() => Linking.openURL('https://twinfusion.co.ke/cultural-heritage')}
          />
        </View>
        </FadeIn>

        {/* Divisions Contact */}
        <FadeIn delay={400} slideUp={30}>
        <View style={styles.divisionsSection}>
          <Text style={[textStyles.label, { color: colors.hub.textMuted, marginBottom: 16 }]}>OUR DIVISIONS</Text>

          <DivisionContact
            name="The Market"
            desc="Handcrafts, Artifacts, Spices & Textiles"
            color={colors.market.accent}
            icon="basket-outline"
          />
          <DivisionContact
            name="The Vault"
            desc="Tanzanite, Gemstones & Fine Jewelry"
            color={colors.vault.accent}
            icon="diamond-outline"
          />
          <DivisionContact
            name="Art Gallery"
            desc="Contemporary & Traditional Fine Art"
            color={colors.shared.gold}
            icon="color-palette-outline"
          />
        </View>
        </FadeIn>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function ActionCard({ icon, iconColor, title, subtitle, onPress }: {
  icon: string; iconColor: string; title: string; subtitle: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.hub.textMuted} />
    </TouchableOpacity>
  );
}

function DivisionContact({ name, desc, color, icon }: {
  name: string; desc: string; color: string; icon: string;
}) {
  return (
    <View style={styles.divisionCard}>
      <View style={[styles.divisionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.divisionName}>{name}</Text>
        <Text style={styles.divisionDesc}>{desc}</Text>
      </View>
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
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: colors.shared.parchment },
  scroll: { flex: 1, backgroundColor: colors.hub.background },
  locationCard: {
    backgroundColor: colors.shared.white, margin: spacing.lg, padding: spacing.lg,
    alignItems: 'center', borderRadius: 8,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  locationText: {
    fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.text, textAlign: 'center', marginTop: 2,
  },
  hoursText: {
    fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted, marginTop: 4,
  },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.shared.gold, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8, marginTop: 20,
  },
  mapBtnText: {
    fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: colors.hub.primary, textTransform: 'uppercase', letterSpacing: 1,
  },
  actionsSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.shared.white, padding: 16, marginBottom: 8,
    borderRadius: 8,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: colors.hub.text },
  actionSub: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, marginTop: 1 },
  divisionsSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  divisionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  divisionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  divisionName: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: colors.hub.text },
  divisionDesc: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, marginTop: 2 },
});
