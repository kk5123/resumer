import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const KEY = 'rsm:tutorialSeen';

export function useTutorialGate() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem(KEY);
      if (!seen) setShowTutorial(true);
      setReady(true);
    })();
  }, []);

  const complete = async () => {
    await AsyncStorage.setItem(KEY, 'true');
    setShowTutorial(false);
  };

  return { ready, showTutorial, complete };
}
