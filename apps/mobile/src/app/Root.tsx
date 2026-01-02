import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import { useEffect, useState } from 'react';
import { bootstrap } from './lifecycle/bootstrap';

import { DebugPanel } from './debug/DebugPanel';

export default function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await bootstrap();
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; }
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
      <DebugPanel
        title="Storage Dump"
        appKeyPrefix="rsm:"
        hidden={!__DEV__}
      />
    </SafeAreaProvider>
  );
}
