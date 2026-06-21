import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn("⚠️ [NOTIFICATIONS] expo-notifications module not found in this client build. Rebuild the APK to enable native notifications.");
}

const SESSION_KEY = '@bkj_user_session';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  {
    id: '1',
    name: 'Leandro Foster',
    email: 'leandro@gmail.com',
    password: '123456',
    role: 'employer',
    title: 'HR Manager at TechCorp',
    location: 'Lahore, Pakistan',
    phone: '+92 300 1234567',
    avatar: null,
    joinDate: 'Jan 2025',
  },
  {
    id: '2',
    name: 'Sara Khan',
    email: 'sara@gmail.com',
    password: '123456',
    role: 'jobseeker',
    title: 'Full Stack Developer',
    location: 'Karachi, Pakistan',
    phone: '+92 333 9876543',
    avatar: null,
    joinDate: 'Mar 2025',
  },
];

const INITIAL_JOBS = [
  {
    id: 'j1',
    title: 'React Native Developer',
    company: 'TechCorp Pvt Ltd',
    location: 'Lahore, Pakistan',
    salary: '$1,200 - $2,000/mo',
    type: 'Full Time',
    category: 'Technology',
    description: 'We are looking for an experienced React Native developer to join our growing team.',
    requirements: ['3+ years React Native', 'JavaScript/TypeScript', 'REST APIs', 'Git'],
    postedBy: '1',
    postedAt: '2 days ago',
    applicants: 14,
    likes: 5,
  },
  {
    id: 'j2',
    title: 'UI/UX Designer',
    company: 'Creative Studio',
    location: 'Karachi, Pakistan',
    salary: '$800 - $1,400/mo',
    type: 'Part Time',
    category: 'Design',
    description: 'Join our creative team as a UI/UX Designer.',
    requirements: ['Figma', 'Adobe XD', '2+ years experience', 'Prototyping'],
    postedBy: '1',
    postedAt: '5 days ago',
    applicants: 28,
    likes: 12,
  },
  {
    id: 'j3',
    title: 'Digital Marketing Specialist',
    company: 'Growth Agency',
    location: 'Islamabad, Pakistan',
    salary: '$600 - $1,000/mo',
    type: 'Remote',
    category: 'Marketing',
    description: 'Drive our digital marketing campaigns across social media, SEO, and email.',
    requirements: ['SEO/SEM', 'Social Media', 'Content Writing', 'Google Analytics'],
    postedBy: '1',
    postedAt: '1 week ago',
    applicants: 42,
    likes: 2,
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Welcome to BKJ! ✨',
    message: 'Explore active listings or post a new opportunity instantly. All users have full job matching access.',
    time: 'Just now',
    type: 'system',
  },
  {
    id: 'n_save1',
    title: 'Sara Khan saved your job! ❤️',
    message: 'Sara Khan saved your listing "React Native Developer". Tap here to view their profile card.',
    time: '5 mins ago',
    type: 'like',
    likerId: '2',
  },
  {
    id: 'n_save2',
    title: 'Leandro Foster saved your job! ❤️',
    message: 'Leandro Foster saved your listing "Digital Marketing Specialist". Tap here to view their profile card.',
    time: '2 hours ago',
    type: 'like',
    likerId: '1',
  }
];

// ─── Helpers (defined outside component so they are stable) ──────────────────
export const getTransformedAvatarUrl = (url, width = 150, height = 150) => {
  // Supabase Image Transformations are failing (likely disabled on free tier or requires Pro plan)
  // Reverting to standard public URL so images load again.
  return url;
};

const retryAsync = async (fn, retries = 3, delay = 500) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isNetwork =
        err?.message?.toLowerCase()?.includes('network') ||
        err?.message?.toLowerCase()?.includes('timeout') ||
        err?.message?.toLowerCase()?.includes('fetch') ||
        err?.status === 0;
      if (!isNetwork || attempt === retries) throw err;
      console.log(`⚠️ Network error encountered (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay * Math.pow(2, attempt)}ms...`);
      await new Promise((res) => setTimeout(res, delay * Math.pow(2, attempt)));
    }
  }
};

const handleError = (err) => {
  console.error('Auth error:', err);
  const msg = err?.message || '';
  const lowerMsg = msg.toLowerCase();

  let friendly;
  let errorCode = 'unknown';

  if (lowerMsg.includes('network') || lowerMsg.includes('timeout')) {
    friendly = 'Network issue. Please check your connection and try again.';
    errorCode = 'network';
  } else if (lowerMsg.includes('invalid login') || lowerMsg.includes('invalid credentials')) {
    friendly = 'Incorrect email or password. Please try again.';
    errorCode = 'invalid_credentials';
  } else if (lowerMsg.includes('email not confirmed')) {
    friendly = 'Please verify your email address before signing in.';
    errorCode = 'email_not_confirmed';
  } else if (lowerMsg.includes('already registered') || lowerMsg.includes('already exists') || lowerMsg.includes('user already registered')) {
    friendly = 'An account with this email already exists.';
    errorCode = 'already_registered';
  } else if (lowerMsg.includes('weak password') || lowerMsg.includes('password should')) {
    friendly = 'Password is too weak. Please use at least 6 characters.';
    errorCode = 'weak_password';
  } else if (lowerMsg.includes('invalid email') || lowerMsg.includes('unable to validate email')) {
    friendly = 'Please enter a valid email address.';
    errorCode = 'invalid_email';
  } else {
    friendly = msg || 'Something went wrong. Please try again.';
    errorCode = 'unknown';
  }

  return { success: false, message: friendly, errorCode };
};

// ─── Image Format Helpers ──────────────────────────────────────────────────
const IMAGE_MIME_MAP = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  bmp: 'image/bmp',
};

const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png'];

