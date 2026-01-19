import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { STORAGE_KEY } from '@/shared/constants/storage';

export function useTutorialGate() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem(STORAGE_KEY.tutorialSeen);
      if (!seen) setShowTutorial(true);
      setReady(true);
    })();
  }, []);

  const complete = async () => {
    await AsyncStorage.setItem(STORAGE_KEY.tutorialSeen, 'true');
    setShowTutorial(false);
  };

  return { ready, showTutorial, complete };
}
