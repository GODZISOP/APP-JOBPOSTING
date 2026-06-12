import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, TextInput, FlatList, Dimensions, Alert,
  Animated, Easing, Modal, Linking, RefreshControl, Share, Platform
} from 'react-native';
import { Image } from 'expo-image';

const blurhash = 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AdBanner from '../components/AdBanner';
import * as ExpoLinking from 'expo-linking';


const { width } = Dimensions.get('window');

const CATEGORIES = [
  'All',
  'Technology',
  'Design',
  'Marketing',
  'Finance',
  'Education',
  'Healthcare',
  'Engineering',
  'Sales',
  'Legal',
  'HR',
  'Media',
  'Hospitality',
  'Construction',
  'Logistics',
  'Customer Support',
  'Administration',
  'Accounting',
  'Real Estate',
  'Retail',
  'Manufacturing',
  'Agriculture',
  'Security',
  'Government',
  'Non-Profit',
  'Research',
  'Freelance',
  'Internship'
];

const CATEGORY_THEMES = {
  All: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', // Premium modern office overview
  },
  Technology: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80', // Modern developer coding screen
  },
  Design: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', // Premium Figma & tools flatlay
  },
  Marketing: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80', // Digital strategy and analytics graphs
  },
  Finance: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', // Stock charts & business workspace
  },
  Education: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80', // Study desk with books & learning environment
  },
  Healthcare: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80', // Stethoscope & clinical research workspace
  },
  Engineering: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80', // Architectural / mechanical blueprints & microchip
  },
  Sales: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80', // Business professional deal & handshake
  },
  Legal: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80', // Gavel & law library shelving
  },
  HR: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', // Collaborative recruiting interview
  },
  Media: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80', // Soundboard & studio microphone
  },
  Hospitality: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', // Premium hotel lobby & service
  },
  Construction: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80', // Safety helmet & engineering construction site
  },
  Logistics: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80', // Warehouse packages & barcode scanner
  },
  'Customer Support': {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=400&q=80', // Premium customer support headset & smile
  },
  Administration: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&q=80', // Modern leather organizer and office desk
  },
  Accounting: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80', // Balance sheet spreadsheet & calculator
  },
  'Real Estate': {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80', // Sleek contemporary home interior
  },
  Retail: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80', // Clean clothing displays in clothing boutique
  },
  Manufacturing: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1581091226825-5b65f2482bcb?w=400&q=80', // Automated industrial production line
  },
  Agriculture: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&q=80', // Sustainable indoor farming and hydroponics green plant shoots
  },
  Security: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80', // Cybersecurity shield visualizer
  },
  Government: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&q=80', // Columns of neoclassical capital building
  },
  'Non-Profit': {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80', // Supportive hands joined in collaboration
  },
  Research: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&q=80', // Scientific microscope & bioscience research lab
  },
  Freelance: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80', // Coffee shop digital nomad working with laptop
  },
  Internship: {
    bg: '#FFFFFF',
    img: 'https://images.unsplash.com/photo-1521737711867-e3b9047d7a86?w=400&q=80', // Intern group listening to corporate presentation
  },
};

const TYPE_COLORS = {
  'Full Time': { bg: '#E8F5E9', text: '#2E7D32' },
  'Part Time': { bg: '#FFF8E1', text: '#F57F17' },
  'Remote': { bg: '#E3F2FD', text: '#1565C0' },
  'Contract': { bg: '#F3E5F5', text: '#7B1FA2' },
  'Daily Basis': { bg: '#E0F7FA', text: '#00838F' },
};

function JobCard({ job, onPress, isLiked, onLike, t }) {
  const logoColors = ['#0D9488', '#2563EB', '#DC2626', '#D97706', '#7C3AED', '#DB2777', '#0891B2'];
  const logoIndex = job.company ? job.company.charCodeAt(0) % logoColors.length : 0;
  const logoBg = logoColors[logoIndex];

  // Dynamic tags
  const isUnder24Hours = job.createdAtTimestamp ? (Date.now() - job.createdAtTimestamp <= 24 * 60 * 60 * 1000) : false;
  const isHot = isUnder24Hours && (job.likes >= 10);
  const isPremium = job.likes >= 10;

  return (
    <TouchableOpacity
      style={[styles.cleanJobRow, isPremium && styles.premiumJobRow]}
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
              <Text style={[styles.jobRowSubtitle, { flexShrink: 1, marginBottom: 0, lineHeight: 16 }]} numberOfLines={1}>{job.company}</Text>
              <Ionicons name="checkmark-circle" size={13} color="#15803D" />
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
          <View style={[styles.metaBadge, { backgroundColor: '#E8F542', borderColor: '#C8D900', borderWidth: 1 }]}>
            <Ionicons name="sparkles" size={10} color="#1A1A1A" style={{ marginRight: 3 }} />
            <Text style={[styles.metaBadgeText, { color: '#1A1A1A', fontWeight: '800' }]}>{t ? t('jobs.featured') : 'Featured 👑'}</Text>
          </View>
        )}
        {isHot && (
          <View style={[styles.metaBadge, { backgroundColor: '#FFECEF', borderColor: '#FFCCD3', borderWidth: 1 }]}>
            <Ionicons name="flame" size={11} color="#EF4444" style={{ marginRight: 3 }} />
            <Text style={[styles.metaBadgeText, { color: '#EF4444', fontWeight: '800' }]}>{t ? t('jobs.hot') : 'Hot 🔥'}</Text>
          </View>
        )}
        <View style={styles.metaBadge}>
          <Ionicons name="briefcase-outline" size={11} color={COLORS.accentGreen} style={{ marginRight: 4 }} />
          <Text style={styles.metaBadgeText} numberOfLines={1} adjustsFontSizeToFit>{job.type}</Text>
        </View>
        <View style={styles.metaBadge}>
          <Ionicons name="location-outline" size={11} color="#6B7280" style={{ marginRight: 4 }} />
          <Text style={[styles.metaBadgeText, { color: '#6B7280' }]} numberOfLines={1} adjustsFontSizeToFit>{job.location}</Text>
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
                color={isLiked ? "#EF4444" : COLORS.textSecondary}
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
  );
}

