import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import { useEffect, useState } from 'react';
import { bootstrap } from './lifecycle/bootstrap';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { SettingsProvider } from '@/features/settings';

import { DebugPanel } from './debug/DebugPanel';
import { useTutorialGate, TutorialModal } from '@/features/tutorial';
import { STORAGE_KEY_PREFIX } from '@/shared/constants/storage';

import { useAsyncEffect } from '@/shared/hooks';
import { AdBanner } from '@/shared/components/AdBanner';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BANNER_HEIGHT = 50;

export default function Root() {
  const [ready, setReady] = useState(false);
  const { ready: tutorialReady, showTutorial, complete } = useTutorialGate();

  useAsyncEffect(async () => {
    await bootstrap();
    setReady(true);
  }, []);

  if (!ready || !tutorialReady) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style='dark' />
      <SettingsProvider>
        <ToastProvider>
          <View style={[styles.container, { paddingBottom: BANNER_HEIGHT }]}>
            <RootNavigator />
          </View>
          <AdBannerWrapper />
          {showTutorial && (
            <TutorialModal visible={showTutorial} onComplete={complete} />
          )}
          <DebugPanel
            title='Storage Dump'
            appKeyPrefix={STORAGE_KEY_PREFIX}
            hidden={!__DEV__}
          />
        </ToastProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function AdBannerWrapper() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.adBannerContainer, { paddingBottom: insets.bottom }]}>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adBannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f7f9fc',
  },
});
