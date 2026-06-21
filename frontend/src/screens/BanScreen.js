import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function BanScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={64} color="#EF4444" />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Account Suspended</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          Your account has been restricted from accessing BKJ.
        </Text>
        
        <View style={[styles.reasonBox, { backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2', borderColor: '#EF4444' }]}>
          <Text style={styles.reasonTitle}>Reason for ban:</Text>
          <Text style={styles.reasonText}>{user?.banReason || 'Violating community guidelines.'}</Text>
        </View>
        
        <Text style={[styles.footer, { color: theme.textLight }]}>
          If you believe this is a mistake, please contact support.
        </Text>

        <TouchableOpacity 
          style={[styles.contactBtn, { backgroundColor: theme.isDark ? '#374151' : '#F3F4F6' }]} 
          onPress={async () => {
            const email = 'bkjadmin@gmail.com';
            const subject = `Account Suspension Appeal - ${user?.name || 'User'}`;
            const gmailUrl = `googlegmail://co?to=${email}&subject=${encodeURIComponent(subject)}`;
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
            try {
              await Linking.openURL(gmailUrl);
            } catch {
              await Linking.openURL(mailtoUrl);
            }
          }}
        >
          <Ionicons name="mail" size={20} color={theme.textPrimary} style={{ marginRight: 8 }} />
          <Text style={[styles.contactText, { color: theme.textPrimary }]}>Contact Support</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  reasonBox: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 40,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
    lineHeight: 22,
  },
  footer: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  contactBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  contactText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomArea: {
    padding: 30,
    paddingBottom: 50,
  },
  logoutBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
