import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import { useEffect, useState } from 'react';
import { bootstrap } from './lifecycle/bootstrap';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { SettingsProvider } from '@/features/settings';

import { DebugPanel } from './debug/DebugPanel';
import { useTutorialGate, TutorialModal } from '@/features/tutorial';

export default function Root() {
  const [ready, setReady] = useState(false);
  const { ready: tutorialReady, showTutorial, complete } = useTutorialGate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      await bootstrap();
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; }
  }, []);

  if (!ready || !tutorialReady) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style='dark' />
      <SettingsProvider>
        <ToastProvider>
          <RootNavigator />
          {showTutorial && (
            <TutorialModal visible={showTutorial} onComplete={complete} />
          )}
          <DebugPanel
            title='Storage Dump'
            appKeyPrefix='rsm:'
            hidden={!__DEV__}
          />
        </ToastProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
