import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  View, Text, StyleSheet, Animated, Easing, Image, Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── BRAND STORY LINES ─────────────────────────────────────────────────────────
const STORY_LINES = [
  "Every great career starts\nwith one step.",
  "Thousands of opportunities\nwaiting for you.",
  "Connect with top recruiters\nin seconds.",
  "Your dream job is closer\nthan you think.",
  "BKJ — Where careers\ncome alive.",
];
const STEPS = ['01', '02', '03', '04', '05'];

// ─── FLOATING SPARKLE ──────────────────────────────────────────────────────────
function Sparkle({ x, y, delay, size = 7 }) {
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0.4)).current;
  const ty = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(op, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(sc, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.timing(ty, { toValue: -20, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(op, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(sc, { toValue: 0.4, duration: 500, useNativeDriver: true }),
        ]),
      ])
    ).start();
    ty.setValue(0);
  }, []);

  return (
    <Animated.Text style={{ position: 'absolute', left: x, top: y, fontSize: size, color: '#fff', opacity: op, transform: [{ scale: sc }, { translateY: ty }] }}>
      ✦
    </Animated.Text>
  );
}

// ─── STORY CAROUSEL ────────────────────────────────────────────────────────────
function StoryCarousel({ onStep }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [idx, setIdx] = useState(0);
  const op = useRef(new Animated.Value(1)).current;
  const ty = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cycle = () => {
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(op, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.timing(ty, { toValue: -12, duration: 280, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]).start(() => {
          const next = (idx + 1) % STORY_LINES.length;
          setIdx(next);
          if (onStep) onStep(next);
          ty.setValue(12);
          Animated.parallel([
            Animated.timing(op, { toValue: 1, duration: 320, useNativeDriver: true }),
            Animated.timing(ty, { toValue: 0, duration: 320, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          ]).start(() => cycle());
        });
      }, 1400);
      return t;
    };
    const t = cycle();
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <Animated.Text style={[styles.storyText, { opacity: op, transform: [{ translateY: ty }] }]}>
      {STORY_LINES[idx]}
    </Animated.Text>
  );
}

