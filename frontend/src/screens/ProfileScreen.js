import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Dimensions, TextInput,
  Animated, Easing, Modal, Linking, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const blurhash = 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import SplashScreen from '../components/splashscreen';
import AdBanner from '../components/AdBanner';

const { width } = Dimensions.get('window');

function SolidBar({ height, active, onPress }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: height,
      tension: 50,
      friction: 6,
      useNativeDriver: false,
    }).start();
  }, [height]);

  return (
    <TouchableOpacity
      style={styles.solidBarColumn}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Animated.View style={[
        styles.solidBarWrapper,
        active ? styles.solidBarActive : styles.solidBarInactive,
        { height: heightAnim }
      ]} />
    </TouchableOpacity>
  );
}

const parseSalary = (salaryStr) => {
  if (!salaryStr) return 0;
  const numbers = salaryStr.replace(/,/g, '').match(/\d+/g);
  if (!numbers || numbers.length === 0) return 0;
  let value = 0;
  if (numbers.length >= 2) {
    const min = parseFloat(numbers[0]);
    const max = parseFloat(numbers[1]);
    value = (min + max) / 2;
  } else {
    value = parseFloat(numbers[0]);
  }
  const isHourly = salaryStr.toLowerCase().includes('hr') || salaryStr.toLowerCase().includes('hour');
  if (isHourly) {
    value = value * 160; // 160 hours/month
  }
  return value;
};

// ─── Profile Skeleton Component ──────────────────────────────────────────────
function ProfileSkeleton() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getStyles(theme);
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#B2E2B9" />

      {/* Top Hero Dome (Mint Green Dome matched) */}
      <View style={styles.heroDome} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerIconBtn} />
        <Text style={styles.headerTitle}>{t('profile.profile_title')}</Text>
        <View style={styles.headerIconBtn} />
      </View>

      {/* Static Profile Section Skeleton */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarBorder, { borderColor: '#E5E7EB' }]}>
          <Animated.View style={[styles.avatarCircle, { backgroundColor: '#E5E7EB', opacity: shimmerAnim }]} />
        </View>
        <Animated.View style={{ width: 140, height: 24, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8, alignSelf: 'center', opacity: shimmerAnim }} />
        <Animated.View style={{ width: 180, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, alignSelf: 'center', opacity: shimmerAnim }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', height: 56, borderBottomWidth: i < 3 ? 1 : 0, borderColor: theme.borderLight }}>
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

function HowItWorksSkeleton({ onClose }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getStyles(theme);
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
    <View style={styles.guideScreenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Guide Header */}
      <View style={[styles.guideScreenHeader, { paddingTop: insets.top > 0 ? insets.top + 12 : 20, paddingBottom: 16 }]}>
        <TouchableOpacity style={styles.guideBackBtn} onPress={onClose} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.guideScreenHeaderTitle}>{t('profile.how_bkj_works')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Banner Skeleton */}
        <View style={[styles.editorialBanner, { backgroundColor: '#F3F4F6', overflow: 'hidden' }]}>
          <Animated.View style={{ width: '100%', height: '100%', backgroundColor: '#E5E7EB', opacity: shimmerAnim }} />
        </View>

        {/* Section Heading Skeleton */}
        <Animated.View style={{ width: '60%', height: 20, backgroundColor: '#E5E7EB', borderRadius: 4, marginVertical: 20, opacity: shimmerAnim }} />

        {/* Stepper Timeline Skeleton */}
        <View style={styles.timelineContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineLineContainer}>
                <Animated.View style={[styles.timelineIconBadge, { opacity: shimmerAnim }]} />
                {i < 4 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Animated.View style={{ width: '25%', height: 10, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 6, opacity: shimmerAnim }} />
                <Animated.View style={{ width: '60%', height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8, opacity: shimmerAnim }} />
                <Animated.View style={{ width: '100%', height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, marginTop: 4, opacity: shimmerAnim }} />
                <Animated.View style={{ width: '90%', height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, marginTop: 6, opacity: shimmerAnim }} />
              </View>
            </View>
          ))}
        </View>

        {/* Finish Button Skeleton */}
        <Animated.View style={[styles.guideScreenFinishBtn, { backgroundColor: '#E5E7EB', opacity: shimmerAnim, borderWidth: 0 }]} />
      </ScrollView>
    </View>
  );
}

