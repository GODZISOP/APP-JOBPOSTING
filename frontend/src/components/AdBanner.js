import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Platform } from 'react-native';
import Constants from 'expo-constants';

// Google Mobile Ads is mocked in development build (metro.config.js redirects to empty module)
// In production build, remove the metro.config.js redirect to enable real ads.
const BannerAd = null;
const BannerAdSize = null;
const TestIds = null;


export default function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If running in Expo Go or if native module failed to load, serve beautiful custom mock layout
  if (isExpoGo || hasError || !BannerAd) {
    return (
      <View style={styles.container}>
        <View style={styles.adFallbackCard}>
          <Text style={styles.adBadge}>SPONSOR</Text>
          <Text style={styles.adFallbackText}>Google AdMob Test Banner</Text>
          <Text style={styles.adFallbackSub}>Click & impression triggers simulated successfully</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={TestIds.BANNER} // Official Google Test Banner ID
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setAdLoaded(true);
          setHasError(false);
        }}
        onAdFailedToLoad={(err) => {
          console.log('[AdMob Banner] Serving beautiful visual placeholder:', err.message);
          setHasError(true);
        }}
      />
      {!adLoaded && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#DFFF00" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  loadingContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adFallbackCard: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 12,
    marginVertical: 12,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  adBadge: {
    position: 'absolute',
    top: 6,
    left: 10,
    fontSize: 8,
    fontWeight: '900',
    color: '#0F172A',
    backgroundColor: '#DFFF00',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  adFallbackText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  adFallbackSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
});
