// features/settings/useSettings.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Settings, defaultSettings, Theme, Language, WeekStart } from '../repo';
import { getSettingsPorts } from '../ports';
import { cancelAllResumeNotifications } from '@/features/notification/services/notificationOrchestorator';

type SettingsContextValue = {
  settings: Settings;
  loaded: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  setAnalyticsOptIn: (v: boolean) => void;
  setTheme: (v: Theme) => void;
  setLanguage: (v: Language | undefined) => void;
  setWeekStart: (v: WeekStart) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const { settingsRepo } = getSettingsPorts();

  useEffect(() => {
    (async () => {
      const loadedSettings = await settingsRepo.load();
      setSettings(loadedSettings);
      setLoaded(true);

      await settingsRepo.save(loadedSettings);
    })();
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      settingsRepo.save(next);

      if (prev.notificationsEnabled && !next.notificationsEnabled) {
        cancelAllResumeNotifications().catch((e) => {
          console.error('[useSettings] failed to cancel all resume notifications', e);
        });
      }

      return next;
    });
  }, []);

  const value: SettingsContextValue = {
    settings,
    loaded,
    setNotificationsEnabled: (v) => update({ notificationsEnabled: v }),
    setAnalyticsOptIn: (v) => update({ analyticsOptIn: v }),
    setTheme: (v) => update({ theme: v }),
    setLanguage: (v) => update({ language: v }),
    setWeekStart: (v) => update({ weekStart: v }),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
