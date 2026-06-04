import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Easing, Dimensions, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { COLORS, FONTS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Remote Collaboration',
    description: 'Work seamlessly with remote teams and hire experts worldwide instantly.',
    lottie: 'https://lottie.host/db911e20-38a5-4f40-8cbf-5af02f8eb5bb/cVWOB6ycut.lottie',
  },
  {
    id: '2',
    title: 'Smart Analytics',
    description: 'Optimize your career matching and find roles using smart analytics and insights.',
    lottie: 'https://lottie.host/582b4bc0-2a4d-4680-bbea-b364ea23f38b/lfauopFWNP.lottie',
  },
  {
    id: '3',
    title: 'Achieve Career Success',
    description: 'Connect with premium recruiters and discover job postings tailored to your skill set.',
    lottie: 'https://lottie.host/885c4670-ba3b-4111-b806-0af6cd80a379/lu7hDliSFx.lottie',
  }
];

export default function GettingStartedScreen({ onGetStarted }) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Animations for text transitions on slide change
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Staggered text animations when page index changes
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(15);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex]);

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollViewRef.current.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    }
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* Background Blobs for Visual Depth */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      {/* Header with Skip Button (not visible on the last slide) */}
      <View style={styles.header}>
        <Text style={styles.headerLogoText}>BKJ</Text>
        {!isLastSlide && (
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => onGetStarted('skip')}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Onboarding Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slideContainer}>
            <View style={styles.animationContainer}>
              <LottieView
                source={{ uri: slide.lottie }}
                style={styles.lottieView}
                autoPlay
                loop
              />
            </View>
            
            <Animated.View style={[styles.textWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Footer containing Pagination Dots & Action Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 40 }]}>
        
        {/* Pagination indicator dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeIndex === i ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        {/* Action Button Area */}
        <View style={styles.buttonWrapper}>
          {!isLastSlide ? (
            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={handleNext} 
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#E8F542" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.primaryBtn} 
                onPress={() => onGetStarted('skip')} 
                activeOpacity={0.88}
              >
                <Text style={styles.primaryBtnText}>Get Started</Text>
                <Ionicons name="rocket-outline" size={18} color="#E8F542" style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={() => onGetStarted('login')} 
                activeOpacity={0.88}
              >
                <Text style={styles.secondaryBtnText}>Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerLogoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 26, 26, 0.05)',
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  slideContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  animationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lottieView: {
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 16,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#1A1A1A',
  },
  activeDot: {
    width: 24,
    opacity: 1,
  },
  inactiveDot: {
    width: 8,
    opacity: 0.18,
  },
  buttonWrapper: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#1A1A1A', // Sleek jet black
    borderRadius: 28,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E8F542', // Lime yellow text on black
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  // Background Blobs for Visual Depth
  bgBlob1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FFFBC8', // Soft warm yellow glow
    opacity: 0.45,
    zIndex: -1,
  },
  bgBlob2: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#B2E2B9', // Slightly deeper mint green glow
    opacity: 0.35,
    zIndex: -1,
  },
});
