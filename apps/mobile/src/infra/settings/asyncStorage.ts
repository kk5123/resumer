import { AsyncStorageHelpers } from '../_asyncStorage/helpers';
import { Settings, SettingsRepo, defaultSettings } from '@/features/settings';
import { storageKey } from '@/shared/constants/storage';

const STORAGE_KEY = storageKey('settings');

export class AsyncStorageSettingsRepository implements SettingsRepo {
  async load(): Promise<Settings> {
    try {
      const parsed = await AsyncStorageHelpers.loadObject<Partial<Settings>>(STORAGE_KEY);
      if (!parsed) return defaultSettings;
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      console.warn('[AsyncStorageSettingsRepo] failed to load settings', e);
      return defaultSettings;
    }
  }

  async save(next: Settings): Promise<void> {
    try {
      await AsyncStorageHelpers.saveObject(STORAGE_KEY, next);
    } catch (e) {
      console.warn('[AsyncStorageSettingsRepo] failed to save settings', e);
    }
  }
}