function JobDetailView({ job, onBack, isLiked, onLike }) {
  const { t } = useTranslation();
  const { user, applyToJob } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const handleShare = async () => {
    try {
      // Configure your Vercel/website redirect URL here
      // For now, using a placeholder bkj-jobs.vercel.app. You can change this to your Vercel domain once deployed!
      const redirectDomain = "https://app-jobposting.vercel.app"; 
      
      // If testing in Expo Go, append ?dev=true so the landing page redirects to the local Expo bundle
      const isTestingOnExpo = true; 
      const shareUrl = `${redirectDomain}/job/${job.id}${isTestingOnExpo ? '?dev=true' : ''}`;
      
      const message = `Check out this job on BKJ: "${job.title}" at "${job.company}"!\nSalary: ${job.salary}\nLocation: ${job.location}\n\nApply now: ${shareUrl}`;

      await Share.share({
        title: `BKJ Job: ${job.title}`,
        message: message,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share the job.');
    }
  };

  // Applicant details (logged in user)
  const applicantName = user?.name || 'Job Seeker';
  const applicantEmail = user?.email || 'No email provided';
  const applicantPhone = user?.phone || 'No phone number provided';

  const isOwnJob = user && (job.postedBy === user.id || job.posterProfile?.id === user.id);
  const employerPhone = job.posterProfile?.phone || (isOwnJob ? user?.phone : '') || '+92 300 1234567';
  const employerEmail = job.posterProfile?.email || (isOwnJob ? user?.email : '') || 'employer@joblink.com';
  const employerName = job.posterProfile?.name || (isOwnJob ? user?.name : '') || 'Anonymous Employer';

  const handleWhatsApp = (phone, name, jobTitle, isBusiness = false) => {
    if (applyToJob) {
      applyToJob(job.id);
    }
    const cleaned = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleaned;
    if (cleaned.startsWith('03')) {
      formattedPhone = '92' + cleaned.slice(1);
    } else if (cleaned.length === 10 && cleaned.startsWith('3')) {
      formattedPhone = '92' + cleaned;
    }

    const message = `Hi ${name || 'Employer'},\n\nI am applying for the "${jobTitle}" position on BKJ. Here are my application details:\n\n👤 Name: ${applicantName}\n📧 Email: ${applicantEmail}\n📞 Phone: ${applicantPhone}\n\nPlease let me know if we can discuss this opportunity further. Thank you!`;
    
    let url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    
    if (isBusiness && Platform.OS === 'android') {
      // Force Android to open WhatsApp Business package specifically
      url = `intent://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}#Intent;package=com.whatsapp.w4b;scheme=whatsapp;end;`;
    }

    // Try to open native app first
    Linking.openURL(url).catch(() => {
      // Fallback to web wa.me if the specific app isn't installed
      const webUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('Error', 'Could not open WhatsApp. Please check if it is installed.');
      });
    });
  };

  const handleEmail = (email, name, jobTitle) => {
    if (applyToJob) {
      applyToJob(job.id);
    }
    const subject = `Job Application - ${jobTitle}`;
    const body = `Hi ${name || 'Employer'},\n\nI am interested in applying for the "${jobTitle}" position listed on BKJ.\n\nHere are my contact and application details:\n\n👤 Name: ${applicantName}\n📧 Email: ${applicantEmail}\n📞 Phone: ${applicantPhone}\n\nPlease find my contact details attached to my BKJ profile.\n\nBest regards,\n${applicantName}`;
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Mail Error', 'Could not open your mail client. Recruiter Email: ' + email);
        }
      })
      .catch(() => {
        Alert.alert('Mail Error', 'Could not open your mail client. Recruiter Email: ' + email);
      });
  };

  let cleanDescription = job.description || '';
  let experienceReq = 'Intermediate';
  if (cleanDescription && cleanDescription.startsWith('[Experience: ')) {
    const endIdx = cleanDescription.indexOf(']');
    if (endIdx !== -1) {
      experienceReq = cleanDescription.substring(13, endIdx);
      cleanDescription = cleanDescription.substring(endIdx + 1).trim();
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      {/* Floating navigation header */}
      <View style={styles.detailNav}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.detailNavTitle}>{t('jobs.job_details')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onLike(job.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#EF4444" : COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="share-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Upwork Style Header Info */}
      <View style={styles.upworkHeaderContainer}>
        {/* Poster Profile Image */}
        <View style={styles.upworkPosterRow}>
          <View style={[styles.upworkPosterAvatar, { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={[styles.upworkPosterAvatarText, { position: 'absolute' }]}>{job.company ? job.company[0].toUpperCase() : 'J'}</Text>
            {(job.posterProfile?.avatar || (user && job.postedBy === user.id && user.avatar)) ? (
              <Image source={{ uri: job.posterProfile?.avatar || user?.avatar }} style={styles.upworkPosterAvatarImg} contentFit="cover" transition={200} placeholder={{ blurhash }} />
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.upworkPosterName}>{job.company}</Text>
            <View style={styles.upworkCategoryRow}>
              <Text style={styles.upworkCategoryText}>{job.category || 'General'}</Text>
              <Text style={styles.upworkDotDivider}>•</Text>
              <Text style={styles.upworkDateText}>Posted {job.postedAt || 'Recently'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.upworkJobTitle}>{job.title}</Text>

        <View style={styles.upworkCompanyRow}>
          <Text style={styles.upworkCompanyName}>{job.company}</Text>
          <View style={styles.upworkLocationBadge}>
            <Ionicons name="location-outline" size={12} color="#64748B" style={{ marginRight: 2 }} />
            <Text style={styles.upworkLocationText}>{job.location}</Text>
          </View>
        </View>

        <View style={styles.upworkDivider} />

        {/* Key Job Specifications Block */}
        <View style={styles.specsChipsRow}>
          <View style={[styles.specChip, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7', borderWidth: 1 }]}>
            <Ionicons name="wallet-outline" size={14} color="#15803D" style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: '#15803D' }]}>{job.salary}</Text>
          </View>
          
          <View style={[styles.specChip, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', borderWidth: 1 }]}>
            <Ionicons name="briefcase-outline" size={14} color="#1D4ED8" style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: '#1D4ED8' }]}>{job.type}</Text>
          </View>

          <View style={[styles.specChip, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE', borderWidth: 1 }]}>
            <Ionicons name="school-outline" size={14} color="#6D28D9" style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: '#6D28D9' }]}>{experienceReq}</Text>
          </View>
        </View>
      </View>

      {/* Stats indicators */}
      <View style={styles.upworkStatsContainer}>
        <View style={styles.upworkStatBox}>
          <Text style={styles.upworkStatVal}>{job.applicants || 0}</Text>
          <Text style={styles.upworkStatLbl}>Applicants</Text>
        </View>
        <View style={styles.upworkStatDivider} />
        <View style={styles.upworkStatBox}>
          <Text style={styles.upworkStatVal}>{job.likes || 0}</Text>
          <Text style={styles.upworkStatLbl}>Likes</Text>
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.upworkSectionCard}>
        <Text style={styles.upworkSectionTitle}>Job Description</Text>
        <Text style={styles.upworkDescText}>{cleanDescription}</Text>
      </View>

      {/* Skills & Requirements Section */}
      <View style={styles.upworkSectionCard}>
        <Text style={styles.upworkSectionTitle}>Skills & Requirements</Text>
        <View style={styles.upworkRequirementsGrid}>
          {job.requirements && job.requirements.length > 0 ? (
            job.requirements.map((req, i) => (
              <View key={i} style={styles.upworkReqChip}>
                <Text style={styles.upworkReqChipText}>{req}</Text>
              </View>
            ))
          ) : (
            <View style={styles.upworkReqChip}>
              <Text style={styles.upworkReqChipText}>Professional communication skills</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recruiter profile information if exists */}
      {job.posterProfile && (
          <View style={styles.upworkClientSection}>
          <Text style={styles.upworkSectionTitle}>About the Recruiter</Text>
          <View style={styles.upworkClientRow}>
            <View style={[styles.upworkClientAvatar, { overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.accentGreen }]}>
              <Text style={[styles.upworkClientAvatarText, { position: 'absolute', color: '#FFF' }]}>
                {employerName ? employerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EM'}
              </Text>
              {(job.posterProfile?.avatar || (user && job.postedBy === user.id && user.avatar)) ? (
                <Image source={{ uri: job.posterProfile?.avatar || user?.avatar }} style={styles.upworkClientAvatarImage} contentFit="cover" transition={200} placeholder={{ blurhash }} />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, flexWrap: 'wrap', gap: 4 }}>
                <Text style={styles.upworkClientName} numberOfLines={1} adjustsFontSizeToFit>{job.posterProfile.name || 'Anonymous Employer'}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#15803D" style={{ marginRight: 2 }} />
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.upworkClientTitle} numberOfLines={1} adjustsFontSizeToFit>{job.posterProfile.title || 'HR Manager / Employer'}</Text>

              <View style={styles.upworkClientMetaRow}>
                <Ionicons name="mail-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.upworkClientMetaText} numberOfLines={1} adjustsFontSizeToFit>{job.posterProfile.email || 'employer@joblink.com'}</Text>
              </View>
              {job.posterProfile.location ? (
                <View style={[styles.upworkClientMetaRow, { marginTop: 2 }]}>
                  <Ionicons name="location-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.upworkClientMetaText} numberOfLines={1} adjustsFontSizeToFit>{job.posterProfile.location}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      )}

      {/* Sticky Bottom Apply Action */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, marginTop: 10 }}>
        <TouchableOpacity
          style={styles.upworkApplyBtn}
          activeOpacity={0.85}
          onPress={() => setShowApplyModal(true)}
        >
          <Text style={styles.upworkApplyBtnText}>{t('jobs.apply_now')}</Text>
          <Ionicons name="paper-plane-outline" size={16} color="#1A1A1A" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Direct Job Application Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showApplyModal}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setShowApplyModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{t('jobs.apply_directly')}</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowApplyModal(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Connect with the recruiter directly via WhatsApp or Email to fast-track your job application!
            </Text>

            {/* Recruiter Details Card */}
            <View style={styles.modalRecruiterCard}>
              <View style={styles.modalRecruiterAvatar}>
                <Text style={styles.modalRecruiterAvatarText}>
                  {employerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalRecruiterName}>{employerName}</Text>
                <Text style={styles.modalRecruiterTitle}>
                  {job.posterProfile?.title || 'Recruitment Coordinator'} at {job.company}
                </Text>
              </View>
            </View>

            {/* Contact Information Displays */}
            <View style={styles.modalContactGrid}>
              <View style={styles.modalContactCard}>
                <View style={styles.modalContactHeader}>
                  <Ionicons name="call" size={15} color="#10B981" />
                  <Text style={styles.modalContactLabel}>WhatsApp Contact</Text>
                </View>
                <Text style={styles.modalContactValue}>{employerPhone}</Text>
              </View>

              <View style={styles.modalContactCard}>
                <View style={styles.modalContactHeader}>
                  <Ionicons name="mail" size={15} color="#3B82F6" />
                  <Text style={styles.modalContactLabel}>Official Email</Text>
                </View>
                <Text style={styles.modalContactValue} numberOfLines={1}>{employerEmail}</Text>
              </View>
            </View>

            {/* Premium Deep Linking Buttons */}
            <View style={styles.modalActionsContainer}>
              <TouchableOpacity
                style={styles.whatsappActionBtn}
                activeOpacity={0.88}
                onPress={() => handleWhatsApp(employerPhone, employerName, job.title)}
              >
                <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.whatsappBtnTitle}>Apply on WhatsApp</Text>
                  <Text style={styles.whatsappBtnSub}>Chat and apply directly via WhatsApp</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ opacity: 0.8 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.whatsappActionBtn, { backgroundColor: '#128C7E', marginTop: 12 }]}
                activeOpacity={0.88}
                onPress={() => handleWhatsApp(employerPhone, employerName, job.title, true)}
              >
                <Ionicons name="business-outline" size={24} color="#FFFFFF" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.whatsappBtnTitle}>Business WhatsApp</Text>
                  <Text style={styles.whatsappBtnSub}>Apply via official Business Account</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ opacity: 0.8 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emailActionBtn}
                activeOpacity={0.88}
                onPress={() => handleEmail(employerEmail, employerName, job.title)}
              >
                <Ionicons name="mail" size={22} color="#FFFFFF" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.emailBtnTitle}>Apply via Email</Text>
                  <Text style={styles.emailBtnSub}>Send cover letter to official inbox</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ opacity: 0.8 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.appApplyBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setShowApplyModal(false);
                  if (applyToJob) {
                    applyToJob(job.id);
                  }
                  Alert.alert(
                    'Application Submitted! 🎉',
                    `Your BKJ profile has been successfully shared with ${job.company} for the "${job.title}" position. Good luck!`,
                    [{ text: 'Perfect', onPress: onBack }]
                  );
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
                <Text style={styles.appApplyBtnText}>Formally Submit Profile via App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function SkeletonCard() {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

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
    <View style={[styles.cleanJobRow, { paddingVertical: 16, paddingHorizontal: 16 }]}>
      {/* 1. Header Row Skeleton (Logo, Text column, Salary pill) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {/* Company Logo Square */}
          <Animated.View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
          <View style={{ gap: 6, flex: 1 }}>
            {/* Company Name */}
            <Animated.View style={{ width: '40%', height: 11, backgroundColor: '#F1F5F9', borderRadius: 4, opacity: shimmerAnim }} />
            {/* Job Title */}
            <Animated.View style={{ width: '75%', height: 14, backgroundColor: '#F1F5F9', borderRadius: 4, opacity: shimmerAnim }} />
          </View>
        </View>
        {/* Salary Badge Pill */}
        <Animated.View style={{ width: 75, height: 26, borderRadius: 10, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
      </View>

      {/* 2. Middle Tags Row Skeleton */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Animated.View style={{ width: 70, height: 22, borderRadius: 8, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
        <Animated.View style={{ width: 85, height: 22, borderRadius: 8, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
      </View>

      {/* 3. Divider Line Skeleton */}
      <View style={{ height: 1.2, backgroundColor: '#EEF2F0', width: '100%', marginBottom: 12 }} />

      {/* 4. Footer Row Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {/* Posted time */}
        <Animated.View style={{ width: 90, height: 12, backgroundColor: '#F1F5F9', borderRadius: 4, opacity: shimmerAnim }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Heart Button */}
          <Animated.View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
          {/* Apply Button */}
          <Animated.View style={{ width: 80, height: 34, borderRadius: 10, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
        </View>
      </View>
    </View>
  );
}

// ─── Full Screen Skeleton ──────────────────────────────────────────────────
function JobsSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 0.8, duration: 800, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0.3, duration: 800, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        {/* 1. Sleek Minimalist App Bar Skeleton */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Animated.View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
            <View>
              <Animated.View style={{ width: 80, height: 12, backgroundColor: '#F1F5F9', borderRadius: 4, marginBottom: 6, opacity: shimmerAnim }} />
              <Animated.View style={{ width: 100, height: 16, backgroundColor: '#F1F5F9', borderRadius: 4, opacity: shimmerAnim }} />
            </View>
          </View>
          <Animated.View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
        </View>

        {/* 2. Premium Hero Stats Card Skeleton */}
        <Animated.View style={{ height: 180, backgroundColor: '#F1F5F9', borderRadius: 24, marginBottom: 24, opacity: shimmerAnim }} />

        {/* 3. Search Wrapper Skeleton */}
        <Animated.View style={{ height: 52, backgroundColor: '#F1F5F9', borderRadius: 18, marginBottom: 20, opacity: shimmerAnim }} />

        {/* 4. Quick Tag Recommendations Scroll Skeleton */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          {[80, 110, 90, 80].map((w, idx) => (
            <Animated.View key={idx} style={{ width: w, height: 34, borderRadius: 14, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
          ))}
        </View>

        {/* 5. Browse Category Label Skeleton */}
        <Animated.View style={{ width: 130, height: 16, backgroundColor: '#F1F5F9', borderRadius: 4, marginBottom: 10, opacity: shimmerAnim }} />

        {/* 6. Minimalistic Category Pills Scroll Skeleton */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {[90, 110, 85, 100].map((w, idx) => (
            <Animated.View key={idx} style={{ width: w, height: 36, borderRadius: 16, backgroundColor: '#F1F5F9', opacity: shimmerAnim }} />
          ))}
        </View>

        {/* 7. Opportunities Header Row Skeleton */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Animated.View style={{ width: 180, height: 20, backgroundColor: '#F1F5F9', borderRadius: 4, opacity: shimmerAnim }} />
          <Animated.View style={{ width: 60, height: 24, backgroundColor: '#F1F5F9', borderRadius: 12, opacity: shimmerAnim }} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ marginBottom: 16 }}><SkeletonCard /></View>
        <View style={{ marginBottom: 16 }}><SkeletonCard /></View>
        <View style={{ marginBottom: 16 }}><SkeletonCard /></View>
      </View>
    </View>
  );
}

// Levenshtein distance fuzzy search helper (Amazon/Daraz style)
function isFuzzyMatch(str, query) {
  if (!str || !query) return false;
  str = str.toLowerCase().trim();
  query = query.toLowerCase().trim();

  // Split both query and target string into clean word tokens
  const strWords = str.split(/[\s\-_,\./\\]+/).filter(Boolean);
  const queryWords = query.split(/\s+/).filter(Boolean);

  if (queryWords.length === 0) return false;

  const getLevenshteinDistance = (a, b) => {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  };

  // Every word in the query must match at least one word in the target string
  return queryWords.every(qWord => {
    return strWords.some(w => {
      // 1. Exact or prefix match (e.g., "re" matches "react")
      if (w.startsWith(qWord)) return true;
      // 2. Query contains the target word (e.g., user typed "react-native" matches "react")
      if (qWord.startsWith(w)) return true;
      // 3. Substring match but only if they are related/meaningful (at least 3 characters)
      if (qWord.length >= 3 && w.length >= qWord.length && w.includes(qWord)) {
        // Prevent matching unrelated words (like "contract" for "react") by ensuring it's not con-tract.
        // If query is "react", we don't want "contract" to match.
        if (qWord === 'react' && w === 'contract') return false;
        return true;
      }
      // 4. Fuzzy typo match
      if (qWord.length >= 3) {
        const distance = getLevenshteinDistance(w, qWord);
        const maxDistance = qWord.length <= 4 ? 1 : 2;
        return distance <= maxDistance;
      }
      return false;
    });
  });
}

export default function JobsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { jobs, user, likedJobs, likeJob, fetchJobs, setIsGuest, userCountry } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const suggestions = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q === '') return [];
    const list = new Set();
    
    // Match titles, companies, categories
    jobs.forEach(j => {
      if (j.title && isFuzzyMatch(j.title, q)) list.add(j.title);
      if (j.company && isFuzzyMatch(j.company, q)) list.add(j.company);
      if (j.category && isFuzzyMatch(j.category, q)) list.add(j.category);
    });
    
    // Static keywords matching
    const staticKeywords = ['Remote', 'Full Time', 'Part Time', 'Daily Basis', 'Designer', 'Developer', 'Marketing', 'Contract'];
    staticKeywords.forEach(k => {
      if (isFuzzyMatch(k, q)) list.add(k);
    });
    
    return Array.from(list).slice(0, 5);
  }, [search, jobs]);

  const handleJobPress = (job) => {
    if (!user) {
      Alert.alert(
        'Create Account First',
        'You must create an account or sign in to view job details.',
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
      return;
    }
    setSelectedJob(job);
  };

  const handleLikePress = (jobId) => {
    if (!user) {
      Alert.alert(
        'Create Account First',
        'You must create an account or sign in to bookmark/like job listings.',
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
      return;
    }
    likeJob(jobId);
  };

  const [screenLoading, setScreenLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLikedOnly, setFilterLikedOnly] = useState(false);
  const [filterMyJobsOnly, setFilterMyJobsOnly] = useState(false);

  // Advanced search and selection filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('Any');

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // Use a predefined robust list of locations to avoid pulling user typos from job data
  const availableLocations = [
    'Remote', 'Pakistan', 'United States', 'United Kingdom', 'Canada', 
    'United Arab Emirates', 'Saudi Arabia', 'Australia', 'Karachi', 
    'Lahore', 'Islamabad', 'Dubai', 'London', 'New York', 'Riyadh', 
    'Doha', 'Oman', 'Qatar', 'Bahrain', 'Kuwait', 'Malaysia', 'Singapore'
  ].sort();

  const filteredCountryOptions = availableLocations.filter(loc =>
    loc.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setScreenLoading(true);
    try {
      await fetchJobs();
    } catch (err) {
      console.warn('Refresh fetch error:', err);
    } finally {
      setRefreshing(false);
      // Clean, micro-animation buffer (300ms) for smooth layout fade-in
      setTimeout(() => {
        setScreenLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setScreenLoading(true);
        await fetchJobs();
      } catch (err) {
        console.warn('Initial load error:', err);
      } finally {
        // Clean, micro-animation buffer (300ms) for smooth layout fade-in
        setTimeout(() => {
          setScreenLoading(false);
        }, 300);
      }
    };
    loadInitialData();
  }, []);

  const routeJobId = route?.params?.jobId;
  useEffect(() => {
    if (routeJobId && jobs && jobs.length > 0) {
      const job = jobs.find(j => String(j.id) === String(routeJobId));
      if (job) {
        if (!user) {
          Alert.alert(
            'Create Account First',
            'You must create an account or sign in to view job details.',
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
        } else {
          setSelectedJob(job);
        }
        navigation.setParams({ jobId: undefined });
      }
    }
  }, [routeJobId, jobs, user]);

  // Professional Auto-refresh polling loop (fetches latest database postings every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing jobs feed to fetch the latest opportunities...');
      fetchJobs();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const resetFilters = () => {
    setSelectedJobTypes([]);
    setSelectedLocations([]);
    setSelectedSalaryRange('Any');
    setCountrySearchQuery('');
    setCountryDropdownOpen(false);
  };

  const filtered = jobs.filter((j) => {
    // 1. Category match
    const matchCat = activeCategory === 'All' || j.category === activeCategory;

    // 2. Enhanced query search match (matches title, company, category, location, type, skills with fuzzy matching)
    const q = search.trim().toLowerCase();
    const matchSearch = q === '' || (
      (j.title && isFuzzyMatch(j.title, q)) ||
      (j.company && isFuzzyMatch(j.company, q)) ||
      (j.category && isFuzzyMatch(j.category, q)) ||
      (j.location && isFuzzyMatch(j.location, q)) ||
      (j.type && isFuzzyMatch(j.type, q)) ||
      (j.description && isFuzzyMatch(j.description, q)) ||
      (j.skills && j.skills.some(skill => isFuzzyMatch(skill, q)))
    );

    // 3. Job Type multi-select filter
    const matchType = selectedJobTypes.length === 0 || selectedJobTypes.some(type => 
      j.type && j.type.toLowerCase().replace('-', ' ').includes(type.toLowerCase().replace('-', ' '))
    );

    // 4. Location multi-select filter
    const matchLoc = selectedLocations.length === 0 ||
      selectedLocations.some(loc => j.location && j.location.toLowerCase().includes(loc.toLowerCase()));

    // 5. Salary Range filter
    let matchSalary = true;
    if (selectedSalaryRange !== 'Any') {
      const jobSalaryVal = parseInt(j.salary.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(jobSalaryVal)) {
        if (selectedSalaryRange === '> $50,000') matchSalary = jobSalaryVal >= 50000;
        else if (selectedSalaryRange === '> $100,000') matchSalary = jobSalaryVal >= 100000;
        else if (selectedSalaryRange === '> $120,000') matchSalary = jobSalaryVal >= 120000;
      }
    }

    // Quick interactive filter overrides
    if (filterLikedOnly) {
      const isLiked = likedJobs?.includes(j.id);
      if (!isLiked) return false;
    }
    if (filterMyJobsOnly) {
      const isOwnJob = user && (j.postedBy === user.id || j.posterProfile?.id === user.id);
      if (!isOwnJob) return false;
    }

    // 6. Global vs Country Specific targeted display logic
    let matchCountryTarget = true;
    if (j.location && selectedLocations.length === 0) { // Bypass user country restriction if explicit locations selected
      const isGlobal = j.location.toLowerCase().includes('global');
      if (!isGlobal && userCountry) {
        // If it's a specific country job, only show to users in that country
        const jobCountryLower = j.location.toLowerCase();
        const userCountryLower = userCountry.toLowerCase();
        matchCountryTarget = jobCountryLower.includes(userCountryLower);
      }
    }

    return matchCat && matchSearch && matchType && matchLoc && matchSalary && matchCountryTarget;
  });

  // ─── Geo-Sort & Search Relevance Sort: Push most relevant & user's country jobs to the top ─────────────────────────
  const geoSortedFiltered = React.useMemo(() => {
    let list = [...filtered];
    
    const q = search.trim().toLowerCase();
    if (q !== '') {
      const getRelevanceScore = (j) => {
        let score = 0;
        const titleLower = j.title?.toLowerCase() || '';
        const companyLower = j.company?.toLowerCase() || '';
        
        // 1. Exact match in title (Highest priority)
        if (titleLower === q) score += 100;
        // 2. Starts with query in title (E.g. "React" -> "React Native Developer")
        else if (titleLower.startsWith(q)) score += 50;
        // 3. Word starts with query in title (E.g. "Native" -> "React Native Developer")
        else {
          const words = titleLower.split(/[\s\-_,\./\\]+/);
          if (words.some(w => w.startsWith(q))) score += 25;
        }
        
        // 4. Substring match in title
        if (titleLower.includes(q)) score += 10;
        // 5. Match in company name
        if (companyLower.startsWith(q)) score += 5;
        else if (companyLower.includes(q)) score += 2;
        
        return score;
      };
      
      list.sort((a, b) => getRelevanceScore(b) - getRelevanceScore(a));
    } else if (userCountry && selectedLocations.length === 0) {
      // Geo-sort only if not searching
      const countryLower = userCountry.toLowerCase();
      const local = [];
      const others = [];
      list.forEach(j => {
        if (j.location && j.location.toLowerCase().includes(countryLower)) {
          local.push(j);
        } else {
          others.push(j);
        }
      });
      list = [...local, ...others];
    }
    
    return list;
  }, [filtered, userCountry, selectedLocations, search]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'BK';

  if (selectedJob) {
    const freshJob = jobs.find(j => j.id === selectedJob.id) || selectedJob;
    return (
      <JobDetailView
        job={freshJob}
        onBack={() => setSelectedJob(null)}
        isLiked={likedJobs?.includes(freshJob.id)}
        onLike={handleLikePress}
      />
    );
  }

  // Redesigned dashboard header to match the user's reference image exactly
  const renderHeader = () => {
    const totalJobsCount = jobs.length;
    const likedJobsCount = likedJobs?.length || 0;
    const myJobsCount = jobs.filter(j => user && (j.postedBy === user.id || j.posterProfile?.id === user.id)).length;
    const isEmployer = user?.role === 'employer';

    return (
      <View style={styles.headerContainer}>
        {/* Sleek Minimalist App Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.userAvatarCircle}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.userAvatarImage} contentFit="cover" transition={200} placeholder={{ blurhash }} />
              ) : (
                <Text style={styles.userAvatarText}>{initials}</Text>
              )}
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.headerSub}>Welcome back,</Text>
              <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>{user?.name?.replace(/\s+/g, ' ') || 'BKJ'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={onRefresh} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="sync-outline" size={18} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Warning Banner for Missing Phone Number */}
        {user && !user.phone && (
          <TouchableOpacity
            style={styles.profileWarningBanner}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.9}
          >
            <View style={styles.warningBannerLeft}>
              <View style={styles.warningIconCircle}>
                <Ionicons name="call" size={16} color="#DC2626" />
              </View>
              <View style={styles.warningTextContainer}>
                <Text style={styles.sectionTitle}>{t('jobs.premium_opportunities')}</Text>
                <Text style={styles.warningDesc}>Add a phone number to post job listings on BKJ.</Text>
              </View>
            </View>
            <View style={styles.warningActionBtn}>
              <Text style={styles.warningActionText}>Add</Text>
              <Ionicons name="chevron-forward" size={12} color="#DC2626" />
            </View>
          </TouchableOpacity>
        )}

        {/* 🌟 NEXT-LEVEL HERO GRADIENT STATS CARD */}
        <View style={styles.heroGradientCard}>
          <View style={styles.heroCardHeader}>
            <View style={styles.heroTagBadge}>
              <Text style={styles.heroTagText}>PREMIUM ACCESS</Text>
            </View>
            <Text style={styles.heroTitle}>{t('profile.shape_future') || 'Shape Your Professional Future 🚀'}</Text>
            <Text style={styles.heroSubText}>{t('profile.explore_postings') || 'Explore matched postings & connect directly with recruiters.'}</Text>
          </View>

          {/* Interactive Stats Grid */}
          <View style={styles.statsGridRow}>
            {/* Stat Box 1: Total Opportunities */}
            <TouchableOpacity
              style={[
                styles.statCardItem,
                (!filterLikedOnly && !filterMyJobsOnly) && styles.statCardItemActive
              ]}
              onPress={() => {
                setFilterLikedOnly(false);
                setFilterMyJobsOnly(false);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.statIconBadge}>
                <Ionicons name="briefcase" size={15} color="#5C9E6A" />
              </View>
              <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{totalJobsCount}</Text>
              <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.total_jobs') || 'Total Jobs'}</Text>
            </TouchableOpacity>

            {/* Stat Box 2: Liked / Saved Opportunities */}
            <TouchableOpacity
              style={[
                styles.statCardItem,
                filterLikedOnly && styles.statCardItemActive
              ]}
              onPress={() => {
                setFilterLikedOnly(!filterLikedOnly);
                setFilterMyJobsOnly(false);
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.statIconBadge, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="heart" size={15} color="#EF4444" />
              </View>
              <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{likedJobsCount}</Text>
              <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.saved_jobs') || 'Favorites'}</Text>
            </TouchableOpacity>

            {/* Stat Box 3: My Postings (Employer) / Verified Status (Job Seeker) */}
            {isEmployer ? (
              <TouchableOpacity
                style={[
                  styles.statCardItem,
                  filterMyJobsOnly && styles.statCardItemActive
                ]}
                onPress={() => {
                  setFilterMyJobsOnly(!filterMyJobsOnly);
                  setFilterLikedOnly(false);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="create" size={15} color="#D97706" />
                </View>
                <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{myJobsCount}</Text>
                <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.my_posts') || 'My Posts'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.statCardItem}>
                <View style={[styles.statIconBadge, { backgroundColor: '#E6F4EA' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                </View>
                <Text style={[styles.statCountVal, { fontSize: 12, color: '#15803D', fontWeight: '800', lineHeight: 22 }]} numberOfLines={1} adjustsFontSizeToFit>{t('profile.verified') || 'Verified'}</Text>
                <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.profile_text') || 'Profile'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Search Container with zIndex to overlay suggestions */}
        <View style={{ zIndex: 99, position: 'relative' }}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('jobs.search_placeholder')}
              placeholderTextColor={COLORS.textLight}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 8 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.searchFilterBtn} onPress={() => setFilterModalVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="options-outline" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {/* Search Suggestions Dropdown Overlay */}
          {searchFocused && suggestions.length > 0 && (
            <View style={styles.suggestionsDropdown}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPressIn={() => {
                    setSearch(item);
                    setSearchFocused(false);
                  }}
                >
                  <Ionicons name="search-outline" size={14} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                  <Text style={styles.sectionTitle}>{t('jobs.categories_header')}</Text>
                  <Ionicons name="arrow-up-sharp" size={12} color={COLORS.textLight} style={{ marginLeft: 'auto', transform: [{ rotate: '-45deg' }] }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Tag Recommendations */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.relatedScroll}
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        >
          {['Interests', 'ui ux designer', 'mobile app', 'developer', 'manager', 'marketing'].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.relatedTag, search === item && styles.relatedTagActive]}
              onPress={() => setSearch(item === 'Interests' ? '' : item)}
            >
              <Text style={[styles.relatedTagText, search === item && styles.relatedTagTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Header: Categories */}
        <Text style={styles.sectionLabel}>Browse by Category</Text>

        {/* Modern minimalistic category pills with glowing count bubble */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryCardsScroll}
          contentContainerStyle={{ gap: 10, paddingRight: 20 }}
        >
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' ? jobs.length : jobs.filter((j) => j.category === cat).length;
            const isActive = activeCategory === cat;

            // Map modern Ionicons to categories
            let iconName = "briefcase-outline";
            let pillColor = "#E6F4EA";
            let iconColor = "#137333";

            if (cat === 'Technology') { iconName = "laptop-outline"; pillColor = "#E0F2FE"; iconColor = "#0369A1"; }
            else if (cat === 'Design') { iconName = "brush-outline"; pillColor = "#FCE7F3"; iconColor = "#BE185D"; }
            else if (cat === 'Marketing') { iconName = "trending-up-outline"; pillColor = "#FEF3C7"; iconColor = "#B45309"; }
            else if (cat === 'Finance') { iconName = "cash-outline"; pillColor = "#DCFCE7"; iconColor = "#15803D"; }
            else if (cat === 'Healthcare') { iconName = "heart-half-outline"; pillColor = "#FEE2E2"; iconColor = "#B91C1C"; }
            else if (cat === 'Education') { iconName = "book-outline"; pillColor = "#EDE9FE"; iconColor = "#6D28D9"; }
            else if (cat === 'Engineering') { iconName = "construct-outline"; pillColor = "#F1F5F9"; iconColor = "#475569"; }

            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive
                ]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.9}
              >
                <View style={[styles.categoryIconCircle, { backgroundColor: isActive ? COLORS.accentYellow : pillColor }]}>
                  <Ionicons name={iconName} size={15} color={isActive ? "#1A1A1A" : iconColor} />
                </View>
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]} numberOfLines={1} adjustsFontSizeToFit>{cat}</Text>
                <View style={[styles.countBubble, isActive && { backgroundColor: '#E8F542' }]}>
                  <Text style={[styles.countBubbleText, isActive && { color: '#1A1A1A' }]} numberOfLines={1} adjustsFontSizeToFit>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Opportunities Header */}
        <View style={styles.listHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listSectionTitle}>
              {filterLikedOnly ? 'Favorite Jobs' : filterMyJobsOnly ? 'My Job Postings' : 'All Available Opportunities'}
            </Text>
            {userCountry && !filterLikedOnly && !filterMyJobsOnly && selectedLocations.length === 0 && (
              <View style={styles.nearYouBadge}>
                <Ionicons name="location" size={11} color="#15803D" style={{ marginRight: 3 }} />
                <Text style={styles.nearYouBadgeText}>Showing {userCountry} jobs first</Text>
              </View>
            )}
          </View>
          <Text style={styles.listSectionBadge}>{geoSortedFiltered.length} Jobs</Text>
        </View>
      </View>
    );
  };



  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <FlatList
        data={screenLoading ? [] : geoSortedFiltered}
        keyExtractor={(j, idx) => j.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accentGreen}
            progressViewOffset={80}
          />
        }
        ListHeaderComponent={screenLoading ? <JobsSkeleton /> : renderHeader()}
        ListFooterComponent={screenLoading ? null : <AdBanner />}
        renderItem={({ item }) =>
          screenLoading ? null : (
              <JobCard
                job={item}
                onPress={handleJobPress}
                isLiked={likedJobs?.includes(item.id)}
                onLike={handleLikePress}
                t={t}
              />
          )
        }
        ListEmptyComponent={
          screenLoading ? null : (
            <View style={styles.emptyBox}>
              <Ionicons name="briefcase-outline" size={44} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No job listings match your search.</Text>
            </View>
          )
        }
      />

      {/* GORGEOUS SLIDING FILTER BOTTOM MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalContent}>

            {/* Modal Header */}
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filter Job Listings</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Job Type Section */}
              <Text style={styles.sectionTitle}>{t('jobs.recent_posts')}</Text>
              <View style={styles.filterPillsContainer}>
                {['Full Time', 'Part Time', 'Remote', 'Contract', 'Daily Basis'].map((type) => {
                  const selected = selectedJobTypes.includes(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.filterSelectPill, selected && styles.filterSelectPillActive]}
                      onPress={() => {
                        if (selected) {
                          setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
                        } else {
                          setSelectedJobTypes([...selectedJobTypes, type]);
                        }
                      }}
                    >
                      <Text style={[styles.filterPillLabel, selected && styles.filterPillLabelActive]}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Location Section */}
              <Text style={styles.filterSectionTitle}>Select Country / Location</Text>

              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setCountryDropdownOpen(!countryDropdownOpen)}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeft}>
                  <Ionicons name="earth-outline" size={18} color="#4B5563" style={{ marginRight: 8 }} />
                  <Text style={styles.dropdownSelectedText} numberOfLines={1}>
                    {selectedLocations.length === 0
                      ? "All Countries / Locations"
                      : selectedLocations.join(', ')}
                  </Text>
                </View>
                <Ionicons
                  name={countryDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#4B5563"
                />
              </TouchableOpacity>

              {countryDropdownOpen && (
                <View style={styles.dropdownListContainer}>
                  {/* Local search input to filter country options */}
                  <View style={styles.dropdownSearchWrapper}>
                    <Ionicons name="search" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder="Search country or city..."
                      placeholderTextColor="#9CA3AF"
                      value={countrySearchQuery}
                      onChangeText={setCountrySearchQuery}
                    />
                  </View>

                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {filteredCountryOptions.map((loc) => {
                      const isSelected = selectedLocations.includes(loc);
                      return (
                        <TouchableOpacity
                          key={loc}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedLocations(selectedLocations.filter(l => l !== loc));
                            } else {
                              setSelectedLocations([...selectedLocations, loc]);
                            }
                          }}
                        >
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                            {loc}
                          </Text>
                          {isSelected && <Ionicons name="checkmark" size={14} color="#1A1A1A" />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Salary Range Section */}
              <Text style={styles.filterSectionTitle}>Minimum Salary</Text>
              <View style={styles.filterPillsContainer}>
                {['Any', '> $50,000', '> $100,000', '> $120,000'].map((salary) => {
                  const selected = selectedSalaryRange === salary;
                  return (
                    <TouchableOpacity
                      key={salary}
                      style={[styles.filterSelectPill, selected && styles.filterSelectPillActive]}
                      onPress={() => setSelectedSalaryRange(salary)}
                    >
                      <Text style={[styles.filterPillLabel, selected && styles.filterPillLabelActive]}>{salary}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Actions Footer */}
            <View style={styles.filterModalFooter}>
              <TouchableOpacity style={styles.filterResetBtn} onPress={resetFilters}>
                <Text style={styles.filterResetBtnText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.filterApplyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  listContent: {
    paddingBottom: 140, // Avoid overlapping floating navigation and AdBanner
  },
  headerContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0F5132',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  userAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 0,
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 0,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  searchFilterBtn: {
    padding: 4,
    marginLeft: 6,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    paddingLeft: 2,
  },

  // Related results tags
  relatedScroll: {
    marginBottom: 18,
  },
  relatedTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  relatedTagText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Short by tags
  sortByScroll: {
    marginBottom: 20,
  },
  sortByTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortByTagActive: {
    backgroundColor: '#E6F4EA',
    borderColor: '#34A853',
  },
  sortByTagText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  sortByTagTextActive: {
    color: '#137333',
  },

  // Modern Horizontal Category Pill Styles
  categoryCardsScroll: {
    marginBottom: 24,
    paddingLeft: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 0,
    gap: 8,
  },
  categoryPillActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#E8F542',
    borderWidth: 1.5,
    shadowColor: '#E8F542',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 0,
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  countBubble: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBubbleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },

  // 🌟 Premium Hero Gradient Card
  heroGradientCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 0,
  },
  heroCardHeader: {
    marginBottom: 16,
  },
  heroTagBadge: {
    backgroundColor: '#E8F542',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubText: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCardItem: {
    flex: 1,
    width: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
  },
  statCardItemActive: {
    borderColor: '#E8F542',
    borderWidth: 2,
    shadowColor: '#E8F542',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statCountVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 22,
  },
  statLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // Opportunities Section Header
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  listSectionBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1A1A',
    backgroundColor: COLORS.accentYellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  nearYouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  nearYouBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },

  // 🌟 Redesigned Next-Level Job Cards (LinkedIn/Upwork Premium style)
  cleanJobRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 0,
  },
  premiumJobRow: {
    borderColor: '#5C9E6A',
    borderWidth: 1.5,
    shadowColor: '#5C9E6A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 0,
    backgroundColor: '#FCFDFD',
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
    color: '#475569',
    fontWeight: '600',
  },
  jobRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  salaryBadgeContainer: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 8,
  },
  jobRowSalaryText: {
    color: '#137333',
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
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGreen,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#E8F542',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  applyBtnLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  relatedTagActive: {
    backgroundColor: '#1A1A1A',
  },
  relatedTagTextActive: {
    color: '#FFFFFF',
  },

  // Detail View
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
  // Upwork Style Detail Page Layout
  upworkHeaderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upworkPosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  upworkPosterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  upworkPosterAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  upworkPosterAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  upworkPosterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  upworkCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  upworkCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upworkDotDivider: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  upworkDateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  upworkJobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  upworkCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  upworkCompanyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  upworkLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  upworkLocationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  upworkDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  specsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  specChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  upworkStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  upworkStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  upworkStatVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E8F542',
  },
  upworkStatLbl: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  upworkStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  upworkSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upworkSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  upworkDescText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  upworkRequirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  upworkReqChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upworkReqChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  upworkClientSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upworkClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upworkClientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  upworkClientAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  upworkClientAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
  upworkClientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  upworkClientTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
  },
  upworkClientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upworkClientMetaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  upworkApplyBtn: {
    backgroundColor: '#E8F542',
    borderRadius: 28,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
    shadowColor: '#E8F542',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  upworkApplyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },

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
  cardPosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cardPosterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12, paddingHorizontal: 40 },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textLight, textAlign: 'center' },

  // Direct Apply Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Elegant backdrop color
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  modalRecruiterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 18,
  },
  modalRecruiterAvatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.accentYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRecruiterAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalRecruiterName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalRecruiterTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  modalContactGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  modalContactCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
  },
  modalContactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  modalContactLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modalContactValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalActionsContainer: {
    gap: 12,
  },
  whatsappActionBtn: {
    backgroundColor: '#25D366',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappBtnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  whatsappBtnSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    marginTop: 1,
  },
  emailActionBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emailBtnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emailBtnSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    marginTop: 1,
  },
  appApplyBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  appApplyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  requirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  premiumReqChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EC',
    borderColor: '#D4EAD7',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  premiumReqText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },

  // ─── Filter Sheet Modal Styles ──────────────────────────────────────────────
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 34,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  filterSelectPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
  },
  filterSelectPillActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  filterPillLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterPillLabelActive: {
    color: '#FFFFFF',
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  filterResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterResetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#E8F542',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  // ─── Collapsible Country Dropdown Styles ───────────────────────────────────
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    marginTop: 6,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownSelectedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  dropdownListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    marginTop: 8,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  dropdownSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dropdownSearchInput: {
    fontSize: 12,
    color: '#1A1A1A',
    flex: 1,
    padding: 0,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownItemActive: {
    backgroundColor: '#E8F542',
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  dropdownItemTextActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  profileWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  warningBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  warningIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  warningDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B91C1C',
    marginTop: 1,
  },
  warningActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  warningActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    marginRight: 2,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EEF2F0',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A2417',
  },
});
