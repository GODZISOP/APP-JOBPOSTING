import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const sections = [
    {
      title: "1. Introduction",
      icon: "information-circle-outline",
      content: "Welcome to BKJ Job Portal. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share your information when you use our mobile application."
    },
    {
      title: "2. Information We Collect",
      icon: "document-text-outline",
      points: [
        "Account Information: Name, Email Address (used for authentication, sending 8-digit verification OTP codes, and account updates), and Password (which is fully encrypted).",
        "Profile & Recruiter Information: Phone number, Profile picture (avatar), Job seeker title, and Location (auto-detected via IP to display relevant country-specific job postings).",
        "Activity & Job Data: Jobs you post, bookmark (like), and apply to."
      ]
    },
    {
      title: "3. How We Use the Information",
      icon: "cog-outline",
      points: [
        "To verify account identity and sign up users securely using OTP codes.",
        "To facilitate job matching by letting Job Seekers apply to listings.",
        "To allow direct communication between Job Seekers and Employers via WhatsApp or Email links.",
        "To filter and sort job listings to match your country first.",
        "To prevent spamming and abuse (such as restrictions on toggling likes too fast)."
      ]
    },
    {
      title: "4. Data Sharing & Disclosure",
      icon: "share-social-outline",
      points: [
        "With Employers: When you apply for a job posting, your Name, Profile Title, Email, Phone Number, and Avatar are shared directly with the Employer who posted that job.",
        "No Third-Party Sale: We do not sell, rent, or lease your personal information with third-party marketers or advertisers."
      ]
    },
    {
      title: "5. Account and Data Deletion",
      icon: "trash-outline",
      content: "You have the right to request deletion of your account and all associated data at any time. You can request account deletion directly from the Profile Settings screen inside this app. Once confirmed, all your profile data, job postings, applications, and bookmarks will be permanently and securely deleted from our databases."
    },
    {
      title: "6. Security",
      icon: "shield-checkmark-outline",
      content: "We implement industry-standard administrative, physical, and electronic security measures to safeguard your personal data from unauthorized access, modification, or disclosure."
    },
    {
      title: "7. Contact Us",
      icon: "mail-outline",
      content: "If you have any questions or feedback regarding this Privacy Policy, please contact our support team at support@bkj-app.com."
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.bgPrimary} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: June 24, 2026</Text>

        {sections.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name={section.icon} size={20} color={theme.isDark ? theme.accentYellow : theme.accentGreen} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.content && <Text style={styles.sectionText}>{section.content}</Text>}
            {section.points && (
              <View style={styles.pointsContainer}>
                {section.points.map((point, pIdx) => (
                  <View key={pIdx} style={styles.pointRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
    backgroundColor: theme.bgPrimary,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  scrollContent: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.borderLight,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.isDark ? 'rgba(255, 140, 0, 0.12)' : 'rgba(92, 158, 106, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  sectionText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    lineHeight: 20,
  },
  pointsContainer: {
    gap: 8,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 14,
    color: theme.isDark ? theme.accentYellow : theme.accentGreen,
    marginRight: 8,
    lineHeight: 18,
  },
  pointText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    lineHeight: 18,
  },
});