const getImageMetadata = (uri) => {
  // Try to extract file extension from URI path
  const match = uri.match(/\.(\w+)(?:\?|$)/);
  const ext = (match ? match[1].toLowerCase() : 'jpg');
  const mimeType = IMAGE_MIME_MAP[ext] || 'image/jpeg';
  // Normalize jpeg → jpg for filename
  const extension = ext === 'jpeg' ? 'jpg' : ext;
  return { extension, mimeType };
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  // Format clock time, e.g. "5:30 PM"
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Check if it's today or yesterday
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  if (isToday) {
    return `Today at ${timeString}`;
  }
  if (isYesterday) {
    return `Yesterday at ${timeString}`;
  }

  const dateStringFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${dateStringFormatted} at ${timeString}`;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [categoryPreferences, setCategoryPreferences] = useState({});

  useEffect(() => {
    const loadCategoryPreferences = async () => {
      try {
        const savedPrefs = await AsyncStorage.getItem('@bkj_category_preferences');
        if (savedPrefs) {
          setCategoryPreferences(JSON.parse(savedPrefs));
        }
      } catch (e) {
        console.warn('Failed to load category preferences:', e);
      }
    };
    loadCategoryPreferences();
  }, []);
  const [likedJobs, setLikedJobs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [signingUp, setSigningUp] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Prefetch avatar to disk cache for instant load
  useEffect(() => {
    if (user && user.avatar) {
      Image.prefetch(user.avatar).catch((err) => {
        console.log('Avatar prefetch failed:', err.message);
      });
    }
  }, [user?.avatar]);

  // Geo-targeting: auto-detected country from IP
  const [userCountry, setUserCountry] = useState(null);

  const [spamBlockUntil, setSpamBlockUntil] = useState(0);
  const [spamModalVisible, setSpamModalVisible] = useState(false);

  // Persistent refs to avoid reset during state/render cycles
  const seenLikeIdsRef = useRef(new Set());
  const lastNotificationTimesRef = useRef(new Map());
  const lastLikeClickTimesRef = useRef(new Map()); // Clicker-side map: Key: jobId, Value: Array of timestamps
  const isInitialLoadRef = useRef(true);

  // Load saved block time on startup
  useEffect(() => {
    const loadBlockTime = async () => {
      try {
        const savedBlock = await AsyncStorage.getItem('@bkj_spam_block_until');
        if (savedBlock) {
          const parsed = Number(savedBlock);
          if (parsed > Date.now()) {
            setSpamBlockUntil(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load spam block time:', e);
      }
    };
    loadBlockTime();
  }, []);

  // ─── Geo-Detect User Country (IP-based, no permissions needed) ──────────────
  useEffect(() => {
    const ISO_TO_NAME = {
      PK: 'Pakistan', IN: 'India', AE: 'United Arab Emirates', SA: 'Saudi Arabia',
      US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
      QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman', DE: 'Germany',
      FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands', SE: 'Sweden',
      NO: 'Norway', DK: 'Denmark', IE: 'Ireland', NZ: 'New Zealand',
      CN: 'China', JP: 'Japan', KR: 'South Korea', SG: 'Singapore',
      MY: 'Malaysia', PH: 'Philippines', TH: 'Thailand', BD: 'Bangladesh',
      TR: 'Turkey', EG: 'Egypt', ZA: 'South Africa', NG: 'Nigeria',
      BR: 'Brazil', MX: 'Mexico', AF: 'Afghanistan', NP: 'Nepal',
      ID: 'Indonesia', VN: 'Vietnam', LK: 'Sri Lanka', IQ: 'Iraq',
      JO: 'Jordan', LB: 'Lebanon', IR: 'Iran', RU: 'Russia', PL: 'Poland',
      PT: 'Portugal', BE: 'Belgium', AT: 'Austria', GR: 'Greece', CZ: 'Czech Republic',
      RO: 'Romania', HU: 'Hungary', FI: 'Finland', CH: 'Switzerland',
    };

    const detectCountry = async () => {
      console.log('🌍 [GEO] Starting country detection...');

      // Step 1: Load from cache first (instant)
      try {
        const cached = await AsyncStorage.getItem('@bkj_user_country');
        if (cached) {
          setUserCountry(cached);
          console.log('🌍 [GEO] Loaded from cache:', cached);
        }
      } catch (cacheErr) {
        console.warn('🌍 [GEO] Cache read failed:', cacheErr.message);
      }

      // Step 2: Try ip-api.com (no HTTPS restriction, mobile-friendly, 10k/day free)
      try {
        console.log('🌍 [GEO] Trying ip-api.com...');
        const r1 = await fetch('http://ip-api.com/json/?fields=country', {
          method: 'GET',
        });
        console.log('🌍 [GEO] ip-api.com status:', r1.status);
        if (r1.ok) {
          const d1 = await r1.json();
          console.log('🌍 [GEO] ip-api.com response:', JSON.stringify(d1));
          if (d1.country) {
            setUserCountry(d1.country);
            await AsyncStorage.setItem('@bkj_user_country', d1.country);
            console.log('🌍 [GEO] ✅ Country set to:', d1.country);
            return;
          }
        }
      } catch (e1) {
        console.warn('🌍 [GEO] ip-api.com failed:', e1.message);
      }

      // Step 3: Try ipapi.co as fallback
      try {
        console.log('🌍 [GEO] Trying ipapi.co...');
        const r2 = await fetch('https://ipapi.co/json/');
        console.log('🌍 [GEO] ipapi.co status:', r2.status);
        if (r2.ok) {
          const d2 = await r2.json();
          console.log('🌍 [GEO] ipapi.co response:', JSON.stringify(d2).substring(0, 100));
          const country = d2.country_name || null;
          if (country) {
            setUserCountry(country);
            await AsyncStorage.setItem('@bkj_user_country', country);
            console.log('🌍 [GEO] ✅ Country set to:', country);
            return;
          }
        }
      } catch (e2) {
        console.warn('🌍 [GEO] ipapi.co failed:', e2.message);
      }

      // Step 4: Try api.country.is (ISO code based)
      try {
        console.log('🌍 [GEO] Trying api.country.is...');
        const r3 = await fetch('https://api.country.is/');
        console.log('🌍 [GEO] api.country.is status:', r3.status);
        if (r3.ok) {
          const d3 = await r3.json();
          console.log('🌍 [GEO] api.country.is response:', JSON.stringify(d3));
          const countryName = ISO_TO_NAME[d3.country] || d3.country || null;
          if (countryName) {
            setUserCountry(countryName);
            await AsyncStorage.setItem('@bkj_user_country', countryName);
            console.log('🌍 [GEO] ✅ Country set to:', countryName);
            return;
          }
        }
      } catch (e3) {
        console.warn('🌍 [GEO] api.country.is failed:', e3.message);
      }

      console.warn('🌍 [GEO] ❌ All 3 geo APIs failed. Geo-targeting unavailable.');
    };

    detectCountry();
  }, []); // Run once on app startup

  // Clear caches when the logged-in user changes (logout/login)
  useEffect(() => {
    seenLikeIdsRef.current.clear();
    lastNotificationTimesRef.current.clear();
    lastLikeClickTimesRef.current.clear();
  }, [user?.id]);

  const isMockMode = false;


  // ✅ NAYA - popup bhi trigger hoga, likerProfile bhi pass hoga
  const addNotification = (title, message, type = 'system', likerProfile = null, jobId = null) => {
    const newNotif = {
      id: Math.random().toString(),
      title, message,
      time: 'Just now',
      type,
      likerProfile,
      job_id: jobId,
    };

    // Bell icon list mein add karo
    setNotifications(prev => {
      let updatedList = prev;
      if (jobId && type === 'system') {
        updatedList = prev.filter(n => !(n.type === 'system' && String(n.job_id) === String(jobId)));
      }
      return [newNotif, ...updatedList];
    });

    // ✅ Popup toast trigger karo (yeh line missing thi!)
    setNotification(null); // pehle reset karo same notif ke liye
    setTimeout(() => {
      setNotification({ title, message, type, likerProfile });
      setTimeout(() => setNotification(null), 4000); // auto-dismiss
    }, 50);

    // ✅ Persist in AsyncStorage so it appears in Profile Notifications after reload
    if (user) {
      const saveNotification = async () => {
        try {
          const saved = await AsyncStorage.getItem('@bkj_global_notifications');
          let list = saved ? JSON.parse(saved) : [];
          if (jobId && type === 'system') {
            // We don't save job status notifications locally anymore since fetchRealNotifications generates them dynamically
            return;
          }
          list.unshift({
            ...newNotif,
            owner_id: user.id, // required for fetchRealNotifications to find it
            created_at: new Date().toISOString()
          });
          await AsyncStorage.setItem('@bkj_global_notifications', JSON.stringify(list));
        } catch (e) {
          console.warn('Failed to save notification to AsyncStorage:', e);
        }
      };
      saveNotification();
    }
  };

  const triggerLocalNotification = async (title, body) => {
    if (!Notifications) {
      console.log('⚠️ [NOTIFICATIONS] Native notifications module is not available in this client build.');
      return;
    }
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('⚠️ [NOTIFICATIONS] Permission not granted for local notifications.');
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // deliver immediately
      });
    } catch (e) {
      console.warn('⚠️ [NOTIFICATIONS] Failed to trigger local notification:', e);
    }
  };

  const clearNotifications = async () => {
    if (!user) return;
    try {
      setNotifications([]);
      const saved = await AsyncStorage.getItem('@bkj_global_notifications');
      if (saved) {
        let list = JSON.parse(saved);
        list = list.filter(n => n.owner_id !== user.id);
        await AsyncStorage.setItem('@bkj_global_notifications', JSON.stringify(list));
      }
      console.log('📝 [DEBUG clearNotifications] Notifications cleared successfully for user:', user.id);
    } catch (e) {
      console.warn('Failed to clear notifications:', e);
    }
  };

  const addSharedLocalNotification = async (ownerId, likerUser, jobTitle, jobId) => {
    try {
      const saved = await AsyncStorage.getItem('@bkj_global_notifications');
      let list = saved ? JSON.parse(saved) : [];

      // Prevent duplicates by removing any existing notification by this user for this specific job first!
      list = list.filter(n => !(n.owner_id === ownerId && n.likerId === likerUser.id && (n.job_id === jobId || n.message.includes(jobTitle))));

      const isOwnLike = ownerId === likerUser.id;
      const newNotif = {
        id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        owner_id: ownerId,
        job_id: jobId,
        title: isOwnLike ? `You saved your job! ❤️` : `${likerUser.name || 'A candidate'} saved your job! ❤️`,
        message: isOwnLike
          ? `You saved your listing "${jobTitle}".`
          : `${likerUser.name || 'Someone'} saved your listing "${jobTitle}". Tap here to view their profile card.`,
        created_at: new Date().toISOString(),
        type: 'like',
        likerId: likerUser.id,
        likerProfile: {
          id: likerUser.id,
          name: likerUser.name || 'Candidate',
          title: likerUser.title || 'Job Seeker',
          location: likerUser.location || 'Not specified',
          phone: likerUser.phone || 'No phone provided',
          email: likerUser.email || 'candidate@gmail.com',
          avatar: likerUser.avatar || null
        }
      };

      console.log('📝 [DEBUG addSharedLocalNotification] Appending local notif:', newNotif);
      list.unshift(newNotif);
      await AsyncStorage.setItem('@bkj_global_notifications', JSON.stringify(list));
      console.log('📝 [DEBUG addSharedLocalNotification] Successfully saved. Storage count is now:', list.length);
    } catch (e) {
      console.warn('Failed to save shared local notification:', e);
    }
  };

  const removeSharedLocalNotification = async (ownerId, likerId, jobId, jobTitle) => {
    try {
      const saved = await AsyncStorage.getItem('@bkj_global_notifications');
      if (saved) {
        let list = JSON.parse(saved);
        list = list.filter(n => !(n.owner_id === ownerId && n.likerId === likerId && (n.job_id === jobId || n.message.includes(jobTitle))));
        await AsyncStorage.setItem('@bkj_global_notifications', JSON.stringify(list));
        console.log('📝 [DEBUG removeSharedLocalNotification] Removed local notification. Remaining count:', list.length);
      }
    } catch (e) {
      console.warn('Failed to delete shared local notification:', e);
    }
  };

  const fetchRealNotifications = async () => {
    if (!user || isGuest) return;
    try {
      console.log('📝 [DEBUG fetchRealNotifications] Logged-in user fetching:', { id: user.id, name: user.name });
      const savedLocal = await AsyncStorage.getItem('@bkj_global_notifications');
      let localNotifs = [];
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        console.log('📝 [DEBUG fetchRealNotifications] Found global shared list of count:', parsed.length);
        const filtered = parsed.filter(n => n.owner_id === user.id);

        // De-duplicate local notifications strictly, falling back to profile ID/name/notif ID if likerId is missing
        const uniqueLocal = [];
        const seenLocal = new Set();
        for (const n of filtered) {
          const likerKey = n.likerId || n.likerProfile?.id || n.likerProfile?.name || n.id;
          const key = `${likerKey}_${n.job_id || n.message}`;
          if (!seenLocal.has(key)) {
            seenLocal.add(key);
            uniqueLocal.push(n);
          }
        }

        localNotifs = uniqueLocal
          // Ignore legacy job status notifications saved in AsyncStorage
          .filter(n => !(n.type === 'system' && n.job_id) && n.type !== 'post')
          // Do not show notifications for self-likes
          .filter(n => n.likerId !== user.id)
          .map(n => ({
            ...n,
            time: formatTimeAgo(n.created_at)
          }));
        console.log(`📝 [DEBUG fetchRealNotifications] Filtered unique localNotifs matching owner_id:`, localNotifs.length);
      }

      if (isMockMode) {
        const welcomeNotif = {
          id: 'welcome',
          title: 'Welcome to BKJ! ✨',
          message: 'Explore active listings or post a new opportunity instantly. All users have full job matching access.',
          time: 'Just now',
          type: 'system',
        };
        setNotifications([welcomeNotif, ...localNotifs]);
        return;
      }

      const { data, error } = await supabase
        .from('likes')
        .select(`
          id,
          job_id,
          user_id,
          created_at,
          jobs (
            title
          ),
          profiles:user_id (
            id,
            name,
            title,
            location,
            phone,
            email,
            avatar_url
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('ℹ️ Supabase likes query failed:', error.message, '| Details:', error.details || 'None');
        console.log('ℹ️ Using local device activity feed fallback.');

        const welcomeNotif = {
          id: 'welcome',
          title: 'Welcome to BKJ! ✨',
          message: 'Explore active listings or post a new opportunity instantly. All users have full job matching access.',
          time: 'Just now',
          type: 'system',
        };
        // Filter out self-likes from local notifications too
        const filteredLocal = localNotifs.filter(n => n.likerId !== user.id);
        setNotifications([welcomeNotif, ...filteredLocal]);
        return;
      }

      if (data) {
        // Only show notifications from OTHER users who liked your jobs (not your own bookmarks), and only if that user's profile still exists
        const otherLikes = data.filter(item => {
          const likerId = item.profiles?.id || item.user_id;
          const profileExists = !!item.profiles;
          return likerId !== user.id && profileExists;
        });

        const dbNotifs = otherLikes.map(item => {
          const likerProfile = item.profiles || {};
          const jobTitle = item.jobs?.title || 'your job';
          const likerName = likerProfile.name || 'Someone';
          const likerInitials = likerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          return {
            id: String(item.id),
            job_id: item.job_id,
            title: `${likerName} liked your post`,
            message: `${likerName} showed interest in your listing "${jobTitle}".`,
            created_at: item.created_at,
            time: formatTimeAgo(item.created_at),
            type: 'like',
            likerId: likerProfile.id || item.user_id,
            likerInitials,
            likerProfile: {
              id: likerProfile.id || item.user_id,
              name: likerName,
              title: likerProfile.title || 'Job Seeker',
              location: likerProfile.location || 'Not specified',
              phone: likerProfile.phone || 'No phone provided',
              email: likerProfile.email || 'candidate@gmail.com',
              avatar: likerProfile.avatar_url || null
            }
          };
        });

        // Query user's jobs to retroactively show them as notifications
        let systemJobsNotifs = [];
        try {
          const { data: myJobs } = await supabase
            .from('jobs')
            .select('id, title, status, created_at')
            .eq('posted_by', user.id);

          if (myJobs) {
            systemJobsNotifs = myJobs
              .filter(job => job.status === 'approved' || job.status === 'pending' || job.status === 'rejected')
              .map(job => {
                let notifTitle = 'Job Status Update';
                let notifMessage = `Your job post "${job.title}" has an update.`;
                
                if (job.status === 'approved') {
                  notifTitle = 'Job Approved ✅';
                  notifMessage = `BKJ has approved your job post: "${job.title}".`;
                } else if (job.status === 'pending') {
                  notifTitle = 'Job Pending ⏳';
                  notifMessage = `Your job post "${job.title}" is under review.`;
                } else if (job.status === 'rejected') {
                  notifTitle = 'Job Rejected ❌';
                  notifMessage = `Your job post "${job.title}" was rejected.`;
                }

                return {
                  id: `sys_${job.status}_${job.id}`,
                  job_id: job.id,
                  title: notifTitle,
                  message: notifMessage,
                  created_at: job.created_at,
                  time: formatTimeAgo(job.created_at),
                  type: 'system'
                };
              });
          }
        } catch (e) {
          console.warn('Failed to fetch user jobs for notifications', e);
        }

        // Merge live database notifications (likes), local system notifications, and retroactive jobs.
        const mergedNotifs = [...dbNotifs, ...localNotifs, ...systemJobsNotifs];

        const uniqueNotifs = [];
        const seenKeys = new Set();
        for (const n of mergedNotifs) {
          const likerKey = n.likerId || n.likerProfile?.id || n.id;
          const key = `${likerKey}_${n.job_id || n.message}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueNotifs.push(n);
          }
        }

        // Sort by created_at descending (newest first)
        uniqueNotifs.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA;
        });

        const welcomeNotif = {
          id: 'welcome',
          title: 'Welcome to BKJ! ✨',
          message: 'Explore active listings or post a new opportunity instantly. All users have full job matching access.',
          time: 'Just now',
          type: 'system',
        };

        setNotifications([welcomeNotif, ...uniqueNotifs]);
      }
    } catch (err) {
      console.warn('Exception fetching real notifications:', err.message);
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  };

  useEffect(() => {
    const loadUserLikedJobs = async () => {
      try {
        const key = user ? `@bkj_liked_jobs_${user.id}` : '@bkj_liked_jobs_guest';
        const saved = await AsyncStorage.getItem(key);
        let localLikes = [];
        if (saved) {
          localLikes = JSON.parse(saved);
          setLikedJobs(localLikes);
        } else {
          setLikedJobs([]);
        }

        // Fetch direct, real-time liked jobs from Supabase on login for absolute multi-device synchronization
        if (user && !isMockMode) {
          const { data, error } = await supabase
            .from('likes')
            .select('job_id')
            .eq('user_id', user.id);

          if (!error && data) {
            const dbLikes = data.map(item => item.job_id);
            setLikedJobs(dbLikes);
            await AsyncStorage.setItem(key, JSON.stringify(dbLikes));
          }
        }
      } catch (e) {
        console.warn('Failed to load liked jobs:', e);
      }
    };

    const loadUserAppliedJobs = async () => {
      try {
        const key = user ? `@bkj_applied_jobs_${user.id}` : '@bkj_applied_jobs_guest';

        // 1. Load from local AsyncStorage first (instant UI, works offline)
        const saved = await AsyncStorage.getItem(key);
        let localList = [];
        if (saved) {
          const parsed = JSON.parse(saved);
          localList = parsed.map(item => {
            if (typeof item === 'object' && item !== null && item.jobId) return item;
            return { jobId: item, appliedAt: new Date().toISOString() };
          });
          setAppliedJobs(localList);

          // Reconcile applicants counts for previously applied jobs in local state
          const localIds = localList.map(item => item.jobId);
          setJobs(prevJobs => prevJobs.map(j => {
            if (localIds.includes(j.id) && !j.appliedByUser) {
              return { ...j, applicants: (j.applicants || 0) + 1, appliedByUser: true };
            }
            return j;
          }));
        }

        // 2. If logged in with real DB, fetch from the real `applications` table
        if (!isMockMode && user) {
          const { data: dbApps, error } = await supabase
            .from('applications')
            .select('job_id, created_at')
            .eq('applicant_id', user.id);

          if (!error && dbApps) {
            console.log(`✅ [APPLIED] Loaded ${dbApps.length} applications from database.`);
            const dbList = dbApps.map(item => ({
              jobId: item.job_id,
              appliedAt: item.created_at || new Date().toISOString()
            }));

            // Merge: DB is source of truth; keep any local items not yet synced to DB
            const merged = [...dbList];
            const dbJobIds = dbList.map(d => d.jobId);
            const localOnlyItems = [];

            localList.forEach(localItem => {
              const exists = dbJobIds.includes(localItem.jobId);
              if (!exists) {
                merged.push(localItem);
                localOnlyItems.push(localItem); // these need to be synced to DB
              }
            });

            // ── Auto-sync old local applications to Supabase ─────────────────
            if (localOnlyItems.length > 0) {
              console.log(`🔄 [SYNC] Syncing ${localOnlyItems.length} old local applications to Supabase...`);
              localOnlyItems.forEach(async (item) => {
                const { error: syncErr } = await supabase
                  .from('applications')
                  .insert({
                    job_id: item.jobId,
                    applicant_id: user.id,
                    created_at: item.appliedAt || new Date().toISOString()
                  });
                if (!syncErr) {
                  console.log(`✅ [SYNC] Old application synced to DB: ${item.jobId}`);
                } else {
                  // Ignore duplicate key errors (already exists)
                  if (!syncErr.code?.includes('23505')) {
                    console.warn(`⚠️ [SYNC] Failed to sync ${item.jobId}:`, syncErr.message);
                  }
                }
              });
            }

            // Persist merged back to AsyncStorage for offline support
            AsyncStorage.setItem(key, JSON.stringify(merged)).catch(e => console.warn(e));
            setAppliedJobs(merged);

            // Reconcile job counts with the merged list
            const mergedIds = merged.map(item => item.jobId);
            setJobs(prevJobs => prevJobs.map(j => {
              if (mergedIds.includes(j.id) && !j.appliedByUser) {
                return { ...j, applicants: (j.applicants || 0) + 1, appliedByUser: true };
              }
              return j;
            }));
          } else if (error) {
            console.warn('⚠️ [APPLIED] Failed to fetch applications from DB:', error.message);
          }
        } else if (!saved) {
          setAppliedJobs([]);
        }
      } catch (e) {
        console.warn('Failed to load applied jobs:', e);
      }
    };

    loadUserLikedJobs();
    loadUserAppliedJobs();

    if (user !== null) {
      setIsGuest(false);
      fetchRealNotifications();
    }
  }, [user]);

  // ─── Session Init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMockMode) {
      console.warn('⚠️ BKJ running in MOCK MODE');
      setJobs(INITIAL_JOBS);
      // Restore persisted mock session
      const restoreMockSession = async () => {
        const startTime = Date.now();
        try {
          const saved = await AsyncStorage.getItem(SESSION_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            setUser(parsed);
            console.log('✅ Restored mock session for:', parsed.name);
          }
        } catch (e) {
          console.warn('Failed to restore mock session:', e);
        } finally {
          const elapsedTime = Date.now() - startTime;
          const minimumDelay = 10000; // 10 seconds
          const remainingDelay = Math.max(0, minimumDelay - elapsedTime);
          setTimeout(() => {
            setLoading(false);
          }, remainingDelay);
        }
      };
      restoreMockSession();
      return;
    }

    console.log('🚀 BKJ connecting to Supabase production backend!');

    // Helper to race a promise with a timeout
    const withTimeout = (promise, ms, timeoutErrorMsg) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutErrorMsg)), ms))
      ]);
    };

    const fetchUserProfile = async (userId, sessionUser = null) => {
      try {
        // Wrap Supabase profiles single row fetch in a 3.5s timeout for instant app startup
        const { data, error } = await withTimeout(
          supabase.from('profiles').select('*').eq('id', userId).single(),
          3500,
          'Profile query timed out'
        );

        if (error) {
          if (error.code === 'PGRST116') { // PGRST116 is "Row not found"
            if (sessionUser) {
              console.log("Auto-recreating missing profile row in database on app startup...");
              const role = sessionUser.user_metadata?.role || 'jobseeker';
              const googleAvatar = sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || null;
              const phone = sessionUser.user_metadata?.phone || '';
              const location = phone ? `Pakistan|phone:${phone}` : 'Pakistan';
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: userId,
                    name: sessionUser.user_metadata?.name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'BKJ User',
                    email: sessionUser.email || '',
                    role: role,
                    avatar_url: googleAvatar,
                    phone: phone || null,
                    location: location,
                  }
                ]);
              if (!insertError) {
                console.log("Successfully auto-recreated missing profile row on app startup.");
                return fetchUserProfile(userId, sessionUser);
              } else {
                console.warn("⚠️ Database profile insertion error:", insertError.message);
              }
            }
            console.log("Profile not found in profiles table and metadata missing. Signing out...");
            setUser(null);
            await supabase.auth.signOut();
            return;
          }
          throw error;
        }

        console.log("🔍 DB PROFILE DATA:", data);
        console.log("🔍 AUTH USER METADATA:", sessionUser?.user_metadata);

        // Fallbacks using the metadata entered during registration
        const name = data?.name || sessionUser?.user_metadata?.name || sessionUser?.user_metadata?.full_name || sessionUser?.email?.split('@')[0] || 'BKJ User';
        const email = data?.email || sessionUser?.email || '';
        const role = data?.role || sessionUser?.user_metadata?.role || 'jobseeker';

        let dbLocation = data?.location || 'Pakistan';
        let phone = data?.phone || '';

        let appliedFromDb = [];
        // Unpack phone and applied from packed location format if present
        if (dbLocation && dbLocation.includes('|')) {
          const parts = dbLocation.split('|');
          dbLocation = parts[0] || 'Pakistan';

          const phonePart = parts.find(p => p.startsWith('phone:'));
          if (phonePart && !phone) {
            phone = phonePart.replace('phone:', '');
          }

          const appliedPart = parts.find(p => p.startsWith('applied:'));
          if (appliedPart) {
            const listStr = appliedPart.replace('applied:', '');
            if (listStr) {
              appliedFromDb = listStr.split(',').map(id => ({
                jobId: id,
                appliedAt: new Date().toISOString()
              }));
            }
          }
        }

        // Google/session metadata fallback only if DB does not have it
        if (!phone) {
          phone = sessionUser?.user_metadata?.phone || '';
        }

        // Merge database-loaded applications into local storage scoped by user ID
        if (appliedFromDb.length > 0) {
          const key = `@bkj_applied_jobs_${userId}`;
          AsyncStorage.getItem(key).then((saved) => {
            let localList = saved ? JSON.parse(saved) : [];
            const merged = [...localList];
            appliedFromDb.forEach(dbItem => {
              const exists = merged.some(localItem => {
                const id = typeof localItem === 'object' ? localItem.jobId : localItem;
                return id === dbItem.jobId;
              });
              if (!exists) {
                merged.push(dbItem);
              }
            });
            const normalized = merged.map(item => {
              if (typeof item === 'object' && item !== null && item.jobId) {
                return item;
              }
              return { jobId: item, appliedAt: new Date().toISOString() };
            });
            AsyncStorage.setItem(key, JSON.stringify(normalized)).catch(e => console.warn(e));
            setAppliedJobs(normalized);
          }).catch(e => console.warn(e));
        }

        // If the phone number contains an '@' (due to browser autofill or Google meta mismatch), treat it as empty
        if (phone && phone.includes('@')) {
          phone = '';
        }

        // Auto-heal/sync missing phone/location packing for existing profiles in the background
        const hasPackedPhone = data && data.location && data.location.includes('|phone:');
        const hasDbPhone = data && data.phone;
        if (data && phone && (!hasPackedPhone || !hasDbPhone)) {
          console.log("📝 Healing existing profile database phone fields in background...");
          const healUpdates = {};
          if (!hasDbPhone) {
            healUpdates.phone = phone;
          }
          if (!hasPackedPhone) {
            const currentLoc = (data.location && !data.location.includes('|')) ? data.location : 'Pakistan';
            healUpdates.location = `${currentLoc}|phone:${phone}`;
          }
          supabase
            .from('profiles')
            .update(healUpdates)
            .eq('id', userId)
            .then(({ error: healErr }) => {
              if (healErr) console.warn("⚠️ Failed background profile healing:", healErr.message);
              else console.log("✅ Profile healed successfully in database.");
            });
        }

        // Auto-heal/sync missing avatar_url in the database profiles table if present in Google/OAuth metadata
        const googleAvatar = sessionUser?.user_metadata?.avatar_url || sessionUser?.user_metadata?.picture || null;
        if (data && !data.avatar_url && googleAvatar) {
          console.log("📝 Auto-syncing Google avatar to database profiles table...");
          supabase
            .from('profiles')
            .update({ avatar_url: googleAvatar })
            .eq('id', userId)
            .then(({ error: syncErr }) => {
              if (syncErr) console.warn("⚠️ Failed to sync avatar to database:", syncErr.message);
              else console.log("✅ Avatar synced to database successfully.");
            });
        }

        const title = data?.title || (role === 'employer' ? 'Employer Profile' : 'Job Seeker Profile');
        const location = dbLocation;

        setUser({
          id: userId,
          name,
          email,
          role,
          title,
          location,
          phone,
          isBanned: data?.is_banned || false,
          banReason: data?.ban_reason || null,
          avatar: getTransformedAvatarUrl(data?.avatar_url || sessionUser?.user_metadata?.avatar_url || sessionUser?.user_metadata?.picture || null),
          joinDate: data?.join_date
            ? new Date(data.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        });
      } catch (err) {
        console.warn('ℹ️ Profile sync resolved using Auth session metadata:', err.message);

        // Critical Fallback: Set user directly from auth metadata so they can still use the app
        if (sessionUser) {
          const role = sessionUser.user_metadata?.role || 'jobseeker';
          let phone = sessionUser.user_metadata?.phone || '';
          if (phone && phone.includes('@')) {
            phone = '';
          }
          setUser({
            id: userId,
            name: sessionUser.user_metadata?.name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'BKJ User',
            email: sessionUser.email || '',
            role,
            title: role === 'employer' ? 'Employer Profile' : 'Job Seeker Profile',
            location: 'Pakistan',
            phone,
            avatar: getTransformedAvatarUrl(sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || null),
            joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          });
        }
      }
    };

    const checkSession = async () => {
      const startTime = Date.now();
      try {
        // Wrap initial session get in a 3.5s timeout for fast startup
        const { data: sessionData } = await withTimeout(
          supabase.auth.getSession(),
          3500,
          'Session get timed out'
        );
        if (sessionData?.session) {
          await fetchUserProfile(sessionData.session.user.id, sessionData.session.user);
        }
      } catch (err) {
        console.error('Session check error or timeout:', err);
      } finally {
        isInitialLoadRef.current = false; // Mark initial check as completed to allow subsequent onAuthStateChange SIGNED_IN events
        const elapsedTime = Date.now() - startTime;
        const minimumDelay = 10000; // 10 seconds
        const remainingDelay = Math.max(0, minimumDelay - elapsedTime);

        setTimeout(() => {
          setLoading(false);
        }, remainingDelay);
      }
    };

    const requestNotificationPermissions = async () => {
      if (!Notifications) return;
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('⚠️ [NOTIFICATIONS] Device permission denied.');
        } else {
          console.log('✅ [NOTIFICATIONS] Device permission granted.');
        }
      } catch (err) {
        console.warn('⚠️ [NOTIFICATIONS] Failed to check permissions:', err);
      }
    };

    checkSession();
    fetchJobs();
    requestNotificationPermissions();

    // Pure event-driven Auth listener (ignores INITIAL_SESSION and background TOKEN_REFRESHED to prevent infinite startup loading loops and sudden mid-app splash screen flashes!)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔑 Auth State Event Triggered: ${event}`);
      if (event === 'SIGNED_IN' && session) {
        // Prevent duplicate profile fetches during initial startup
        if (isInitialLoadRef.current) {
          console.log('ℹ️ Skipping duplicate profile fetch on SIGNED_IN event during app launch.');
          return;
        }
        setLoading(true);
        await fetchUserProfile(session.user.id, session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => authListener?.subscription?.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Reliable Polling for Notifications (Clock-Agnostic) ────────────────────
  useEffect(() => {
    if (!user || isMockMode) return;

    let isFirstFetch = true;

    const checkNewLikes = async () => {
      try {
        const { data, error } = await supabase
          .from('likes')
          .select(`
            id, created_at, user_id, job_id,
            profiles:user_id ( id, name, avatar_url, title, location, phone, email ),
            jobs ( title )
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.warn('❌ [POLLING DEBUG] Supabase Error fetching likes:', error.message);
          return;
        }

        if (!data) {
          console.log('ℹ️ [POLLING DEBUG] No data returned from likes table.');
          return;
        }

        if (isFirstFetch) {
          console.log('🏁 [POLLING DEBUG] First fetch baseline. Found', data.length, 'likes.');

          // Time travel check: Find likes that happened in the last 60 seconds while app was closed!
          const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();

          data.forEach(like => {
            // If it's an old like, or a self-like, suppress it forever.
            if (like.created_at < sixtySecondsAgo || like.user_id === user.id) {
              seenLikeIdsRef.current.add(like.id);
              console.log('   - Suppressed Old/Self Like ID:', like.id);
            } else {
              // Leave it UN-memorized so the exact next poll catches it and shows the missed popup!
              console.log('   - Kept Recent Like to trigger Missed Popup! ID:', like.id);
            }
          });

          isFirstFetch = false;
          return;
        }

        // On subsequent runs
        for (const like of data) {
          if (!seenLikeIdsRef.current.has(like.id)) {
            console.log('🚨 [POLLING DEBUG] BRAND NEW LIKE DETECTED! ID:', like.id);
            seenLikeIdsRef.current.add(like.id); // Memorize so it doesn't pop twice

            if (like.user_id !== user.id) {
              // Anti-spam protection check: prevent spamming popups for like/unlike abuse (60 seconds cooldown)
              const spamKey = `${like.user_id}_${like.job_id}`;
              const lastShown = lastNotificationTimesRef.current.get(spamKey) || 0;
              const now = Date.now();
              if (now - lastShown < 60000) { // 60 seconds cooldown
                console.log(`[POLLING DEBUG] Suppressed spam notification for user ${like.user_id} on job ${like.job_id} (cooldown active).`);
                continue;
              }
              // Update last notification time
              lastNotificationTimesRef.current.set(spamKey, now);

              console.log('✅ [POLLING DEBUG] Like is from another user! Triggering popup...');
              const p = like.profiles || {};
              const likerName = p.name || 'Someone';
              const jobTitle = like.jobs?.title || 'your post';

              const profileData = {
                id: p.id || like.user_id,
                name: likerName,
                title: p.title || 'Job Seeker',
                location: p.location || 'Not specified',
                phone: p.phone || 'No phone provided',
                email: p.email || 'candidate@gmail.com',
                avatar: p.avatar_url || null
              };

              console.log('🚀 [POLLING DEBUG] Calling addNotification for:', likerName);
              addNotification(
                `${likerName} liked your job`,
                `${likerName} just showed interest in "${jobTitle}"!`,
                'like',
                profileData
              );

              // Trigger native device local notification
              triggerLocalNotification(
                `${likerName} liked your post`,
                `"${likerName}" showed interest in your listing "${jobTitle}".`
              );
            } else {
              console.log('⚠️ [POLLING DEBUG] Ignored like because it was self-liked by user:', user.id);
            }
          }
        }
      } catch (err) {
        console.warn('❌ [POLLING DEBUG] Exception in checkNewLikes:', err);
      }
    };

    // Populate baseline immediately
    console.log('🚀 [POLLING DEBUG] Starting notification polling interval for user:', user.id);
    checkNewLikes();

    // Poll every 3.5 seconds
    const interval = setInterval(checkNewLikes, 3500);
    return () => {
      console.log('🛑 [POLLING DEBUG] Stopping polling interval.');
      clearInterval(interval);
    };
  }, [user, isMockMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Polling for New Job Listings (New Posts) ───────────────────
  useEffect(() => {
    if (!user || isMockMode) return;

    let isFirstJobsFetch = true;
    let seenJobIds = new Set();

    const checkNewJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            company,
            posted_by,
            profiles:posted_by ( name )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.warn('❌ [JOBS POLLING] Supabase Error fetching jobs:', error.message);
          return;
        }

        if (!data) return;

        if (isFirstJobsFetch) {
          // Store all existing job IDs on first load so we don't spam notifications for existing jobs
          data.forEach(job => seenJobIds.add(job.id));
          isFirstJobsFetch = false;
          console.log('🏁 [JOBS POLLING] Established baseline with', seenJobIds.size, 'jobs.');
          return;
        }

        // On subsequent checks, look for brand new jobs
        for (const job of data) {
          if (!seenJobIds.has(job.id)) {
            seenJobIds.add(job.id); // Memorize it

            // Only notify if it was posted by someone else (not the current logged-in user)
            if (job.posted_by !== user.id) {
              const employerName = job.profiles?.name || job.company || 'Someone';
              console.log('🚨 [JOBS POLLING] New job detected! Title:', job.title);

              triggerLocalNotification(
                'New Job Opportunity! 🚀',
                `"${job.title}" has just been posted by ${employerName}. Tap to apply!`
              );
            }
          }
        }
      } catch (err) {
        console.warn('❌ [JOBS POLLING] Exception:', err);
      }
    };

    // Run first baseline check
    checkNewJobs();

    // Poll every 10 seconds
    const interval = setInterval(checkNewJobs, 10000);
    return () => clearInterval(interval);
  }, [user, isMockMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Realtime Job Status Notifications ───────────────────
  useEffect(() => {
    if (!user || isMockMode) return;

    const channel = supabase
      .channel('public:jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          console.log('Realtime job update payload:', payload);

          if (payload.eventType === 'DELETE') {
            setJobs(prevJobs => prevJobs.filter(j => j.id !== payload.old.id));
            return;
          }

          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            
            setJobs(prevJobs => {
              const existingJob = prevJobs.find(j => j.id === payload.new.id);
              if (!existingJob) return prevJobs; // Job not in our list

              // Check if status actually changed AND it belongs to the current user
              if (existingJob.status !== newStatus && payload.new.posted_by === user.id) {
                if (newStatus === 'approved') {
                  addNotification(
                    'Job Approved ✅',
                    `BKJ has approved your job post: "${payload.new.title}".`,
                    'system',
                    null,
                    payload.new.id
                  );
                } else if (newStatus === 'rejected') {
                  addNotification(
                    'Job Rejected ❌',
                    `Your job post "${payload.new.title}" was rejected.`,
                    'system',
                    null,
                    payload.new.id
                  );
                }
              }

              // Update the job and unshift it to the top so recent updates take precedence
              const updatedJob = { 
                ...existingJob, 
                ...payload.new, 
                is_top: payload.new.is_top,
                top_updated_at: payload.new.top_updated_at ? new Date(payload.new.top_updated_at).getTime() : 0
              };
              const filteredJobs = prevJobs.filter(j => j.id !== payload.new.id);
              filteredJobs.unshift(updatedJob);
              
              return filteredJobs.sort((a, b) => {
                if (a.is_top && b.is_top) {
                  return (b.top_updated_at || b.createdAtTimestamp) - (a.top_updated_at || a.createdAtTimestamp);
                }
                if (a.is_top === b.is_top) return 0;
                return a.is_top ? -1 : 1;
              });
            });
          }
        }
      )
      .subscribe();

    // ─── Realtime Profile/Ban Status ───────────────────
    const profileChannel = supabase
      .channel('public:profiles_ban')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          console.log('Realtime profile update payload:', payload);
          if (payload.new.is_banned !== undefined) {
            setUser(prevUser => ({
              ...prevUser,
              isBanned: payload.new.is_banned,
              banReason: payload.new.ban_reason
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(profileChannel);
    };
  }, [user, isMockMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const rankJobs = (jobList, prefs = categoryPreferences) => {
    return [...jobList].sort((a, b) => {
      const scoreA = prefs[a.category] || 0;
      const scoreB = prefs[b.category] || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      const timeA = a.createdAtTimestamp || 0;
      const timeB = b.createdAtTimestamp || 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      const likesA = a.likes || 0;
      const likesB = b.likes || 0;
      return likesB - likesA;
    });
  };

  const trackCategoryView = async (category) => {
    if (!category || category === 'All') return;
    try {
      const prefs = { ...categoryPreferences };
      prefs[category] = (prefs[category] || 0) + 1;
      setCategoryPreferences(prefs);
      await AsyncStorage.setItem('@bkj_category_preferences', JSON.stringify(prefs));
      setJobs(prevJobs => rankJobs(prevJobs, prefs));
    } catch (e) {
      console.warn('Failed to track category view:', e);
    }
  };

  const triggerNotification = (title, message, type = 'system', likerProfile = null) => {
    setNotification(null);
    setTimeout(() => {
      setNotification({ title, message, type, likerProfile });
      setTimeout(() => setNotification(null), 3500);
    }, 50);
  };
  // ─── Fetch Jobs ────────────────────────────────────────────────────────────
  const fetchJobs = async () => {
    if (isMockMode) {
      const mapped = INITIAL_JOBS.map(job => {
        let ageDays = 2;
        if (job.id === 'j2') ageDays = 5;
        if (job.id === 'j3') ageDays = 7;
        const mockUser = INITIAL_USERS.find(u => u.id === job.postedBy) || INITIAL_USERS[0];
        return {
          ...job,
          createdAtTimestamp: Date.now() - ageDays * 24 * 60 * 60 * 1000,
          posterProfile: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            title: mockUser.title,
            location: mockUser.location,
            phone: mockUser.phone,
          }
        };
      });
      const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
      const activeJobs = mapped.filter(job => job.createdAtTimestamp >= fifteenDaysAgo);
      setJobs(rankJobs(activeJobs));
      return;
    }
    try {
      let dbResponse;
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            profiles:posted_by (
              id,
              name,
              email,
              title,
              location,
              phone,
              avatar_url
            )
          `);
        if (error) throw error;
        dbResponse = data;
      } catch (initialErr) {
        console.log('ℹ️ profiles.phone column might be missing. Retrying query without phone column...');
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            profiles:posted_by (
              id,
              name,
              email,
              title,
              location,
              avatar_url
            )
          `);
        if (error) throw error;
        dbResponse = data;
      }

      const data = dbResponse || [];

      // Query database likes count for Supabase mode to ensure real-time consistency across accounts
      let dbLikesList = [];
      if (!isMockMode) {
        try {
          const { data: lData, error: lErr } = await supabase
            .from('likes')
            .select('job_id');
          if (!lErr && lData) {
            dbLikesList = lData;
          }
        } catch (e) {
          console.warn('Failed to fetch global likes count:', e);
        }
      }

      // Query real applicant counts from the `applications` table (one row = one applicant)
      let dbApplicationCounts = {};
      if (!isMockMode) {
        try {
          const { data: appCountData, error: appCountErr } = await supabase
            .from('applications')
            .select('job_id');
          if (!appCountErr && appCountData) {
            appCountData.forEach(app => {
              dbApplicationCounts[app.job_id] = (dbApplicationCounts[app.job_id] || 0) + 1;
            });
            console.log(`✅ [APPLICANTS] Loaded counts for ${Object.keys(dbApplicationCounts).length} jobs from DB.`);
          }
        } catch (e) {
          console.warn('Failed to fetch application counts:', e);
        }
      }

      const savedLocal = await AsyncStorage.getItem('@bkj_global_notifications');
      const localNotifs = savedLocal ? JSON.parse(savedLocal) : [];

      // De-duplicate local notifications to count only unique likes strictly, falling back to profile ID/name/notif ID if likerId is missing
      const uniqueLocalNotifs = [];
      const seenLocal = new Set();
      for (const n of localNotifs) {
        const likerKey = n.likerId || n.likerProfile?.id || n.likerProfile?.name || n.id;
        const key = `${likerKey}_${n.job_id || n.message}`;
        if (!seenLocal.has(key)) {
          seenLocal.add(key);
          uniqueLocalNotifs.push(n);
        }
      }

      // Check which jobs the user has applied to
      const appliedIds = appliedJobs.map(item => typeof item === 'object' ? item.jobId : item);

      const mapped = data.map((job) => {
        let likesCount = job.likes || 0;
        if (!isMockMode) {
          // Count exact rows matching this job in likes table for complete multi-device/multi-account real-time accuracy!
          likesCount = dbLikesList.filter(l => l.job_id === job.id).length;
        } else {
          // Mock mode local fallback
          const activeJobLikes = uniqueLocalNotifs.filter(n =>
            n.type === 'like' &&
            (n.job_id === job.id || (job.title && n.message?.toLowerCase().includes(job.title.toLowerCase())))
          ).length;
          likesCount = Math.max(job.likes || 0, activeJobLikes);
        }

        const p = job.profiles || {};
        let dbLocation = p.location || job.location || 'Pakistan';
        let employerPhone = p.phone || '';
        let employerName = p.name || 'Anonymous Employer';
        let employerEmail = p.email || 'employer@joblink.com';
        let employerTitle = p.title || 'HR Manager';

        if (dbLocation && dbLocation.includes('|phone:')) {
          const parts = dbLocation.split('|phone:');
          dbLocation = parts[0] || 'Pakistan';
          employerPhone = parts[1] || '';
        }

        // Mock Users fallback logic for pre-existing system jobs
        if (!employerPhone || employerName === 'Anonymous Employer') {
          const mockU = INITIAL_USERS.find(u => u.id === (p.id || job.posted_by));
          if (mockU) {
            employerPhone = mockU.phone || employerPhone;
            employerName = mockU.name || employerName;
            employerEmail = mockU.email || employerEmail;
            employerTitle = mockU.title || employerTitle;
            dbLocation = mockU.location || dbLocation;
          }
        }

        return {
          id: job.id,
          title: job.title,
          status: job.status,
          is_top: job.is_top || false,
          top_updated_at: job.top_updated_at ? new Date(job.top_updated_at).getTime() : 0,
          company: employerName || job.company || 'Anonymous Employer',
          location: job.location,
          salary: job.salary,
          type: job.type,
          category: job.category,
          description: job.description,
          requirements: job.requirements || [],
          postedBy: job.posted_by,
          posterProfile: job.posted_by ? {
            id: p.id || job.posted_by,
            name: employerName,
            email: employerEmail,
            title: employerTitle,
            location: dbLocation,
            phone: employerPhone,
            avatar: getTransformedAvatarUrl(p.avatar_url || null),
          } : null,
          postedAt: formatTimeAgo(job.created_at),
          likes: likesCount,
          createdAtTimestamp: job.created_at ? new Date(job.created_at).getTime() : Date.now(),
          applicants: !isMockMode && dbApplicationCounts[job.id] !== undefined
            ? dbApplicationCounts[job.id]
            : (appliedIds.includes(job.id) ? (job.applicants_count || 0) + 1 : (job.applicants_count || 0)),
          appliedByUser: appliedIds.includes(job.id),
        };
      });
      const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
      const activeJobs = mapped.filter(job => {
        if (job.status === 'deleted') return false;
        const isRecent = job.createdAtTimestamp >= fifteenDaysAgo;
        const isApproved = job.status === 'approved';
        const noStatus = !job.status; // Fallback if SQL column not added yet
        const isMine = user && job.postedBy === user.id;
        return isRecent && (isApproved || noStatus || isMine);
      });
      const ranked = rankJobs(activeJobs);
      const sortedByTop = ranked.sort((a, b) => {
        if (a.is_top && b.is_top) {
          return (b.top_updated_at || b.createdAtTimestamp) - (a.top_updated_at || a.createdAtTimestamp);
        }
        if (a.is_top === b.is_top) return 0;
        return a.is_top ? -1 : 1;
      });
      setJobs(sortedByTop);
      // Prefetch all avatars to disk cache to ensure instant rendering
      mapped.forEach((job) => {
        if (job.posterProfile?.avatar) {
          Image.prefetch(job.posterProfile.avatar).catch(() => { });
        }
      });
      await fetchRealNotifications();
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
    }
  };

  // ─── Like Job ──────────────────────────────────────────────────────────────
  const likeJob = async (jobId) => {
    // Check if the user is currently spam-blocked
    const now = Date.now();
    if (now < spamBlockUntil) {
      setSpamModalVisible(true);
      return;
    }

    // Clicker-side anti-spam check: max 5 clicks per 10 seconds
    const clickHistory = lastLikeClickTimesRef.current.get(jobId) || [];
    const recentClicks = [...clickHistory, now].filter(t => now - t < 10000); // Keep last 10s clicks
    lastLikeClickTimesRef.current.set(jobId, recentClicks);

    if (recentClicks.length > 5) {
      const blockDuration = 600000; // 10 minutes in milliseconds
      const blockEnd = now + blockDuration;
      setSpamBlockUntil(blockEnd);
      await AsyncStorage.setItem('@bkj_spam_block_until', String(blockEnd));
      setSpamModalVisible(true);
      return;
    }

    let jobTitle = '';
    const isCurrentlyLiked = likedJobs.includes(jobId);
    let newLikedJobs;
    if (isCurrentlyLiked) {
      newLikedJobs = likedJobs.filter(id => id !== jobId);
    } else {
      newLikedJobs = [...likedJobs, jobId];
    }
    setLikedJobs(newLikedJobs);
    const key = user ? `@bkj_liked_jobs_${user.id}` : '@bkj_liked_jobs_guest';
    await AsyncStorage.setItem(key, JSON.stringify(newLikedJobs));

    // Update shared local notification feed for cross-user tests
    const jobToUpdate = jobs.find(j => j.id === jobId);
    console.log('📝 [DEBUG likeJob] Liking Job ID:', jobId);
    console.log('📝 [DEBUG likeJob] Current Logged-in User:', user ? { id: user.id, name: user.name } : 'NULL');
    if (jobToUpdate) {
      console.log('📝 [DEBUG likeJob] Job found:', {
        title: jobToUpdate.title,
        postedBy: jobToUpdate.postedBy,
        posted_by: jobToUpdate.posted_by
      });
      const targetOwner = jobToUpdate.postedBy || jobToUpdate.posted_by;

      if (user && targetOwner !== user.id) {
        if (isCurrentlyLiked) {
          console.log(`📝 [DEBUG likeJob] Removing local bookmark notification for owner: ${targetOwner}`);
          await removeSharedLocalNotification(targetOwner, user.id, jobId, jobTitle || jobToUpdate.title);
        } else {
          console.log(`📝 [DEBUG likeJob] Adding local bookmark notification for owner: ${targetOwner}`);
          await addSharedLocalNotification(targetOwner, user, jobTitle || jobToUpdate.title, jobId);
        }
      }
    } else {
      console.warn('📝 [DEBUG likeJob] WARNING: Job not found in global jobs state list! Jobs in state count:', jobs.length);
    }

    setJobs(prevJobs => {
      const updated = prevJobs.map(job => {
        if (job.id === jobId) {
          jobTitle = job.title;
          const currentLikes = job.likes || 0;
          return {
            ...job,
            likes: Math.max(0, currentLikes + (isCurrentlyLiked ? -1 : 1))
          };
        }
        return job;
      });
      return rankJobs(updated);
    });

    const toastTitle = isCurrentlyLiked ? 'Removed from Likes' : 'Job Liked! ❤️';
    const toastMsg = isCurrentlyLiked
      ? `"${jobTitle}" has been removed from your favorites.`
      : `"${jobTitle}" added to your bookmarks and ranked higher!`;
    triggerNotification(toastTitle, toastMsg);

    // NOTE: Do NOT call addNotification() here — fetchRealNotifications() at the
    // end of this function will load the notification from AsyncStorage/DB,
    // preventing the duplicate that was showing before.

    if (!isMockMode && user) {
      try {
        const jobToUpdate = jobs.find(j => j.id === jobId);
        if (jobToUpdate) {
          const currentLikes = jobToUpdate.likes || 0;
          const newLikesCount = Math.max(0, currentLikes + (isCurrentlyLiked ? -1 : 1));

          supabase
            .from('jobs')
            .update({ likes_count: newLikesCount })
            .eq('id', jobId)
            .then(({ error }) => {
              if (error) {
                console.warn('Supabase likes update failed (falling back to local):', error.message);
              }
            });

          if (isCurrentlyLiked) {
            supabase
              .from('likes')
              .delete()
              .eq('job_id', jobId)
              .eq('user_id', user.id)
              .then(({ error }) => {
                if (error) {
                  console.log('ℹ️ Supabase likes delete relation offline/not-created:', error.message);
                }
              });
          } else {
            supabase
              .from('likes')
              .insert({
                job_id: jobId,
                user_id: user.id,
                owner_id: jobToUpdate.postedBy || jobToUpdate.posted_by,
                created_at: new Date().toISOString()
              })
              .then(({ error }) => {
                if (error) {
                  console.log('ℹ️ Supabase likes insert relation offline/not-created:', error.message);
                }
              });
          }
        }
      } catch (err) {
        console.log('ℹ️ Network exception during like sync:', err.message);
      }
    }

    // Auto-refresh user notifications state in real-time instantly so it shows in the UI drawer/modal
    await fetchRealNotifications();
  };

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoggingIn(true);
    try {
      if (isMockMode) {
        // Premium transition delay to show loading splash screen
        await new Promise((res) => setTimeout(res, 1500));
        let loggedInUser;
        if (!email) { loggedInUser = users[0]; }
        else {
          const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          if (found) { loggedInUser = found; }
          else {
            const isEmployer = ['employer', 'hr', 'leandro'].some((k) =>
              email.toLowerCase().includes(k)
            );
            loggedInUser = {
              id: String(Date.now()),
              name: email.split('@')[0],
              email,
              password: password || '123456',
              role: isEmployer ? 'employer' : 'jobseeker',
              title: isEmployer ? 'Employer Profile' : 'Job Seeker Profile',
              location: 'Pakistan',
              phone: isEmployer ? '+92 300 1234567' : '+92 333 9876543',
              avatar: null,
            };
            setUsers((prev) => [...prev, loggedInUser]);
          }
        }
        setUser(loggedInUser);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
        return { success: true };
      }
      try {
        const { data: signInData, error: signInError } = await retryAsync(async () => {
          const res = await supabase.auth.signInWithPassword({ email, password });
          if (res.error) {
            const errMsg = res.error.message?.toLowerCase() || '';
            if (errMsg.includes('network') || errMsg.includes('timeout') || errMsg.includes('fetch') || res.error.status === 0) {
              throw res.error;
            }
          }
          return res;
        });
        if (signInError) throw signInError;

        const userId = signInData?.user?.id;
        if (userId) {
          // Query profiles table to make sure the user profile actually exists in the database
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

          if (profileError) throw profileError;

          if (!profile) {
            // Recreate the profile row automatically so the user is never locked out!
            console.log("Auto-recreating deleted profile row in database for user:", userId);
            const userPhone = signInData?.user?.user_metadata?.phone || '';
            const userLocation = userPhone ? `Pakistan|phone:${userPhone}` : 'Pakistan';
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: userId,
                  name: signInData?.user?.user_metadata?.name || email.split('@')[0],
                  email: email,
                  role: signInData?.user?.user_metadata?.role || 'jobseeker',
                  phone: userPhone || null,
                  location: userLocation,
                }
              ]);
            if (insertError) {
              console.error("Failed to auto-recreate profile row:", insertError);
              await supabase.auth.signOut();
              return { success: false, message: 'Account not found. Please create an account.' };
            }
            console.log("Successfully auto-recreated deleted profile row for user:", userId);
          }
        }
        return { success: true };
      } catch (err) {
        return handleError(err);
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // ─── Google Login ──────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    setLoggingIn(true);
    try {
      if (isMockMode) {
        // Premium transition delay to show loading splash screen
        await new Promise((res) => setTimeout(res, 1500));
        setUser(users[0]);
        return { success: true };
      }
      try {
        console.log('[Google Auth] Environment Debug:', {
          appOwnership: Constants.appOwnership,
          executionEnvironment: Constants.executionEnvironment,
          expoConfig: Constants.expoConfig ? { name: Constants.expoConfig.name, slug: Constants.expoConfig.slug, scheme: Constants.expoConfig.scheme } : null
        });

        const isExpoGo = Constants.executionEnvironment === 'storeClient' || Constants.executionEnvironment === 'store-client' || Constants.appOwnership === 'expo';
        // Dynamically resolve scheme from app config, falling back to 'bkj'
        const configScheme = Constants.expoConfig?.scheme || 'bkj';
        const configSlug = Constants.expoConfig?.slug || 'bkj';

        const redirectTo = isExpoGo
          ? `https://auth.expo.io/@zainsh-26/${configSlug}`
          : `${configScheme}://redirect`;

        console.log('[Google Auth] Initiating OAuth with Redirect URL:', redirectTo);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) {
          console.error('Google OAuth error:', error);
          return { success: false, message: error.message || 'Google sign-in failed' };
        }
        console.log('[Google Auth] Supabase OAuth URL:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success') {
          console.log('[Google Auth] Redirect URL received:', result.url);

          // Robust regex extraction for tokens (handles both '#' and '?' formats seamlessly)
          const accessTokenMatch = result.url.match(/[#?&]access_token=([^&]+)/);
          const refreshTokenMatch = result.url.match(/[#?&]refresh_token=([^&]+)/);

          const access_token = accessTokenMatch ? accessTokenMatch[1] : null;
          const refresh_token = refreshTokenMatch ? refreshTokenMatch[1] : null;

          console.log('[Google Auth] Extracted access_token:', access_token ? 'SUCCESS' : 'NOT FOUND');

          if (access_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
            return { success: true };
          } else {
            return { success: false, message: 'OAuth tokens not found in the redirect URL.' };
          }
        }
        return { success: false, message: 'Google sign-in was cancelled.' };
      } catch (err) {
        console.error('Google OAuth exception:', err);
        return { success: false, message: 'Unable to connect to Google. Please try again.' };
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // ─── Signup ────────────────────────────────────────────────────────────────
  const signup = async (name, email, password, role, phone = '') => {
    setSigningUp(true);
    try {
      if (isMockMode) {
        // Premium transition delay to show loading splash screen
        await new Promise((res) => setTimeout(res, 1500));
        const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return { success: false, message: 'Email already registered' };
        return { success: true };
      }
      try {
        const { error } = await retryAsync(async () => {
          const res = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role, phone } },
          });
          if (res.error) {
            const errMsg = res.error.message?.toLowerCase() || '';
            if (errMsg.includes('network') || errMsg.includes('timeout') || errMsg.includes('fetch') || res.error.status === 0) {
              throw res.error;
            }
          }
          return res;
        });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        return handleError(err);
      }
    } finally {
      setSigningUp(false);
    }
  };

  // ─── Verify Email OTP ──────────────────────────────────────────────────────
  const verifyEmailOtp = async (email, token, signupDetails = null) => {
    try {
      if (isMockMode) {
        if (signupDetails) {
          const newUser = {
            id: String(Date.now()),
            name: signupDetails.name,
            email: signupDetails.email.toLowerCase(),
            password: signupDetails.password,
            role: signupDetails.role,
            phone: signupDetails.phone,
            title: signupDetails.role === 'employer' ? 'Employer' : 'Job Seeker',
            location: 'Pakistan',
            avatar: null,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          };
          setUsers((prev) => [...prev, newUser]);
          setUser(newUser);
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        }
        return { success: true };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      if (error) throw error;

      // Fetch user profile to ensure state is hydrated properly
      if (data?.user) {
        // Fetch user profile (fetchUserProfile is defined in AuthProvider useEffect, but we can set session or trigger a reload)
        // Actually, supabase.auth.setSession will trigger onAuthStateChange, but we can also manually call fetchUserProfile if needed.
        // Wait, fetchUserProfile is inside the main useEffect. It is not directly accessible here. But since verifyOtp logs the user in,
        // supabase's auth listener will automatically fetch the user profile.
      }
      return { success: true, session: data.session };
    } catch (err) {
      return handleError(err);
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    setLoggingOut(true);
    setLikedJobs([]); // Clear active likes immediately so state does not leak during transitions
    setAppliedJobs([]); // Clear active applied jobs immediately too
    // Brief delay so the "Logging out..." splash is visible
    await new Promise((res) => setTimeout(res, 1800));
    setIsGuest(false);

    // Always clear local AsyncStorage session keys immediately so a refresh never restores the session
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(
        (key) =>
          key === SESSION_KEY ||
          key.startsWith('sb-') ||
          key.includes('supabase')
      );
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      console.log('✅ Local session storage cleared successfully on logout.');
    } catch (storageErr) {
      console.warn('Failed to clear AsyncStorage keys on logout:', storageErr);
    }

    if (isMockMode) {
      setUser(null);
      setLoggingOut(false);
      return;
    }
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err.message);
      setUser(null);
    } finally {
      setLoggingOut(false);
    }
  };

  // ─── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (isMockMode) {
      setUser((prev) => {
        const newUser = { ...prev, ...updates };
        AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser)).catch(err => {
          console.warn('Failed to save mock user profile:', err);
        });

        // Also update in the global mock users array
        setUsers((prevUsers) =>
          prevUsers.map(u => u.id === prev.id ? { ...u, ...updates } : u)
        );

        // Update local jobs posted by this user instantly
        setJobs((prevJobs) =>
          prevJobs.map(j => {
            if (j.postedBy === prev.id) {
              return {
                ...j,
                company: updates.name || j.company,
                posterProfile: {
                  ...j.posterProfile,
                  ...updates,
                  name: updates.name || j.posterProfile?.name,
                  avatar: updates.avatar || j.posterProfile?.avatar,
                }
              };
            }
            return j;
          })
        );

        return newUser;
      });
      return { success: true };
    }
    const withTimeout = async (promise, ms) => {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Operation timed out.')), ms);
      });
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    };

    try {
      console.log('🧩 [PROFILE] updateProfile start', { updates });

      // 1. Skip auth metadata phone update here in React Native because
      //    Supabase auth.updateUser can hang on some mobile environments.
      //    Phone is saved in the profile record below instead.
      if (updates.phone !== undefined) {
        console.log('🧩 [PROFILE] skipping auth.updateUser for phone');
      }

      // 2. Avatar upload
      let avatarUrl = undefined;
      let previewUrl = undefined;

      if (updates.avatar !== undefined) {
        const uri = updates.avatar;
        console.log('🧩 [PROFILE] avatar uri', uri);

        const decodeBase64ToArrayBuffer = (base64Str) => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          const lookup = new Uint8Array(256);
          for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

          let b64 = base64Str;
          if (b64.includes(',')) {
            b64 = b64.split(',')[1];
          }

          let bufferLength = b64.length * 0.75;
          if (b64[b64.length - 1] === '=') bufferLength--;
          if (b64[b64.length - 2] === '=') bufferLength--;

          const arraybuffer = new ArrayBuffer(bufferLength);
          const bytes = new Uint8Array(arraybuffer);

          let p = 0;
          for (let i = 0; i < b64.length; i += 4) {
            let encoded1 = lookup[b64.charCodeAt(i)];
            let encoded2 = lookup[b64.charCodeAt(i + 1)];
            let encoded3 = lookup[b64.charCodeAt(i + 2)];
            let encoded4 = lookup[b64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
          }
          return arraybuffer;
        };

        const uploadAvatar = async (fileName, fileData, mimeType) => {
          console.log('🧩 [PROFILE] uploadAvatar uploading data...');
          const result = await withTimeout(
            supabase.storage
              .from('avatars')
              .upload(fileName, fileData, {
                contentType: mimeType || 'image/jpeg',
                upsert: true,
              }),
            20000
          );
          console.log('🧩 [PROFILE] uploadResult', result);
          return result;
        };

        if (uri && (uri.startsWith('data:image') || uri.startsWith('file://') || uri.startsWith('content://'))) {
          try {
            // Detect actual image format from the URI
            const metadata = getImageMetadata(uri);
            let { extension, mimeType } = metadata;
            console.log('🧩 [PROFILE] Detected image format:', { extension, mimeType });

            // Normalize unsupported formats to JPEG
            const SUPPORTED = ['image/jpeg', 'image/png'];
            if (!SUPPORTED.includes(mimeType)) {
              console.log('🧩 [PROFILE] Unsupported format, falling back to JPEG');
              extension = 'jpg';
              mimeType = 'image/jpeg';
            }

            let fileDataToUpload;

            if (uri.startsWith('data:image')) {
              console.log('🧩 [PROFILE] Decoding Base64 directly to ArrayBuffer...');
              fileDataToUpload = decodeBase64ToArrayBuffer(uri);
              console.log(`🧩 [PROFILE] ArrayBuffer created: ${fileDataToUpload.byteLength} bytes`);
            } else {
              console.log('🧩 [PROFILE] Local URI detected. Reading file as Base64 using expo-file-system...');
              try {
                const base64Str = await FileSystem.readAsStringAsync(uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                fileDataToUpload = decodeBase64ToArrayBuffer(base64Str);
                console.log(`🧩 [PROFILE] ArrayBuffer created via FileSystem: ${fileDataToUpload.byteLength} bytes`);
              } catch (fsErr) {
                console.warn('❌ [STORAGE] FileSystem read error:', fsErr);
                throw fsErr;
              }
            }

            if (!fileDataToUpload || (fileDataToUpload.size && fileDataToUpload.size < 100) || (fileDataToUpload.byteLength && fileDataToUpload.byteLength < 100)) {
              console.warn('❌ [STORAGE] File data is empty or too small, aborting upload.');
              return { success: false, message: 'Image file is empty or invalid.' };
            }

            const fileName = `avatar_${user.id}.${extension}`;
            console.log('🧩 [PROFILE] Uploading avatar data to Supabase Storage...');
            const { error: uploadError } = await uploadAvatar(fileName, fileDataToUpload, mimeType);

            if (uploadError) {
              console.warn('❌ [STORAGE] Upload error:', uploadError.message);
              return { success: false, message: 'Image upload failed.' };
            }

            // Use public URL only (no signed URL that would expire)
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            // Add a cache buster timestamp to ensure React Native fetches the fresh image
            const timestamp = new Date().getTime();
            avatarUrl = `${urlData.publicUrl}?t=${timestamp}`;
            previewUrl = avatarUrl;
            console.log('✅ [STORAGE] Public Avatar URL:', avatarUrl);
          } catch (uploadErr) {
            console.warn('❌ [STORAGE] Exception:', uploadErr?.message || uploadErr);
            return { success: false, message: 'Image upload failed.' };
          }
        } else if (uri && uri.startsWith('http')) {
          avatarUrl = uri;
          previewUrl = uri;
        }
      }

      // 3. Profile table update (Location is strictly auto-detected and cannot be manually modified)
      const rawLocation = userCountry || (user?.location ? user.location.split('|')[0] : 'Pakistan');
      const packedLocation = `${rawLocation}|phone:${updates.phone || ''}`;

      const normalizedName = updates.name ? updates.name.replace(/\s+/g, ' ').trim() : updates.name;

      const profileUpdates = {
        name: normalizedName,
        title: updates.title,
        location: packedLocation,
      };

      if (updates.phone !== undefined) {
        profileUpdates.phone = updates.phone;
      }

      if (avatarUrl !== undefined) {
        profileUpdates.avatar_url = avatarUrl;
      }

      console.log('📝 [PROFILE] Updating profiles table...');

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (error) throw error;

      console.log('✅ [PROFILE] Profile updated successfully!');

      // Asynchronously sync Supabase Auth metadata for name/phone in the background to ensure session stays fully aligned
      supabase.auth.updateUser({
        data: {
          name: normalizedName,
          phone: updates.phone
        }
      }).then(({ error: authErr }) => {
        if (authErr) {
          console.log('ℹ️ Background metadata sync info (safe to ignore):', authErr.message);
        } else {
          console.log('✅ Background auth user metadata synced successfully.');
        }
      }).catch(err => {
        console.log('ℹ️ Background metadata sync exception:', err);
      });

      setUser((prev) => ({
        ...prev,
        ...updates,
        name: normalizedName,
        avatar: previewUrl || (avatarUrl !== undefined ? avatarUrl : prev.avatar),
      }));

      // Refresh the jobs list to instantly reflect the new avatar on any jobs posted by the user
      await fetchJobs();

      return { success: true };

    } catch (err) {
      return handleError(err);
    }
  };
  // ─── Post Job ──────────────────────────────────────────────────────────────
  const postJob = async (jobData) => {
    if (isMockMode) {
      setJobs((prev) => [
        {
          id: 'j' + Date.now(),
          ...jobData,
          postedBy: user.id,
          postedAt: 'Just now',
          applicants: 0,
        },
        ...prev,
      ]);
      addNotification('Pending Approval ⏳', `Your job posting "${jobData.title}" has been submitted successfully. The BKJ Team will review and approve your post shortly.`, 'post');
      return { success: true };
    }
    try {
      let insertedJobId = null;
      const { error, data } = await retryAsync(async () => {
        const res = await supabase.from('jobs').insert([
          {
            title: jobData.title,
            company: jobData.company,
            location: jobData.location,
            salary: jobData.salary,
            type: jobData.type,
            category: jobData.category,
            description: jobData.description,
            requirements: jobData.requirements || [],
            posted_by: user.id,
          },
        ]).select();
        if (res.error) {
          const errMsg = res.error.message?.toLowerCase() || '';
          if (errMsg.includes('network') || errMsg.includes('timeout') || errMsg.includes('fetch') || res.error.status === 0) {
            throw res.error;
          }
        }
        return res;
      });
      if (error) throw error;
      
      if (data && data.length > 0) {
        insertedJobId = data[0].id;
      }
      
      addNotification(
        'Job Pending ⏳', 
        `Your job posting "${jobData.title}" has been submitted successfully and is pending approval.`, 
        'system', 
        null, 
        insertedJobId
      );
      await fetchJobs();
      return { success: true };
    } catch (err) {
      return handleError(err);
    }
  };

  // ─── Job Management ────────────────────────────────────────────────────────
  const deleteJob = async (jobId) => {
    if (isMockMode) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      addNotification('Job Deleted', 'Your job posting was deleted successfully.', 'system');
      return { success: true };
    }
    try {
      const { error } = await supabase.from('jobs').update({ status: 'deleted' }).eq('id', jobId);
      if (error) {
        // Fallback if update fails
        const { data, error: delErr } = await supabase.from('jobs').delete().eq('id', jobId).select();
        if (delErr) throw delErr;
        if (!data || data.length === 0) throw new Error('Permission denied.');
      }
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      addNotification('Job Deleted', 'Your job posting was deleted successfully.', 'system');
      return { success: true };
    } catch (err) {
      return handleError(err);
    }
  };

  const updateJob = async (jobId, updates) => {
    if (isMockMode) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...updates } : j)));
      return { success: true };
    }
    try {
      const { error } = await supabase.from('jobs').update(updates).eq('id', jobId);
      if (error) throw error;
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...updates } : j)));
      return { success: true };
    } catch (err) {
      return handleError(err);
    }
  };

  const closeHiring = async (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found' };

    // We prepend [CLOSED] to the title as a safe fallback since we aren't sure if a status column exists.
    const newTitle = job.title.startsWith('[CLOSED]') ? job.title : `[CLOSED] ${job.title}`;
    const res = await updateJob(jobId, { title: newTitle });
    if (res.success) {
      addNotification('Hiring Closed', `Hiring for "${job.title}" has been closed.`, 'system');
    }
    return res;
  };

  const getMyJobs = () => jobs.filter((j) => j.postedBy === user?.id);
  const getUserById = async (id) => {
    const local = users.find((u) => u.id === id) || INITIAL_USERS.find((u) => u.id === id);
    if (local) return local;

    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
            title: data.title || 'Job Seeker',
            avatar: getTransformedAvatarUrl(data.avatar_url || null),
          };
        }
      } catch (e) {
        console.warn('Failed to fetch user by id from Supabase:', e);
      }
    }
    return null;
  };

  const applyToJob = async (jobId) => {
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (!jobToUpdate) return;

    // Check if already applied to prevent duplicate count increment
    const alreadyApplied = appliedJobs.some(item => {
      const id = typeof item === 'object' ? item.jobId : item;
      return id === jobId;
    });
    if (alreadyApplied) return;

    // 1. Add to appliedJobs local list
    const newAppliedItem = { jobId, appliedAt: new Date().toISOString() };
    const newApplied = [...appliedJobs, newAppliedItem];
    setAppliedJobs(newApplied);
    const key = user ? `@bkj_applied_jobs_${user.id}` : '@bkj_applied_jobs_guest';
    await AsyncStorage.setItem(key, JSON.stringify(newApplied)).catch((e) => {
      console.warn('Failed to save applied jobs to AsyncStorage:', e);
    });

    // 2. Increment applicants count locally in state
    setJobs(prevJobs => {
      return prevJobs.map(j => {
        if (j.id === jobId) {
          return { ...j, applicants: (j.applicants || 0) + 1 };
        }
        return j;
      });
    });

    // 3. Update Database if not mock mode and user is logged in
    if (!isMockMode && user) {
      try {
        console.log(`📤 [APPLICATION] Saving: job_id=${jobId}, applicant_id=${user.id}`);

        // Insert into the real `applications` table (awaited for full error visibility)
        const { data: insertData, error: insertError } = await supabase
          .from('applications')
          .insert({
            job_id: jobId,
            applicant_id: user.id,
            created_at: new Date().toISOString()
          })
          .select();

        if (insertError) {
          console.error('❌ [APPLICATION] Insert FAILED:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
          });
        } else {
          console.log('✅ [APPLICATION] Saved to Supabase!', insertData);

          // Also bump applicants_count on the jobs table for consistency
          const newApplicantsCount = (jobToUpdate.applicants || 0) + 1;
          supabase
            .from('jobs')
            .update({ applicants_count: newApplicantsCount })
            .eq('id', jobId)
            .then(({ error }) => {
              if (error) console.warn('⚠️ [JOBS] applicants_count update failed:', error.message);
            });
        }
      } catch (err) {
        console.error('❌ [APPLICATION] Exception:', err.message);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jobs,
        loading,
        loggingOut,
        isGuest,
        setIsGuest,
        categoryPreferences,
        trackCategoryView,
        login,
        loginWithGoogle,
        signup,
        verifyEmailOtp,
        logout,
        updateProfile,
        postJob,
        deleteJob,
        updateJob,
        closeHiring,
        getMyJobs,
        getUserById,
        fetchJobs,
        likedJobs,
        likeJob,
        appliedJobs,
        applyToJob,
        notification,
        notifications,
        addNotification,
        clearNotifications,
        signingUp,
        loggingIn,
        fetchRealNotifications,
        userCountry,
      }}
    >
      {children}
      <SpamAlertGlobalModal
        visible={spamModalVisible}
        until={spamBlockUntil}
        onClose={() => setSpamModalVisible(false)}
      />
    </AuthContext.Provider>
  );
};

