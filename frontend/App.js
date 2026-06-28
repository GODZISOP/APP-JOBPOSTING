import './polyfill';
import * as Sentry from '@sentry/react-native';

// Sentry initialization has been moved to index.js to catch early startup crashes.
import './src/locales/i18n';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Animated, Easing, Alert, Image, Platform, Modal, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
let Notifications;
try {
  Notifications = require('expo-notifications');
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (e) {
  console.warn("⚠️ [NOTIFICATIONS] expo-notifications module not found in this client build. Rebuild the APK to enable native notifications.");
}

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { FONTS } from './src/theme/colors';
import NetworkBarrier from './src/components/NetworkBarrier';
import SplashScreen from './src/components/splashscreen';
import { useTranslation } from 'react-i18next';

import GettingStartedScreen from './src/screens/GettingStartedScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import JobsScreen from './src/screens/JobsScreen';
import PostJobScreen from './src/screens/PostJobScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Define Linking configuration mapping
const linking = {
  prefixes: [Linking.createURL('/'), 'bkj://'],
  config: {
    screens: {
      Main: {
        screens: {
          Jobs: 'job/:jobId',
        },
      },
    },
  },
};


// ─── Tab Icon ──────────────────────────────────────────────────────────────────
function TabIcon({ name, focused, color, theme }) {
  const styles = getStyles(theme);
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconActive]}>
      <Ionicons name={name} size={22} color={focused ? theme.textPrimary : color} />
    </View>
  );
}

// ─── Main Tabs ─────────────────────────────────────────────────────────────────
function MainTabs() {
  const { user, setIsGuest } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const styles = getStyles(theme);

  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0, top: 0, left: 0, right: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom: insets.bottom > 0 ? insets.bottom + 10 : 24,
            height: 74,
            paddingBottom: 8,
            paddingTop: 8,
          }
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: theme.textPrimary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} color={color} theme={theme} />
          ),
        }}
      />
      <Tab.Screen
        name="PostJob"
        component={PostJobScreen}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              Alert.alert(
                'Create Account First',
                'You must create an account or sign in to post job opportunities.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign In / Sign Up',
                    onPress: () => {
                      setIsGuest(false);
                    }
                  }
                ]
              );
            }
          }
        }}
        options={{
          tabBarLabel: t('tabs.post_job'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'add-circle' : 'add-circle-outline'} focused={focused} color={color} theme={theme} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} theme={theme} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

import BanScreen from './src/screens/BanScreen';

// ─── Privacy Consent Screen for First-Time Users ─────────────────────────────
function PrivacyConsentScreen({ onAccept }) {
  const { theme } = useTheme();
  const [agreed, setAgreed] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const styles = getConsentStyles(theme);

  if (showPolicy) {
    return <PrivacyPolicyScreen navigation={{ goBack: () => setShowPolicy(false) }} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.bgPrimary} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={64} color={theme.isDark ? '#E8F542' : '#15803D'} />
        </View>

        <Text style={styles.title}>Welcome to BKJ</Text>
        <Text style={styles.subtitle}>Job Portal & Matcher</Text>

        <Text style={styles.description}>
          Please review our Privacy Policy to understand how we secure and use your data for job matching.
        </Text>

        <TouchableOpacity style={styles.linkButton} onPress={() => setShowPolicy(true)} activeOpacity={0.8}>
          <Ionicons name="document-text-outline" size={18} color={theme.isDark ? '#E8F542' : '#15803D'} style={{ marginRight: 6 }} />
          <Text style={styles.linkText}>Read Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <View style={styles.termsTextContainer}>
          <Text style={styles.termsText}>
            By using this app, you agree to:{"\n"}
            <Text style={{ fontWeight: '800' }}>Terms & Conditions</Text> and <Text style={{ fontWeight: '800' }}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Checkbox Row */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={14} color={theme.isDark ? '#000000' : '#FFFFFF'} />}
          </View>
          <Text style={styles.checkboxLabel}>I Agree to Privacy Policy</Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueBtn, !agreed && styles.continueBtnDisabled]}
          disabled={!agreed}
          onPress={onAccept}
          activeOpacity={0.85}
        >
          <Text style={[styles.continueBtnText, !agreed && styles.continueBtnTextDisabled]}>CONTINUE</Text>
          <Ionicons name="arrow-forward" size={16} color={!agreed ? theme.textLight : (theme.isDark ? '#000000' : '#FFFFFF')} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getConsentStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    content: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: theme.bgCard,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.borderLight,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
    iconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.isDark ? 'rgba(232, 245, 66, 0.08)' : 'rgba(21, 128, 61, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.isDark ? theme.accentYellow : theme.accentGreen,
      textAlign: 'center',
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    description: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 24,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderLight,
      marginBottom: 20,
    },
    linkText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textPrimary,
      marginLeft: 8,
    },
    termsTextContainer: {
      marginBottom: 16,
      alignItems: 'center',
    },
    termsText: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      gap: 10,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.isDark ? theme.accentYellow : theme.accentGreen,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    checkboxChecked: {
      backgroundColor: theme.isDark ? theme.accentYellow : theme.accentGreen,
    },
    checkboxLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    continueBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 52,
      backgroundColor: theme.isDark ? theme.accentYellow : theme.accentGreen,
      borderRadius: 16,
      shadowColor: theme.isDark ? theme.accentYellow : theme.accentGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 3,
    },
    continueBtnDisabled: {
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0',
      shadowOpacity: 0,
      elevation: 0,
    },
    continueBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.isDark ? '#000000' : '#FFFFFF',
      letterSpacing: 0.5,
    },
    continueBtnTextDisabled: {
      color: theme.textLight,
    },
  });
}

