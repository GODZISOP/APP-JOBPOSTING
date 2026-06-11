import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Easing, Dimensions, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { COLORS, FONTS } from '../theme/colors';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    titleKey: 'onboarding.slide1_title',
    descKey: 'onboarding.slide1_desc',
    lottie: require('../../assets/onboarding1.json'),
  },
  {
    id: '2',
    titleKey: 'onboarding.slide2_title',
    descKey: 'onboarding.slide2_desc',
    lottie: require('../../assets/onboarding2.json'),
  },
  {
    id: '3',
    titleKey: 'onboarding.slide3_title',
    descKey: 'onboarding.slide3_desc',
    lottie: require('../../assets/onboarding3.json'),
  }
];

export default function GettingStartedScreen({ onGetStarted, onReady }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Premium delay to allow Lottie files and onboarding slide layout to fully mount
    const timer = setTimeout(() => {
      if (onReady) onReady();
    }, 850);
    return () => clearTimeout(timer);
  }, [onReady]);

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

  // Header skip button opacity interpolation (fades out as we scroll to last slide)
  const skipButtonOpacity = scrollX.interpolate({
    inputRange: [width, width * 1.5, width * 2],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  // Primary button content interpolations (cross-fades Next and Get Started)
  const nextOpacity = scrollX.interpolate({
    inputRange: [width, width * 1.5, width * 2],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  const getStartedOpacity = scrollX.interpolate({
    inputRange: [width, width * 1.5, width * 2],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  // Secondary button opacity interpolation (fades in as we scroll to last slide)
  const secondaryBtnOpacity = scrollX.interpolate({
    inputRange: [width, width * 1.5, width * 2],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* Background Blobs for Visual Depth */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      {/* Header with Skip Button (fades out on the last slide) */}
      <View style={styles.header}>
        <Text style={styles.headerLogoText}>BKJ</Text>
        <Animated.View style={{ opacity: skipButtonOpacity }}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => onGetStarted('skip')}
            activeOpacity={0.7}
            disabled={activeIndex === 2}
          >
            <Text style={styles.skipButtonText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Onboarding Slider */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true, listener: onScroll }
        )}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, i) => (
          <OnboardingSlide
            key={slide.id}
            slide={slide}
            index={i}
            scrollX={scrollX}
            t={t}
          />
        ))}
      </Animated.ScrollView>

      {/* Footer containing Pagination Dots & Action Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 40 }]}>

        {/* Pagination indicator dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, i) => {
            const dotScaleX = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width
              ],
              outputRange: [1, 3, 1],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width
              ],
              outputRange: [0.18, 1, 0.18],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: dotOpacity,
                    transform: [{ scaleX: dotScaleX }],
                  }
                ]}
              />
            );
          })}
        </View>

        {/* Action Button Area */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={isLastSlide ? () => onGetStarted('skip') : handleNext}
            activeOpacity={0.88}
          >
            {/* Next button content */}
            <Animated.View
              style={[
                styles.primaryBtnContent,
                {
                  opacity: nextOpacity,
                  transform: [{ scale: nextOpacity }]
                }
              ]}
              pointerEvents={isLastSlide ? 'none' : 'auto'}
            >
              <Text style={styles.primaryBtnText}>{t('onboarding.next')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#E8F542" style={{ marginLeft: 6 }} />
            </Animated.View>

            {/* Get Started button content */}
            <Animated.View
              style={[
                styles.primaryBtnContent,
                {
                  opacity: getStartedOpacity,
                  transform: [{ scale: getStartedOpacity }]
                }
              ]}
              pointerEvents={isLastSlide ? 'auto' : 'none'}
            >
              <Text style={styles.primaryBtnText}>{t('onboarding.get_started')}</Text>
              <Ionicons name="rocket-outline" size={18} color="#E8F542" style={{ marginLeft: 6 }} />
            </Animated.View>
          </TouchableOpacity>

          <Animated.View style={{ opacity: secondaryBtnOpacity }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => onGetStarted('login')}
              activeOpacity={0.88}
              disabled={activeIndex !== 2}
            >
              <Text style={styles.secondaryBtnText}>{t('onboarding.sign_in')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

      </View>
    </View>
  );
}

const OnboardingSlide = React.memo(({ slide, index, scrollX, t }) => {
  const opacity = scrollX.interpolate({
    inputRange: [
      (index - 0.75) * width,
      index * width,
      (index + 0.75) * width
    ],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const translateY = scrollX.interpolate({
    inputRange: [
      (index - 0.75) * width,
      index * width,
      (index + 0.75) * width
    ],
    outputRange: [24, 0, 24],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slideContainer}>
      <View style={styles.animationContainer}>
        <LottieView
          source={slide.lottie}
          style={styles.lottieView}
          autoPlay
          loop
        />
      </View>

      <Animated.View style={[styles.textWrapper, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.title}>{t(slide.titleKey)}</Text>
        <Text style={styles.description}>{t(slide.descKey)}</Text>
      </Animated.View>
    </View>
  );
});

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
    width: 8,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: '#1A1A1A',
  },
  buttonWrapper: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#1A1A1A', // Sleek jet black
    borderRadius: 28,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  primaryBtnContent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
