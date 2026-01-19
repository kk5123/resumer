import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResumeRepo } from '@/domain/resume/repo';
import { ResumeEvent } from '@/domain/resume/types';
import { InterruptionId } from '@/domain/common.types';
import { storageKey } from '@/shared/constants/storage';
import { IndexManager } from '../_asyncStorage/IndexManager';

const RESUME_EVENT_PREFIX = storageKey('resume:event');
const RESUME_INDEX_PREFIX = storageKey('resume:index');

export class AsyncStorageResumeRepository implements ResumeRepo {
  private indexManager = new IndexManager(RESUME_INDEX_PREFIX, RESUME_EVENT_PREFIX);

  async save(event: ResumeEvent): Promise<void> {
    const id = event.id as string;
    const interruptionId = event.interruptionId as string;

    await this.indexManager.saveEntity(id, event);
    await this.indexManager.addToIndex(id, interruptionId);
  }

  async listByInterruptionId(interruptionId: InterruptionId): Promise<ResumeEvent[]> {
    const id = interruptionId as string;
    const index = await this.indexManager.loadIndex(id);
    if (index.length === 0) return [];

    const events = await Promise.all(
      index.map((id) => this.indexManager.loadEntity<ResumeEvent>(id))
    );
    return events.filter((e): e is ResumeEvent => e != null);
  }

  async findLatestByInterruptionId(interruptionId: InterruptionId): Promise<ResumeEvent | null> {
    const id = interruptionId as string;
    const index = await this.indexManager.loadIndex(id);
    if (index.length === 0) return null;

    const latestId = index[index.length - 1];
    return this.indexManager.loadEntity<ResumeEvent>(latestId);
  }

  async deleteAll(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const keys = allKeys.filter(
      (k) => k.startsWith(`${RESUME_EVENT_PREFIX}:`) || k.startsWith(`${RESUME_INDEX_PREFIX}:`)
    );
    if (keys.length) await AsyncStorage.multiRemove(keys);
  }
}