// ─── Root Navigator ────────────────────────────────────────────────────────────
function RootNavigator() {
  const { user, loading, loggingOut, isGuest, setIsGuest, signingUp, loggingIn, justSignedUp, setJustSignedUp } = useAuth();
  const { theme } = useTheme();
  const [transitioningToDashboard, setTransitioningToDashboard] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [splashType, setSplashType] = useState(null);
  const prevIsBanned = useRef(user?.isBanned);

  useEffect(() => {
    if (prevIsBanned.current !== undefined && user?.isBanned !== undefined) {
      if (!prevIsBanned.current && user.isBanned) {
        setSplashType('suspended');
        setTimeout(() => setSplashType(null), 2500);
      } else if (prevIsBanned.current && !user.isBanned) {
        setSplashType('unbanned');
        setTimeout(() => setSplashType(null), 3000);
      }
    }
    prevIsBanned.current = user?.isBanned;
  }, [user?.isBanned]);

  useEffect(() => {
    if (!loading) {
      setIsInitialLoad(false);
    }
  }, [loading]);

  const showDashboard = user !== null || isGuest;

  // Determine if splash overlay is active
  const showSplash = loading || loggingOut || signingUp || loggingIn || transitioningToDashboard || splashType !== null;

  // Determine splash parameters
  let splashMessage = '';
  let splashSubMessage = '';
  let splashIsSignOut = false;
  let splashShowLottie = false;
  let splashTypeProp = undefined;

  if (splashType === 'suspended') {
    splashMessage = "Account Suspended";
    splashSubMessage = "You have been banned from BKJ.";
    splashTypeProp = 'suspended';
  } else if (splashType === 'unbanned') {
    splashMessage = "Welcome Back!";
    splashSubMessage = "Your account has been unbanned. 🎉";
    splashTypeProp = 'unbanned';
  } else if (loggingOut) {
    splashMessage = "Logging out...";
    splashSubMessage = "See you soon!";
    splashIsSignOut = true;
  } else if (signingUp) {
    splashMessage = "Creating account...";
    splashSubMessage = "Setting up your profile";
    splashShowLottie = true;
  } else if (loggingIn) {
    splashMessage = "Signing in...";
    splashSubMessage = "Welcome back!";
    splashShowLottie = true;
  } else if (transitioningToDashboard) {
    splashMessage = "Welcome to BKJ!";
    splashSubMessage = "Setting up your premium experience...";
    splashShowLottie = true;
  } else if (loading && !isInitialLoad) {
    // Show the login/signup style loader (door Lottie) in the dashboard
    splashMessage = "Loading...";
    splashSubMessage = "Please wait...";
    splashShowLottie = true;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user?.isBanned ? (
            // 🚫 Banned user screen
            <Stack.Screen name="Ban" component={BanScreen} />
          ) : showDashboard ? (
            // ✅ Active session or guest browsing mode
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            // ❌ No session / welcome & auth screens
            <>
              <Stack.Screen name="GettingStarted">
                {(props) => (
                  <GettingStartedScreen
                    {...props}
                    onGetStarted={(type) => {
                      if (type === 'signup') {
                        props.navigation.navigate('Signup');
                      } else if (type === 'login') {
                        props.navigation.navigate('Login');
                      } else if (type === 'skip') {
                        setTransitioningToDashboard(true);
                        setTimeout(() => {
                          setIsGuest(true);
                          setTransitioningToDashboard(false);
                        }, 1500);
                      }
                    }}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          )}
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Privacy Policy Consent Modal for Just Registered Users */}
      <Modal
        visible={justSignedUp && !showSplash}
        transparent={false}
        animationType="slide"
        statusBarTranslucent={true}
      >
        <PrivacyConsentScreen 
          onAccept={async () => {
            try {
              await AsyncStorage.setItem('@bkj_privacy_accepted', 'true');
              setJustSignedUp(false);
            } catch (e) {
              console.warn(e);
              setJustSignedUp(false);
            }
          }}
        />
      </Modal>

      {/* Render Splash Screen as a smooth absolute overlay to prevent black background flashes */}
      {showSplash && (
        <View style={StyleSheet.absoluteFill}>
          <SplashScreen
            message={splashMessage}
            subMessage={splashSubMessage}
            isSignOut={splashIsSignOut}
            showLottie={splashShowLottie}
            type={splashTypeProp}
          />
        </View>
      )}
    </View>
  );
}

