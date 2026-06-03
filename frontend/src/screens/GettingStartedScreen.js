import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Easing, Dimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../theme/colors';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: 'search', label: 'Browse Jobs', desc: 'Explore thousands of opportunities' },
  { icon: 'briefcase', label: 'Post Listings', desc: 'Employers publish jobs instantly' },
  { icon: 'person', label: 'Build Profile', desc: 'Showcase your skills & experience' },
];

export default function GettingStartedScreen({ onGetStarted }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const featureAnims = FEATURES.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(logoScale, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    // Stagger feature cards
    featureAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 500 + i * 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* Hero Section */}
      <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }] }]}>
          <Ionicons name="briefcase" size={44} color={COLORS.textPrimary} />
        </Animated.View>
        <Text style={styles.title}>Jobify</Text>
        <Text style={styles.subtitle}>Your premium gateway to{'\n'}career growth</Text>
      </Animated.View>

      {/* Feature Cards */}
      <View style={styles.featuresContainer}>
        {FEATURES.map((feat, i) => (
          <Animated.View
            key={feat.label}
            style={[
              styles.featureCard,
              {
                opacity: featureAnims[i],
                transform: [{ translateX: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
              },
            ]}
          >
            <View style={styles.featureIconCircle}>
              <Ionicons name={feat.icon} size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureLabel}>{feat.label}</Text>
              <Text style={styles.featureDesc}>{feat.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </Animated.View>
        ))}
      </View>

      {/* CTA Buttons */}
      <Animated.View style={[styles.ctaContainer, { opacity: fadeAnim, paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 40 }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => onGetStarted('skip')} activeOpacity={0.88}>
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.textPrimary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => onGetStarted('login')} activeOpacity={0.88}>
          <Text style={styles.secondaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    paddingHorizontal: 24,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 30,
    marginBottom: 36,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: Platform.OS === 'android' ? 3 : 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  // Features
  featuresContainer: {
    gap: 12,
    marginBottom: 36,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 1 : 3,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },

  // CTAs
  ctaContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  primaryBtn: {
    backgroundColor: COLORS.accentYellow,
    borderRadius: 26,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 2 : 5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  secondaryBtn: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#EEF2F0',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentGreen,
  },
});
