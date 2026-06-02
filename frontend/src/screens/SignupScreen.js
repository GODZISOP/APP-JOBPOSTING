import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('jobseeker');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { signup } = useAuth();

  // ─── Field-level Validation ──────────────────────────────────────────────────
  const validate = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (phone.trim().includes('@')) {
      errors.phone = 'Please enter a valid phone number, not an email.';
    } else if (phone.trim().replace(/\D/g, '').length < 7) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Handle Signup ───────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await signup(name.trim(), email.trim().toLowerCase(), password, role, phone.trim());
    setLoading(false);

    if (result.success) return; // onAuthStateChange will handle navigation

    // Handle specific error codes
    if (result.errorCode === 'already_registered') {
      Alert.alert(
        '⚠️ Account Already Exists',
        `An account with ${email.trim()} already exists.\n\nWould you like to sign in instead?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            style: 'default',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } else if (result.errorCode === 'invalid_email') {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else if (result.errorCode === 'weak_password') {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is too weak. Use at least 6 characters.' }));
    } else if (result.errorCode === 'network') {
      Alert.alert('🌐 Connection Error', 'Unable to reach the server. Please check your internet connection and try again.');
    } else {
      Alert.alert('Signup Failed', result.message || 'Something went wrong. Please try again.');
    }
  };

  // ─── Input with inline error ─────────────────────────────────────────────────
  const renderInput = ({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry, errorKey, rightElement, autoCapitalize }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, fieldErrors[errorKey] && styles.inputWrapperError]}>
        <Ionicons name={icon} size={18} color={fieldErrors[errorKey] ? '#EF4444' : COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, rightElement ? { flex: 1 } : null]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (fieldErrors[errorKey]) setFieldErrors((prev) => ({ ...prev, [errorKey]: null }));
          }}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry || false}
          autoCapitalize={autoCapitalize || 'none'}
        />
        {rightElement}
      </View>
      {fieldErrors[errorKey] ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
          <Text style={styles.errorText}>{fieldErrors[errorKey]}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="briefcase" size={28} color={COLORS.textPrimary} />
          </View>
          <Text style={styles.appName}>Jobify</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>Join the premium job gateway</Text>



          {/* Full Name */}
          {renderInput({
            label: 'Full name',
            icon: 'person-outline',
            value: name,
            onChangeText: setName,
            placeholder: 'Enter your full name',
            errorKey: 'name',
            autoCapitalize: 'words',
          })}

          {/* Email */}
          {renderInput({
            label: 'Email address',
            icon: 'mail-outline',
            value: email,
            onChangeText: setEmail,
            placeholder: 'Enter email address',
            keyboardType: 'email-address',
            errorKey: 'email',
          })}

          {/* Phone */}
          {renderInput({
            label: 'Phone number',
            icon: 'call-outline',
            value: phone,
            onChangeText: setPhone,
            placeholder: '+92 300 1234567',
            keyboardType: 'phone-pad',
            errorKey: 'phone',
          })}

          {/* Password */}
          {renderInput({
            label: 'Security passcode',
            icon: 'lock-closed-outline',
            value: password,
            onChangeText: setPassword,
            placeholder: 'Minimum 6 characters',
            secureTextEntry: !showPass,
            errorKey: 'password',
            rightElement: (
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ),
          })}

          {/* Submit */}
          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} activeOpacity={0.88} disabled={loading}>
            <Text style={styles.signupBtnText}>{loading ? 'Creating account...' : 'Confirm'}</Text>
            {!loading && <Ionicons name="arrow-forward" size={18} color={COLORS.textPrimary} style={{ marginLeft: 6 }} />}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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

  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 20 },
  backBtn: {
    position: 'absolute', left: 0, top: 56,
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  logoCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  appName: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },

  card: {
    backgroundColor: COLORS.bgCard, borderRadius: 28, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06, shadowRadius: 20, elevation: 6,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  cardSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2, marginBottom: 20 },

  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 42, borderRadius: 14, backgroundColor: '#F8FAF9',
    borderWidth: 2, borderColor: 'transparent',
  },
  roleBtnActive: { backgroundColor: COLORS.accentYellow, borderColor: '#C8D900' },
  roleBtnText: { fontSize: FONTS.sizes.xs + 1, fontWeight: '700', color: COLORS.textSecondary },
  roleBtnTextActive: { color: COLORS.textPrimary },

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

  signupBtn: {
    backgroundColor: COLORS.accentYellow,
    borderRadius: 26, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
    shadowColor: COLORS.accentYellow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  signupBtnText: { fontSize: FONTS.sizes.md + 1, fontWeight: '800', color: COLORS.textPrimary },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '500' },
  loginLink: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.accentGreen },
});
