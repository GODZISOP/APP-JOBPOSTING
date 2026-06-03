import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Dimensions, TextInput,
  Animated, Easing, Modal, Image, Linking, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import SplashScreen from '../components/splashscreen';
import AdBanner from '../components/AdBanner';

const { width } = Dimensions.get('window');

function DottedColumn({ height, active }) {
  const dotCount = Math.max(3, Math.min(10, Math.floor(height / 8)));
  const dots = [];
  for (let i = 0; i < dotCount; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.chartDot,
          active ? styles.chartDotActive : styles.chartDotInactive,
          { opacity: 0.3 + (i / dotCount) * 0.7 },
        ]}
      />
    );
  }
  return (
    <View style={styles.chartColumn}>
      {active && (
        <View style={styles.peakIndicatorContainer}>
          <View style={styles.peakRing} />
          <View style={styles.peakCore} />
        </View>
      )}
      <View style={[styles.dotsWrapper, active && styles.dotsWrapperActive]}>
        {dots.reverse()}
      </View>
    </View>
  );
}

// ─── Profile Skeleton Component ──────────────────────────────────────────────
function ProfileSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingTop: 12 }]}>
        <View style={styles.headerIconBtn} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerIconBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section Skeleton */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarBorder, { borderColor: '#E5E7EB' }]}>
            <Animated.View style={[styles.avatarCircle, { backgroundColor: '#E5E7EB', opacity: shimmerAnim }]} />
          </View>
          <Animated.View style={{ width: 140, height: 24, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8, alignSelf: 'center', opacity: shimmerAnim }} />
          <Animated.View style={{ width: 180, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, alignSelf: 'center', opacity: shimmerAnim }} />
        </View>

        {/* Info Cards Skeleton */}
        <View style={styles.infoRow}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.infoCard}>
              <Animated.View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', marginBottom: 8, alignSelf: 'center', opacity: shimmerAnim }} />
              <Animated.View style={{ width: 50, height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 6, alignSelf: 'center', opacity: shimmerAnim }} />
              <Animated.View style={{ width: 60, height: 14, backgroundColor: '#E5E7EB', borderRadius: 4, alignSelf: 'center', opacity: shimmerAnim }} />
            </View>
          ))}
        </View>

        {/* Chart Card Skeleton */}
        <View style={[styles.chartCard, { height: 180, justifyContent: 'center' }]}>
          <Animated.View style={{ width: '50%', height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, alignSelf: 'flex-start', marginBottom: 20, opacity: shimmerAnim }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 }}>
            {[35, 45, 25, 55, 65, 40, 50, 80, 45, 60, 30, 50, 70, 48, 38].map((h, i) => (
              <Animated.View key={i} style={{ width: 6, height: `${h}%`, backgroundColor: '#E5E7EB', borderRadius: 3, opacity: shimmerAnim }} />
            ))}
          </View>
        </View>

        {/* Settings Cards Skeleton */}
        <View style={styles.settingsGroup}>
          <Animated.View style={{ width: '40%', height: 14, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 12, opacity: shimmerAnim }} />
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', height: 56, borderBottomWidth: i < 3 ? 1 : 0, borderColor: COLORS.borderLight }}>
              <Animated.View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#E5E7EB', marginRight: 12, opacity: shimmerAnim }} />
              <Animated.View style={{ flex: 1, height: 14, backgroundColor: '#E5E7EB', borderRadius: 4, opacity: shimmerAnim }} />
              <Animated.View style={{ width: 16, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, opacity: shimmerAnim }} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile, getMyJobs, getUserById, setIsGuest, jobs, likedJobs, notifications, clearNotifications, fetchJobs } = useAuth();
  const myJobs = getMyJobs ? getMyJobs() : [];
  const bookmarkedJobs = (jobs || []).filter(j => likedJobs?.includes(j.id));

  // ─── ALL HOOKS MUST BE AT THE TOP (Rules of Hooks) ─────────────────────────
  const [notif, setNotif] = useState(true);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedLiker, setSelectedLiker] = useState(null);
  const [showLikerModal, setShowLikerModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [showAvatarError, setShowAvatarError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  
  const isFocused = useIsFocused();
  const [lastAvatar, setLastAvatar] = useState(user?.avatar || '');
  const [newAvatarUri, setNewAvatarUri] = useState(null);

  // Trigger loading skeleton ONLY when the user ID transitions (e.g., login)
  const lastUserId = useRef(user?.id || null);

  useEffect(() => {
    if (user) {
      if (user.id !== lastUserId.current) {
        // User just logged in or switched account! Trigger skeleton!
        setProfileLoading(true);
        lastUserId.current = user.id;
        const timer = setTimeout(() => setProfileLoading(false), 1200);
        return () => clearTimeout(timer);
      } else {
        // Already logged in, keep profile visible
        setProfileLoading(false);
      }
    } else {
      lastUserId.current = null;
      setProfileLoading(true);
    }
  }, [user]);

  // Sync avatar updates
  useEffect(() => {
    if (user) {
      if (user.avatar) {
        if (user.avatar !== lastAvatar && user.avatar !== newAvatarUri) {
          setNewAvatarUri(user.avatar);
        }
      } else {
        setLastAvatar('');
        setNewAvatarUri(null);
      }
    } else {
      setLastAvatar('');
      setNewAvatarUri(null);
    }
  }, [user?.avatar, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    setProfileLoading(true);
    if (fetchJobs) {
      await fetchJobs();
    }
    setRefreshing(false);
    setTimeout(() => {
      setProfileLoading(false);
    }, 1200);
  };

  // Upload overlay states
  const [uploadOverlay, setUploadOverlay] = useState('hidden'); // 'hidden' | 'uploading' | 'success' | 'error'
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');
  const uploadSpinAnim = useRef(new Animated.Value(0)).current;
  const uploadScaleAnim = useRef(new Animated.Value(0)).current;
  const uploadCheckAnim = useRef(new Animated.Value(0)).current;

  // Auto-sync edit fields when user data changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditTitle(user.title || '');
      setEditPhone(user.phone || '');
      setEditLocation(user.location || '');
      setEditAvatar(user.avatar || '');
    }
  }, [user]);

  // ─── Derived values ────────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'JL';

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const requestGalleryPermission = async () => {
    try {
      // 1. Get current permission status
      const existingPermission = await ImagePicker.getMediaLibraryPermissionsAsync();

      // If already granted, return true
      if (existingPermission.granted) {
        return true;
      }

      // 2. Request permission if we can ask again
      if (existingPermission.canAskAgain) {
        const response = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (response.granted) {
          return true;
        }
      }

      // 3. If denied or cannot ask again, show settings redirect alert
      Alert.alert(
        'Gallery Access Blocked 🚫',
        'Gallery access is currently disabled. Please enable Photos/Media permission in your device settings to select and upload a profile photo.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            style: 'default',
            onPress: () => {
              Linking.openSettings().catch(() => {
                Alert.alert('Error', 'Unable to open system settings. Please open Settings manually.');
              });
            }
          }
        ]
      );
      return false;
    } catch (error) {
      console.warn('Error checking gallery permission:', error);
      return false;
    }
  };

  const handlePickAvatar = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setEditAvatar(localUri);
      }
    } catch (e) {
      console.warn('Error picking image:', e);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const handlePickAvatarAndSave = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const localUri = asset.uri;

        console.log('📸 [AVATAR] Image selected:', localUri);

        setEditAvatar(localUri);
        setUploadOverlay('uploading');
        uploadSpinAnim.setValue(0);
        uploadScaleAnim.setValue(0);
        uploadCheckAnim.setValue(0);

        Animated.loop(
          Animated.timing(uploadSpinAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();

        Animated.spring(uploadScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();

        console.log('🚀 [AVATAR] Calling updateProfile...');

        let res;
        try {
          res = await updateProfile({
            name: user?.name,
            title: user?.title,
            phone: user?.phone,
            location: user?.location,
            avatar: localUri,
          });
          console.log('✅ [AVATAR] updateProfile response:', JSON.stringify(res));
        } catch (dbErr) {
          console.warn('❌ [AVATAR] updateProfile exception:', dbErr?.message || dbErr);
          res = { success: false, message: dbErr?.message };
        }

        uploadSpinAnim.stopAnimation();
        console.log('🎯 [AVATAR] Upload result success:', res?.success);

        if (res?.success) {
          setUploadOverlay('success');
          uploadCheckAnim.setValue(0);
          Animated.sequence([
            Animated.spring(uploadCheckAnim, {
              toValue: 1.2,
              friction: 3,
              tension: 100,
              useNativeDriver: true,
            }),
            Animated.spring(uploadCheckAnim, {
              toValue: 1,
              friction: 5,
              useNativeDriver: true,
            }),
          ]).start();
          setTimeout(() => setUploadOverlay('hidden'), 1800);
        } else {
          console.warn('❌ [AVATAR] Upload failed:', res?.message);
          setUploadErrorMessage(res?.message || 'Upload failed');
          setUploadOverlay('error');
          setTimeout(() => setUploadOverlay('hidden'), 3000);
        }
      } else {
        console.log('📸 [AVATAR] Image picker cancelled');
      }
    } catch (e) {
      console.warn('❌ [AVATAR] Image picker error:', e?.message || e);
      setUploadErrorMessage(e?.message || 'An unexpected error occurred');
      setUploadOverlay('error');
      setTimeout(() => setUploadOverlay('hidden'), 3000);
    }
  };
  const handleSaveProfile = async () => {
    setSaving(true);
    const res = await updateProfile({
      name: editName,
      title: editTitle,
      phone: editPhone,
      location: editLocation,
      avatar: editAvatar,
    });
    setSaving(false);
    if (res?.success) {
      setEditing(false);
    } else {
      Alert.alert('Update Failed', res?.message || 'Could not update profile details.');
    }
  };

  // ─── Conditional renders (after all hooks) ─────────────────────────────────
  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <View style={[styles.header, { paddingTop: 12 }]}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconCircle}>
            <Ionicons name="person-outline" size={42} color={COLORS.textPrimary} />
          </View>
          <Text style={styles.guestTitle}>Professional Profile</Text>
          <Text style={styles.guestSub}>
            Create an account or sign in to set up your profile, showcase your skills, track job applications, and post career opportunities.
          </Text>
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => setIsGuest(false)}
            activeOpacity={0.88}
          >
            <Text style={styles.guestBtnText}>Create Account / Sign In</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.textPrimary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (uploadOverlay === 'uploading') {
    return (
      <SplashScreen
        message="Uploading profile photo..."
        subMessage="Saving your beautiful avatar to servers dynamically"
        showLottie={true}
      />
    );
  }

  if (saving) {
    return (
      <SplashScreen
        message="Saving profile changes..."
        subMessage="Updating your professional details in the database"
        showLottie={true}
      />
    );
  }

  if (showHowItWorksModal) {
    return (
      <View style={[styles.guideScreenContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        
        {/* Guide Header */}
        <View style={[styles.guideScreenHeader, { paddingTop: 12 }]}>
          <TouchableOpacity style={styles.guideBackBtn} onPress={() => setShowHowItWorksModal(false)} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.guideScreenHeaderTitle}>Platform Guide</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Editorial Banner */}
          <View style={styles.editorialBanner}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80' }} 
              style={styles.editorialBannerImg} 
            />
            <View style={styles.editorialOverlay}>
              <Text style={styles.editorialTitle}>The Jobify Vision</Text>
              <Text style={styles.editorialSub}>Discover how our professional, data-driven algorithm powers a premier marketplace for candidates and recruiters alike.</Text>
            </View>
          </View>

          {/* Section Heading */}
          <Text style={styles.guideSectionHeading}>Platform Mechanics & Guidelines</Text>

          {/* Card 1: Explore Opportunities */}
          <View style={styles.guideDetailCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80' }} 
              style={styles.guideDetailImg} 
            />
            <View style={styles.guideDetailContent}>
              <View style={styles.guideDetailTitleRow}>
                <View style={[styles.guideIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="search" size={18} color="#3B82F6" />
                </View>
                <Text style={styles.guideDetailTitle}>1. Discover Elite Careers</Text>
              </View>
              <Text style={styles.guideDetailDesc}>
                Browse professional job opportunities globally. Apply instantly with a single tap and track your application status in real-time on your dashboard.
              </Text>
            </View>
          </View>

          {/* Card 2: Featured Algorithm */}
          <View style={styles.guideDetailCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80' }} 
              style={styles.guideDetailImg} 
            />
            <View style={styles.guideDetailContent}>
              <View style={styles.guideDetailTitleRow}>
                <View style={[styles.guideIconWrap, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="sparkles" size={18} color="#10B981" />
                </View>
                <Text style={styles.guideDetailTitle}>2. Premium "Featured" Upgrade</Text>
              </View>
              <Text style={styles.guideDetailDesc}>
                Jobs achieving 10+ likes automatically upgrade to premium status. The listing gets highlighted with an elegant Emerald border, gold drop shadows, and a crown icon 👑.
              </Text>
            </View>
          </View>

          {/* Card 3: Hot Tag */}
          <View style={styles.guideDetailCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80' }} 
              style={styles.guideDetailImg} 
            />
            <View style={styles.guideDetailContent}>
              <View style={styles.guideDetailTitleRow}>
                <View style={[styles.guideIconWrap, { backgroundColor: '#FFF5F5' }]}>
                  <Ionicons name="flame" size={18} color="#EF4444" />
                </View>
                <Text style={styles.guideDetailTitle}>3. Instant "Hot 🔥" Trending Status</Text>
              </View>
              <Text style={styles.guideDetailDesc}>
                Postings that gain 10+ likes within the first 24 hours of creation are marked as Hot 🔥. This high-velocity engagement highlights listing popularity to active job-seekers.
              </Text>
            </View>
          </View>

          {/* Card 4: Verified Badge */}
          <View style={styles.guideDetailCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80' }} 
              style={styles.guideDetailImg} 
            />
            <View style={styles.guideDetailContent}>
              <View style={styles.guideDetailTitleRow}>
                <View style={[styles.guideIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="checkmark-circle" size={18} color="#15803D" />
                </View>
                <Text style={styles.guideDetailTitle}>4. Verified Network Trust</Text>
              </View>
              <Text style={styles.guideDetailDesc}>
                Verified profiles and job posters are labeled with our custom vector tick emblem. This eliminates credentials offset issues and guarantees authentic hiring channels.
              </Text>
            </View>
          </View>

          {/* Finish Button */}
          <TouchableOpacity 
            style={styles.guideScreenFinishBtn} 
            onPress={() => setShowHowItWorksModal(false)}
            activeOpacity={0.88}
          >
            <Text style={styles.guideScreenFinishText}>Got It! Return to Profile 🚀</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const chartData = [
    { height: 25, active: false }, { height: 35, active: false },
    { height: 18, active: false }, { height: 48, active: false },
    { height: 55, active: false }, { height: 30, active: false },
    { height: 40, active: false }, { height: 82, active: true },
    { height: 35, active: false }, { height: 50, active: false },
    { height: 22, active: false }, { height: 44, active: false },
    { height: 60, active: false }, { height: 38, active: false },
    { height: 28, active: false },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: 12 }]}>
        {editing ? (
          <TouchableOpacity 
            style={styles.headerIconBtn} 
            onPress={() => setEditing(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => {
            if (editing) {
              handleSaveProfile();
            } else {
              setEditName(user?.name || '');
              setEditTitle(user?.title || '');
              setEditPhone(user?.phone || '');
              setEditLocation(user?.location || '');
              setEditing(true);
            }
          }}
        >
          <Ionicons
            name={editing ? 'checkmark' : 'create-outline'}
            size={19}
            color={editing ? COLORS.accentGreen : COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentGreen} />
        }
      >

        {/* Avatar + Basic Info */}
        <View style={styles.avatarSection}>
          {editing ? (
            <TouchableOpacity
              style={styles.avatarBorder}
              onPress={handlePickAvatar}
              activeOpacity={0.8}
            >
              {editAvatar ? (
                <Image source={{ uri: editAvatar }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.avatarBorder}
              onPress={handlePickAvatarAndSave}
              activeOpacity={0.8}
            >
              {/* Layer 1: Base image (last active image, cached and immediate) */}
              {lastAvatar ? (
                <Image
                  source={{ uri: lastAvatar }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}

              {/* Layer 2: Incoming avatar image (loading on top absolute) */}
              {newAvatarUri && newAvatarUri !== lastAvatar && (
                <Image
                  source={{ uri: newAvatarUri }}
                  style={[styles.avatarImage, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
                  resizeMode="cover"
                  onLoad={() => {
                    setLastAvatar(newAvatarUri);
                    setNewAvatarUri(null);
                    setShowAvatarError(false);
                  }}
                  onError={() => {
                    setNewAvatarUri(null);
                    setShowAvatarError(true);
                  }}
                />
              )}

              {showAvatarError && !lastAvatar && !newAvatarUri && (
                <View style={[styles.avatarCircle, { position: 'absolute', backgroundColor: '#E5E7EB' }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          {editing && (
            <TouchableOpacity onPress={handlePickAvatar} style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.accentGreen, fontSize: 13, fontWeight: '700' }}>Change Profile Photo</Text>
            </TouchableOpacity>
          )}

          {editing ? (
            <View style={styles.editFields}>
              <View style={styles.editRow}>
                <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} style={styles.editIcon} />
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full name"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={styles.editRow}>
                <Ionicons name="briefcase-outline" size={16} color={COLORS.textSecondary} style={styles.editIcon} />
                <TextInput
                  style={styles.editInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Job title / Role"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={styles.editRow}>
                <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} style={styles.editIcon} />
                <TextInput
                  style={styles.editInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="+92 300 1234567"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.editRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} style={styles.editIcon} />
                <TextInput
                  style={styles.editInput}
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="Location"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user?.name || 'Jobify User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>

              <TouchableOpacity
                style={styles.uploadPhotoBtn}
                onPress={handlePickAvatarAndSave}
                activeOpacity={0.85}
              >
                <Ionicons name="camera-outline" size={15} color="#111111" style={{ marginRight: 6 }} />
                <Text style={styles.uploadPhotoText}>Upload Profile Photo</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info Cards Row - Initials / Phone / Role */}
        {!editing && (
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <View style={[styles.infoIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="briefcase" size={16} color="#15803D" />
              </View>
              <Text style={styles.infoLabel}>Jobs Posted</Text>
              <Text style={styles.infoValue}>{myJobs.length}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="call" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {user?.phone || 'Not set'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIconWrap, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="calendar-outline" size={16} color="#F97316" />
              </View>
              <Text style={styles.infoLabel}>Member</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {user?.joinDate || 'Jan 2026'}
              </Text>
            </View>
          </View>
        )}

        {/* Job Title Info */}
        {!editing && user?.title && (
          <View style={styles.titleCard}>
            <Ionicons name="briefcase-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.titleCardText}>{user.title}</Text>
            {user?.location && (
              <>
                <View style={styles.titleDot} />
                <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.titleCardText}>{user.location}</Text>
              </>
            )}
          </View>
        )}

        {/* Dotted Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartCardHeader}>
            <Text style={styles.chartCardTitle}>Total Rate</Text>
            <TouchableOpacity style={styles.dropdownBtn}>
              <Text style={styles.dropdownText}>Yearly </Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.rateBadge}>
            <Text style={styles.rateValue}>$118,952.34</Text>
            <Text style={styles.rateLabel}>Total Spend</Text>
          </View>
          <View style={styles.chartVisualizer}>
            {chartData.map((data, index) => (
              <DottedColumn key={index} height={data.height} active={data.active} />
            ))}
          </View>
        </View>

        {/* 3-Grid Feature Cards */}
        <View style={styles.featureGrid}>
          <TouchableOpacity style={styles.gridCard} onPress={() => setShowNotifModal(true)} activeOpacity={0.8}>
            <View style={styles.gridCardHeader}>
              <View style={styles.iconCircleBlue}>
                <Ionicons name="notifications" size={16} color="#3B82F6" />
                {notif && <View style={styles.blueDot} />}
              </View>
            </View>
            <Text style={styles.gridCardLabel}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => setShowHowItWorksModal(true)} 
            activeOpacity={0.8}
          >
            <View style={styles.gridCardHeader}>
              <View style={styles.iconCircleBlueLight}>
                <Ionicons name="help-circle" size={16} color="#60A5FA" />
              </View>
            </View>
            <Text style={styles.gridCardLabel}>How It Works</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <View style={styles.gridCardHeader}>
              <View style={styles.iconCirclePurple}>
                <Ionicons name="chatbubble" size={15} color="#8B5CF6" />
              </View>
            </View>
            <Text style={styles.gridCardLabel}>Rate us</Text>
          </TouchableOpacity>
        </View>

        {/* My Job Listings */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Job Listings ({myJobs.length})</Text>
            {myJobs.length === 0 ? (
              <View style={styles.emptyJobsCard}>
                <Ionicons name="folder-open-outline" size={24} color={COLORS.textLight} />
                <Text style={styles.emptyJobsText}>No jobs posted yet.</Text>
              </View>
            ) : (
              myJobs.map(job => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobRow}
                  activeOpacity={0.7}
                  onPress={() => setSelectedJob(job)}
                >
                  <View style={styles.jobRowLeft}>
                    <Text style={styles.jobRowTitle}>{job.title}</Text>
                    <Text style={styles.jobRowSub}>{job.type} • {job.location}</Text>
                  </View>
                  <View style={[styles.jobRowBadge, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.jobRowBadgeText, { color: '#2E7D32' }]}>{job.salary}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Bookmarked Opportunities */}
        {user && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Bookmarked Opportunities ({bookmarkedJobs.length})</Text>
              <Ionicons name="heart" size={16} color="#E53935" />
            </View>
            {bookmarkedJobs.length === 0 ? (
              <View style={styles.emptyJobsCard}>
                <Ionicons name="heart-dislike-outline" size={24} color={COLORS.textLight} />
                <Text style={styles.emptyJobsText}>No bookmarked jobs yet.</Text>
              </View>
            ) : (
              bookmarkedJobs.map(job => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobRow}
                  activeOpacity={0.7}
                  onPress={() => setSelectedJob(job)}
                >
                  <View style={styles.jobRowLeft}>
                    <Text style={styles.jobRowTitle}>{job.title}</Text>
                    <Text style={styles.jobRowSub}>{job.company} • {job.location}</Text>
                  </View>
                  <View style={[styles.jobRowBadge, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.jobRowBadgeText, { color: '#EF4444' }]}>❤️ {job.likes || 0}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>Account & Utilities</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsRow}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="lock-closed" size={16} color={COLORS.accentGreen} />
              </View>
              <Text style={styles.settingsLabel}>Security & Privacy</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingsRow} onPress={handleLogout}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out" size={16} color="#EF4444" />
              </View>
              <Text style={[styles.settingsLabel, { color: '#EF4444' }]}>Log Out Account</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerVersion}>Jobify v1.0.0</Text>
        <AdBanner />
      </ScrollView>

      {/* Instagram-Style Notifications Modal */}
      <Modal
        visible={showNotifModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowNotifModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {(!notifications || notifications.length === 0) ? (
                <View style={styles.emptyNotifBox}>
                  <Ionicons name="notifications-off-outline" size={44} color={COLORS.textLight} />
                  <Text style={styles.emptyNotifText}>No activity yet</Text>
                  <Text style={{ fontSize: 13, color: COLORS.textLight, textAlign: 'center', marginTop: 4 }}>
                    When someone likes your job posts, you'll see it here.
                  </Text>
                </View>
              ) : (() => {
                const groups = { 'Today': [], 'This Week': [], 'Earlier': [] };
                const now = new Date();

                notifications.forEach(n => {
                  if (n.id === 'welcome' || !n.created_at) {
                    groups['Today'].push(n);
                    return;
                  }
                  const date = new Date(n.created_at);
                  const diffDays = (now - date) / (1000 * 60 * 60 * 24);

                  if (date.toDateString() === now.toDateString()) {
                    groups['Today'].push(n);
                  } else if (diffDays < 7) {
                    groups['This Week'].push(n);
                  } else {
                    groups['Earlier'].push(n);
                  }
                });

                return Object.keys(groups).map(groupName => {
                  const list = groups[groupName];
                  if (list.length === 0) return null;

                  return (
                    <View key={groupName} style={{ marginBottom: 8 }}>
                      <Text style={styles.igGroupHeader}>{groupName}</Text>
                      {list.map((n) => {
                        const isLike = n.type === 'like';
                        const isSystem = n.type === 'system' || n.id === 'welcome';
                        const likerName = n.likerProfile?.name || 'Someone';
                        const avatarInitials = n.likerInitials ||
                          (likerName !== 'Someone' ? likerName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??');

                        return (
                          <TouchableOpacity
                            key={n.id}
                            style={styles.igNotifRow}
                            activeOpacity={0.6}
                            onPress={() => {
                              const candidate = n.likerProfile || (n.likerId ? getUserById(n.likerId) : null);
                              if (candidate) {
                                setSelectedLiker(candidate);
                                setShowLikerModal(true);
                              }
                            }}
                          >
                            {/* Avatar */}
                            {isLike ? (
                              n.likerProfile?.avatar && n.likerProfile.avatar.length > 5 ? (
                                <Image source={{ uri: n.likerProfile.avatar }} style={styles.igAvatarImage} resizeMode="cover" />
                              ) : (
                                <View style={styles.igAvatar}>
                                  <Text style={styles.igAvatarText}>{avatarInitials}</Text>
                                </View>
                              )
                            ) : isSystem ? (
                              <View style={[styles.igIconCircle, { backgroundColor: '#EFF6FF' }]}>
                                <Ionicons name="sparkles" size={18} color="#3B82F6" />
                              </View>
                            ) : (
                              <View style={[styles.igIconCircle, { backgroundColor: '#ECFDF5' }]}>
                                <Ionicons name="briefcase" size={18} color="#10B981" />
                              </View>
                            )}

                            {/* Content - Instagram inline style */}
                            <View style={{ flex: 1 }}>
                              {isLike ? (
                                <Text style={styles.igNotifText} numberOfLines={3}>
                                  <Text style={styles.igBoldName}>{likerName}</Text>
                                  {' liked your job post.  '}
                                  <Text style={styles.igTimeText}>{n.time}</Text>
                                </Text>
                              ) : (
                                <View>
                                  <Text style={styles.igNotifText} numberOfLines={2}>
                                    <Text style={styles.igBoldName}>{n.title}  </Text>
                                    <Text style={styles.igTimeText}>{n.time}</Text>
                                  </Text>
                                  <Text style={styles.igSubText} numberOfLines={2}>{n.message}</Text>
                                </View>
                              )}
                            </View>

                            {/* Like heart indicator */}
                            {isLike && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                                <Ionicons name="heart" size={16} color="#EF4444" />
                                <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} style={{ marginLeft: 4 }} />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                });
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Liker/Candidate Profile Modal Card */}
      <Modal
        visible={showLikerModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLikerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '58%', borderTopLeftRadius: 32, borderTopRightRadius: 32 }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Candidate Profile</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowLikerModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            {selectedLiker && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingVertical: 10 }}>
                {/* Initials Avatar */}
                <View style={styles.likerAvatarCircle}>
                  {selectedLiker?.avatar && selectedLiker.avatar.length > 5 ? (
                    <Image source={{ uri: selectedLiker.avatar }} style={styles.likerAvatarImage} resizeMode="cover" />
                  ) : (
                    <Text style={styles.likerAvatarText}>
                      {selectedLiker?.name ? selectedLiker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'C'}
                    </Text>
                  )}
                </View>

                {/* Name & Title */}
                <Text style={styles.likerName}>{selectedLiker.name}</Text>
                <Text style={styles.likerTitle}>{selectedLiker.title || 'Job Seeker'}</Text>

                {/* Divider */}
                <View style={styles.likerDivider} />

                {/* Detailed Info Cards */}
                <View style={styles.likerInfoContainer}>
                  <View style={styles.likerInfoRow}>
                    <Ionicons name="location" size={16} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                    <Text style={styles.likerInfoText}>{selectedLiker.location || 'Lahore, Pakistan'}</Text>
                  </View>

                  <View style={styles.likerInfoRow}>
                    <Ionicons name="call" size={16} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                    <Text style={styles.likerInfoText}>{selectedLiker.phone || '+92 300 1234567'}</Text>
                  </View>

                  <View style={styles.likerInfoRow}>
                    <Ionicons name="mail" size={16} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                    <Text style={styles.likerInfoText}>{selectedLiker.email || 'candidate@gmail.com'}</Text>
                  </View>
                </View>

                {/* Connect Action Buttons */}
                <View style={styles.likerActionsRow}>
                  <TouchableOpacity
                    style={[styles.likerActionButton, { backgroundColor: '#EFF6FF' }]}
                    onPress={() => Alert.alert('Direct Call', `Dialing ${selectedLiker.phone || '+92 300 1234567'}...`)}
                  >
                    <Ionicons name="call" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
                    <Text style={[styles.likerActionText, { color: '#3B82F6' }]}>Call Candidate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.likerActionButton, { backgroundColor: '#ECFDF5' }]}
                    onPress={() => Alert.alert('Email Sent', `Opening mail client for ${selectedLiker.email || 'candidate@gmail.com'}...`)}
                  >
                    <Ionicons name="mail" size={16} color="#10B981" style={{ marginRight: 6 }} />
                    <Text style={[styles.likerActionText, { color: '#10B981' }]}>Email</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Bookmarked/My Job Details Modal */}
      <Modal
        visible={!!selectedJob}
        animationType="slide"
        onRequestClose={() => setSelectedJob(null)}
      >
        <ScrollView style={styles.modalContainer} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          {/* Nav */}
          <View style={styles.detailNav}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setSelectedJob(null)}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.detailNavTitle}>Job Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedJob && (
            <>
              {/* Hero */}
              <View style={styles.detailHeroCard}>
                <View style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>{(selectedJob.company || 'C')[0]}</Text>
                </View>
                <Text style={styles.detailTitle}>{selectedJob.title}</Text>
                <Text style={styles.detailCompany}>{selectedJob.company || 'TechCorp'}</Text>
                <View style={styles.detailBadgeRow}>
                  <View style={[styles.typeBadge, { backgroundColor: COLORS.accentYellow }]}>
                    <Text style={[styles.typeBadgeText, { color: COLORS.textPrimary }]}>{selectedJob.type}</Text>
                  </View>
                  <View style={styles.detailBadge}>
                    <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.detailBadgeText}> {selectedJob.location}</Text>
                  </View>
                </View>
                <Text style={styles.detailSalary}>{selectedJob.salary}</Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                {[
                  { value: selectedJob.applicants || 0, label: 'Applicants' },
                  { value: selectedJob.likes || 0, label: 'Likes' },
                  { value: selectedJob.postedAt || '2 days ago', label: 'Posted' },
                ].map((s) => (
                  <View key={s.label} style={styles.statCard}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Description */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Job Description</Text>
                <Text style={styles.descText}>{selectedJob.description}</Text>
              </View>

              {/* Requirements */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Requirements</Text>
                {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
                  selectedJob.requirements.map((req, i) => (
                    <View key={i} style={styles.reqItem}>
                      <View style={styles.reqDot} />
                      <Text style={styles.reqText}>{req}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.reqItem}>
                    <View style={styles.reqDot} />
                    <Text style={styles.reqText}>Professional communication skills</Text>
                  </View>
                )}
              </View>

              {/* Poster Profile */}
              {selectedJob.posterProfile && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Job Poster Profile</Text>
                  <View style={styles.posterRow}>
                    <View style={styles.posterAvatarCircle}>
                      {selectedJob.posterProfile.avatar ? (
                        <Image source={{ uri: selectedJob.posterProfile.avatar }} style={styles.posterAvatarImage} />
                      ) : (
                        <Text style={styles.posterAvatarText}>
                          {selectedJob.posterProfile.name ? selectedJob.posterProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EM'}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.posterName}>{selectedJob.posterProfile.name || 'Anonymous Employer'}</Text>
                      <Text style={styles.posterTitle}>{selectedJob.posterProfile.title || 'HR Manager / Employer'}</Text>

                      <View style={styles.posterContactRow}>
                        <Ionicons name="mail-outline" size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.posterContactText}>{selectedJob.posterProfile.email || 'employer@joblink.com'}</Text>
                      </View>

                      {selectedJob.posterProfile.location ? (
                        <View style={[styles.posterContactRow, { marginTop: 4 }]}>
                          <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={styles.posterContactText}>{selectedJob.posterProfile.location}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </Modal>

      {/* ─── Upload Overlay Modal ─────────────────────────────────────── */}
      <Modal
        visible={uploadOverlay !== 'hidden'}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.uploadOverlay}>
          <Animated.View style={[
            styles.uploadCard,
            { transform: [{ scale: uploadScaleAnim }] }
          ]}>
            {uploadOverlay === 'uploading' && (
              <>
                <Animated.View style={{
                  transform: [{
                    rotate: uploadSpinAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }}>
                  <View style={styles.uploadSpinner}>
                    <View style={styles.uploadSpinnerArc} />
                  </View>
                </Animated.View>
                <Text style={styles.uploadStatusTitle}>Uploading Photo...</Text>
                <Text style={styles.uploadStatusSub}>Please wait while we update your profile</Text>
              </>
            )}
            {uploadOverlay === 'success' && (
              <>
                <Animated.View style={[
                  styles.uploadSuccessCircle,
                  { transform: [{ scale: uploadCheckAnim }] }
                ]}>
                  <Ionicons name="checkmark" size={40} color="#FFFFFF" />
                </Animated.View>
                <Text style={styles.uploadStatusTitle}>Photo Updated! 🎉</Text>
                <Text style={styles.uploadStatusSub}>Your profile picture has been saved successfully</Text>
              </>
            )}
            {uploadOverlay === 'error' && (
              <>
                <View style={styles.uploadErrorCircle}>
                  <Ionicons name="close" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.uploadStatusTitle}>Upload Failed</Text>
                <Text style={styles.uploadStatusSub}>
                  {uploadErrorMessage || 'Something went wrong. Please try again.'}
                </Text>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 180 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 0, paddingBottom: 12,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },

  // Avatar
  avatarSection: { alignItems: 'center', marginTop: 18, marginBottom: 16 },
  avatarBorder: {
    width: 104, height: 104, borderRadius: 52,
    borderWidth: 3, borderColor: '#B5DCB9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#0F5132', alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#15803D',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  userEmail: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  uploadPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentYellow || '#EDFC62',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    shadowColor: COLORS.accentYellow || '#EDFC62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadPhotoText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111111',
  },

  // Info Row Cards
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  infoCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 14,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  infoIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  infoInitialsText: { fontSize: 13, fontWeight: '800', color: COLORS.accentGreen },
  infoLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },

  // Title card
  titleCard: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    backgroundColor: COLORS.bgCard, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 16, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  titleCardText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  titleDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textLight },

  // Edit Mode
  editFields: { width: '100%', gap: 10, marginTop: 4, marginBottom: 8 },
  editRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAF9', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#EEF2F0',
    paddingHorizontal: 14, height: 48,
  },
  editIcon: { marginRight: 10 },
  editInput: { flex: 1, fontSize: FONTS.sizes.sm + 1, color: COLORS.textPrimary, fontWeight: '600' },

  // Chart Card
  chartCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 28, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06, shadowRadius: 18, elevation: 4, marginBottom: 16,
  },
  chartCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartCardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, backgroundColor: COLORS.bgSecondary, borderRadius: 12 },
  dropdownText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  rateBadge: {
    backgroundColor: COLORS.accentYellow, alignSelf: 'flex-start',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 20,
    shadowColor: COLORS.accentYellow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  rateValue: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  rateLabel: { fontSize: FONTS.sizes.xs, color: '#5C6E12', fontWeight: '600', marginTop: 1 },
  chartVisualizer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    height: 100, paddingHorizontal: 4,
    borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#F0F0F0', paddingTop: 10,
  },
  chartColumn: { alignItems: 'center', width: 14, height: '100%', justifyContent: 'flex-end' },
  dotsWrapper: { gap: 3, alignItems: 'center' },
  dotsWrapperActive: { gap: 3 },
  chartDot: { width: 4, height: 4, borderRadius: 2 },
  chartDotActive: { backgroundColor: '#E8F542', width: 5, height: 5, borderRadius: 2.5 },
  chartDotInactive: { backgroundColor: '#9EAE9F' },
  peakIndicatorContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  peakRing: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#E8F542', backgroundColor: '#FFFFFF', position: 'absolute' },
  peakCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E8F542' },

  // Feature Grid
  featureGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20 },
  gridCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 16, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  gridCardHeader: { marginBottom: 24 },
  iconCircleBlue: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  blueDot: { position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFFFFF' },
  iconCircleBlueLight: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
  iconCirclePurple: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  gridCardLabel: { fontSize: FONTS.sizes.xs + 1, fontWeight: '700', color: COLORS.textPrimary },

  // Job Section
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10, paddingLeft: 2 },
  emptyJobsCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyJobsText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  jobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  jobRowLeft: { flex: 1 },
  jobRowTitle: { fontSize: FONTS.sizes.sm + 1, fontWeight: '700', color: COLORS.textPrimary },
  jobRowSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  jobRowBadge: { backgroundColor: COLORS.accentYellow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  jobRowBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textPrimary },

  // Settings
  settingsSection: { marginBottom: 15 },
  sectionHeader: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10, paddingLeft: 2 },
  settingsCard: { backgroundColor: COLORS.bgCard, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingsIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  settingsLabel: { flex: 1, fontSize: FONTS.sizes.sm + 1, fontWeight: '700', color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginLeft: 66 },
  footerVersion: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 24 },

  // Guest styles
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  guestIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  guestSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  guestBtn: {
    backgroundColor: COLORS.accentYellow,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // Notification Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Premium semi-transparent overlay
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgPrimary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    height: '75%', // Modern bottom-sheet style height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyNotifBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyNotifText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 8,
    paddingLeft: 4,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notifMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    marginLeft: 10,
  },
  notifMsg: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 16,
  },

  // Instagram-Style Notification Styles
  igGroupHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 12,
    paddingLeft: 2,
  },
  igNotifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  igAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  igAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  igAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  igIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  igNotifText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    fontWeight: '400',
    lineHeight: 19,
  },
  igBoldName: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  igTimeText: {
    fontSize: 12.5,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  igSubText: {
    fontSize: 12.5,
    color: COLORS.textLight,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 17,
  },

  likerAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  likerAvatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  likerAvatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  likerName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  likerTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 16,
  },
  likerDivider: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.borderLight,
    marginBottom: 16,
  },
  likerInfoContainer: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  likerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likerInfoText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  likerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  likerActionButton: {
    flex: 1,
    borderRadius: 18,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  likerActionText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // Job details styling
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  detailNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: COLORS.bgPrimary,
  },
  detailNavTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  detailHeroCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 26, margin: 20, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
  },
  detailAvatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.accentYellow, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  detailAvatarText: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  detailTitle: { fontSize: FONTS.sizes.lg + 1, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  detailCompany: { fontSize: FONTS.sizes.sm + 1, color: COLORS.textSecondary, marginTop: 4 },
  detailBadgeRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 14 },
  detailBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgSecondary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  detailBadgeText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '500' },
  detailSalary: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  statValue: { fontSize: FONTS.sizes.sm + 1, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 4 },
  sectionCard: { backgroundColor: COLORS.bgCard, borderRadius: 20, marginHorizontal: 20, marginBottom: 14, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  descText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 22 },
  reqItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reqDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accentYellow, marginRight: 10 },
  reqText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontSize: FONTS.sizes.xs - 1, fontWeight: '800' },

  // Poster Profile Styles
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  posterAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  posterAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  posterName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  posterTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  posterContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterContactText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Upload Overlay
  uploadOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  uploadSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadSpinnerArc: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: 'transparent',
    borderTopColor: '#15803D',
    borderRightColor: '#15803D',
  },
  uploadSuccessCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadErrorCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadStatusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  uploadStatusSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Full Screen Guide Screen Styles
  guideScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  guideScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
    backgroundColor: COLORS.bgCard,
  },
  guideBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAF9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F0',
  },
  guideScreenHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  editorialBanner: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  editorialBannerImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  editorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  editorialTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  editorialSub: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 16,
    fontWeight: '500',
  },
  guideSectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  guideDetailCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEF2F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  guideDetailImg: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  guideDetailContent: {
    padding: 18,
  },
  guideDetailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  guideIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  guideDetailTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  guideDetailDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    fontWeight: '500',
  },
  guideScreenFinishBtn: {
    backgroundColor: '#111111',
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  guideScreenFinishText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
