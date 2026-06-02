import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function AdBanner() {
  return (
    <View style={styles.container}>
      <View style={styles.adFallbackCard}>
        <Text style={styles.adBadge}>SPONSOR</Text>
        <Text style={styles.adFallbackText}>Google AdMob Test Banner</Text>
        <Text style={styles.adFallbackSub}>Web Sandbox demo active - click & impressions simulated</Text>
      </View>
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
