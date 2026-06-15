import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';

let styles;
let theme;

export default function ForgotPasswordScreen({ navigation }) {
  const { theme: _theme } = useTheme(); theme = _theme;
  styles = getStyles(theme);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ─── Email Validation ────────────────────────────────────────────────────────
  const validateEmailOnly = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Reset Data Validation ───────────────────────────────────────────────────
  const validateResetData = () => {
    const errors = {};
    if (!userEnteredOtp.trim()) {
      errors.otp = 'Verification code is required.';
    } else if (userEnteredOtp.trim().length !== 8) {
      errors.otp = 'Code must be exactly 8 digits.';
    }

    if (!newPassword) {
      errors.password = 'New security passcode is required.';
    } else if (newPassword.length < 6) {
      errors.password = 'Passcode must be at least 6 characters.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Send Reset OTP ──────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!validateEmailOnly()) return;

    setLoading(true);
    try {
      const backendUrl = __DEV__
        ? `http://${Constants.expoConfig?.hostUri?.split(':')?.[0] || '192.168.100.22'}:5000`
        : (Constants.expoConfig?.extra?.backendUrl || 'https://app-jobposting-arks.vercel.app');
      
      const response = await fetch(`${backendUrl}/api/auth/send-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setOtpCode(data.otp);
      setOtpSent(true);

      if (data.delivered === false) {
        Alert.alert(
          '🔑 Verification Code (Dev Mode)',
          `Email delivery failed (${data.warning || 'SMTP Error'}).\n\nSince you are in Dev Mode, here is your 8-digit OTP code to proceed:\n\n${data.otp}`
        );
      } else {
        Alert.alert(
          '🔑 Verification Code Sent',
          `An 8-digit OTP verification code has been sent to ${email.trim()}.\n\nPlease check your inbox.`
        );
      }
    } catch (err) {
      console.error('Send reset OTP error:', err);
      Alert.alert('Error', err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle Reset Passcode ────────────────────────────────────────────────────
  const handleResetPasscode = async () => {
    if (!validateResetData()) return;

    if (userEnteredOtp.trim() !== otpCode) {
      setFieldErrors({ otp: 'The verification code you entered is incorrect.' });
      return;
    }

    setLoading(true);
    try {
      const backendUrl = __DEV__
        ? `http://${Constants.expoConfig?.hostUri?.split(':')?.[0] || '192.168.100.22'}:5000`
        : (Constants.expoConfig?.extra?.backendUrl || 'https://app-jobposting-arks.vercel.app');
      
      const response = await fetch(`${backendUrl}/api/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          password: newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset passcode.');
      }

      Alert.alert(
        '🎉 Passcode Reset Successfully',
        'Your security passcode has been updated. Please login with your new credentials.',
        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      console.error('Reset passcode error:', err);
      Alert.alert('Error', err.message || 'Failed to reset passcode.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={[styles.logoCircle, { overflow: 'hidden' }]}>
            <Image source={require('../../assets/icon.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
          <Text style={styles.appName}>BKJ</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reset Passcode 🔑</Text>
          <Text style={styles.cardSubtitle}>Recover access to your premium job matching account.</Text>

          {/* Step 1: Input Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account address</Text>
            <View style={[styles.inputWrapper, fieldErrors.email && styles.inputWrapperError]}>
              <Ionicons name="mail-outline" size={18} color={fieldErrors.email ? '#EF4444' : theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your registered email"
                placeholderTextColor={theme.textLight}
                value={email}
                onChangeText={(text) => { setEmail(text); clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!otpSent}
              />
            </View>
            {fieldErrors.email ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                <Text style={styles.errorText}>{fieldErrors.email}</Text>
              </View>
            ) : null}
          </View>

          {/* Step 2: OTP & New Password (Only shown after OTP is successfully sent) */}
          {otpSent && (
            <>
              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={[styles.inputWrapper, fieldErrors.otp && styles.inputWrapperError]}>
                  <Ionicons name="keypad-outline" size={18} color={fieldErrors.otp ? '#EF4444' : theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 8-digit OTP code"
                    placeholderTextColor={theme.textLight}
                    value={userEnteredOtp}
                    onChangeText={(text) => { setUserEnteredOtp(text); clearError('otp'); }}
                    keyboardType="numeric"
                    maxLength={8}
                  />
                </View>
                {fieldErrors.otp ? (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                    <Text style={styles.errorText}>{fieldErrors.otp}</Text>
                  </View>
                ) : null}
              </View>

              {/* New Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Security Passcode</Text>
                <View style={[styles.inputWrapper, fieldErrors.password && styles.inputWrapperError]}>
                  <Ionicons name="lock-closed-outline" size={18} color={fieldErrors.password ? '#EF4444' : theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Choose a new passcode (min 6 chars)"
                    placeholderTextColor={theme.textLight}
                    value={newPassword}
                    onChangeText={(text) => { setNewPassword(text); clearError('password'); }}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
                {fieldErrors.password ? (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                    <Text style={styles.errorText}>{fieldErrors.password}</Text>
                  </View>
                ) : null}
              </View>
            </>
          )}

          {/* CTA Buttons */}
          {!otpSent ? (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSendOtp} activeOpacity={0.88} disabled={loading}>
              <Text style={styles.submitBtnText}>{loading ? 'Sending Code...' : 'Send Reset Code'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color={theme.textPrimary} style={{ marginLeft: 6 }} />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleResetPasscode} activeOpacity={0.88} disabled={loading}>
              <Text style={styles.submitBtnText}>{loading ? 'Resetting Passcode...' : 'Reset Passcode'}</Text>
              {!loading && <Ionicons name="checkmark-circle-outline" size={18} color={theme.textPrimary} style={{ marginLeft: 6 }} />}
            </TouchableOpacity>
          )}

          {/* Back to Login Link */}
          <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.loginLink}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bgPrimary },
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

    header: { alignItems: 'center', paddingTop: 56, paddingBottom: 20 },
    backBtn: {
      position: 'absolute', left: 0, top: 56,
      width: 40, height: 40, borderRadius: 14,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
      borderWidth: 1, borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
    },
    logoCircle: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: 'transparent',
      alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    appName: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 },

    card: {
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.bgCard, borderRadius: 28, padding: 24,
      shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
      borderWidth: 1, borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB',
      shadowOpacity: 0.06, shadowRadius: 20, elevation: 0,
    },
    cardTitle: { fontSize: 22, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5, marginBottom: 4 },
    cardSubtitle: { fontSize: FONTS.sizes.sm, color: theme.textSecondary, marginBottom: 20 },

    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: theme.textPrimary, marginBottom: 8, paddingLeft: 2 },
    inputWrapper: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAF9', borderRadius: 16,
      borderWidth: 1.5, borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#EEF2F0',
      paddingHorizontal: 16, height: 52,
    },
    inputWrapperError: {
      borderColor: '#EF4444',
      backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.1)' : '#FFF5F5',
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: FONTS.sizes.md, color: theme.textPrimary, fontWeight: '500' },
    eyeBtn: { padding: 4 },

    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, paddingLeft: 2 },
    errorText: { fontSize: 12, color: '#EF4444', fontWeight: '500', flex: 1 },

    submitBtn: {
      backgroundColor: theme.accentYellow,
      borderRadius: 26, height: 54,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginTop: 8,
      shadowColor: theme.accentYellow, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25, shadowRadius: 8, elevation: 0,
    },
    submitBtnText: { fontSize: FONTS.sizes.md + 1, fontWeight: '800', color: theme.textPrimary },

    loginRow: { alignSelf: 'center', marginTop: 24 },
    loginLink: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: theme.accentGreen },
  });
}
