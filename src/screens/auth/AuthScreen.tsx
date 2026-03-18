/**
 * AuthScreen — Login / Register
 *
 * Toggle between login and register forms.
 * Secure session stored locally.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { FadeIn } from '../../components/animated';
import { Divider } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import { useEnvStore } from '../../stores/envStore';
import { colors, textStyles, spacing } from '../../theme';

export default function AuthScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const baseUrl = useEnvStore((s) => s.urls.hub.base);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  async function handleSubmit() {
    if (mode === 'register') {
      if (!name.trim()) { Alert.alert('Required', 'Please enter your name.'); return; }
      if (password !== confirmPassword) { Alert.alert('Mismatch', 'Passwords do not match.'); return; }
    }
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email.'); return; }
    if (!password || password.length < 6) { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return; }

    setLoading(true);
    const result = mode === 'login'
      ? await login(email.trim(), password)
      : await register(name.trim(), email.trim(), password, phone.trim());

    setLoading(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error || 'Something went wrong.');
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader backgroundColor={colors.hub.primary} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={styles.hero}>
            <Image
              source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/hero-centre.jpg` }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              cachePolicy="disk"
            />
            <View style={styles.heroOverlay} />
            <FadeIn delay={200} slideUp={20}>
              <View style={styles.heroContent}>
                <Image
                  source={{ uri: `${baseUrl}/wp-content/themes/ch-main-hub/assets/images/logo-white.png` }}
                  style={{ width: 180, height: 50 }}
                  contentFit="contain"
                  cachePolicy="disk"
                />
                <Text style={styles.heroTitle}>{mode === 'login' ? 'Welcome Back' : 'Join Us'}</Text>
                <Text style={styles.heroSub}>
                  {mode === 'login' ? 'Sign in to your Cultural Heritage account' : 'Create your account to start shopping'}
                </Text>
              </View>
            </FadeIn>
          </View>

          {/* Tab Toggle */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, mode === 'login' && styles.tabActive]} onPress={() => setMode('login')}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, mode === 'register' && styles.tabActive]} onPress={() => setMode('register')}>
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>FULL NAME *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color={colors.hub.textMuted} />
                  <TextInput style={styles.input} placeholder="Your full name" placeholderTextColor={colors.hub.textMuted}
                    value={name} onChangeText={setName} />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>EMAIL *</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={colors.hub.textMuted} />
                <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor={colors.hub.textMuted}
                  value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            {mode === 'register' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PHONE / WHATSAPP</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="call-outline" size={18} color={colors.hub.textMuted} />
                  <TextInput style={styles.input} placeholder="+255..." placeholderTextColor={colors.hub.textMuted}
                    value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PASSWORD *</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.hub.textMuted} />
                <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor={colors.hub.textMuted}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.hub.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {mode === 'register' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CONFIRM PASSWORD *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.hub.textMuted} />
                  <TextInput style={styles.input} placeholder="Re-enter password" placeholderTextColor={colors.hub.textMuted}
                    value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
                </View>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name={mode === 'login' ? 'log-in-outline' : 'person-add-outline'} size={18} color="#fff" />
                  <Text style={styles.submitText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.shared.gold} />
              <Text style={styles.securityText}>Your data is encrypted and securely stored. We never share your information.</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.hub.background },
  scroll: { flex: 1 },
  hero: { height: 200, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 24 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,56,44,0.85)' },
  heroContent: { zIndex: 1, alignItems: 'center' },
  heroTitle: { fontFamily: 'CormorantGaramond-Bold', fontSize: 28, color: '#fff', marginTop: 12 },
  heroSub: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  tabRow: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: 8, backgroundColor: '#F0F0F0', overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { backgroundColor: colors.hub.primary },
  tabText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.hub.textMuted },
  tabTextActive: { color: '#fff' },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: colors.hub.text, letterSpacing: 1, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.shared.white, borderWidth: 1, borderColor: colors.hub.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4,
  },
  input: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 15, color: colors.hub.text, paddingVertical: 12 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.hub.primary, paddingVertical: 16, borderRadius: 10, marginTop: 8,
  },
  submitText: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#fff', letterSpacing: 0.5 },
  securityNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, padding: 14, backgroundColor: 'rgba(197,160,89,0.08)', borderRadius: 8 },
  securityText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, flex: 1, lineHeight: 18 },
});
