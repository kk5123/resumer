import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterruptionId } from '@/domain/common.types';
import { NotificationBindingRepo } from '@/features/notification/repo';
import { NotificationId } from '@/features/notification/types';
import { storageKey } from '@/shared/constants/storage';

const STORAGE_KEY = storageKey('notificationBindings'); // Record<string, string>

type RawMap = Record<string, string>;

async function loadAll(): Promise<RawMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as RawMap;
  } catch {
    return {};
  }
}

async function saveAll(map: RawMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export class AsyncStorageNotificationBindingRepo implements NotificationBindingRepo {
  async save(interruptionId: InterruptionId, notificationId: NotificationId): Promise<void> {
    const map = await loadAll();
    map[interruptionId as unknown as string] = notificationId as unknown as string;
    await saveAll(map);
  }

  async find(interruptionId: InterruptionId): Promise<NotificationId | null> {
    const map = await loadAll();
    const raw = map[interruptionId as unknown as string];
    return raw ? (raw as unknown as NotificationId) : null;
  }

  async delete(interruptionId: InterruptionId): Promise<void> {
    const map = await loadAll();
    delete map[interruptionId as unknown as string];
    await saveAll(map);
  }

  async deleteAll(): Promise<void> {
    await saveAll({});
  }
}
