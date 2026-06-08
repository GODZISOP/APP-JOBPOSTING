import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

import LottieView from 'lottie-react-native';

// Custom glowing pulse ring behind the app logo (mint green accent)
function PulseHalo() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.35, 0.15, 0],
  });

  return <Animated.View style={[styles.halo, { transform: [{ scale }], opacity }]} />;
}

// Custom horizontal sliding glowing progress bar matching the main button
function SleekProgressBar() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBarActive, { transform: [{ translateX }] }]} />
    </View>
  );
}

export default function SplashScreen({ message, subMessage, isSignOut, showLottie }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (!isSignOut && !showLottie) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isSignOut, showLottie]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
      {/* Ambient background glows matching BKJ brand colors */}
      <View style={styles.glowBlob1} />
      <View style={styles.glowBlob2} />

      <View style={styles.logoContainer}>
        {/* Animated halo behind logo */}
        {!(isSignOut || showLottie) && <PulseHalo />}

        {/* Brand logo is always preserved */}
        {!(isSignOut || showLottie) && (
          <Animated.View style={[styles.splashLogoCircle, { transform: [{ scale: pulseAnim }] }]}>
            {!imageLoaded && (
              <ActivityIndicator 
                size="small" 
                color="#1A1A1A" 
                style={StyleSheet.absoluteFillObject} 
              />
            )}
            <Animated.Image
              source={require('../../../assets/icon.png')}
              style={[styles.logoImage, { opacity: imageOpacity }]}
              resizeMode="cover"
              onLoad={handleImageLoad}
            />
          </Animated.View>
        )}

        {/* Absolute Lottie overlays */}
        {(isSignOut || showLottie) && (
          <LottieView
            source={require('../../../assets/signout.json')}
            style={styles.absoluteLottie}
            autoPlay
            loop
          />
        )}
      </View>

      <Text style={styles.splashTitle}>{isSignOut ? 'Logging Out' : 'BKJ'}</Text>
      <Text style={styles.splashSub}>{subMessage || (isSignOut ? 'See you soon!' : 'Your gateway to career growth')}</Text>

      {/* Premium light card status badge */}
      {message ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{message}</Text>
        </View>
      ) : null}

      {/* Premium line loading indicator */}
      <View style={styles.progressSection}>
        <SleekProgressBar />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary, // Restore original light mint green theme
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBlob1: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FFFBC8', // Soft warm yellow glow
    opacity: 0.45,
    zIndex: -2,
  },
  glowBlob2: {
    position: 'absolute',
    bottom: -140,
    left: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#B2E2B9', // Soft light green glow
    opacity: 0.35,
    zIndex: -2,
  },
  logoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  absoluteLottie: {
    position: 'absolute',
    width: 165,
    height: 165,
    zIndex: 10,
    pointerEvents: 'none',
  },
  halo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#5C9E6A', // Deeper mint green pulsing glow ring
    zIndex: -1,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  splashLogoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#1A1A1A', // Jet black highlight ring matching app buttons
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  splashTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1A1A1A', // Jet black matching app theme
    letterSpacing: -0.8,
  },
  splashSub: {
    fontSize: 14,
    color: '#6B7280', // Dark gray description matching main app
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 36,
  },
  statusBadge: {
    marginTop: 24,
    backgroundColor: '#FFFFFF', // Clean white card badge
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#EEF2F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.3,
  },
  progressSection: {
    marginTop: 48,
  },
  progressBarContainer: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(26, 26, 26, 0.08)', // Translucent track
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarActive: {
    width: 50,
    height: '100%',
    backgroundColor: '#1A1A1A', // Jet black sliding bar matching buttons
    borderRadius: 2,
  },
});
