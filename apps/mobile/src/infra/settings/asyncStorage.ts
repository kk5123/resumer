// infra/settings/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, SettingsRepo, defaultSettings } from '@/features/settings';

const STORAGE_KEY = 'rsm:settings';

export class AsyncStorageSettingsRepository implements SettingsRepo {
  async load(): Promise<Settings> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      console.warn('[AsyncStorageSettingsRepo] failed to load settings', e);
      return defaultSettings;
    }
  }
  
  async save(next: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('[AsyncStorageSettingsRepo] failed to save settings', e);
    }
  }
}
