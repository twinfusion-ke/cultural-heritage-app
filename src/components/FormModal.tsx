/**
 * FormModal — Reusable popup form
 *
 * Slides up from bottom, collects user details, submits to
 * WordPress email endpoint. Used for bookings, enquiries, visits.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appApi } from '../api/appApi';
import { colors, textStyles, spacing } from '../theme';

export type FormType = 'booking' | 'visit' | 'contact' | 'consultation' | 'enquiry';

interface FormField {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
}

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  formType: FormType;
  accentColor?: string;
  extraFields?: FormField[];
}

const BASE_FIELDS: FormField[] = [
  { key: 'name', label: 'Full Name', placeholder: 'Your full name', required: true },
  { key: 'email', label: 'Email', placeholder: 'your@email.com', required: true, keyboardType: 'email-address' },
  { key: 'phone', label: 'Phone / WhatsApp', placeholder: '+255...', keyboardType: 'phone-pad' },
];

const FORM_CONFIGS: Record<FormType, { fields: FormField[]; successMessage: string }> = {
  booking: {
    fields: [
      ...BASE_FIELDS,
      { key: 'date', label: 'Preferred Date', placeholder: 'e.g. 25 March 2026', required: true },
      { key: 'guests', label: 'Number of Guests', placeholder: '1', keyboardType: 'numeric' },
      { key: 'exhibition', label: 'Exhibition', placeholder: 'Which exhibition?' },
      { key: 'message', label: 'Additional Notes', placeholder: 'Any special requirements?', multiline: true },
    ],
    successMessage: 'Your booking request has been sent! We will confirm via email within 24 hours.',
  },
  visit: {
    fields: [
      ...BASE_FIELDS,
      { key: 'date', label: 'Visit Date', placeholder: 'e.g. 25 March 2026', required: true },
      { key: 'guests', label: 'Number of Visitors', placeholder: '1', keyboardType: 'numeric' },
      { key: 'interests', label: 'Interests', placeholder: 'Market, Vault, Gallery, or All' },
      { key: 'message', label: 'Special Requests', placeholder: 'Wheelchair access, guided tour, etc.', multiline: true },
    ],
    successMessage: 'Your visit request has been received! We look forward to welcoming you.',
  },
  contact: {
    fields: [
      ...BASE_FIELDS,
      { key: 'subject', label: 'Subject', placeholder: 'What is this about?', required: true },
      { key: 'message', label: 'Message', placeholder: 'Your message...', required: true, multiline: true },
    ],
    successMessage: 'Your message has been sent! We will respond within 24 hours.',
  },
  consultation: {
    fields: [
      ...BASE_FIELDS,
      { key: 'date', label: 'Preferred Date', placeholder: 'e.g. 25 March 2026', required: true },
      { key: 'interest', label: 'Interest', placeholder: 'Tanzanite, Ruby, Custom Design...' },
      { key: 'budget', label: 'Budget Range', placeholder: 'e.g. $1,000 - $5,000' },
      { key: 'message', label: 'Additional Details', placeholder: 'Describe what you are looking for', multiline: true },
    ],
    successMessage: 'Your consultation request has been sent! Our gemologist will contact you within 24 hours.',
  },
  enquiry: {
    fields: [
      ...BASE_FIELDS,
      { key: 'message', label: 'Your Enquiry', placeholder: 'What would you like to know?', required: true, multiline: true },
    ],
    successMessage: 'Your enquiry has been sent! We will get back to you shortly.',
  },
};

export default function FormModal({
  visible,
  onClose,
  title,
  subtitle,
  formType,
  accentColor = colors.shared.gold,
  extraFields,
}: FormModalProps) {
  const insets = useSafeAreaInsets();
  const config = FORM_CONFIGS[formType];
  const fields = extraFields || config.fields;
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    // Validate required fields
    for (const field of fields) {
      if (field.required && !values[field.key]?.trim()) {
        Alert.alert('Required Field', `Please fill in "${field.label}"`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await appApi('submit_form', {
        form_type: formType,
        ...values,
      });
      Alert.alert('Sent!', config.successMessage, [{ text: 'OK', onPress: onClose }]);
      setValues({});
    } catch {
      // Fallback: open WhatsApp with form data
      const lines = fields
        .filter((f) => values[f.key])
        .map((f) => `${f.label}: ${values[f.key]}`)
        .join('\n');
      const msg = `${title}\n\n${lines}`;
      Alert.alert(
        'Sending via WhatsApp',
        'We could not send the form online. Would you like to send it via WhatsApp instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open WhatsApp',
            onPress: () => {
              const url = `https://wa.me/255786454999?text=${encodeURIComponent(msg)}`;
              require('react-native').Linking.openURL(url);
              onClose();
            },
          },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetContainer}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Handle + Close */}
            <View style={styles.handleRow}>
              <View style={styles.handle} />
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.hub.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={[textStyles.h2, { color: colors.hub.text }]}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* Form Fields */}
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {fields.map((field) => (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    {field.label} {field.required && <Text style={{ color: colors.shared.error }}>*</Text>}
                  </Text>
                  <TextInput
                    style={[styles.input, field.multiline && styles.inputMultiline]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.hub.textMuted}
                    value={values[field.key] || ''}
                    onChangeText={(v) => updateField(field.key, v)}
                    keyboardType={field.keyboardType || 'default'}
                    multiline={field.multiline}
                    numberOfLines={field.multiline ? 4 : 1}
                    autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'sentences'}
                  />
                </View>
              ))}

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: accentColor }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#fff" />
                  <Text style={styles.submitText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backdropTouch: { flex: 1 },
  sheetContainer: { maxHeight: '85%' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  handleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingHorizontal: 16 },
  handle: { width: 36, height: 4, backgroundColor: '#DDD', borderRadius: 2 },
  closeBtn: { position: 'absolute', right: 16, top: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  titleSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  subtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, marginTop: 4, lineHeight: 20 },
  formScroll: { paddingHorizontal: spacing.lg, maxHeight: 400 },
  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.hub.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    fontFamily: 'Montserrat-Regular', fontSize: 15, color: colors.hub.text,
    borderWidth: 1, borderColor: colors.hub.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FAFAFA',
  },
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginTop: spacing.sm, paddingVertical: 16, borderRadius: 8,
  },
  submitText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' },
});