function ProfileJobCard({ job, onPress, isLiked, onLike, t, user, theme, styles }) {
  const logoColors = ['#0D9488', '#2563EB', '#DC2626', '#D97706', '#7C3AED', '#DB2777', '#0891B2'];
  const logoIndex = job.company ? job.company.charCodeAt(0) % logoColors.length : 0;
  const logoBg = logoColors[logoIndex];
  const blurhash = 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH';

  // Dynamic tags
  const isUnder24Hours = job.createdAtTimestamp ? (Date.now() - job.createdAtTimestamp <= 24 * 60 * 60 * 1000) : false;
  const isHot = isUnder24Hours && (job.likes >= 10);
  const isPremium = job.likes >= 10;

  return (
    <View style={[
      styles.cleanJobRow,
      isPremium && styles.premiumJobRow,
      {
        marginHorizontal: 0,
        marginBottom: 12,
        borderColor: theme.isDark ? (isPremium ? '#FF8C00' : 'rgba(255, 140, 0, 0.2)') : (isPremium ? '#5C9E6A' : theme.borderLight),
        shadowColor: theme.isDark ? (isPremium ? '#FF8C00' : 'rgba(255, 140, 0, 0.5)') : '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: theme.isDark ? 0.15 : 0.04,
        shadowRadius: theme.isDark ? 8 : 12,
        elevation: 0,
      }
    ]}>
      <TouchableOpacity
        style={{ padding: 16, backgroundColor: 'transparent' }}
        onPress={() => onPress(job)}
        activeOpacity={0.92}
      >
        {/* Top Header Row: Company Logo & Info + Salary */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.companyLogoSquare, { backgroundColor: logoBg, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={[styles.companyLogoInitial, { position: 'absolute' }]}>
                {job.company ? job.company[0].toUpperCase() : 'J'}
              </Text>
              {(job.posterProfile?.avatar || (user && job.postedBy === user.id && user.avatar)) ? (
                <Image source={{ uri: job.posterProfile?.avatar || user?.avatar }} style={styles.companyLogoImage} contentFit="cover" transition={200} placeholder={{ blurhash }} />
              ) : null}
            </View>
            <View style={styles.companyNameContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.jobRowSubtitle, { flexShrink: 1, marginBottom: 0, lineHeight: 16 }]} numberOfLines={1}>{job.company || 'BKJ Employer'}</Text>
                <Ionicons name="checkmark-circle" size={13} color={theme.isDark ? '#FF8C00' : '#15803D'} />
              </View>
              <Text style={styles.jobRowTitle} numberOfLines={1}>{job.title}</Text>
            </View>
          </View>

          {/* Salary Pill */}
          <View style={styles.salaryBadgeContainer}>
            <Text style={styles.jobRowSalaryText} numberOfLines={1}>{job.salary}</Text>
          </View>
        </View>

        {/* Middle Tags Row */}
        <View style={styles.cardTagsRow}>
          {isPremium && (
            <View style={[styles.metaBadge, { backgroundColor: theme.isDark ? 'rgba(255, 140, 0, 0.15)' : '#E8F542', borderColor: theme.isDark ? '#FF8C00' : '#C8D900', borderWidth: 1 }]}>
              <Ionicons name="sparkles" size={10} color={theme.isDark ? '#FF8C00' : '#1A1A1A'} style={{ marginRight: 3 }} />
              <Text style={[styles.metaBadgeText, { color: theme.isDark ? '#FF8C00' : '#1A1A1A', fontWeight: '800' }]}>{t ? t('jobs.featured') : 'Featured 👑'}</Text>
            </View>
          )}
          {isHot && (
            <View style={[styles.metaBadge, { backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFECEF', borderColor: theme.isDark ? '#EF4444' : '#FFCCD3', borderWidth: 1 }]}>
              <Ionicons name="flame" size={11} color="#EF4444" style={{ marginRight: 3 }} />
              <Text style={[styles.metaBadgeText, { color: '#EF4444', fontWeight: '800' }]}>{t ? t('jobs.hot') : 'Hot 🔥'}</Text>
            </View>
          )}
          <View style={styles.metaBadge}>
            <Ionicons name="briefcase-outline" size={11} color={theme.accentGreen} style={{ marginRight: 4 }} />
            <Text style={styles.metaBadgeText} numberOfLines={1} adjustsFontSizeToFit>{job.type}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="location-outline" size={11} color={theme.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.metaBadgeText, { color: theme.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>{job.location}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="people-outline" size={11} color={theme.isDark ? '#FF8C00' : '#15803D'} style={{ marginRight: 4 }} />
            <Text style={[styles.metaBadgeText, { color: theme.isDark ? '#FF8C00' : '#15803D' }]} numberOfLines={1} adjustsFontSizeToFit>{job.applicants || 0} {t ? t('jobs.applicants') : 'applicants'}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Bottom Actions Row */}
        <View style={styles.cardFooterRow}>
          <Text style={styles.jobRowMetaText}>
            Posted {job.postedAt || 'Recently'}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={[styles.rowHeartBtn, isLiked && styles.rowHeartBtnActive]}
              onPress={(e) => {
                e.stopPropagation();
                onLike(job.id);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={13}
                  color={isLiked ? "#EF4444" : theme.textSecondary}
                />
                <Text style={[styles.rowHeartCountText, isLiked && styles.rowHeartCountTextActive]}>
                  {job.likes || 0}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.applyArrowBtn}>
              <Text style={styles.applyBtnLabel}>{t ? t('jobs.apply_button') : 'Apply'}</Text>
              <Ionicons name="arrow-forward" size={12} color="#1A1A1A" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const { user, logout, updateProfile, getMyJobs, getUserById, setIsGuest, jobs, likedJobs, likeJob, appliedJobs, notifications, fetchJobs, fetchRealNotifications, deleteJob, updateJob, closeHiring } = useAuth();
  const myJobs = getMyJobs ? getMyJobs() : [];
  const bookmarkedJobs = (jobs || []).filter(j => likedJobs?.includes(j.id));
  const appliedJobsList = (jobs || []).reduce((acc, job) => {
    const applyInfo = appliedJobs?.find(item => {
      const id = typeof item === 'object' ? item.jobId : item;
      return id === job.id;
    });
    if (applyInfo) {
      const date = typeof applyInfo === 'object' ? applyInfo.appliedAt : new Date().toISOString();
      acc.push({
        ...job,
        appliedAtDate: date
      });
    }
    return acc;
  }, []);

  // ─── ALL HOOKS MUST BE AT THE TOP (Rules of Hooks) ─────────────────────────
  const { t, i18n } = useTranslation();
  const [notif, setNotif] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' }
  ];

  const [selectedManageJob, setSelectedManageJob] = useState(null);
  const [showJobActionModal, setShowJobActionModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [showAllJobsModal, setShowAllJobsModal] = useState(false);
  const [showAppliedModal, setShowAppliedModal] = useState(false);
  const [showBookmarkedModal, setShowBookmarkedModal] = useState(false);
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showAllJobsModal) {
      listAnim.setValue(0);
      Animated.spring(listAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [showAllJobsModal]);

  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobSalary, setEditJobSalary] = useState('');
  const [editJobDesc, setEditJobDesc] = useState('');
  const [editJobReqs, setEditJobReqs] = useState('');

  const handleJobClick = (job) => {
    setSelectedManageJob(job);
    setShowJobActionModal(true);
  };

  const handleEditJob = () => {
    setEditJobTitle(selectedManageJob?.title || '');
    setEditJobSalary(selectedManageJob?.salary || '');
    setEditJobDesc(selectedManageJob?.description || '');
    setEditJobReqs(Array.isArray(selectedManageJob?.requirements) ? selectedManageJob.requirements.join('\n') : (selectedManageJob?.requirements || ''));
    setShowJobActionModal(false);
    setShowEditJobModal(true);
  };

  const handleCancelAction = () => {
    setShowJobActionModal(false);
  };

  const handleSaveEditJob = async () => {
    if (!selectedManageJob) return;
    setShowEditJobModal(false);
    setShowJobActionModal(false);
    setShowAllJobsModal(false);
    setLocalSplashMessage("Updating Job");
    setLocalSplashSub("Applying your modifications...");
    setLocalSplashSignOut(false);
    setLocalSplashLottie(true);
    setLocalSplash(true);

    setTimeout(async () => {
      const reqsArray = editJobReqs.split('\n').filter(r => r.trim() !== '');
      const res = await updateJob(selectedManageJob.id, {
        title: editJobTitle,
        salary: editJobSalary,
        description: editJobDesc,
        requirements: reqsArray,
      });

      setTimeout(() => {
        setLocalSplash(false);
        if (res.success) {
          setSelectedManageJob(null);
        } else {
          Alert.alert("Update Failed", "Could not update the job details.");
        }
      }, 1500);
    }, 50);
  };

  const handleDeleteJob = async () => {
    if (!selectedManageJob) return;
    Alert.alert('Delete Job', 'Are you sure you want to delete this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setShowJobActionModal(false);
          setShowAllJobsModal(false);
          setLocalSplashMessage("Deleting Job");
          setLocalSplashSub("Removing the listing permanently...");
          setLocalSplashSignOut(false);
          setLocalSplashLottie(true);
          setLocalSplash(true);

          setTimeout(async () => {
            const res = await deleteJob(selectedManageJob.id);

            setTimeout(() => {
              setLocalSplash(false);
              if (res.success) {
                setSelectedManageJob(null);
              } else {
                Alert.alert("Deletion Failed", "Could not delete the job.");
              }
            }, 1500);
          }, 50);
        }
      }
    ]);
  };

  const handleCloseHiring = async () => {
    if (!selectedManageJob) return;
    Alert.alert('Close Hiring', 'Are you sure you want to close hiring for this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close', style: 'destructive', onPress: async () => {
          setShowJobActionModal(false);
          setShowAllJobsModal(false);
          setLocalSplashMessage("Closing Hiring");
          setLocalSplashSub("Archiving and closing the position...");
          setLocalSplashSignOut(false);
          setLocalSplashLottie(true);
          setLocalSplash(true);

          setTimeout(async () => {
            const res = await closeHiring(selectedManageJob.id);

            setTimeout(() => {
              setLocalSplash(false);
              if (res.success) {
                setSelectedManageJob(null);
              } else {
                Alert.alert("Action Failed", "Could not close hiring.");
              }
            }, 1500);
          }, 50);
        }
      }
    ]);
  };

  useEffect(() => {
    const loadLang = async () => {
      try {
        const lang = await AsyncStorage.getItem('@app_lang');
        if (lang) setSelectedLanguage(lang);
      } catch (e) { }
    };
    loadLang();
  }, []);

  const handleSelectLanguage = (langObj) => {
    setSelectedLanguage(langObj.name);
    setShowLanguageModal(false);
    i18n.changeLanguage(langObj.code);
  };
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [localSplash, setLocalSplash] = useState(false);
  const [localSplashMessage, setLocalSplashMessage] = useState('');
  const [localSplashSub, setLocalSplashSub] = useState('');
  const [localSplashSignOut, setLocalSplashSignOut] = useState(false);
  const [localSplashLottie, setLocalSplashLottie] = useState(false);

  const isFocused = useIsFocused();
  const [lastAvatar, setLastAvatar] = useState(user?.avatar || '');
  const [newAvatarUri, setNewAvatarUri] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Sync chart selectedIndex with active list updates
  useEffect(() => {
    const list = user?.role === 'employer' ? myJobs : appliedJobsList;
    if (list && list.length > 0) {
      const parsedValues = list.slice(-15).map(job => parseSalary(job.salary));
      const maxIndex = parsedValues.indexOf(Math.max(...parsedValues));
      if (maxIndex !== -1 && maxIndex < list.slice(-15).length) {
        setSelectedIndex(maxIndex);
      } else {
        setSelectedIndex(0);
      }
    } else {
      setSelectedIndex(null);
    }
  }, [appliedJobsList.length, myJobs.length, user?.role]);

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
      setProfileLoading(false);
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
    Alert.alert(t('profile.logout_confirmation_title'), t('profile.logout_confirmation_body'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.log_out'), style: 'destructive', onPress: logout },
    ]);
  };

  const requestGalleryPermission = async () => {
    try {
      const existingPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (existingPermission.granted) return true;
      if (existingPermission.canAskAgain) {
        const response = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (response.granted) return true;
      }
      Alert.alert(
        t('profile.gallery_access_blocked'),
        t('profile.gallery_access_msg'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('profile.open_settings'),
            style: 'default',
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return false;
    } catch (error) {
      return false;
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
        quality: 0.2, // Aggressively compress image for faster CDN delivery
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setEditAvatar(localUri);

        setLocalSplashMessage("Updating Avatar");
        setLocalSplashSub("Uploading your profile photo...");
        setLocalSplashSignOut(false);
        setLocalSplashLottie(true);
        setLocalSplash(true);

        const res = await updateProfile({
          ...user,
          avatar: localUri,
        });

        setTimeout(() => {
          setLocalSplash(false);
          if (!res?.success) {
            Alert.alert("Upload Failed", "Could not upload profile photo.");
          }
        }, 1500);
      }
    } catch (e) {
      setLocalSplash(false);
      Alert.alert("Upload Failed", "Something went wrong.");
    }
  };

  const handleSaveProfile = async () => {
    // 1. Name Validation
    const nameTrimmed = editName.trim();
    if (!nameTrimmed) {
      Alert.alert("Validation Error", "Full name is required.");
      return;
    }
    if (nameTrimmed.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nameTrimmed)) {
      Alert.alert("Validation Error", "Please enter your real name, not an email address.");
      return;
    }
    if (/\d/.test(nameTrimmed)) {
      Alert.alert("Validation Error", "Name cannot contain numbers.");
      return;
    }
    
    const vulgarWords = [
      'sex', 'porn', 'fuck', 'bitch', 'cunt', 'dick', 'pussy', 'nude', 'naked', 'penis', 'vagina',
      'randi', 'gandu', 'chutiya', 'loda', 'behenchod', 'madarchod', 'harami', 'bhosdike', 'dalal',
      'kamine', 'laundiy', 'bastard', 'asshole', 'slut', 'whore', 'boobs', 'butt', 'gndu', 'chutya',
      'maderchod', 'behanchod', 'kamina', 'randee', 'saala', 'saali', 'dalla'
    ];
    const clean = nameTrimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const normalized = clean
      .replace(/0/g, 'o')
      .replace(/1/g, 'i')
      .replace(/3/g, 'e')
      .replace(/4/g, 'a')
      .replace(/5/g, 's')
      .replace(/8/g, 'b');

    const words = normalized.split(/\s+/);
    const isVulgar = words.some(w => vulgarWords.includes(w)) || vulgarWords.some(vw => normalized.includes(vw));

    if (isVulgar) {
      Alert.alert("Validation Error", "Vulgar/inappropriate names are not allowed.");
      return;
    }

    setSaving(true);
    setLocalSplashMessage("Saving Profile");
    setLocalSplashSub("Updating your professional details...");
    setLocalSplashSignOut(false);
    setLocalSplashLottie(true);
    setLocalSplash(true);

    const res = await updateProfile({
      name: editName,
      title: editTitle,
      phone: editPhone,
      location: editLocation,
      avatar: editAvatar,
    });

    setTimeout(() => {
      setLocalSplash(false);
      setSaving(false);
      if (res?.success) {
        setEditing(false);
      } else {
        Alert.alert(t('profile.update_failed'), res?.message || t('profile.update_error_body'));
      }
    }, 1500);
  };

  // ─── Conditional renders (after all hooks) ─────────────────────────────────
  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.bgPrimary} />
        <View style={[styles.header, { paddingTop: 12 }]}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>{t('profile.profile_title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconCircle}>
            <Ionicons name="person" size={40} color={theme.isDark ? '#111111' : theme.accentGreen} />
          </View>
          <Text style={styles.guestTitle}>{t('profile.professional_profile')}</Text>
          <Text style={styles.guestSub}>
            {t('profile.guest_description')}
          </Text>
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => setIsGuest(false)}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={20} color={theme.isDark ? '#111111' : theme.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.guestBtnText}>{t('profile.create_account_signin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (profileLoading && user) {
    return <ProfileSkeleton />;
  }

  const userRole = user?.role || 'jobseeker';
  const isEmployer = userRole === 'employer';
  const activeList = isEmployer ? myJobs : appliedJobsList;

  // Calculate total spend/potential rate
  let totalSpend = 0;
  activeList.forEach(job => {
    totalSpend += parseSalary(job.salary);
  });

  let chartData = [];
  if (isEmployer) {
    if (activeList.length > 0) {
      const listToUse = activeList.slice(-15);
      const parsedValues = listToUse.map(job => parseSalary(job.salary));
      const maxVal = Math.max(...parsedValues, 1);

      chartData = listToUse.map((job, idx) => {
        const val = parsedValues[idx];
        const height = Math.max(25, Math.min(150, Math.round((val / maxVal) * 150)));
        return {
          height,
          job,
          val,
          label: `J${idx + 1}`,
          dateLabel: job?.title || 'Job',
          appCount: 1
        };
      });
    } else {
      chartData = [
        { height: 45 }, { height: 60 }, { height: 75 }, { height: 66 },
        { height: 54 }, { height: 90 }, { height: 105 }, { height: 120 },
        { height: 96 }, { height: 75 }, { height: 60 }, { height: 54 },
        { height: 66 }, { height: 84 }, { height: 45 }
      ].map((d, i) => ({ ...d, label: `${i}`, dateLabel: '', appCount: 0 }));
    }
  } else {
    const getLast7Days = () => {
      const days = [];
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
          dateString: d.toDateString(),
          label: weekdays[d.getDay()],
          rawDate: d,
        });
      }
      return days;
    };

    const daysList = getLast7Days();
    chartData = daysList.map((day, index) => {
      const jobsOnDay = appliedJobsList.filter(job => {
        const jobDate = new Date(job.appliedAtDate).toDateString();
        return jobDate === day.dateString;
      });

      const appCount = jobsOnDay.length;

      // Create a nice smooth escalating slope for the background bars
      let height = 40 + (index * 11);

      if (appCount === 1) height = Math.max(height, 70);
      else if (appCount === 2) height = Math.max(height, 100);
      else if (appCount > 2) height = Math.max(height, 100 + (appCount - 2) * 20);

      height = Math.min(150, height);

      return {
        height,
        label: day.label,
        dateLabel: day.rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
        jobs: jobsOnDay,
        appCount,
      };
    });
  }

  const dynamicTrendPercentage = isEmployer
    ? `+${Math.min(100, Math.max(12, myJobs.length * 8))}%`
    : `+${Math.min(100, Math.max(0, appliedJobsList.length * 19))}%`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.isDark ? theme.bgPrimary : "#B2E2B9"} />

      {theme.isDark ? (
        <LinearGradient
          colors={['rgba(255, 140, 0, 0.12)', 'rgba(255, 140, 0, 0.05)', 'rgba(0,0,0,0)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
        />
      ) : (
        <View style={styles.heroDome} />
      )}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        {editing ? (
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setEditing(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle}>{t('profile.profile_title')}</Text>
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
            color={editing ? theme.accentGreen : theme.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Static Profile Section (Unscrollable Top Part on Green Background) */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarBorder}
          onPress={editing ? handlePickAvatarAndSave : handlePickAvatarAndSave}
          activeOpacity={0.8}
        >
          <View style={[styles.avatarCircle, { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={[styles.avatarText, { position: 'absolute' }]}>{initials}</Text>
            {editAvatar ? (
              <Image source={{ uri: editAvatar }} style={styles.avatarImage} contentFit="cover" transition={200} placeholder={{ blurhash }} />
            ) : null}
          </View>
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {editing && (
          <TouchableOpacity onPress={handlePickAvatarAndSave} style={{ marginTop: 20, padding: 10 }}>
            <Text style={{ color: theme.accentGreen, fontSize: 13, fontWeight: '700' }}>{t('profile.change_profile_photo')}</Text>
          </TouchableOpacity>
        )}

        {!editing && (
          <>
            <Text style={styles.userName} numberOfLines={1} adjustsFontSizeToFit>{user?.name || 'BKJ User'}</Text>
            <Text style={styles.userEmail} numberOfLines={1} adjustsFontSizeToFit>{user?.email || ''}</Text>

            <TouchableOpacity
              style={styles.uploadPhotoBtn}
              onPress={handlePickAvatarAndSave}
              activeOpacity={0.85}
            >
              <Text style={styles.uploadPhotoText}>{t('profile.upload_profile_photo')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Scrollable Content (Bottom Section on White Background) */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.isDark ? '#FF8C00' : '#15803D'}
            colors={[theme.isDark ? '#FF8C00' : '#15803D']}
            progressBackgroundColor={theme.isDark ? '#1C1C1E' : '#FFFFFF'}
          />
        }
      >

        {editing && (
          <View style={styles.editFields}>
            <View style={styles.editRow}>
              <Ionicons name="person" size={18} color={theme.textSecondary} style={styles.editIcon} />
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.editRow}>
              <Ionicons name="briefcase" size={18} color={theme.textSecondary} style={styles.editIcon} />
              <TextInput
                style={styles.editInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Professional Title"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.editRow}>
              <Ionicons name="call" size={18} color={theme.textSecondary} style={styles.editIcon} />
              <TextInput
                style={styles.editInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Phone Number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>
            <View style={[styles.editRow, { opacity: 0.65 }]}>
              <Ionicons name="location" size={18} color={theme.textLight} style={styles.editIcon} />
              <TextInput
                style={[styles.editInput, { color: theme.textSecondary }]}
                value={editLocation}
                editable={false}
                placeholder="Location"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        )}

        {/* Info Cards Row - Initials / Phone / Role */}
        {!editing && (
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <View style={[styles.infoIconWrap, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}><Ionicons name="call" size={16} color="#1565C0" /></View>
              <Text style={styles.infoLabel} numberOfLines={1} adjustsFontSizeToFit>{t('profile.phone')}</Text>
              <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
                {user?.phone ? (user.phone.length > 10 ? user.phone.slice(0, 10) + '...' : user.phone) : t('common.none')}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIconWrap, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}><Ionicons name="time" size={16} color="#E65100" /></View>
              <Text style={styles.infoLabel} numberOfLines={1} adjustsFontSizeToFit>{t('profile.member')}</Text>
              <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
                {user?.createdAt ? new Date(user.createdAt.seconds * 1000).getFullYear() : new Date().getFullYear()}
              </Text>
            </View>

            <TouchableOpacity style={styles.infoCard} onPress={() => setShowAllJobsModal(true)} activeOpacity={0.7}>
              <View style={[styles.infoIconWrap, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9' }]}>
                <Ionicons name="briefcase" size={16} color="#15803D" />
              </View>
              <Text style={styles.infoLabel} numberOfLines={1} adjustsFontSizeToFit>{t('profile.jobs_posted')}</Text>
              <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>{myJobs.length}</Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Modern Solid Chart Card */}
        <View style={styles.chartCard}>
          {/* Top Row: Title, Trend & Value */}
          <View style={styles.chartTopRow}>
            <View style={styles.chartTopLeft}>
              <Text style={styles.chartCardTitle}>
                {isEmployer ? t('profile.hiring_budget') : t('profile.application_timeline')}
              </Text>

              <View style={styles.trendContainer}>
                <Text style={styles.trendPercentage}>
                  {dynamicTrendPercentage}
                </Text>
                <Text style={styles.trendSubtitle}>
                  grow since last {isEmployer ? 'month' : 'week'} ↗
                </Text>
              </View>
            </View>

            <View style={styles.chartValueBadge}>
              <Text style={styles.chartValueNumber}>
                {isEmployer
                  ? totalSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                  : appliedJobsList.length}
              </Text>
              <View style={styles.chartValuePill}>
                <Text style={styles.chartValuePillText}>
                  {isEmployer ? 'USD' : (appliedJobsList.length === 1 ? 'APP' : 'APPS')}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Row: Bars Only */}
          <View style={styles.chartBottomRow}>
            {/* Right: Bars */}
            <View style={[styles.chartVisualizer, activeList.length === 0 && { opacity: 0.15 }]}>
              {chartData.map((data, index) => (
                <SolidBar
                  key={index}
                  height={data.height}
                  active={activeList.length > 0 ? index === selectedIndex : false}
                  onPress={() => activeList.length > 0 && setSelectedIndex(index)}
                />
              ))}
            </View>
          </View>

          {activeList.length === 0 && (
            <View style={styles.chartPlaceholderOverlay}>
              <Text style={styles.chartPlaceholderText}>
                {isEmployer
                  ? t('profile.no_jobs_analysis')
                  : t('profile.no_applied_analysis')}
              </Text>
            </View>
          )}
        </View>

        {/* Activity & Support */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>{t('profile.activity_help') || 'Activity & Support'}</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsRow} onPress={async () => {
              if (fetchRealNotifications) await fetchRealNotifications();
              setShowNotifModal(true);
            }} activeOpacity={0.7}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="notifications" size={16} color="#2E7D32" />
              </View>
              <Text style={styles.settingsLabel}>{t('profile.notifications')}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingsRow} onPress={() => setShowHowItWorksModal(true)} activeOpacity={0.7}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="help-circle" size={16} color="#E65100" />
              </View>
              <Text style={styles.settingsLabel}>{t('profile.how_bkj_works')}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textLight} />
            </TouchableOpacity>
          </View>
        </View>



        {/* My Opportunities Section */}
        {user && !isEmployer && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>{t('profile.my_opportunities') || 'Opportunities'}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>

              {/* Applied Box Wrapper with underlay background */}
              <View style={{ width: 170, height: 210, marginRight: 16, backgroundColor: theme.isDark ? '#FF7A00' : '#B2E2B9', borderRadius: 28, position: 'relative' }}>
                {theme.isDark && (
                  <>
                    {/* Outer soft glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        right: -6,
                        bottom: -6,
                        borderRadius: 34,
                        borderWidth: 4,
                        borderColor: 'rgba(255, 122, 0, 0.04)',
                      }}
                      pointerEvents="none"
                    />
                    {/* Inner intense glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: 'rgba(255, 122, 0, 0.15)',
                      }}
                      pointerEvents="none"
                    />
                  </>
                )}
                <TouchableOpacity
                  style={{ width: '100%', height: '100%', backgroundColor: theme.isDark ? '#FF7A00' : '#B2E2B9', borderRadius: 28, padding: 20, justifyContent: 'space-between', borderWidth: 1, borderColor: theme.isDark ? '#FF7A00' : theme.borderLight }}
                  activeOpacity={0.85}
                  onPress={() => setShowAppliedModal(true)}
                >
                  <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: theme.isDark ? 'rgba(0,0,0,0.1)' : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="paper-plane" size={22} color={theme.isDark ? '#111111' : theme.accentGreen} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: theme.isDark ? '#000000' : theme.textPrimary, marginBottom: 6 }} numberOfLines={2}>{t('profile.applied_jobs') || 'Applied Jobs'}</Text>
                    <Text style={{ fontSize: 13, color: theme.isDark ? 'rgba(0,0,0,0.7)' : theme.textSecondary }} numberOfLines={2}>{appliedJobsList.length} {t('profile.applications_sent') || 'applications sent'}</Text>
                  </View>
                  <View style={{ alignSelf: 'flex-end', width: 34, height: 34, borderRadius: 17, backgroundColor: theme.isDark ? 'rgba(0,0,0,0.1)' : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="chevron-forward" size={18} color={theme.isDark ? '#111111' : theme.accentGreen} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Bookmarked Box Wrapper with underlay background */}
              <View style={{ width: 170, height: 210, marginRight: 16, backgroundColor: theme.isDark ? '#1A1A1A' : '#FFFFFF', borderRadius: 28, position: 'relative' }}>
                {theme.isDark && (
                  <>
                    {/* Outer soft glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        right: -6,
                        bottom: -6,
                        borderRadius: 34,
                        borderWidth: 4,
                        borderColor: 'rgba(255, 140, 0, 0.04)',
                      }}
                      pointerEvents="none"
                    />
                    {/* Inner intense glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: 'rgba(255, 140, 0, 0.15)',
                      }}
                      pointerEvents="none"
                    />
                  </>
                )}
                <TouchableOpacity
                  style={{ width: '100%', height: '100%', backgroundColor: theme.bgCard, borderRadius: 28, padding: 20, justifyContent: 'space-between', borderWidth: 1, borderColor: theme.isDark ? 'rgba(255, 140, 0, 0.2)' : theme.borderLight }}
                  activeOpacity={0.85}
                  onPress={() => setShowBookmarkedModal(true)}
                >
                  <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.borderLight }}>
                    <Ionicons name="heart" size={22} color="#EF4444" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: theme.textPrimary, marginBottom: 6 }} numberOfLines={2}>{t('profile.saved_jobs') || 'Saved Jobs'}</Text>
                    <Text style={{ fontSize: 13, color: theme.textSecondary }} numberOfLines={2}>{bookmarkedJobs.length} {t('profile.bookmarked_items') || 'bookmarked items'}</Text>
                  </View>
                  <View style={{ alignSelf: 'flex-end', width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="chevron-forward" size={18} color={theme.textPrimary} />
                  </View>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>{t('profile.account_utilities')}</Text>
          <View style={[styles.settingsCard, { borderColor: theme.isDark ? 'rgba(255, 140, 0, 0.2)' : '#E2E8F0' }]}>
            <TouchableOpacity style={styles.settingsRow} onPress={() => setShowLanguageModal(true)} activeOpacity={0.7}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="language" size={16} color="#0284C7" />
              </View>
              <Text style={styles.settingsLabel}>{t('profile.app_language')}</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, marginRight: 8, fontWeight: '600' }}>{selectedLanguage}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Dark Mode Toggle */}
            <View style={styles.settingsRow}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#1E293B' }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={16} color="#38BDF8" />
              </View>
              <Text style={[styles.settingsLabel, { flex: 1 }]}>{t('profile.dark_mode') || 'Dark Mode'}</Text>
              <TouchableOpacity
                onPress={toggleTheme}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: isDark ? theme.success || '#10B981' : theme.borderLight || '#E2E8F0',
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                }}
                activeOpacity={0.8}
              >
                <Animated.View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: isDark ? 20 : 0 }]
                }} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingsRow} onPress={handleLogout}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out" size={16} color="#EF4444" />
              </View>
              <Text style={[styles.settingsLabel, { color: '#EF4444' }]}>{t('profile.logout_account')}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerVersion}>BKJ v1.0.0</Text>
        <Text style={styles.developerCredit}>Developed by Babar Thakur</Text>
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
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowNotifModal(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {(!notifications || notifications.length === 0) ? (
                <View style={styles.emptyNotifBox}>
                  <Ionicons name="notifications-off-outline" size={44} color={theme.textLight} />
                  <Text style={styles.emptyNotifText}>No activity yet</Text>
                  <Text style={{ fontSize: 13, color: theme.textLight, textAlign: 'center', marginTop: 4 }}>
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
                            onPress={async () => {
                              let candidate = n.likerProfile;
                              if (!candidate && n.likerId) {
                                candidate = await getUserById(n.likerId);
                              }
                              if (candidate) {
                                // Dismiss notification modal first to allow iOS to present the second modal correctly
                                setShowNotifModal(false);
                                setTimeout(() => {
                                  setSelectedLiker(candidate);
                                  setShowLikerModal(true);
                                }, 350);
                              }
                            }}
                          >
                            {/* Avatar */}
                            {isLike ? (
                              n.likerProfile?.avatar && n.likerProfile.avatar.length > 5 ? (
                                <Image source={{ uri: n.likerProfile.avatar }} style={styles.igAvatarImage} contentFit="cover" transition={200} placeholder={{ blurhash }} />
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
                                <Ionicons name="chevron-forward" size={14} color={theme.textLight} style={{ marginLeft: 4 }} />
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
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowLikerModal(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            {selectedLiker && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingVertical: 10 }}>
                {/* Initials Avatar */}
                <View style={styles.likerAvatarCircle}>
                  {selectedLiker?.avatar && selectedLiker.avatar.length > 5 ? (
                    <Image source={{ uri: selectedLiker.avatar }} style={styles.likerAvatarImage} contentFit="cover" transition={200} placeholder={{ blurhash }} />
                  ) : (
                    <Text style={styles.likerAvatarText}>
                      {selectedLiker?.name ? selectedLiker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'C'}
                    </Text>
                  )}
                </View>

                {/* Name & Title */}
                <Text style={styles.likerName} numberOfLines={1} adjustsFontSizeToFit>{selectedLiker?.name}</Text>
                <Text style={styles.likerTitle} numberOfLines={1} adjustsFontSizeToFit>{selectedLiker?.title || 'Job Seeker'}</Text>

                {/* Divider */}
                <View style={styles.likerDivider} />

                {/* Detailed Info Cards */}
                <View style={styles.likerInfoContainer}>
                  <View style={styles.likerInfoRow}>
                    <Ionicons name="location-outline" size={18} color={theme.isDark ? theme.accentYellow : theme.accentGreen} style={{ marginRight: 12 }} />
                    <Text style={styles.likerInfoText} numberOfLines={1} adjustsFontSizeToFit>
                      {selectedLiker?.location && selectedLiker.location !== 'Not specified' ? selectedLiker.location : 'Not specified'}
                    </Text>
                  </View>

                  <View style={styles.likerInfoRow}>
                    <Ionicons name="call-outline" size={18} color={theme.isDark ? theme.accentYellow : theme.accentGreen} style={{ marginRight: 12 }} />
                    <Text style={styles.likerInfoText} numberOfLines={1} adjustsFontSizeToFit>
                      {selectedLiker?.phone && selectedLiker.phone !== 'No phone provided' ? selectedLiker.phone : 'No phone provided'}
                    </Text>
                  </View>

                  <View style={styles.likerInfoRow}>
                    <Ionicons name="mail-outline" size={18} color={theme.isDark ? theme.accentYellow : theme.accentGreen} style={{ marginRight: 12 }} />
                    <Text style={styles.likerInfoText} numberOfLines={1} adjustsFontSizeToFit>
                      {selectedLiker?.email && selectedLiker.email !== 'candidate@gmail.com' ? selectedLiker.email : 'No email provided'}
                    </Text>
                  </View>
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
            <TouchableOpacity style={styles.iconBtn} onPress={() => setSelectedJob(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.detailNavTitle}>Job Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedJob && (
            <>
              {/* Hero */}
              <View style={styles.detailHeroCard}>
                <View style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>{(selectedJob?.company || 'C')[0]}</Text>
                </View>
                <Text style={styles.detailTitle}>{selectedJob?.title}</Text>
                <Text style={styles.detailCompany}>{selectedJob?.company || 'TechCorp'}</Text>
                <View style={styles.detailBadgeRow}>
                  <View style={[styles.typeBadge, { backgroundColor: theme.accentYellow }]}>
                    <Text style={[styles.typeBadgeText, { color: theme.textPrimary }]}>{selectedJob?.type}</Text>
                  </View>
                  <View style={styles.detailBadge}>
                    <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
                    <Text style={styles.detailBadgeText}> {selectedJob?.location}</Text>
                  </View>
                </View>
                <Text style={styles.detailSalary}>{selectedJob?.salary}</Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                {[
                  { value: selectedJob?.applicants || 0, label: 'Applicants' },
                  { value: selectedJob?.likes || 0, label: 'Likes' },
                  { value: selectedJob?.postedAt || '2 days ago', label: 'Posted' },
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
                <Text style={styles.descText}>{selectedJob?.description}</Text>
              </View>

              {/* Requirements */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Requirements</Text>
                {selectedJob?.requirements && selectedJob.requirements.length > 0 ? (
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
              {selectedJob?.posterProfile && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Job Poster Profile</Text>
                  <View style={styles.posterRow}>
                    <View style={styles.posterAvatarCircle}>
                      {selectedJob.posterProfile?.avatar ? (
                        <Image source={{ uri: selectedJob.posterProfile.avatar }} style={styles.posterAvatarImage} contentFit="cover" transition={200} placeholder={{ blurhash }} />
                      ) : (
                        <Text style={styles.posterAvatarText}>
                          {selectedJob.posterProfile?.name ? selectedJob.posterProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EM'}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.posterName}>{selectedJob.posterProfile?.name || 'Anonymous Employer'}</Text>
                      <Text style={styles.posterTitle}>{selectedJob.posterProfile?.title || 'HR Manager / Employer'}</Text>

                      <View style={styles.posterContactRow}>
                        <Ionicons name="mail-outline" size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.posterContactText}>{selectedJob.posterProfile?.email || 'employer@joblink.com'}</Text>
                      </View>

                      {selectedJob.posterProfile?.location ? (
                        <View style={[styles.posterContactRow, { marginTop: 4 }]}>
                          <Ionicons name="location-outline" size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
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

      {/* How It Works Guide Modal (Genuine Overlay to Prevent Bottom Navigation Bar Intersections) */}
      <Modal
        visible={showHowItWorksModal}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => {
          setGuideLoading(false);
          setShowHowItWorksModal(false);
        }}
      >
        {guideLoading ? (
          <HowItWorksSkeleton
            onClose={() => {
              setGuideLoading(false);
              setShowHowItWorksModal(false);
            }}
          />
        ) : (
          <View style={styles.guideScreenContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Guide Header */}
            <View style={[styles.guideScreenHeader, { paddingTop: insets.top > 0 ? insets.top + 12 : 20, paddingBottom: 16 }]}>
              <TouchableOpacity
                style={styles.guideBackBtn}
                onPress={() => {
                  setGuideLoading(false);
                  setShowHowItWorksModal(false);
                }}
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.guideScreenHeaderTitle}>How It Works</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Editorial Banner */}
              <View style={styles.editorialBanner}>
                <View style={styles.editorialOverlay}>
                  <View style={styles.editorialBadge}>
                    <Text style={styles.editorialBadgeText}>BKJ SYSTEM DESIGN</Text>
                  </View>
                  <Text style={styles.editorialTitle}>The BKJ Mechanics</Text>
                  <Text style={styles.editorialSub}>Discover how our professional, data-driven algorithm powers a marketplace for candidates and recruiters alike.</Text>
                </View>
              </View>

              {/* Section Heading */}
              <Text style={styles.guideSectionHeading}>Platform Mechanics & Guidelines</Text>

              {/* Stepper Timeline Section */}
              <View style={styles.timelineContainer}>
                {/* Step 1 */}
                <View style={styles.timelineItem}>
                  <View style={styles.timelineLineContainer}>
                    <View style={[styles.timelineIconBadge, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]}>
                      <Ionicons name="search" size={16} color="#3B82F6" />
                    </View>
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStepNumber}>STEP 01</Text>
                    <Text style={styles.timelineStepTitle}>Discover Elite Careers</Text>
                    <Text style={styles.timelineStepDesc}>
                      Browse professional job opportunities globally. Apply instantly with a single tap and track your application status in real-time on your dashboard.
                    </Text>
                  </View>
                </View>

                {/* Step 2 */}
                <View style={styles.timelineItem}>
                  <View style={styles.timelineLineContainer}>
                    <View style={[styles.timelineIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                      <Ionicons name="sparkles" size={16} color="#10B981" />
                    </View>
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStepNumber}>STEP 02</Text>
                    <Text style={styles.timelineStepTitle}>Premium "Featured" Upgrade</Text>
                    <Text style={styles.timelineStepDesc}>
                      Jobs achieving 10+ likes automatically upgrade to premium status. The listing gets highlighted with an elegant Emerald border, gold drop shadows, and a crown icon 👑.
                    </Text>
                  </View>
                </View>

                {/* Step 3 */}
                <View style={styles.timelineItem}>
                  <View style={styles.timelineLineContainer}>
                    <View style={[styles.timelineIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
                      <Ionicons name="flame" size={16} color="#EF4444" />
                    </View>
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStepNumber}>STEP 03</Text>
                    <Text style={styles.timelineStepTitle}>Instant "Hot 🔥" Trending Status</Text>
                    <Text style={styles.timelineStepDesc}>
                      Postings that gain 10+ likes within the first 24 hours of creation are marked as Hot 🔥. This high-velocity engagement highlights listing popularity to active job-seekers.
                    </Text>
                  </View>
                </View>

                {/* Step 4 */}
                <View style={styles.timelineItem}>
                  <View style={styles.timelineLineContainer}>
                    <View style={[styles.timelineIconBadge, { backgroundColor: 'rgba(21, 128, 61, 0.08)' }]}>
                      <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                    </View>
                    {/* No line for the last step */}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStepNumber}>STEP 04</Text>
                    <Text style={styles.timelineStepTitle}>Verified Network Trust</Text>
                    <Text style={styles.timelineStepDesc}>
                      Verified profiles and job posters are labeled with our custom vector tick emblem. This eliminates credentials offset issues and guarantees authentic hiring channels.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Finish Button */}
              <TouchableOpacity
                style={styles.guideScreenFinishBtn}
                onPress={() => {
                  setGuideLoading(false);
                  setShowHowItWorksModal(false);
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.guideScreenFinishText}>Got It! Return to Profile 🚀</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="fade" transparent={true} onRequestClose={() => setShowLanguageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingHorizontal: 0, paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 30, height: 'auto', maxHeight: '90%' }]}>
            <View style={{ paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>{t('profile.select_language')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingTop: 8 }}>
              {LANGUAGES.map((langObj, index) => {
                const isSelected = selectedLanguage === langObj.name;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, marginHorizontal: 12, borderRadius: 14, marginBottom: 6 },
                      isSelected ? { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#F0FDF4' } : {}
                    ]}
                    onPress={() => handleSelectLanguage(langObj)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 20, marginRight: 14 }}>{langObj.flag}</Text>
                      <Text style={{ fontSize: 16, fontWeight: isSelected ? '700' : '500', color: isSelected ? theme.accentGreen : theme.textPrimary }}>
                        {langObj.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.accentGreen} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Unified All Jobs / Manage / Edit Modal */}
      <Modal visible={showAllJobsModal} transparent animationType="slide" onRequestClose={() => {
        if (showEditJobModal) setShowEditJobModal(false);
        else if (showJobActionModal) setShowJobActionModal(false);
        else setShowAllJobsModal(false);
      }}>
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          {showEditJobModal ? (
            <View style={[styles.modalContent, { height: '85%', paddingHorizontal: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: theme.bgPrimary }]}>
              <View style={{ width: 36, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, alignSelf: 'center', marginTop: -10, marginBottom: 20 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={[styles.modalTitle, { fontSize: 22, color: theme.textPrimary }]}>Edit Job</Text>
                <TouchableOpacity onPress={() => setShowEditJobModal(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>

                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary, marginBottom: 6, marginLeft: 4 }}>Job Title</Text>
                <TextInput style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 14, marginBottom: 16, fontSize: 14, color: theme.textPrimary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' }} value={editJobTitle} onChangeText={setEditJobTitle} placeholder="e.g. Senior React Developer" placeholderTextColor="#94A3B8" />

                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary, marginBottom: 6, marginLeft: 4 }}>Salary</Text>
                <TextInput style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 14, marginBottom: 16, fontSize: 14, color: theme.textPrimary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' }} value={editJobSalary} onChangeText={setEditJobSalary} placeholder="e.g. $80k - $100k/year" placeholderTextColor="#94A3B8" />

                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary, marginBottom: 6, marginLeft: 4 }}>Description</Text>
                <TextInput style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 14, marginBottom: 16, fontSize: 14, color: theme.textPrimary, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' }} multiline value={editJobDesc} onChangeText={setEditJobDesc} placeholder="Describe the job role and responsibilities..." placeholderTextColor="#94A3B8" />

                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary, marginBottom: 6, marginLeft: 4 }}>Requirements (one per line)</Text>
                <TextInput style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 14, marginBottom: 24, fontSize: 14, color: theme.textPrimary, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' }} multiline value={editJobReqs} onChangeText={setEditJobReqs} placeholder="e.g. 3+ years React Native experience&#10;Strong communication skills" placeholderTextColor="#94A3B8" />

                <TouchableOpacity style={{ backgroundColor: theme.accentGreen, padding: 16, borderRadius: 16, alignItems: 'center' }} onPress={handleSaveEditJob}>
                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800' }}>Save Changes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', marginTop: 10, marginBottom: 40 }} onPress={() => setShowEditJobModal(false)}>
                  <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ) : showJobActionModal ? (
            <View style={[styles.modalContent, { paddingHorizontal: 20, paddingBottom: 30, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: theme.bgPrimary }]}>
              <View style={{ width: 36, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, alignSelf: 'center', marginTop: -10, marginBottom: 20 }} />
              <Text style={[styles.modalTitle, { fontSize: 22, textAlign: 'center', marginBottom: 4, color: theme.textPrimary }]}>Manage Job</Text>
              <Text style={{ textAlign: 'center', marginBottom: 24, color: theme.textSecondary, fontSize: 14, fontWeight: '500' }}>{selectedManageJob?.title}</Text>

              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)', padding: 14, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }} onPress={handleEditJob}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Ionicons name="pencil" size={20} color={theme.isDark ? '#4ADE80' : '#166534'} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.isDark ? '#4ADE80' : '#166534', flex: 1 }}>Edit Job Details</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(22, 101, 52, 0.3)'} />
              </TouchableOpacity>

              {!selectedManageJob?.title?.startsWith('[CLOSED]') && (
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)', padding: 14, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }} onPress={handleCloseHiring}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Ionicons name="lock-closed" size={20} color={theme.isDark ? '#FB923C' : '#C2410C'} />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.isDark ? '#FB923C' : '#C2410C', flex: 1 }}>Close Hiring</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.isDark ? 'rgba(251, 146, 60, 0.3)' : 'rgba(194, 65, 12, 0.3)'} />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.5)', padding: 14, borderRadius: 18, marginBottom: 24, borderWidth: 1, borderColor: theme.isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.8)' }} onPress={handleDeleteJob}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Ionicons name="trash" size={20} color={theme.isDark ? '#F87171' : '#EF4444'} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.isDark ? '#F87171' : '#EF4444', flex: 1 }}>Delete Job</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ padding: 16, borderRadius: 18, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)', borderWidth: 1, borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'transparent', alignItems: 'center' }} onPress={handleCancelAction}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.modalContent, { height: '85%', paddingHorizontal: 0, paddingBottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: theme.bgPrimary }]}>
              <View style={{ alignSelf: 'center', marginTop: -40, marginBottom: 15, width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', padding: 4, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
                <View style={{ width: '100%', height: '100%', borderRadius: 36, backgroundColor: theme.accentGreen, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '700', position: 'absolute' }}>{initials}</Text>
                  {(user?.avatar || editAvatar) ? (
                    <Image source={{ uri: user?.avatar || editAvatar }} style={{ width: '100%', height: '100%', borderRadius: 36 }} contentFit="cover" transition={200} placeholder={{ blurhash }} />
                  ) : null}
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={[styles.modalTitle, { fontSize: 22, color: theme.textPrimary }]}>{t('profile.my_job_listings')} ({myJobs.length})</Text>
                <TouchableOpacity onPress={() => setShowAllJobsModal(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                {myJobs.length === 0 ? (
                  <View style={[styles.emptyJobsContainer, { marginTop: 40 }]}>
                    <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <Ionicons name="briefcase-outline" size={32} color={theme.textSecondary} />
                    </View>
                    <Text style={[styles.emptyJobsText, { fontSize: 15, color: theme.textSecondary }]}>{t('profile.no_jobs_posted')}</Text>
                  </View>
                ) : (
                  myJobs.map((job, index) => {
                    const translateY = listAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    });
                    const opacity = listAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    });
                    const isLiked = likedJobs?.includes(job.id);
                    return (
                      <Animated.View key={job.id} style={{ opacity, transform: [{ translateY }] }}>
                        <ProfileJobCard
                          job={job}
                          onPress={handleJobClick}
                          isLiked={isLiked}
                          onLike={likeJob}
                          t={t}
                          user={user}
                          theme={theme}
                          styles={styles}
                        />
                      </Animated.View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* Applied Jobs Modal */}
      <Modal visible={showAppliedModal} transparent animationType="slide" onRequestClose={() => setShowAppliedModal(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { height: '85%', paddingHorizontal: 0, paddingBottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: theme.bgPrimary }]}>
            <View style={{ width: 36, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, alignSelf: 'center', marginTop: -10, marginBottom: 20 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={[styles.modalTitle, { fontSize: 22, color: theme.textPrimary }]}>{t('profile.applied_jobs') || 'Applied Jobs'} ({appliedJobsList.length})</Text>
              <TouchableOpacity onPress={() => setShowAppliedModal(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
              {appliedJobsList.length === 0 ? (
                <View style={[styles.emptyJobsContainer, { marginTop: 40 }]}>
                  <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Ionicons name="paper-plane-outline" size={32} color={theme.textSecondary} />
                  </View>
                  <Text style={[styles.emptyJobsText, { fontSize: 15, color: theme.textSecondary }]}>{t('profile.no_applied_jobs') || 'No applied jobs yet.'}</Text>
                </View>
              ) : (
                appliedJobsList.map((job) => {
                  const isLiked = likedJobs?.includes(job.id);
                  return (
                    <ProfileJobCard
                      key={job.id}
                      job={job}
                      onPress={(j) => {
                        setShowAppliedModal(false);
                        setTimeout(() => setSelectedJob(j), 100);
                      }}
                      isLiked={isLiked}
                      onLike={likeJob}
                      t={t}
                      user={user}
                      theme={theme}
                      styles={styles}
                    />
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bookmarked Jobs Modal */}
      <Modal visible={showBookmarkedModal} transparent animationType="slide" onRequestClose={() => setShowBookmarkedModal(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { height: '85%', paddingHorizontal: 0, paddingBottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: theme.bgPrimary }]}>
            <View style={{ width: 36, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, alignSelf: 'center', marginTop: -10, marginBottom: 20 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={[styles.modalTitle, { fontSize: 22, color: theme.textPrimary }]}>{t('profile.bookmarked_opportunities')} ({bookmarkedJobs.length})</Text>
              <TouchableOpacity onPress={() => setShowBookmarkedModal(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
              {bookmarkedJobs.length === 0 ? (
                <View style={[styles.emptyJobsContainer, { marginTop: 40 }]}>
                  <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Ionicons name="heart-dislike-outline" size={32} color={theme.textSecondary} />
                  </View>
                  <Text style={[styles.emptyJobsText, { fontSize: 15, color: theme.textSecondary }]}>{t('profile.no_bookmarked_jobs')}</Text>
                </View>
              ) : (
                bookmarkedJobs.map((job) => {
                  const isLiked = likedJobs?.includes(job.id);
                  return (
                    <ProfileJobCard
                      key={job.id}
                      job={job}
                      onPress={(j) => {
                        setShowBookmarkedModal(false);
                        setTimeout(() => setSelectedJob(j), 100);
                      }}
                      isLiked={isLiked}
                      onLike={likeJob}
                      t={t}
                      user={user}
                      theme={theme}
                      styles={styles}
                    />
                  );
                })
              )}
            </ScrollView>
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

    </View>

  );
}

function getStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.isDark ? theme.bgPrimary : '#FFFFFF' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 34, paddingBottom: 140 },

    heroDome: {
      position: 'absolute',
      top: 0,
      left: -40,
      right: -40,
      height: 360,
      backgroundColor: theme.isDark ? 'transparent' : '#B2E2B9',
      borderBottomLeftRadius: (width + 80) / 1.6,
      borderBottomRightRadius: (width + 80) / 1.6,
    },

    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingTop: 0, paddingBottom: 6,
      zIndex: 10,
    },
    headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: theme.textPrimary },
    headerIconBtn: {
      width: 40, height: 40, borderRadius: 14,
      backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: '#E2E8F0',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 0,
    },

    // Avatar
    avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 20, zIndex: 10 },
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
    userName: { fontSize: 26, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 },
    userEmail: { fontSize: FONTS.sizes.sm, color: theme.textSecondary, marginTop: 2 },
    uploadPhotoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accentYellow || '#EDFC62',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 12,
      shadowColor: theme.accentYellow || '#EDFC62',
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
      flex: 1, width: 0, backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.bgCard, borderRadius: 18, padding: 14,
      alignItems: 'center',
      borderWidth: 1, borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.borderLight,
      shadowColor: theme.isDark ? '#000' : theme.bgDark, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: theme.isDark ? 0 : 0.04, shadowRadius: theme.isDark ? 0 : 10, elevation: theme.isDark ? 0 : 0,
    },
    infoIconWrap: {
      width: 34, height: 34, borderRadius: 17,
      alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    infoInitialsText: { fontSize: 13, fontWeight: '800', color: theme.accentGreen },
    infoLabel: { fontSize: 10, fontWeight: '600', color: theme.textSecondary, marginBottom: 2, lineHeight: 14 },
    infoValue: { fontSize: 12, fontWeight: '700', color: theme.textPrimary, textAlign: 'center', lineHeight: 16 },

    // Title card
    titleCard: {
      flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.bgCard, borderRadius: 14,
      paddingHorizontal: 16, paddingVertical: 10,
      marginBottom: 16, gap: 6,
      borderWidth: 1, borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.borderLight,
      shadowColor: theme.bgDark, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0 : 0.03, shadowRadius: 6, elevation: 0,
    },
    titleCardText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
    titleDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.textLight },

    // Edit Mode
    editFields: { width: '100%', gap: 10, marginTop: 8, marginBottom: 16 },
    editRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.bgCard, borderRadius: 14,
      borderWidth: 1, borderColor: theme.borderLight,
      paddingHorizontal: 14, height: 48,
    },
    editIcon: { marginRight: 10 },
    editInput: { flex: 1, fontSize: FONTS.sizes.sm + 1, color: theme.textPrimary, fontWeight: '600' },

    // Chart Card
    chartCard: {
      backgroundColor: theme.bgCard, borderRadius: 28, padding: 24,
      shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06, shadowRadius: 18, elevation: 4, marginBottom: 20,
    },
    chartTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    chartCardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginTop: 4,
    },
    chartValueBadge: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chartValueNumber: {
      fontSize: 28,
      fontWeight: '500',
      color: theme.textPrimary,
      letterSpacing: -0.5,
    },
    chartValuePill: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    chartValuePillText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#15803D',
    },
    chartTopLeft: {
      flex: 1,
    },
    chartBottomRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    trendContainer: {
      marginTop: 12,
    },
    trendPercentage: {
      fontSize: 36,
      fontWeight: '400',
      color: theme.textPrimary,
      letterSpacing: -1,
    },
    trendSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '500',
      marginTop: 4,
    },
    chartVisualizer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      height: 160,
      flex: 1.5,
      gap: 8,
    },
    solidBarColumn: {
      alignItems: 'center',
      width: 32,
      height: '100%',
      justifyContent: 'flex-end'
    },
    solidBarWrapper: {
      width: 32,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
    },
    solidBarActive: {
      backgroundColor: '#1E293B', // Almost black/dark slate like the image
    },
    solidBarInactive: {
      backgroundColor: theme.accentGreen,
      opacity: 0.85,
    },
    chartTooltip: {
      position: 'absolute',
      bottom: 115,
      backgroundColor: '#1E293B',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
      transform: [{ translateX: -50 }],
      zIndex: 10,
    },
    chartTooltipTitle: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    chartTooltipSubtitle: {
      color: '#E8F542',
      fontSize: 9,
      fontWeight: '600',
      marginTop: 1,
    },
    chartTooltipArrow: {
      width: 6,
      height: 6,
      backgroundColor: '#1E293B',
      transform: [{ rotate: '45deg' }],
      position: 'absolute',
      bottom: -3,
      alignSelf: 'center',
    },
    chartLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      marginTop: 8,
    },
    chartLabelText: {
      fontSize: 9,
      fontWeight: '600',
      color: '#9EAE9F',
      width: 14,
      textAlign: 'center',
    },
    chartLabelTextActive: {
      color: '#E8F542',
      fontWeight: '700',
    },

    // Feature Grid
    featureGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20 },
    gridCard: {
      flex: 1, width: 0, backgroundColor: theme.bgCard, borderRadius: 20, padding: 16, alignItems: 'flex-start',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    },
    gridCardHeader: { marginBottom: 24 },
    iconCircleBlue: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
    blueDot: { position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFFFFF' },
    iconCircleBlueLight: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
    iconCirclePurple: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
    gridCardLabel: { fontSize: FONTS.sizes.xs + 1, fontWeight: '700', color: theme.textPrimary, lineHeight: 18 },

    // Job Section
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: theme.textPrimary, marginBottom: 10, paddingLeft: 2 },
    emptyJobsCard: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyJobsText: { fontSize: FONTS.sizes.sm, color: theme.textSecondary },
    jobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.bgCard, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 0 },
    jobRowLeft: { flex: 1 },
    jobRowTitle: { fontSize: FONTS.sizes.sm + 1, fontWeight: '700', color: theme.textPrimary },
    jobRowSub: { fontSize: FONTS.sizes.xs, color: theme.textSecondary, marginTop: 2 },
    jobRowBadge: { backgroundColor: theme.accentYellow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    jobRowBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: theme.textPrimary },

    // Settings
    settingsSection: { marginBottom: 15 },
    sectionHeader: { fontSize: FONTS.sizes.md, fontWeight: '800', color: theme.textPrimary, marginBottom: 10, paddingLeft: 2 },
    settingsCard: { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.bgCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.isDark ? 'transparent' : '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: theme.isDark ? 0 : 0.04, shadowRadius: 12, elevation: 0 },
    settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    settingsIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    settingsLabel: { flex: 1, fontSize: FONTS.sizes.sm + 1, fontWeight: '700', color: theme.textPrimary },
    divider: { height: 1, backgroundColor: theme.borderLight, marginLeft: 66 },
    footerVersion: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: theme.textLight, marginTop: 24 },

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
      backgroundColor: theme.accentYellow,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      shadowColor: theme.accentYellow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    guestTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.textPrimary,
      letterSpacing: -0.5,
      marginBottom: 10,
    },
    guestSub: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    guestBtn: {
      backgroundColor: theme.accentYellow,
      borderRadius: 24,
      height: 48,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.accentYellow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    guestBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.textPrimary,
    },

    // Notification Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Premium semi-transparent overlay
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.bgPrimary,
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
      color: theme.textPrimary,
      letterSpacing: -0.2,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.bgCard,
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
      color: theme.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    sectionHeader: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textLight,
      letterSpacing: 1.5,
      marginBottom: 10,
      marginTop: 8,
      paddingLeft: 4,
    },
    notifItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.bgCard,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0 : 0.03,
      shadowRadius: 8,
      elevation: theme.isDark ? 0 : 1,
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
      color: theme.textPrimary,
      flex: 1,
    },
    notifTime: {
      fontSize: 11,
      color: theme.textLight,
      fontWeight: '600',
      marginLeft: 10,
    },
    notifMsg: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
      marginTop: 4,
      lineHeight: 16,
    },

    // Instagram-Style Notification Styles
    igGroupHeader: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.textPrimary,
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
      borderBottomColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#F0F0F0',
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
      color: theme.textSecondary,
      fontWeight: '400',
      lineHeight: 19,
    },
    igBoldName: {
      fontWeight: '700',
      color: theme.textPrimary,
    },
    igTimeText: {
      fontSize: 12.5,
      color: theme.textLight,
      fontWeight: '400',
    },
    igSubText: {
      fontSize: 12.5,
      color: theme.textLight,
      fontWeight: '400',
      marginTop: 2,
      lineHeight: 17,
    },

    likerAvatarCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.accentYellow,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      shadowColor: theme.accentYellow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },
    likerAvatarText: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.textPrimary,
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
      color: theme.textPrimary,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    likerTitle: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '600',
      marginBottom: 16,
    },
    likerDivider: {
      height: 1,
      width: '100%',
      backgroundColor: theme.borderLight,
      marginBottom: 16,
    },
    likerInfoContainer: {
      width: '100%',
      backgroundColor: theme.bgCard,
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
      color: theme.textPrimary,
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
      backgroundColor: theme.bgPrimary,
    },
    detailNav: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
      backgroundColor: theme.bgPrimary,
    },
    detailNavTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: theme.textPrimary },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: theme.bgCard,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    detailHeroCard: {
      backgroundColor: theme.bgCard, borderRadius: 26, margin: 20, padding: 24, alignItems: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
    },
    detailAvatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: theme.accentYellow, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    detailAvatarText: { fontSize: 24, fontWeight: '800', color: theme.textPrimary },
    detailTitle: { fontSize: FONTS.sizes.lg + 1, fontWeight: '800', color: theme.textPrimary, textAlign: 'center' },
    detailCompany: { fontSize: FONTS.sizes.sm + 1, color: theme.textSecondary, marginTop: 4 },
    detailBadgeRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 14 },
    detailBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgSecondary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    detailBadgeText: { fontSize: FONTS.sizes.xs, color: theme.textSecondary, fontWeight: '500' },
    detailSalary: { fontSize: 24, fontWeight: '800', color: theme.textPrimary },
    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: theme.bgCard, borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
    statValue: { fontSize: FONTS.sizes.sm + 1, fontWeight: '800', color: theme.textPrimary, textAlign: 'center' },
    statLabel: { fontSize: FONTS.sizes.xs, color: theme.textSecondary, marginTop: 4 },
    sectionCard: { backgroundColor: theme.bgCard, borderRadius: 20, marginHorizontal: 20, marginBottom: 14, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
    sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: theme.textPrimary, marginBottom: 12 },
    descText: { fontSize: FONTS.sizes.sm, color: theme.textSecondary, lineHeight: 22 },
    reqItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    reqDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accentYellow, marginRight: 10 },
    reqText: { fontSize: FONTS.sizes.sm, color: theme.textSecondary },
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
      backgroundColor: theme.accentYellow,
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
      color: theme.textPrimary,
    },
    posterName: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    posterTitle: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
      marginBottom: 4,
    },
    posterContactRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    posterContactText: {
      fontSize: 12,
      color: theme.textSecondary,
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
      backgroundColor: theme.bgPrimary,
    },
    guideScreenHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#EEF2F0',
      backgroundColor: theme.isDark ? 'transparent' : theme.bgCard,
    },
    guideBackBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAF9',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#EEF2F0',
    },
    guideScreenHeaderTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    editorialBanner: {
      width: '100%',
      height: 155,
      borderRadius: 24,
      overflow: 'hidden',
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.5)' : '#1E293B',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: theme.isDark ? 0 : 0.12,
      shadowRadius: 16,
      elevation: theme.isDark ? 0 : 3,
    },
    editorialOverlay: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    editorialBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#E8F542',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 10,
    },
    editorialBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#1A1A1A',
      letterSpacing: 0.5,
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
      color: theme.textPrimary,
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    timelineContainer: {
      paddingLeft: 4,
      marginTop: 10,
      marginBottom: 20,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    timelineLineContainer: {
      alignItems: 'center',
      marginRight: 14,
    },
    timelineIconBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#EEF2F0',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0 : 0.04,
      shadowRadius: 4,
      elevation: theme.isDark ? 0 : 2,
      zIndex: 2,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#EEF2F0',
      marginVertical: 4,
      minHeight: 88,
    },
    timelineContent: {
      flex: 1,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.bgCard,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#EEF2F0',
      padding: 18,
    },
    timelineStepNumber: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.accentGreen,
      letterSpacing: 1,
      marginBottom: 4,
    },
    timelineStepTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.textPrimary,
      marginBottom: 6,
    },
    timelineStepDesc: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      fontWeight: '500',
    },
    guideScreenFinishBtn: {
      backgroundColor: theme.isDark ? '#FFFFFF' : '#111111',
      borderRadius: 20,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginTop: 10,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: theme.isDark ? 0 : 0.12,
      shadowRadius: 12,
      elevation: theme.isDark ? 0 : 4,
    },
    guideScreenFinishText: {
      color: theme.isDark ? '#111111' : '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    chartPlaceholderOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    chartPlaceholderText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    developerCredit: {
      textAlign: 'center',
      fontSize: 10,
      fontWeight: '700',
      color: theme.textSecondary,
      marginTop: 4,
      marginBottom: 16,
      opacity: 0.8,
    },
    cleanJobRow: {
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.45)',
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 0,
    },
    premiumJobRow: {
      borderColor: theme.isDark ? '#FF8C00' : '#5C9E6A',
      borderWidth: 1.5,
      shadowColor: theme.isDark ? '#FF8C00' : '#5C9E6A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: theme.isDark ? 0.6 : 0.12,
      shadowRadius: 16,
      elevation: 0,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.55)',
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    companyLogoSquare: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    companyLogoImage: {
      width: 44,
      height: 44,
      borderRadius: 14,
    },
    companyLogoInitial: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    companyNameContainer: {
      flex: 1,
    },
    jobRowSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    jobRowTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.isDark ? '#FFFFFF' : '#1A1A1A',
      marginTop: 2,
      letterSpacing: -0.2,
    },
    salaryBadgeContainer: {
      backgroundColor: theme.isDark ? 'rgba(255, 140, 0, 0.15)' : '#E6F4EA',
      borderColor: theme.isDark ? 'rgba(255, 140, 0, 0.4)' : 'transparent',
      borderWidth: theme.isDark ? 1 : 0,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      marginLeft: 8,
    },
    jobRowSalaryText: {
      color: theme.isDark ? '#FF8C00' : '#137333',
      fontSize: 11,
      fontWeight: '800',
    },
    cardTagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    metaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    metaBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.isDark ? '#FF8C00' : theme.accentGreen,
    },
    cardDivider: {
      height: 1,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
      marginBottom: 12,
    },
    cardFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    jobRowMetaText: {
      fontSize: 10,
      color: '#94A3B8',
      fontWeight: '600',
    },
    rowHeartBtn: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
    },
    rowHeartBtnActive: {
      backgroundColor: '#FEE2E2',
    },
    rowHeartCountText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#64748B',
    },
    rowHeartCountTextActive: {
      color: '#EF4444',
    },
    applyArrowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? '#FF8C00' : '#E8F542',
      borderWidth: 1,
      borderColor: theme.isDark ? '#FF8C00' : '#CBD5E1',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 4,
      shadowColor: theme.isDark ? '#FF8C00' : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.6 : 0,
      shadowRadius: theme.isDark ? 6 : 0,
      elevation: theme.isDark ? 3 : 0,
    },
    applyBtnLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: '#1A1A1A',
    },
  });
}
