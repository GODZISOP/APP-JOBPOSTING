import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform, Alert, Image, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
let styles;
let theme;
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import SplashScreen from '../components/splashscreen';

export default function SignupScreen({ navigation }) {
  const { theme: _theme } = useTheme(); theme = _theme;
  styles = getStyles(theme);
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('jobseeker');
  const [loading, setLoading] = useState(false);

  const [localSplash, setLocalSplash] = useState(false);
  const [localSplashMessage, setLocalSplashMessage] = useState('');
  const [localSplashSub, setLocalSplashSub] = useState('');
  const [localSplashSignOut, setLocalSplashSignOut] = useState(false);
  const [localSplashLottie, setLocalSplashLottie] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showOtpConfirm, setShowOtpConfirm] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [userEnteredEmailOtp, setUserEnteredEmailOtp] = useState('');
  const { signup, verifyEmailOtp, userCountry, setJustSignedUp } = useAuth();

  const COUNTRY_DIAL_CODES = {
    'Pakistan': '+92',
    'India': '+91',
    'United Arab Emirates': '+971',
    'Saudi Arabia': '+966',
    'Qatar': '+974',
    'Kuwait': '+965',
    'Bahrain': '+973',
    'Oman': '+968',
    'United States': '+1',
    'Canada': '+1',
    'United Kingdom': '+44',
    'Germany': '+49',
    'France': '+33',
    'Italy': '+39',
    'Spain': '+34',
    'Netherlands': '+31',
    'Switzerland': '+41',
    'Sweden': '+46',
    'Norway': '+47',
    'Denmark': '+45',
    'Ireland': '+353',
    'Australia': '+61',
    'New Zealand': '+64',
    'China': '+86',
    'Japan': '+81',
    'South Korea': '+82',
    'Singapore': '+65',
    'Malaysia': '+60',
    'Indonesia': '+62',
    'Philippines': '+63',
    'Thailand': '+66',
    'Vietnam': '+84',
    'Bangladesh': '+880',
    'Sri Lanka': '+94',
    'Turkey': '+90',
    'Egypt': '+20',
    'South Africa': '+27',
    'Nigeria': '+234',
    'Kenya': '+254',
    'Morocco': '+212',
    'Brazil': '+55',
    'Mexico': '+52',
    'Argentina': '+54',
    'Colombia': '+57',
    'Chile': '+56',
    'Russia': '+7',
    'Poland': '+48',
    'Portugal': '+351',
    'Belgium': '+32',
    'Austria': '+43',
    'Greece': '+30',
    'Czech Republic': '+420',
    'Romania': '+40',
    'Hungary': '+36',
    'Finland': '+358',
    'Iraq': '+964',
    'Jordan': '+962',
    'Lebanon': '+961',
    'Afghanistan': '+93',
    'Iran': '+98',
    'Nepal': '+977'
  };

  const COUNTRY_PHONE_LENGTHS = {
    'Pakistan': 10,
    'India': 10,
    'United Arab Emirates': 9,
    'Saudi Arabia': 9,
    'Qatar': 8,
    'Kuwait': 8,
    'Bahrain': 8,
    'Oman': 8,
    'United States': 10,
    'Canada': 10,
    'United Kingdom': 10,
    'Germany': [10, 11],
    'France': 9,
    'Italy': 10,
    'Spain': 9,
    'Netherlands': 9,
    'Switzerland': 9,
    'Sweden': 9,
    'Norway': 8,
    'Denmark': 8,
    'Ireland': 9,
    'Australia': 9,
    'New Zealand': 9,
    'China': 11,
    'Japan': 10,
    'South Korea': 10,
    'Singapore': 8,
    'Malaysia': [9, 10],
    'Indonesia': [10, 11, 12],
    'Philippines': 10,
    'Thailand': 9,
    'Vietnam': 9,
    'Bangladesh': 10,
    'Sri Lanka': 9,
    'Turkey': 10,
    'Egypt': 10,
    'South Africa': 9,
    'Nigeria': 10,
    'Kenya': 9,
    'Morocco': 9,
    'Brazil': 11,
    'Mexico': 10,
    'Argentina': 10,
    'Colombia': 10,
    'Chile': 9,
    'Russia': 10,
    'Poland': 9,
    'Portugal': 9,
    'Belgium': 9,
    'Austria': 10,
    'Greece': 10,
    'Czech Republic': 9,
    'Romania': 9,
    'Hungary': 9,
    'Finland': 9,
    'Iraq': 10,
    'Jordan': 9,
    'Lebanon': 8,
    'Afghanistan': 9,
    'Iran': 10,
    'Nepal': 10,
  };


  const COUNTRY_CODES = [
    { name: 'Pakistan', flag: '🇵🇰', code: '+92' },
    { name: 'India', flag: '🇮🇳', code: '+91' },
    { name: 'United Arab Emirates', flag: '🇦🇪', code: '+971' },
    { name: 'Saudi Arabia', flag: '🇸🇦', code: '+966' },
    { name: 'Qatar', flag: '🇶🇦', code: '+974' },
    { name: 'Kuwait', flag: '🇰🇼', code: '+965' },
    { name: 'Bahrain', flag: '🇧🇭', code: '+973' },
    { name: 'Oman', flag: '🇴🇲', code: '+968' },
    { name: 'United States', flag: '🇺🇸', code: '+1' },
    { name: 'Canada', flag: '🇨🇦', code: '+1' },
    { name: 'United Kingdom', flag: '🇬🇧', code: '+44' },
    { name: 'Germany', flag: '🇩🇪', code: '+49' },
    { name: 'France', flag: '🇫🇷', code: '+33' },
    { name: 'Italy', flag: '🇮🇹', code: '+39' },
    { name: 'Spain', flag: '🇪🇸', code: '+34' },
    { name: 'Netherlands', flag: '🇳🇱', code: '+31' },
    { name: 'Switzerland', flag: '🇨🇭', code: '+41' },
    { name: 'Sweden', flag: '🇸🇪', code: '+46' },
    { name: 'Norway', flag: '🇳🇴', code: '+47' },
    { name: 'Denmark', flag: '🇩🇰', code: '+45' },
    { name: 'Ireland', flag: '🇮🇪', code: '+353' },
    { name: 'Australia', flag: '🇦🇺', code: '+61' },
    { name: 'New Zealand', flag: '🇳🇿', code: '+64' },
    { name: 'China', flag: '🇨🇳', code: '+86' },
    { name: 'Japan', flag: '🇯🇵', code: '+81' },
    { name: 'South Korea', flag: '🇰🇷', code: '+82' },
    { name: 'Singapore', flag: '🇸🇬', code: '+65' },
    { name: 'Malaysia', flag: '🇲🇾', code: '+60' },
    { name: 'Indonesia', flag: '🇮🇩', code: '+62' },
    { name: 'Philippines', flag: '🇵🇭', code: '+63' },
    { name: 'Thailand', flag: '🇹🇭', code: '+66' },
    { name: 'Vietnam', flag: '🇻🇳', code: '+84' },
    { name: 'Bangladesh', flag: '🇧🇩', code: '+880' },
    { name: 'Sri Lanka', flag: '🇱🇰', code: '+94' },
    { name: 'Turkey', flag: '🇹🇷', code: '+90' },
    { name: 'Egypt', flag: '🇪🇬', code: '+20' },
    { name: 'South Africa', flag: '🇿🇦', code: '+27' },
    { name: 'Nigeria', flag: '🇳🇬', code: '+234' },
    { name: 'Kenya', flag: '🇰🇪', code: '+254' },
    { name: 'Morocco', flag: '🇲🇦', code: '+212' },
    { name: 'Brazil', flag: '🇧🇷', code: '+55' },
    { name: 'Mexico', flag: '🇲🇽', code: '+52' },
    { name: 'Argentina', flag: '🇦🇷', code: '+54' },
    { name: 'Colombia', flag: '🇨🇴', code: '+57' },
    { name: 'Chile', flag: '🇨🇱', code: '+56' },
    { name: 'Russia', flag: '🇷🇺', code: '+7' },
    { name: 'Poland', flag: '🇵🇱', code: '+48' },
    { name: 'Portugal', flag: '🇵🇹', code: '+351' },
    { name: 'Belgium', flag: '🇧🇪', code: '+32' },
    { name: 'Austria', flag: '🇦🇹', code: '+43' },
    { name: 'Greece', flag: '🇬🇷', code: '+30' },
    { name: 'Czech Republic', flag: '🇨🇿', code: '+420' },
    { name: 'Romania', flag: '🇷🇴', code: '+40' },
    { name: 'Hungary', flag: '🇭🇺', code: '+36' },
    { name: 'Finland', flag: '🇫🇮', code: '+358' },
    { name: 'Iraq', flag: '🇮🇶', code: '+964' },
    { name: 'Jordan', flag: '🇯🇴', code: '+962' },
    { name: 'Lebanon', flag: '🇱🇧', code: '+961' },
    { name: 'Afghanistan', flag: '🇦🇫', code: '+93' },
    { name: 'Iran', flag: '🇮🇷', code: '+98' },
    { name: 'Nepal', flag: '🇳🇵', code: '+977' }
  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState({ name: 'Pakistan', flag: '🇵🇰', code: '+92' });
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);

  useEffect(() => {
    if (userCountry) {
      const matched = COUNTRY_CODES.find(c => c.name === userCountry);
      if (matched) {
        setSelectedCountryCode(matched);
      }
    }
  }, [userCountry]);

  // Helper to format local numbers to international format
  const getFormattedPhone = () => {
    let clean = phone.trim().replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    return selectedCountryCode.code + clean;
  };

  // Helper to process signup errors
  const handleSignupError = (result) => {
    if (result.errorCode === 'already_registered') {
      Alert.alert(
        '⚠️ Account Already Exists',
        `An account with ${email.trim()} already exists.\n\nWould you like to sign in instead?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            style: 'default',
            onPress: () => {
              setShowOtpConfirm(false);
              navigation.navigate('Login');
            },
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

  // ─── Field-level Validation ──────────────────────────────────────────────────
  const validate = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    } else if (name.trim().includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name.trim())) {
      errors.name = 'Please enter your real name, not an email address.';
    } else if (/\d/.test(name.trim())) {
      errors.name = 'Name cannot contain numbers.';
    } else {
      const vulgarWords = [
        'sex', 'porn', 'fuck', 'bitch', 'cunt', 'dick', 'pussy', 'nude', 'naked', 'penis', 'vagina',
        'randi', 'gandu', 'chutiya', 'loda', 'behenchod', 'madarchod', 'harami', 'bhosdike', 'dalal',
        'kamine', 'laundiy', 'bastard', 'asshole', 'slut', 'whore', 'boobs', 'butt', 'gndu', 'chutya',
        'maderchod', 'behanchod', 'kamina', 'randee', 'saala', 'saali', 'dalla'
      ];

      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ''); // clean special characters like s*x, s3x
      // Normalize common leet-speak / bypasses
      const normalized = cleanName
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/8/g, 'b');

      const words = normalized.split(/\s+/);
      const isVulgar = words.some(w => vulgarWords.includes(w)) || vulgarWords.some(vw => normalized.includes(vw));

      if (isVulgar) {
        errors.name = 'Vulgar/inappropriate names are not allowed.';
      }
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    // COUNTRY_PHONE_LENGTHS moved to component scope

    const formatted = getFormattedPhone();
    const selectedCountryName = selectedCountryCode.name;
    const expectedLength = COUNTRY_PHONE_LENGTHS[selectedCountryName];

    // Extract national number (remove country code and any leading 0)
    let nationalNumber = phone.trim();
    if (nationalNumber.startsWith('0')) {
      nationalNumber = nationalNumber.substring(1);
    }

    let isLengthValid = true;
    if (expectedLength) {
      if (Array.isArray(expectedLength)) {
        isLengthValid = expectedLength.includes(nationalNumber.length);
      } else {
        isLengthValid = nationalNumber.length === expectedLength;
      }
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
      Alert.alert("Validation Error", errors.phone);
    } else if (phone.trim().includes('@')) {
      errors.phone = 'Please enter a valid phone number, not an email.';
      Alert.alert("Validation Error", errors.phone);
    } else if (!isLengthValid) {
      const lengthStr = Array.isArray(expectedLength) ? expectedLength.join(' or ') : expectedLength;
      errors.phone = `Phone number for ${selectedCountryName} must be exactly ${lengthStr} digits (excluding country code).`;
      Alert.alert("Validation Error", errors.phone);
    } else if (!/^\+[1-9]\d{7,14}$/.test(formatted)) {
      errors.phone = 'Must be a valid international number (e.g. +923001234567).';
      Alert.alert("Validation Error", errors.phone);
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLocalSplashMessage("Sending Code");
    setLocalSplashSub("Requesting verification email...");
    setLocalSplashSignOut(false);
    setLocalSplashLottie(true);
    setLocalSplash(true);
    setLoading(true);

    try {
      const backendUrl = __DEV__
        ? `http://${Constants.expoConfig?.hostUri?.split(':')?.[0] || '192.168.100.22'}:5000`
        : (Constants.expoConfig?.extra?.backendUrl || 'https://app-jobposting-arks.vercel.app');
      console.log(`🔌 [BACKEND] Connecting to: ${backendUrl}`);

      const response = await fetch(`${backendUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), phone: getFormattedPhone() })
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error === 'already_registered_phone') {
          setLocalSplash(false);
          setLoading(false);
          Alert.alert('Phone Number Taken', data.message || 'This phone number is already registered to another account. Please sign in or use a different number.');
          return;
        }
        if (data.error === 'already_registered_email') {
          setLocalSplash(false);
          setLoading(false);
          Alert.alert('Email Already Registered', data.message || 'This email address is already registered. Please sign in or use a different email.');
          return;
        }
        throw new Error(data.error || 'Failed to send OTP email.');
      }

      setEmailOtpCode(data.otp);

      setTimeout(() => {
        setLocalSplash(false);
        setLoading(false);
        if (data.delivered === false) {
          Alert.alert(
            '🔑 Verification Code (Dev Mode)',
            `Email delivery failed (${data.warning || 'SMTP Error'}).\n\nSince you are in Dev Mode, here is your 8-digit OTP code to proceed:\n\n${data.otp}`
          );
        } else {
          Alert.alert(
            '🔑 Verification Code Sent',
            `An 8-digit OTP verification code has been sent to ${email.trim()}.\n\nPlease check your inbox and spam folder.`
          );
        }
        setShowOtpConfirm(true);
      }, 1500);

    } catch (err) {
      setLocalSplash(false);
      setLoading(false);
      console.error('Signup OTP email error:', err);
      const isNetworkError = err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('fetch') || err.message?.toLowerCase().includes('failed');
      if (isNetworkError) {
        Alert.alert(
          '📶 Server Down / Offline',
          'We are unable to reach the servers right now. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚠️ Server Busy',
          'The server is currently busy or under maintenance. Please try again in a few moments.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleVerifyAndSubmit = async () => {
    if (!userEnteredEmailOtp.trim()) {
      Alert.alert('Empty Code', 'Please enter the 8-digit verification code.');
      return;
    }

    if (userEnteredEmailOtp.trim() !== emailOtpCode) {
      Alert.alert('Invalid OTP', 'The verification code you entered is incorrect. Please try again.');
      return;
    }

    setShowOtpConfirm(false);
    setLocalSplashMessage("Creating Account");
    setLocalSplashSub("Setting up your secure profile...");
    setLocalSplashSignOut(false);
    setLocalSplashLottie(true);
    setLocalSplash(true);
    setLoading(true);

    const result = await signup(name.trim(), email.trim().toLowerCase(), password, role, getFormattedPhone());

    setTimeout(() => {
      setLocalSplash(false);
      setLoading(false);
      if (result.success) {
        setJustSignedUp(true);
        Alert.alert('Registration Successful 🎉', 'Your account has been verified and registered successfully.');
      } else {
        handleSignupError(result);
      }
    }, 1500);
  };

  // ─── Input with inline error ─────────────────────────────────────────────────
  const renderInput = ({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry, errorKey, leftElement, rightElement, autoCapitalize, maxLength }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, fieldErrors[errorKey] && styles.inputWrapperError]}>
        {leftElement ? leftElement : (
          <Ionicons name={icon} size={18} color={fieldErrors[errorKey] ? '#EF4444' : theme.textSecondary} style={styles.inputIcon} />
        )}
        <TextInput
          style={[styles.input, rightElement ? { flex: 1 } : null]}
          placeholder={placeholder}
          placeholderTextColor={theme.textLight}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (fieldErrors[errorKey]) setFieldErrors((prev) => ({ ...prev, [errorKey]: null }));
          }}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry || false}
          autoCapitalize={autoCapitalize || 'none'}
          maxLength={maxLength}
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
          <Text style={styles.cardTitle}>{t('auth.signup_title')}</Text>
          <Text style={styles.cardSubtitle}>{t('auth.signup_subtitle')}</Text>



          {/* Full Name */}
          {renderInput({
            label: 'Full name',
            icon: 'person-outline',
            value: name,
            onChangeText: setName,
            placeholder: t('auth.name_placeholder'),
            errorKey: 'name',
            autoCapitalize: 'words',
          })}

          {/* Email */}
          {renderInput({
            label: 'Email address',
            icon: 'mail-outline',
            value: email,
            onChangeText: setEmail,
            placeholder: t('auth.email_placeholder'),
            keyboardType: 'email-address',
            errorKey: 'email',
          })}

          {(() => {
            const expectedLength = COUNTRY_PHONE_LENGTHS[selectedCountryCode.name] || 10;
            const maxLen = Array.isArray(expectedLength) ? Math.max(...expectedLength) : expectedLength;
            return renderInput({
              label: 'Phone number',
              value: phone,
              onChangeText: (text) => {
                let cleaned = text;
                if (cleaned.startsWith('0')) {
                  cleaned = cleaned.substring(1);
                }
                cleaned = cleaned.replace(/[^0-9]/g, '');
                setPhone(cleaned.slice(0, maxLen));
              },
              placeholder: '300 1234567',
              keyboardType: 'phone-pad',
              errorKey: 'phone',
              leftElement: (
                <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                  <Ionicons name="call-outline" size={18} color={fieldErrors['phone'] ? '#EF4444' : theme.textSecondary} style={{ marginRight: 6 }} />
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 4,
                      marginRight: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                    onPress={() => !userCountry && setShowCountryCodeModal(true)}
                    activeOpacity={userCountry ? 1 : 0.8}
                  >
                    <Text style={{ fontSize: 14, color: theme.textPrimary, fontWeight: '700', textAlignVertical: 'center', includeFontPadding: false }}>
                      {selectedCountryCode.flag} {selectedCountryCode.code}{!userCountry ? ' ▾' : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              ),
              rightElement: phone ? (
                <TouchableOpacity
                  onPress={() => setPhone('')}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="close-circle" size={18} color={theme.textSecondary || '#94A3B8'} />
                </TouchableOpacity>
              ) : null
            });
          })()}

          {/* Password */}
          {renderInput({
            label: 'Security passcode',
            icon: 'lock-closed-outline',
            value: password,
            onChangeText: setPassword,
            placeholder: t('auth.password_placeholder'),
            secureTextEntry: !showPass,
            errorKey: 'password',
            rightElement: (
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            ),
          })}

          {/* Terms & Privacy Agreement Text */}
          <View style={styles.agreementTextContainer}>
            <Text style={styles.agreementText}>
              By signing up, you agree to our{"\n"}
              <Text style={styles.agreementLink} onPress={() => navigation.navigate('PrivacyPolicy')}>
                Privacy Policy
              </Text>
              {" "}and{" "}
              <Text style={styles.agreementLink} onPress={() => navigation.navigate('PrivacyPolicy')}>
                Terms & Conditions
              </Text>
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} activeOpacity={0.88} disabled={loading}>
            <Text style={styles.signupBtnText}>{loading ? 'Creating account...' : t('auth.signup_button')}</Text>
            {!loading && <Ionicons name="arrow-forward" size={18} color={theme.textPrimary} style={{ marginLeft: 6 }} />}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{t('auth.already_have_account')} </Text>
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Login');
                }
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.loginLink}>{t('auth.login_link')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* OTP Verification Modal Overlay */}
      <Modal visible={showOtpConfirm} transparent={true} animationType="fade" onRequestClose={() => setShowOtpConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.otpCard}>
            <Ionicons name="mail-open-outline" size={54} color={theme.accentYellow} style={styles.otpIcon} />
            <Text style={styles.otpTitle}>Verify Email ✉️</Text>
            <Text style={styles.otpSubtitle}>
              We sent an 8-digit verification code to your email. Please enter the code below to verify your account:
            </Text>

            <Text style={styles.otpInputLabel}>Email Verification Code</Text>
            <View style={styles.otpInputWrapper}>
              <TextInput
                style={styles.otpInput}
                placeholder="00000000"
                placeholderTextColor={theme.textLight}
                keyboardType="numeric"
                maxLength={8}
                value={userEnteredEmailOtp}
                onChangeText={setUserEnteredEmailOtp}
              />
            </View>

            <TouchableOpacity style={styles.otpSubmitBtn} onPress={handleVerifyAndSubmit} activeOpacity={0.88} disabled={loading}>
              <Text style={styles.otpSubmitBtnText}>{loading ? 'Verifying...' : 'Verify & Sign Up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.otpCancelBtn} onPress={() => setShowOtpConfirm(false)} activeOpacity={0.8}>
              <Text style={styles.otpCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Country Code Selection Modal */}
      <Modal visible={showCountryCodeModal} transparent={true} animationType="slide" onRequestClose={() => setShowCountryCodeModal(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end', paddingHorizontal: 0, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={{
            backgroundColor: theme.bgPrimary,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 24,
            paddingHorizontal: 20,
            height: '60%',
            width: '100%',
            maxWidth: '100%',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingBottom: 20
          }}>
            <View style={{ paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary }}>Select Country Code 📞</Text>
              <TouchableOpacity onPress={() => setShowCountryCodeModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.name}
              style={{ width: '100%', marginTop: 8 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                  }}
                  onPress={() => {
                    setSelectedCountryCode(item);
                    setShowCountryCodeModal(false);
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>{item.flag}</Text>
                  <Text style={{ fontSize: 15, color: theme.textPrimary, flex: 1, fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ fontSize: 15, color: theme.textSecondary, fontWeight: '700' }}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      {localSplash && (
        <Modal transparent animationType="fade" visible={localSplash}>
          <SplashScreen
            message={localSplashMessage}
            subMessage={localSplashSub}
            isSignOut={localSplashSignOut}
            showLottie={localSplashLottie}
          />
        </Modal>
      )}
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
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 0,
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
    cardTitle: { fontSize: 22, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 },
    cardSubtitle: { fontSize: FONTS.sizes.sm, color: theme.textSecondary, marginTop: 2, marginBottom: 20 },

    roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    roleBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      height: 42, borderRadius: 14, backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAF9',
      borderWidth: 2, borderColor: 'transparent',
    },
    roleBtnActive: { backgroundColor: theme.accentYellow, borderColor: '#C8D900' },
    roleBtnText: { fontSize: FONTS.sizes.xs + 1, fontWeight: '700', color: theme.textSecondary },
    roleBtnTextActive: { color: theme.textPrimary },

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

    agreementTextContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    agreementText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    agreementLink: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.isDark ? theme.accentYellow : theme.accentGreen,
    },

    signupBtn: {
      backgroundColor: theme.accentYellow,
      borderRadius: 26, height: 54,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginTop: 8,
      shadowColor: theme.accentYellow, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25, shadowRadius: 8, elevation: 0,
    },
    signupBtnText: { fontSize: FONTS.sizes.md + 1, fontWeight: '800', color: theme.textPrimary },

    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    loginText: { fontSize: FONTS.sizes.sm, color: theme.textSecondary, fontWeight: '500' },
    loginLink: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: theme.accentGreen },

    // OTP Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    otpCard: {
      backgroundColor: theme.isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 28,
      borderWidth: 1.5,
      borderColor: theme.isDark ? '#334155' : '#E5E7EB',
      padding: 24,
      width: '90%',
      maxWidth: 340,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 24,
    },
    otpIcon: {
      marginBottom: 12,
    },
    otpTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    otpSubtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 20,
    },
    otpInputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textPrimary,
      alignSelf: 'flex-start',
      marginBottom: 6,
      paddingLeft: 2,
    },
    otpInputWrapper: {
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAF9',
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#EEF2F0',
      paddingHorizontal: 16,
      height: 56,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    otpInput: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.textPrimary,
      letterSpacing: 8,
      textAlign: 'center',
      width: '100%',
    },
    otpSubmitBtn: {
      backgroundColor: theme.accentYellow,
      borderRadius: 20,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      shadowColor: theme.accentYellow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      marginBottom: 10,
    },
    otpSubmitBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    otpCancelBtn: {
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    otpCancelBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textSecondary,
    },
  });
}
