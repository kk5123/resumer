import { AsyncStorageHelpers } from '../_asyncStorage/helpers';
import { InterruptionId } from '@/domain/common.types';
import { NotificationBindingRepo } from '@/features/notification/repo';
import { NotificationId } from '@/features/notification/types';
import { STORAGE_KEY } from '@/shared/constants/storage';

async function loadMap() {
  return AsyncStorageHelpers.loadRecord<string>(STORAGE_KEY.notificationBindings);
}

async function saveMap(map: Record<string, string>) {
  await AsyncStorageHelpers.saveRecord(STORAGE_KEY.notificationBindings, map);
}

export class AsyncStorageNotificationBindingRepo implements NotificationBindingRepo {
  async save(interruptionId: InterruptionId, notificationId: NotificationId): Promise<void> {
    const map = await loadMap();
    map[interruptionId as string] = notificationId as string;
    await saveMap(map);
  }

  async find(interruptionId: InterruptionId): Promise<NotificationId | null> {
    const map = await loadMap();
    const raw = map[interruptionId as string];
    return raw ? (raw as NotificationId) : null;
  }

  async delete(interruptionId: InterruptionId): Promise<void> {
    const map = await loadMap();
    delete map[interruptionId as string];
    await saveMap(map);
  }

  async deleteAll(): Promise<void> {
    await saveMap({});
  }

  async listAll(): Promise<NotificationId[]> {
    const map = await loadMap();
    return Object.values(map) as NotificationId[];
  }
}
