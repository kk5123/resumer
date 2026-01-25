import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage操作の共通ヘルパー
 * AsyncStorage実装専用（将来的にSQLite3に移行する際は別実装が必要）
 */
export const AsyncStorageHelpers = {
  async loadArray<T>(key: string): Promise<T[]> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  },
  
  async saveArray<T>(key: string, items: T[]): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  },
  
  async loadObject<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  
  async saveObject<T>(key: string, obj: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(obj));
  },
  
  async loadRecord<T>(key: string): Promise<Record<string, T>> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, T>;
    } catch {
      return {};
    }
  },
  
  async saveRecord<T>(key: string, record: Record<string, T>): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(record));
  },
};
