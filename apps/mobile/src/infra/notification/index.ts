import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterruptionId } from '@/domain/common.types';
import { NotificationBindingRepo } from '@/features/notification/repo';

const STORAGE_KEY = 'rsm:notificationBindings'; // Record<interruptionId, notificationId>

type BindingMap = Record<string, string>;

async function loadAll(): Promise<BindingMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as BindingMap;
  } catch {
    return {};
  }
}

async function saveAll(map: BindingMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export class AsyncStorageNotificationBindingRepo implements NotificationBindingRepo {
  async save(interruptionId: InterruptionId, notificationId: string | null): Promise<void> {
    const map = await loadAll();
    if (notificationId) {
      map[interruptionId as unknown as string] = notificationId;
    } else {
      delete map[interruptionId as unknown as string];
    }
    await saveAll(map);
  }

  async find(interruptionId: InterruptionId): Promise<string | null> {
    const map = await loadAll();
    return map[interruptionId as unknown as string] ?? null;
  }

  async delete(interruptionId: InterruptionId): Promise<void> {
    const map = await loadAll();
    delete map[interruptionId as unknown as string];
    await saveAll(map);
  }
}