// ─── In-App Toast Notification ────────────────────────────────────────────────
function InAppNotification() {
  const { notification } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [activeNotif, setActiveNotif] = useState(null);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const timerRef = useRef(null);

  // Modal State for Candidate Profile
  const [showToastLikerModal, setShowToastLikerModal] = useState(false);

  useEffect(() => {
    if (notification) {
      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // 1. Reset position before animating in (fixes stuck animation)
      slideAnim.setValue(-150);
      setActiveNotif(notification);

      // 2. Slide in
      Animated.spring(slideAnim, {
        toValue: 60,
        useNativeDriver: true,
        bounciness: 7,
        speed: 10,
      }).start();

      // 3. Auto-dismiss after 4 seconds
      timerRef.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.ease,
        }).start(() => {
          setActiveNotif(null); // 4. Clear content after exit
        });
      }, 4000);

    } else {
      // Manually dismissed from context
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
        pointerEvents: "none",
        easing: Easing.ease,
      }).start(() => setActiveNotif(null));
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification]);

  const isLike = activeNotif?.type === 'like';
  const avatarUrl = activeNotif?.likerProfile?.avatar;
  const initials = activeNotif?.likerProfile?.name
    ? activeNotif.likerProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const candidate = activeNotif?.likerProfile;

  return (
    <>
      <Animated.View
        style={[
          styles.notificationContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
        pointerEvents={notification ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.notificationCard}
          activeOpacity={0.9}
          onPress={() => {
            if (candidate) {
              if (timerRef.current) clearTimeout(timerRef.current);
              Animated.timing(slideAnim, {
                toValue: -150,
                duration: 250,
                useNativeDriver: true,
              }).start(() => {
                setActiveNotif(null);
              });
              setShowToastLikerModal(true);
            }
          }}
        >
          {isLike ? (
            avatarUrl && avatarUrl.length > 5 ? (
              <Image source={{ uri: avatarUrl }} style={styles.toastAvatar} resizeMode="cover" />
            ) : (
              <View style={styles.toastAvatarCircle}>
                <Text style={styles.toastAvatarText}>{initials}</Text>
              </View>
            )
          ) : (
            <Image
              source={require('./assets/icon.png')}
              style={[styles.toastAvatar, { borderWidth: 1, borderColor: '#334155' }]}
              resizeMode="cover"
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.notificationTitle}>{activeNotif?.title || ''}</Text>
            <Text style={styles.notificationMsg} numberOfLines={2}>{activeNotif?.message || ''}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Global Toast Candidate Modal */}
      <Modal
        visible={showToastLikerModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowToastLikerModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.bgPrimary, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, height: '58%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 }}>Candidate Profile</Text>
              <TouchableOpacity onPress={() => setShowToastLikerModal(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {candidate && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingVertical: 10 }}>
                {/* Initials Avatar */}
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.accentYellow, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  {candidate.avatar && candidate.avatar.length > 5 ? (
                    <Image source={{ uri: candidate.avatar }} style={{ width: 64, height: 64, borderRadius: 32 }} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 24, fontWeight: '800', color: theme.textPrimary }}>
                      {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'C'}
                    </Text>
                  )}
                </View>

                {/* Name & Title */}
                <Text style={{ fontSize: 18, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 }} numberOfLines={1}>{candidate.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 16 }} numberOfLines={1}>{candidate.title || 'Job Seeker'}</Text>

                {/* Divider */}
                <View style={{ width: '100%', height: 1, backgroundColor: theme.borderLight, marginBottom: 16 }} />

                {/* Detailed Info Cards */}
                <View style={{ width: '100%', gap: 12, marginBottom: 20, paddingHorizontal: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.borderLight }}>
                    <Ionicons name="location-outline" size={18} color={theme.isDark ? theme.accentYellow : theme.accentGreen} style={{ marginRight: 12 }} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, flex: 1 }} numberOfLines={1}>
                      {candidate.location && candidate.location !== 'Not specified' ? candidate.location : 'Not specified'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.borderLight }}>
                    <Ionicons name="call-outline" size={18} color={theme.isDark ? theme.accentYellow : theme.accentGreen} style={{ marginRight: 12 }} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, flex: 1 }} numberOfLines={1}>
                      {candidate.phone && candidate.phone !== 'No phone provided' ? candidate.phone : 'No phone provided'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.borderLight }}>
                    <Ionicons name="mail-outline" size={18} color={theme.isDark ? theme.accentYellow : theme.accentGreen} style={{ marginRight: 12 }} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, flex: 1 }} numberOfLines={1}>
                      {candidate.email && candidate.email !== 'candidate@gmail.com' ? candidate.email : 'No email provided'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

import Constants from 'expo-constants';
import { Asset } from 'expo-asset';

// ─── App Root ──────────────────────────────────────────────────────────────────
function App() {
  useEffect(() => {
    // Preload critical assets (Logo and Google G) for instant loading
    const preload = async () => {
      try {
        await Asset.loadAsync([
          require('./assets/icon.png'),
          require('./src/assets/google_g.png'),
        ]);
        console.log('⚡ Critical assets preloaded successfully!');
      } catch (err) {
        console.warn('⚠️ Asset preloading failed:', err.message);
      }
    };
    preload();

    // Navigation bar is already configured natively via app.json edgeToEdgeEnabled
    // Removing the imperative NavigationBar calls to prevent native crashes.

    if (Platform.OS === 'web') {
      return;
    }
    const isExpoGo = Constants.executionEnvironment === 'store-client';
    if (isExpoGo) {
      console.log('ℹ️ Running in Expo Go: Bypassing native AdMob initialization.');
      return;
    }

    try {
      const { NativeModules } = require('react-native');
      const hasNativeModule = NativeModules.RNGoogleMobileAdsModule || NativeModules.RNGoogleMobileAds;
      if (!hasNativeModule) {
        console.warn('⚠️ RNGoogleMobileAds native module is not compiled in this build. Bypassing AdMob.');
        return;
      }

      const libName = 'react-native' + '-google-mobile-ads';
      const mobileAds = require(libName).default;
      mobileAds()
        .initialize()
        .then(adapterStatuses => {
          console.log('⚡ AdMob Mobile Ads SDK Initialized Successfully!', adapterStatuses);
        })
        .catch(err => {
          console.warn('⚠️ AdMob Initialization Failed:', err.message);
        });
    } catch (e) {
      console.log('⚠️ Mobile ads library not supported in this environment:', e.message);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NetworkBarrier>
            <View style={{ flex: 1 }}>
              <RootNavigator />
              <InAppNotification />
            </View>
          </NetworkBarrier>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function getStyles(theme) {
  return StyleSheet.create({
    // Tab Bar
    tabBar: {
      position: 'absolute',
      left: 20,
      right: 20,
      backgroundColor: theme.bgCard,
      borderRadius: 28,
      borderTopWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: Platform.OS === 'android' ? 4 : 12,
    },
    tabLabel: {
      fontSize: FONTS.sizes.xs,
      fontWeight: '600',
      marginTop: 2,
    },
    tabIconWrap: {
      width: 40,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabIconActive: {
      backgroundColor: theme.accentYellow,
    },

    // In-App Toast Notification
    notificationContainer: {
      position: 'absolute',
      top: 0,
      left: 20,
      right: 20,
      zIndex: 99999,
      elevation: 999, // CRITICAL FOR ANDROID VISIBILITY
    },
    notificationCard: {
      backgroundColor: '#1E293B',
      borderRadius: 20,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 24,
      borderWidth: 1,
      borderColor: '#334155',
    },
    notificationIndicator: {
      width: 4,
      height: '100%',
      backgroundColor: theme.accentYellow,
      borderRadius: 2,
      marginRight: 12,
    },
    toastAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    toastAvatarCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.accentYellow,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    toastAvatarText: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    notificationTitle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: -0.1,
    },
    notificationMsg: {
      color: '#94A3B8',
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },
  });
}

export default Sentry.wrap(App);
