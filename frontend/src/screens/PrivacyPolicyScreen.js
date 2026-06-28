import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const summaryPoints = [
    "Your email and phone number are shared with employers when you apply",
    "You must consent before your data is shared",
    "Employers contact you directly via email, phone, or WhatsApp",
    "Our app does not monitor WhatsApp conversations",
    "You can block and report employers",
    "Your account and data can be deleted anytime",
    "All data is encrypted and secure",
    "We never sell your data",
    "You have full control over your information"
  ];

  const sections = [
    {
      title: "1. Introduction",
      icon: "information-circle-outline",
      content: "Welcome to BKJ Job Portal. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you use our mobile application. By using this application, you agree to the practices described in this Privacy Policy. If you do not agree with our practices, please do not use this application."
    },
    {
      title: "2. Information We Collect",
      icon: "document-text-outline",
      content: "Our application collects personal information necessary to provide job matching and employment services. When you create an account, we collect your full name, email address, and phone number for authentication and account verification purposes. Your email is used to send you verification codes, account updates, important notifications, and communications from employers. Your password is collected and fully encrypted using military-grade AES-256 encryption to ensure security. Additionally, we collect profile information including your profile picture or avatar, your job seeker title or professional designation, and your location data which is auto-detected via your IP address to show you relevant job listings specific to your country and region. We also track your activity within the application such as the jobs you apply to, the jobs you bookmark or like, and your interactions with employers. All of this data is collected solely to provide you with personalized job matching services and to facilitate direct communication between job seekers and employers."
    },
    {
      title: "3. How We Use Your Information",
      icon: "cog-outline",
      content: "We use your collected information for several specific purposes related to our job portal services. Your email address and phone number are used to verify your account identity and sign you up securely using one-time password OTP codes sent to your email. Your profile information including your title and location are used to facilitate job matching by allowing job seekers to apply to relevant job listings and helping employers find qualified candidates in their region. Your email and phone number enable direct communication between you and employers regarding your job applications, interview scheduling, and job offers. We filter and sort job listings to match your country first, ensuring you see the most relevant opportunities in your location. We also use your information to prevent spamming and abuse of our platform, such as implementing restrictions on toggling likes too rapidly or applying to jobs too frequently within short time periods. Your data helps us improve our services, understand user behavior, and enhance the overall platform experience."
    },
    {
      title: "4. Contact Information Sharing with Employers",
      icon: "share-social-outline",
      content: "When you submit a job application through our platform, your personal contact information is shared with the employer who posted that job listing. Specifically, the employer receives your full name, email address, phone number, profile picture or avatar, and your job title. Before your information is shared, our application displays a clear consent dialog informing you that your contact information will be shared with the employer. The dialog clearly states \"Your Contact Information Will Be Shared With Employer\" and lists the specific details that will be transmitted. You have the option to cancel and not apply, or to confirm and proceed with sharing your information. By clicking the apply button after seeing this warning, you explicitly consent to share your contact information with that employer."
    },
    {
      title: "5. How Employers Will Contact You",
      icon: "people-outline",
      content: "The employer who receives your information may contact you through multiple methods. They may send you emails to discuss your application status, schedule interviews, or extend job offers. They may call your phone number directly using the phone number you provided during registration or in your profile. They may also send you messages through WhatsApp using your phone number. Our application does not restrict which communication method the employer chooses to use. All communication attempts from employers are direct and do not go through our application platform. You should expect to receive contact from employers through any of these channels after submitting a job application."
    },
    {
      title: "6. Public Employer Information Display",
      icon: "eye-outline",
      content: "When an employer posts a job listing on our platform, certain information about the employer is publicly displayed within the job posting to help you identify the employer and contact them directly if desired. This public information includes the employer's phone number, email address, WhatsApp link, company name, and company logo. This information is visible to all users of the application and is not restricted. Job seekers can call the employer directly using the provided phone number, send emails to the provided email address, or start a WhatsApp conversation using the provided WhatsApp link without going through our application. The employer's contact information is shared with the clear intention of facilitating direct communication between employers and job seekers."
    },
    {
      title: "7. WhatsApp Integration and Third-Party Services",
      icon: "logo-whatsapp",
      content: "Our application integrates with WhatsApp to facilitate communication between job seekers and employers. When you click a WhatsApp link in our application or when an employer sends you a WhatsApp message, you are communicating directly through WhatsApp's platform. Our application does not handle, store, monitor, or have access to your WhatsApp conversations. The use of WhatsApp is governed entirely by WhatsApp's Privacy Policy and Terms of Service, which are separate and independent from this Privacy Policy. We are not responsible for how WhatsApp handles your data, how your conversations are stored, or how your information is used within their platform. All WhatsApp conversations are subject to WhatsApp's policies and encryption standards. Additionally, we use email services to send you verification codes, account updates, important notifications, and to receive your inquiries through our support system. Your email communications are encrypted and stored securely on our servers."
    },
    {
      title: "8. Data Retention and Deletion Policies",
      icon: "trash-outline",
      content: "When your account is active, we retain all your personal data to provide continuous job matching services and to maintain your profile and job application history. You have the absolute right to request deletion of your account and all associated data at any time. You can request account deletion directly from the Profile Settings screen within the application by navigating to your profile and selecting the Delete Account option. Once you confirm deletion by entering your password and confirming the action, all your profile data, job postings you created, job applications you submitted, bookmarks you saved, and complete activity history will be permanently and securely deleted from our databases within thirty days. Please note that conversations you have had with employers through WhatsApp, email, or direct phone calls are not controlled or stored by our application and will remain on those external platforms according to their respective policies. For users who choose to keep their account active, we retain job application history for one year, job bookmarks and likes are retained for two years, and chat communication records within our application are retained for one year. After these retention periods, old records may be deleted to manage storage efficiently."
    },
    {
      title: "9. Security and Data Protection Measures",
      icon: "shield-checkmark-outline",
      content: "We implement industry-standard administrative, physical, and electronic security measures to safeguard your personal data from unauthorized access, modification, disclosure, or destruction. All passwords stored in our system are encrypted using military-grade AES-256 encryption standards, ensuring that even our administrative staff cannot view your actual password. All data transmitted between your device and our servers is protected by HTTPS/TLS encryption protocols, ensuring that data cannot be intercepted during transmission. Your personal information is stored on secure cloud infrastructure with multiple layers of protection, redundancy, and backup systems. We conduct regular security audits on a quarterly basis to identify and address potential vulnerabilities or security gaps. Our servers are protected by firewalls, intrusion detection systems, and continuous monitoring. Despite these comprehensive measures, no security system is completely impenetrable, and we cannot guarantee absolute security of your data. However, we are committed to maintaining the highest possible security standards."
    },
    {
      title: "10. User Control, Safety Features, and Blocking",
      icon: "lock-closed-outline",
      content: "You have complete control over your personal information and interactions within our application. If you receive unwanted contact from an employer, you have the option to block that employer, which will prevent them from sending you further messages through our platform and viewing your profile. You can also report employers who engage in harassment, spam, inappropriate behavior, or any form of abuse or misconduct. When you report an employer, our support team reviews the complaint thoroughly and takes appropriate action, which may include restricting the employer's account, suspending their access, or removing them from the platform entirely. You retain the right to opt-out from further contact by unsubscribing from employer emails, blocking employer phone numbers, or blocking employers on WhatsApp. You can modify your communication preferences at any time through your account settings. We also implement anti-spam protection measures such as rate limiting on certain actions to prevent rapid repeated behavior that might constitute abuse of the platform."
    },
    {
      title: "11. No Sale of Personal Data to Third Parties",
      icon: "ban-outline",
      content: "We want to clearly and explicitly state that we do not sell, rent, lease, or share your personal information with third-party marketers, advertisers, data brokers, or any external organizations. Your data is shared only with the employers of the specific jobs you apply for, and with essential service providers who assist us in operating our application and providing our services such as cloud hosting providers and email delivery services. We never provide your contact information to spam callers, telemarketers, unauthorized third parties, or any external data companies. Your trust is fundamental to our business model, and we are committed to maintaining the confidentiality and security of your personal data. We do not profit from selling user data."
    },
    {
      title: "12. Protection Against Spam, Abuse, and Fraudulent Activity",
      icon: "alert-circle-outline",
      content: "Our application includes multiple protective measures to prevent spam, harassment, abuse, fraud, and malicious activity. We implement a verification system for employers to ensure that only legitimate recruiters and authorized company representatives can post jobs and contact applicants. We verify employer identities and may require business documentation or other proof of legitimacy. We also monitor user behavior continuously to detect and prevent suspicious activities such as rapid repeated actions that might indicate automated abuse or bot activity. If you like or bookmark jobs too frequently within a short time period, our system will temporarily restrict these actions for five to fifteen minutes to prevent misuse of the platform. Applicants can report any employer who sends spam messages, engages in harassment, sends inappropriate or offensive content, or violates our community guidelines. Our support team investigates all reports thoroughly and takes appropriate action to protect users."
    },
    {
      title: "13. Compliance with Laws and Regulations",
      icon: "business-outline",
      content: "This application and our privacy practices comply with Google Play Store policies and requirements for transparent data handling, user consent, and data security. For users located in the European Union, our practices comply with the General Data Protection Regulation (GDPR), which provides you with specific rights regarding your personal data including the right to access, correct, delete, and port your data. We also comply with all applicable local data protection laws in the countries where our application is available. Additionally, we comply with consumer protection regulations, telecommunications regulations regarding the collection and sharing of phone numbers, and anti-spam laws in all jurisdictions where we operate. We are committed to maintaining the highest standards of legal compliance and user protection globally."
    },
    {
      title: "14. Age Requirement and Eligibility",
      icon: "calendar-outline",
      content: "This application is intended for users who are eighteen years of age or older. By using this application, you represent and warrant that you are at least eighteen years old and legally capable of entering into binding agreements, contracting with employers, and accepting employment. Job applications through our platform require a verified adult account to ensure that employers can confidently communicate with adult job seekers and to maintain appropriate professional standards. We do not knowingly collect personal information from individuals under the age of eighteen. If we discover that we have collected information from someone under eighteen years of age, we will promptly delete such information and take appropriate steps to remove their account."
    },
    {
      title: "15. Communication Preferences and Updates",
      icon: "mail-open-outline",
      content: "You can manage your communication preferences through your account settings at any time. You can choose to receive or not receive emails from employers regarding job opportunities and application updates. You can opt-out of marketing communications and notifications while still maintaining your ability to receive critical account security notifications. If you receive emails from employers and wish to unsubscribe, you can use the unsubscribe link provided in every employer email. Opting out of communications does not affect your ability to use the job portal or apply to jobs. You will receive mandatory communications regarding account security, account deletion, and critical platform updates regardless of your communication preferences."
    },
    {
      title: "16. Updates to this Privacy Policy",
      icon: "sync-outline",
      content: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, industry standards, or other factors affecting privacy and data protection. When we make material changes to this Privacy Policy that significantly affect your rights or how we handle your data, we will notify you by email to the address you provided during registration or by posting a prominent notice within the application prominently displayed when you open the app. We will provide at least thirty days notice before any material changes take effect, giving you time to review and understand the changes. Your continued use of the application following the posting of a revised Privacy Policy means that you accept and agree to the changes. It is your responsibility to review this Privacy Policy periodically to stay informed about how we protect your personal information. If you do not agree with any changes, you should delete your account and stop using the application."
    },
    {
      title: "17. Contact Us and Support",
      icon: "mail-outline",
      content: "If you have any questions, concerns, complaints, or requests regarding this Privacy Policy or our data handling practices, please contact our support team at support@bkj-app.com. Our support team will respond to your inquiry within twenty-four to forty-eight hours. You can also submit a complaint, grievance, or support request through the in-app contact option available in the Settings section of the application. For urgent matters or issues requiring immediate attention, you can use the in-app support feature to connect with our team directly and have your concern addressed as quickly as possible. We take all privacy concerns seriously and are committed to resolving any issues promptly, fairly, and satisfactorily. We also welcome your feedback on how we can improve our privacy practices and better protect your data."
    },
    {
      title: "18. Your Rights and Choices",
      icon: "options-outline",
      content: "You have the following rights regarding your personal data. You have the right to access all your personal data that we hold by contacting our support team and requesting a data download. You have the right to correct or update any inaccurate or incomplete information by logging into your account and editing your profile. You have the right to delete your account and all associated personal data at any time by selecting Delete Account in your Profile Settings. You have the right to restrict how we use your data by opting out of specific services or communications. You have the right to withdraw your consent for data sharing at any time by blocking employers or changing your privacy settings. You have the right to lodge a complaint with your local data protection authority if you believe your rights have been violated. You have the right to data portability, meaning you can request that we provide your data in a structured, commonly used, and machine-readable format."
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
        <Text style={styles.lastUpdated}>Last Updated: June 28, 2026</Text>

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

        {/* Summary Card at the end */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary of Key Points</Text>
          <View style={styles.summaryGrid}>
            {summaryPoints.map((point, idx) => (
              <View key={idx} style={styles.summaryRow}>
                <Ionicons name="checkmark-circle" size={16} color={theme.isDark ? '#E8F542' : '#15803D'} style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={styles.summaryText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
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
  summaryCard: {
    alignSelf: 'stretch',
    backgroundColor: theme.isDark ? 'rgba(255, 140, 0, 0.05)' : '#F0FDF4',
    borderWidth: 1.5,
    borderColor: theme.isDark ? 'rgba(255, 140, 0, 0.3)' : '#DCFCE7',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.isDark ? '#FF8C00' : '#15803D',
    marginBottom: 12,
  },
  summaryGrid: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.textPrimary,
    lineHeight: 18,
  },
  sectionCard: {
    alignSelf: 'stretch',
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
    flex: 1,
    flexShrink: 1,
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