// ─── DOT PROGRESS ──────────────────────────────────────────────────────────────
function DotProgress({ active }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.dotsRow}>
      {STEPS.map((_, i) => (
        <View key={i} style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SplashScreen({ message, subMessage, isSignOut, showLottie }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [stepIdx, setStepIdx] = useState(0);

  const phase = useRef(new Animated.Value(0)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOp = useRef(new Animated.Value(0)).current;
  const cardOp = useRef(new Animated.Value(0)).current;
  const cardTY = useRef(new Animated.Value(40)).current;
  const bA = useRef(new Animated.Value(0)).current;
  const kA = useRef(new Animated.Value(0)).current;
  const jA = useRef(new Animated.Value(0)).current;
  const badgeSc = useRef(new Animated.Value(0.6)).current;
  const badgeOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardTY, { toValue: 0, duration: 700, delay: 200, easing: Easing.out(Easing.back(1.3)), useNativeDriver: true }),
      Animated.timing(cardOp, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();

    Animated.stagger(130, [
      Animated.spring(bA, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.spring(kA, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.spring(jA, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.spring(badgeSc, { toValue: 1, friction: 5, tension: 55, delay: 400, useNativeDriver: true }),
      Animated.timing(badgeOp, { toValue: 1, duration: 350, delay: 400, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, bounciness: 14, speed: 8, delay: 300, useNativeDriver: true }),
      Animated.timing(iconOp, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounce, { toValue: -7, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(iconBounce, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });

    if (!isSignOut && !showLottie) {
      const t = setTimeout(() => {
        Animated.timing(phase, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [isSignOut, showLottie]);

  const isoOp = phase.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const isoSc = phase.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] });
  const deckOp = phase.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const deckSc = phase.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });

  const mkLetter = (a) => ({
    opacity: a,
    transform: [
      { scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
      { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
    ],
  });

  const isSimple = isSignOut || showLottie;

  return (
    // Single white root — no two-section split
    <View style={styles.root}>

      {/* ── GREEN DOME HERO (arch shape via huge borderRadius at bottom) ─── */}
      <View style={[styles.heroDome, isSimple && { height: SH * 0.46 }]}>

        {/* Sparkles inside dome */}
        <Sparkle x={24} y={38} delay={0} size={10} />
        <Sparkle x={SW - 52} y={55} delay={700} size={8} />
        <Sparkle x={48} y={SW * 0.42} delay={400} size={7} />
        <Sparkle x={SW - 68} y={SW * 0.40} delay={1100} size={9} />
        <Sparkle x={SW * 0.5} y={28} delay={900} size={6} />

        {/* Lottie — Phase 1 Isometric */}
        {!isSimple && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: isoOp, transform: [{ scale: isoSc }], alignItems: 'center', justifyContent: 'center' }]}>
            <LottieView source={require('../../../assets/lottie_isometric.json')} style={styles.lottieMain} autoPlay loop />
          </Animated.View>
        )}

        {/* Lottie — Phase 2 Map */}
        {!isSimple && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: deckOp, transform: [{ scale: deckSc }], alignItems: 'center', justifyContent: 'center' }]}>
            <LottieView source={require('../../../assets/lottie_map.json')} style={styles.lottieMain} autoPlay loop />
          </Animated.View>
        )}

        {/* Signout lottie */}
        {isSimple && (
          <LottieView source={require('../../../assets/signout.json')} style={styles.lottieMain} autoPlay loop />
        )}
      </View>

      {/* ── FLOATING APP ICON — centered between dome and content ── */}
      <Animated.View style={[styles.iconWrapper, { opacity: iconOp, transform: [{ scale: iconScale }, { translateY: iconBounce }] }]}>
        <View style={styles.iconGlow} />
        <Image source={require('../../../assets/icon.png')} style={styles.appIcon} resizeMode="cover" />
      </Animated.View>

      {/* ── CONTENT AREA (plain white, no card) ────────────────────── */}
      <Animated.View style={[styles.content, { opacity: cardOp, transform: [{ translateY: cardTY }] }, isSimple && { paddingBottom: 80 }]}>

        {/* Step badge */}
        {!isSimple && (
          <Animated.View style={[styles.stepBadge, { opacity: badgeOp, transform: [{ scale: badgeSc }] }]}>
            <Text style={styles.stepText}>Step {STEPS[stepIdx]}</Text>
          </Animated.View>
        )}

        {/* BKJ title or Main status message */}
        {isSimple ? (
          <Text style={styles.titleFull}>{message || (isSignOut ? 'Logging Out' : 'Loading...')}</Text>
        ) : (
          <View style={styles.letterRow}>
            <Animated.Text style={[styles.titleLetter, mkLetter(bA)]}>B</Animated.Text>
            <Animated.Text style={[styles.titleLetter, mkLetter(kA)]}>K</Animated.Text>
            <Animated.Text style={[styles.titleLetter, mkLetter(jA)]}>J</Animated.Text>
          </View>
        )}

        {/* Story / subtitle */}
        <View style={styles.storyBox}>
          {!isSimple ? (
            <StoryCarousel onStep={setStepIdx} />
          ) : (
            <Text style={styles.storyText}>{subMessage || 'See you soon!'}</Text>
          )}
        </View>

        {/* Status badge (only for starting/onboarding if message is present) */}
        {!isSimple && message ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{message}</Text>
          </View>
        ) : null}

        {/* Dot progress */}
        {!isSimple && <DotProgress active={stepIdx} />}
      </Animated.View>
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const DOME_H = SH * 0.56;

function getStyles(theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.bgPrimary,
      alignItems: 'center',
    },

    // Green dome: fills top portion, huge bottom border radius = arch / wave shape
    heroDome: {
      width: SW + 80,               // wider than screen so side cuts are hidden
      height: DOME_H,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#B2E2B9',
      borderBottomLeftRadius: (SW + 80) / 1.6,   // big arch curve
      borderBottomRightRadius: (SW + 80) / 1.6,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      marginLeft: -40,
      marginRight: -40,
      // Lift icon above the dome bottom edge
      paddingBottom: 40,
    },
    lottieMain: {
      width: SW * 0.68,
      height: SW * 0.68,
    },

    // Floating icon — between dome and content, always centered
    iconWrapper: {
      marginTop: -36,         // pull up to overlap dome bottom edge
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    iconGlow: {
      position: 'absolute',
      width: 84,
      height: 84,
      borderRadius: 24,
      backgroundColor: theme.isDark ? 'rgba(255, 140, 0, 0.18)' : 'rgba(26, 155, 86, 0.18)',
      transform: [{ scale: 1.2 }],
    },
    appIcon: {
      width: 72,
      height: 72,
      borderRadius: 20,
      borderWidth: 3.5,
      borderColor: theme.isDark ? 'rgba(255, 140, 0, 0.6)' : '#FFFFFF',
    },

    // Content area below dome
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 8,
      paddingBottom: 28,
      paddingHorizontal: 32,
      width: '100%',
    },

    stepBadge: {
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#E8F9EF',
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 4,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#A7F3C9',
    },
    stepText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.isDark ? '#FFFFFF' : '#1A9B56',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },

    letterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    titleLetter: {
      fontSize: 42,
      fontWeight: '900',
      color: theme.textPrimary,
      letterSpacing: -1.5,
    },
    titleFull: {
      fontSize: 38,
      fontWeight: '900',
      color: theme.textPrimary,
      marginBottom: 8,
    },

    storyBox: {
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    storyText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 23,
    },

    statusBadge: {
      marginTop: 14,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F0FDF4',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#BBF7D0',
    },

    statusBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.isDark ? '#FFFFFF' : '#15803D',
      letterSpacing: 0.2,
    },

    dotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      gap: 6,
    },
    dot: {
      borderRadius: 6,
      height: 7,
    },
    dotActive: {
      width: 24,
      backgroundColor: theme.isDark ? '#FFFFFF' : '#1A9B56',
    },
    dotInactive: {
      width: 7,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : '#D1FAE5',
    },
  });
}
