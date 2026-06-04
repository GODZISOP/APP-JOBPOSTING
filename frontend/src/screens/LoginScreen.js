import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, loginWithGoogle } = useAuth();

  // ─── Field-level Validation ──────────────────────────────────────────────────
  const validate = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Handle Login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.success) return;

    // Show specific error per errorCode
    if (result.errorCode === 'invalid_credentials') {
      setFieldErrors({ email: ' ', password: 'Incorrect email or password.' });
    } else if (result.errorCode === 'email_not_confirmed') {
      Alert.alert(
        '📧 Email Not Verified',
        'Please check your inbox and verify your email address before signing in.',
        [{ text: 'OK' }]
      );
    } else if (result.errorCode === 'network') {
      Alert.alert('🌐 Connection Error', 'Unable to reach the server. Please check your internet connection and try again.');
    } else if (result.errorCode === 'account_not_found') {
      Alert.alert(
        '❌ Account Not Found',
        'No account found with this email. Would you like to create one?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => navigation.navigate('Signup') },
        ]
      );
    } else {
      Alert.alert('Login Failed', result.message || 'Something went wrong. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (!result.success && result.message) {
      Alert.alert('Google Sign-In Failed', result.message);
    }
  };

  const clearError = (field) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.logoArea}>
          <View style={[styles.logoCircle, { overflow: 'hidden' }]}>
            <Image source={require('../../assets/icon.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
          <Text style={styles.appName}>BKJ</Text>
          <Text style={styles.tagline}>Your beautiful gateway to career growth</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Access your jobs & dashboard</Text>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
            disabled={googleLoading}
          >
            <Image source={require('../assets/google_g.png')} style={styles.googleIcon} />
            <Text style={styles.googleBtnText}>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account address</Text>
            <View style={[styles.inputWrapper, fieldErrors.email && styles.inputWrapperError]}>
              <Ionicons name="mail-outline" size={18} color={fieldErrors.email ? '#EF4444' : COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={(t) => { setEmail(t); clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {fieldErrors.email && fieldErrors.email.trim() ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                <Text style={styles.errorText}>{fieldErrors.email}</Text>
              </View>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Security passcode</Text>
            <View style={[styles.inputWrapper, fieldErrors.password && styles.inputWrapperError]}>
              <Ionicons name="lock-closed-outline" size={18} color={fieldErrors.password ? '#EF4444' : COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={(t) => { setPassword(t); clearError('password'); }}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {fieldErrors.password && fieldErrors.password.trim() ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                <Text style={styles.errorText}>{fieldErrors.password}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity style={styles.forgotBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.forgotText}>Reset passcode?</Text>
          </TouchableOpacity>

          {/* Login CTA */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.88} disabled={loading}>
            {loading ? (
              <Text style={styles.loginBtnText}>Processing...</Text>
            ) : (
              <>
                <Text style={styles.loginBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.textPrimary} style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  logoArea: { alignItems: 'center', paddingTop: 64, paddingBottom: 28 },
  logoCircle: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 0,
  },
  appName: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: FONTS.sizes.xs + 1, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.bgCard, borderRadius: 28,
    padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowOpacity: 0.06, shadowRadius: 20, elevation: 0,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  cardSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2, marginBottom: 20 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 16, height: 52, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 0,
  },
  googleIcon: { width: 24, height: 24, marginRight: 10 },
  googleBtnText: { fontSize: FONTS.sizes.sm + 1, fontWeight: '700', color: COLORS.textPrimary },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EEF2F0' },
  dividerText: { fontSize: 12, color: COLORS.textSecondary, marginHorizontal: 12, fontWeight: '600' },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, paddingLeft: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAF9', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#EEF2F0',
    paddingHorizontal: 16, height: 52,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, fontWeight: '500' },
  eyeBtn: { padding: 4 },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, paddingLeft: 2 },
  errorText: { fontSize: 12, color: '#EF4444', fontWeight: '500', flex: 1 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: FONTS.sizes.sm, color: COLORS.accentGreen, fontWeight: '700' },

  loginBtn: {
    backgroundColor: COLORS.accentYellow,
    borderRadius: 26, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.accentYellow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 0,
  },
  loginBtnText: { fontSize: FONTS.sizes.md + 1, fontWeight: '800', color: COLORS.textPrimary },

  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '500' },
  signupLink: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.accentGreen },
});
