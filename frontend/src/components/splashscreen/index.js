import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

import LottieView from 'lottie-react-native';

function LoadingDot({ delay }) {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1,   duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.dot, { opacity: anim }]} />;
}

export default function SplashScreen({ message, subMessage, isSignOut, showLottie }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();

    if (!isSignOut && !showLottie) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isSignOut, showLottie]);

  return (
    <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
      {isSignOut || showLottie ? (
        <LottieView
          source={require('../../../assets/signout.json')}
          style={styles.lottieLogo}
          autoPlay
          loop
        />
      ) : (
        <Animated.View style={[styles.splashLogoCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </Animated.View>
      )}
      <Text style={styles.splashTitle}>{isSignOut ? 'Logging Out' : 'Jobify'}</Text>
      <Text style={styles.splashSub}>{subMessage || (isSignOut ? 'See you soon!' : 'Your gateway to career growth')}</Text>

      {/* Status message (e.g. "Logging out...") */}
      {message ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{message}</Text>
        </View>
      ) : null}

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => <LoadingDot key={i} delay={i * 200} />)}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieLogo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  splashLogoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: Platform.OS === 'android' ? 3 : 10,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  splashSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentYellow,
  },
  statusBadge: {
    marginTop: 20,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 3,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
});
