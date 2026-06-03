import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';

const SESSION_KEY = '@jobify_user_session';

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
    title: 'Welcome to Jobify! ✨',
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
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  bmp:  'image/bmp',
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
  const [likedJobs, setLikedJobs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [signingUp, setSigningUp] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const isMockMode =
    !process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project-id') ||
    !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder');


 // ✅ NAYA - popup bhi trigger hoga, likerProfile bhi pass hoga
const addNotification = (title, message, type = 'system', likerProfile = null) => {
  const newNotif = {
    id: Math.random().toString(),
    title, message,
    time: 'Just now',
    type,
    likerProfile,
  };

  // Bell icon list mein add karo
  setNotifications(prev => [newNotif, ...prev]);

  // ✅ Popup toast trigger karo (yeh line missing thi!)
  setNotification(null); // pehle reset karo same notif ke liye
  setTimeout(() => {
    setNotification({ title, message, type, likerProfile });
    setTimeout(() => setNotification(null), 4000); // auto-dismiss
  }, 50);
};

  const clearNotifications = async () => {
    if (!user) return;
    try {
      setNotifications([]);
      const saved = await AsyncStorage.getItem('@jobify_global_notifications');
      if (saved) {
        let list = JSON.parse(saved);
        list = list.filter(n => n.owner_id !== user.id);
        await AsyncStorage.setItem('@jobify_global_notifications', JSON.stringify(list));
      }
      console.log('📝 [DEBUG clearNotifications] Notifications cleared successfully for user:', user.id);
    } catch (e) {
      console.warn('Failed to clear notifications:', e);
    }
  };

  const addSharedLocalNotification = async (ownerId, likerUser, jobTitle, jobId) => {
    try {
      const saved = await AsyncStorage.getItem('@jobify_global_notifications');
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
          email: likerUser.email || 'candidate@gmail.com'
        }
      };
      
      console.log('📝 [DEBUG addSharedLocalNotification] Appending local notif:', newNotif);
      list.unshift(newNotif);
      await AsyncStorage.setItem('@jobify_global_notifications', JSON.stringify(list));
      console.log('📝 [DEBUG addSharedLocalNotification] Successfully saved. Storage count is now:', list.length);
    } catch (e) {
      console.warn('Failed to save shared local notification:', e);
    }
  };

  const removeSharedLocalNotification = async (ownerId, likerId, jobId, jobTitle) => {
    try {
      const saved = await AsyncStorage.getItem('@jobify_global_notifications');
      if (saved) {
        let list = JSON.parse(saved);
        list = list.filter(n => !(n.owner_id === ownerId && n.likerId === likerId && (n.job_id === jobId || n.message.includes(jobTitle))));
        await AsyncStorage.setItem('@jobify_global_notifications', JSON.stringify(list));
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
      const savedLocal = await AsyncStorage.getItem('@jobify_global_notifications');
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
        
        localNotifs = uniqueLocal.map(n => {
          const isOwnLike = n.owner_id === n.likerId || n.likerId === user.id;
          return {
            ...n,
            title: isOwnLike ? `You saved your job! ❤️` : n.title,
            message: isOwnLike 
              ? (n.message.includes('"') 
                  ? `You saved your listing "${n.message.split('"')[1]}".` 
                  : `You saved your job listing.`)
              : n.message,
            time: formatTimeAgo(n.created_at)
          };
        });
        console.log(`📝 [DEBUG fetchRealNotifications] Filtered unique localNotifs matching owner_id:`, localNotifs.length);
      }

      if (isMockMode) {
        const welcomeNotif = {
          id: 'welcome',
          title: 'Welcome to Jobify! ✨',
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
          title: 'Welcome to Jobify! ✨',
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
        // Only show notifications from OTHER users who liked your jobs (not your own bookmarks)
        const otherLikes = data.filter(item => {
          const likerId = item.profiles?.id || item.user_id;
          return likerId !== user.id;
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
        
        // Filter out self-likes from local notifications too
        const filteredLocal = localNotifs.filter(n => n.likerId !== user.id);
        const mergedNotifs = [...dbNotifs, ...filteredLocal];
        
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
          title: 'Welcome to Jobify! ✨',
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
        const key = user ? `@jobify_liked_jobs_${user.id}` : '@jobify_liked_jobs_guest';
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
    loadUserLikedJobs();

    if (user !== null) {
      setIsGuest(false);
      fetchRealNotifications();
    }
  }, [user]);

  // ─── Session Init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMockMode) {
      console.warn('⚠️ Jobify running in MOCK MODE');
      setJobs(INITIAL_JOBS);
      // Restore persisted mock session
      const restoreMockSession = async () => {
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
          setLoading(false);
        }
      };
      restoreMockSession();
      return;
    }

    console.log('🚀 Jobify connecting to Supabase production backend!');

    // Helper to race a promise with a timeout
    const withTimeout = (promise, ms, timeoutErrorMsg) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutErrorMsg)), ms))
      ]);
    };

    const fetchUserProfile = async (userId, sessionUser = null) => {
      try {
        // Wrap Supabase profiles single row fetch in a 10s timeout
        const { data, error } = await withTimeout(
          supabase.from('profiles').select('*').eq('id', userId).single(),
          10000,
          'Profile query timed out'
        );
        
        if (error) {
          if (error.code === 'PGRST116') { // PGRST116 is "Row not found"
            if (sessionUser) {
              console.log("Auto-recreating missing profile row in database on app startup...");
              const role = sessionUser.user_metadata?.role || 'jobseeker';
              const googleAvatar = sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || null;
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: userId,
                    name: sessionUser.user_metadata?.name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'Jobify User',
                    email: sessionUser.email || '',
                    role: role,
                    avatar_url: googleAvatar,
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
        const name = data?.name || sessionUser?.user_metadata?.name || sessionUser?.user_metadata?.full_name || sessionUser?.email?.split('@')[0] || 'Jobify User';
        const email = data?.email || sessionUser?.email || '';
        const role = data?.role || sessionUser?.user_metadata?.role || 'jobseeker';
        
        let dbLocation = data?.location || 'Pakistan';
        let phone = data?.phone || sessionUser?.user_metadata?.phone || '';
        
        // Unpack phone from packed location format if present
        if (dbLocation && dbLocation.includes('|phone:')) {
          const parts = dbLocation.split('|phone:');
          dbLocation = parts[0] || 'Pakistan';
          phone = parts[1] || phone;
        }

        // If the phone number contains an '@' (due to browser autofill or Google meta mismatch), treat it as empty
        if (phone && phone.includes('@')) {
          phone = '';
        }

        // Auto-heal/sync missing phone packing for existing profiles in the background
        if (data && data.location && !data.location.includes('|phone:') && phone) {
          console.log("📝 Healing existing profile location database field with phone number package in background...");
          supabase
            .from('profiles')
            .update({ location: `${data.location}|phone:${phone}` })
            .eq('id', userId)
            .then(({ error: healErr }) => {
              if (healErr) console.warn("⚠️ Failed background profile healing:", healErr.message);
              else console.log("✅ Profile healed successfully in database.");
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
          avatar: data?.avatar_url || sessionUser?.user_metadata?.avatar_url || sessionUser?.user_metadata?.picture || null,
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
            name: sessionUser.user_metadata?.name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'Jobify User',
            email: sessionUser.email || '',
            role,
            title: role === 'employer' ? 'Employer Profile' : 'Job Seeker Profile',
            location: 'Pakistan',
            phone,
            avatar: sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture || null,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          });
        }
      }
    };

    const checkSession = async () => {
      const startTime = Date.now();
      try {
        // Wrap initial session get in a 10s timeout
        const { data: sessionData } = await withTimeout(
          supabase.auth.getSession(),
          10000,
          'Session get timed out'
        );
        if (sessionData?.session) {
          await fetchUserProfile(sessionData.session.user.id, sessionData.session.user);
        }
      } catch (err) {
        console.error('Session check error or timeout:', err);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const minimumDelay = 2500; // 2.5 seconds for a premium splash animation
        const remainingDelay = Math.max(0, minimumDelay - elapsedTime);

        setTimeout(() => {
          setLoading(false);
        }, remainingDelay);
      }
    };

    checkSession();
    fetchJobs();

    // Pure event-driven Auth listener (ignores INITIAL_SESSION and background TOKEN_REFRESHED to prevent infinite startup loading loops and sudden mid-app splash screen flashes!)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔑 Auth State Event Triggered: ${event}`);
      if (event === 'SIGNED_IN' && session) {
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
    let seenLikeIds = new Set();

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
              seenLikeIds.add(like.id);
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
          if (!seenLikeIds.has(like.id)) {
            console.log('🚨 [POLLING DEBUG] BRAND NEW LIKE DETECTED! ID:', like.id);
            seenLikeIds.add(like.id); // Memorize so it doesn't pop twice

            if (like.user_id !== user.id) {
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

  const rankJobs = (jobList) => {
    return [...jobList].sort((a, b) => {
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
      setJobs(rankJobs(mapped));
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

      const savedLocal = await AsyncStorage.getItem('@jobify_global_notifications');
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
          company: job.company,
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
            avatar: p.avatar_url || null,
          } : null,
          postedAt: formatTimeAgo(job.created_at),
          likes: likesCount,
          createdAtTimestamp: job.created_at ? new Date(job.created_at).getTime() : Date.now(),
          applicants: job.applicants_count || 0,
        };
      });
      setJobs(rankJobs(mapped));
      await fetchRealNotifications();
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
    }
  };

  // ─── Like Job ──────────────────────────────────────────────────────────────
  const likeJob = async (jobId) => {
    let jobTitle = '';
    const isCurrentlyLiked = likedJobs.includes(jobId);
    let newLikedJobs;
    if (isCurrentlyLiked) {
      newLikedJobs = likedJobs.filter(id => id !== jobId);
    } else {
      newLikedJobs = [...likedJobs, jobId];
    }
    setLikedJobs(newLikedJobs);
    const key = user ? `@jobify_liked_jobs_${user.id}` : '@jobify_liked_jobs_guest';
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
      
      if (user) {
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
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: userId,
                  name: signInData?.user?.user_metadata?.name || email.split('@')[0],
                  email: email,
                  role: signInData?.user?.user_metadata?.role || 'jobseeker',
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
        setUser(users[0]);
        return { success: true };
      }
      try {
        const isExpoGo = Constants.appOwnership === 'expo';
        const redirectTo = isExpoGo 
          ? 'https://auth.expo.io/@zainsh-26/jobify' 
          : AuthSession.makeRedirectUri({ scheme: 'jobify' });

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) {
          console.error('Google OAuth error:', error);
          return { success: false, message: error.message || 'Google sign-in failed' };
        }
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
        const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return { success: false, message: 'Email already registered' };
        const newUser = {
          id: String(Date.now()),
          name,
          email,
          password,
          role,
          phone,
          title: role === 'employer' ? 'Employer' : 'Job Seeker',
          location: 'Pakistan',
          avatar: null,
          joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
        setUsers((prev) => [...prev, newUser]);
        setUser(newUser);
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

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    setLoggingOut(true);
    setLikedJobs([]); // Clear active likes immediately so state does not leak during transitions
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
    setUser((prev) => ({ ...prev, ...updates }));
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

    // 3. Profile table update
    const packedLocation = updates.location
      ? `${updates.location}|phone:${updates.phone || ''}`
      : `Pakistan|phone:${updates.phone || ''}`;

    const profileUpdates = {
      name: updates.name,
      title: updates.title,
      location: packedLocation,
    };

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

    setUser((prev) => ({
      ...prev,
      ...updates,
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
      addNotification('Job Posted! 🚀', `Your job posting "${jobData.title}" is now live.`, 'post');
      return { success: true };
    }
    try {
      const { error } = await retryAsync(async () => {
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
        ]);
        if (res.error) {
          const errMsg = res.error.message?.toLowerCase() || '';
          if (errMsg.includes('network') || errMsg.includes('timeout') || errMsg.includes('fetch') || res.error.status === 0) {
            throw res.error;
          }
        }
        return res;
      });
      if (error) throw error;
      addNotification('Job Posted! 🚀', `Your job posting "${jobData.title}" is now live.`, 'post');
      await fetchJobs();
      return { success: true };
    } catch (err) {
      return handleError(err);
    }
  };

  const getMyJobs = () => jobs.filter((j) => j.postedBy === user?.id);
  const getUserById = (id) => users.find((u) => u.id === id) || INITIAL_USERS.find((u) => u.id === id);

  return (
    <AuthContext.Provider
      value={{
        user,
        jobs,
        loading,
        loggingOut,
        isGuest,
        setIsGuest,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateProfile,
        postJob,
        getMyJobs,
        getUserById,
        fetchJobs,
        likedJobs,
        likeJob,
        notification,
        notifications,
        addNotification,
        clearNotifications,
        signingUp,
        loggingIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