// Global Custom Spam Alert Modal styled according to app theme
function SpamAlertGlobalModal({ visible, until, onClose }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!visible || until <= Date.now()) return;

    const updateTimer = () => {
      const diff = until - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        onClose();
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeLeft(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [visible, until, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={spamStyles.modalOverlay}>
        <View style={spamStyles.spamCard}>
          <Ionicons name="time" size={54} color="#EF4444" style={spamStyles.spamIcon} />
          <Text style={spamStyles.spamTitle}>Account Restricted ⚠️</Text>
          <Text style={spamStyles.spamMessage}>
            You have liked and unliked too quickly. Your interest toggling has been locked temporarily to prevent network spamming.
          </Text>

          <View style={spamStyles.timerBadge}>
            <Text style={spamStyles.timerLabel}>Restriction remaining:</Text>
            <Text style={spamStyles.timerText}>{timeLeft || '10:00'}</Text>
          </View>

          <TouchableOpacity style={spamStyles.spamButton} onPress={onClose} activeOpacity={0.88}>
            <Text style={spamStyles.spamButtonText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const spamStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  spamCard: {
    backgroundColor: '#1E293B', // Premium dark slate card
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#334155', // Slate border
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
  spamIcon: {
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  spamTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  spamMessage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8', // Muted slate gray
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  timerBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 22,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  spamButton: {
    backgroundColor: '#E8F542', // Lime yellow matching app accent
    borderRadius: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#E8F542',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  spamButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A', // Dark slate text
  },
});

export const useAuth = () => useContext(AuthContext);
