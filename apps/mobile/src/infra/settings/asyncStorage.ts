import { AsyncStorageHelpers } from '../_asyncStorage/helpers';
import { Settings, SettingsRepo, defaultSettings } from '@/features/settings';
import { STORAGE_KEY } from '@/shared/constants/storage';

export class AsyncStorageSettingsRepository implements SettingsRepo {
  async load(): Promise<Settings> {
    try {
      const parsed = await AsyncStorageHelpers.loadObject<Partial<Settings>>(STORAGE_KEY.settings);
      if (!parsed) return defaultSettings;
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      console.warn('[AsyncStorageSettingsRepo] failed to load settings', e);
      return defaultSettings;
    }
  }

  async save(next: Settings): Promise<void> {
    try {
      await AsyncStorageHelpers.saveObject(STORAGE_KEY.settings, next);
    } catch (e) {
      console.warn('[AsyncStorageSettingsRepo] failed to save settings', e);
    }
  }
}
