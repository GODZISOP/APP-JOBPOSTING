import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

export default function NetworkBarrier({ children }) {
  const [isConnected, setIsConnected] = useState(true);
  const { fetchJobs, loading } = useAuth();
  const wasOffline = useRef(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    // 1. Subscribe to real-time NetInfo changes
    const unsubscribe = NetInfo.addEventListener(state => {
      // isInternetReachable can be false when there's a signal/connection but no actual internet data flow.
      // If it is null, we fallback to isConnected to avoid transient connection check flickers.
      const connected = state.isConnected !== false && state.isInternetReachable !== false;
      
      if (connected) {
        // Clear any pending offline trigger immediately
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
          debounceTimeout.current = null;
        }
        setIsConnected(true);

        // 2. Dynamic Auto-refresh: When network goes from offline back to online
        if (wasOffline.current) {
          console.log('📶 Internet reconnected! Automatically refreshing job listings...');
          fetchJobs();
          wasOffline.current = false;
        }
      } else {
        wasOffline.current = true;
        // Debounce setting offline state to avoid transient check flickers (especially on startup)
        if (!debounceTimeout.current) {
          debounceTimeout.current = setTimeout(() => {
            setIsConnected(false);
            debounceTimeout.current = null;
          }, 2000); // Wait 2 seconds of persistent disconnect before showing offline UI
        }
      }
    });

    return () => {
      unsubscribe();
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [fetchJobs]);

  const handleManualRetry = async () => {
    const state = await NetInfo.fetch();
    const connected = state.isConnected !== false && state.isInternetReachable !== false;
    setIsConnected(connected);
    if (connected) {
      fetchJobs();
    } else {
      Alert.alert(
        'Still Offline 📴',
        'We checked, but there is still no internet connection. Please verify your Wi-Fi or cellular network settings.'
      );
    }
  };

  // Only show the offline screen if the user is truly offline AND the app has finished its initial splash screen loading phase
  if (!isConnected && !loading) {
    return (
      <View style={styles.offlineContainer}>
        {/* Hardware-Accelerated LottieView to render the local offline JSON animation */}
        <View style={styles.offlineAnimationContainer}>
          <LottieView
            source={require('../../../assets/offline.json')}
            style={styles.offlineWebView}
            autoPlay
            loop
          />
        </View>

        <View style={styles.offlineContent}>
          <Text style={styles.offlineTitle}>Connection Lost</Text>
          <Text style={styles.offlineSubtitle}>
            Your internet seems to be down. Don't worry, we'll restore your dashboard automatically as soon as you're back online.
          </Text>

          <View style={styles.offlineBadge}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlineBadgeText}>Waiting for network...</Text>
          </View>

          <TouchableOpacity style={styles.offlineBtn} activeOpacity={0.85} onPress={handleManualRetry}>
            <Ionicons name="refresh-outline" size={18} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
            <Text style={styles.offlineBtnText}>Check Connection</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  offlineAnimationContainer: {
    width: 260,
    height: 260,
    overflow: 'hidden',
    borderRadius: 130,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  offlineWebView: {
    width: 260,
    height: 260,
    backgroundColor: 'transparent',
  },
  offlineContent: {
    alignItems: 'center',
    width: '100%',
  },
  offlineTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  offlineSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
    marginRight: 8,
  },
  offlineBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  offlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentYellow,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  offlineBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
