import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// AdMob Ad Unit ID
// TODO: 本番環境では実際のAd Unit IDに置き換えてください
// テスト用ID: ca-app-pub-3940256099942544/2934735716 (Banner)
const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER // 開発環境ではテスト広告を使用
  : 'ca-app-pub-3940256099942544/2934735716'; // TODO: 本番用Ad Unit IDに置き換え

export function AdBanner() {
  const [error, setError] = useState<string | null>(null);

  // エラー時は広告を非表示にしてアプリの動作に影響を与えない
  if (error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          setError(null);
        }}
        onAdFailedToLoad={(error) => {
          console.warn('Ad failed to load:', error);
          setError(error.message);
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
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
