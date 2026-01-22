import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// EAS / .env で設定している想定: development / preview / production
const APP_ENV = process.env.APP_ENV ?? 'development';
const BANNER_UNIT_ID = Platform.OS === 'ios'
  ? process.env.ADMOB_BANNER_ID_IOS
  : process.env.ADMOB_BANNER_ID_ANDROID;

// Expo Go かどうか
const isStoreClient = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// preview / production だけ実広告を出したい
const shouldUseRealAds =
  !isStoreClient && APP_ENV === 'production';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

const MOCK_AD_HEIGHT = 50;

if (shouldUseRealAds) {
  const RNGoogleAds = require('react-native-google-mobile-ads');
  BannerAd = RNGoogleAds.BannerAd;
  BannerAdSize = RNGoogleAds.BannerAdSize;
  TestIds = RNGoogleAds.TestIds;
}

function getAdUnitId() {
  if (APP_ENV === 'preview') {
    return TestIds.BANNER;
  }
  return BANNER_UNIT_ID;
}

export function AdBanner() {
  const [error, setError] = useState<string | null>(null);

  // Expo Go / development 環境では常にダミー表示
  if (!shouldUseRealAds || !BannerAd || !BannerAdSize) {
    return (
      <View style={styles.mockContainer}>
        <Text style={styles.mockText}>[Ad banner]</Text>
      </View>
    );
  }

  if (error) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={getAdUnitId()}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => setError(null)}
        onAdFailedToLoad={(e: any) => {
          console.warn('Ad failed to load:', e);
          setError(e.message);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  mockContainer: {
    width: '100%',
    height: MOCK_AD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#d4d4d4',
  },
  mockText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
