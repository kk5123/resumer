import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResumeRepo } from '@/domain/resume/repo';
import { ResumeEvent } from '@/domain/resume/types';
import { InterruptionId } from '@/domain/common.types';
import { storageKey } from '@/shared/constants/storage';

const RESUME_EVENT_KEY = (id: string) => storageKey(`resume:event:${id}`);
const RESUME_INDEX_KEY = (interruptionId: string) =>
  storageKey(`resume:index:${interruptionId}`);

export class AsyncStorageResumeRepository implements ResumeRepo {
  async save(event: ResumeEvent): Promise<void> {
    const id = event.id as unknown as string;
    const interruptionId = event.interruptionId as unknown as string;

    const plainEvent: ResumeEvent = {
      id: event.id,
      interruptionId: event.interruptionId,
      resumedAt: event.resumedAt,
      source: event.source,
      status: event.status,
      snoozeMinutes: event.snoozeMinutes,
      // metadataが循環参照を持つ可能性があるため、安全にシリアライズ
      metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : undefined,
    };

    // イベント本体保存
    await AsyncStorage.setItem(RESUME_EVENT_KEY(id), JSON.stringify(plainEvent));

    // 紐づく中断のインデックス更新（重複チェック）
    const index = await this.loadIndex(interruptionId);
    if (!index.includes(id)) {
      index.push(id);
      await this.saveIndex(interruptionId, index);
    }
  }

  async listByInterruptionId(interruptionId: InterruptionId): Promise<ResumeEvent[]> {
    const idStr = interruptionId as unknown as string;
    const index = await this.loadIndex(idStr);
    if (index.length === 0) return [];

    const events = await Promise.all(index.map((id) => this.loadEvent(id)));
    return events.filter((e): e is ResumeEvent => e != null);
  }

  async findLatestByInterruptionId(
    interruptionId: InterruptionId
  ): Promise<ResumeEvent | null> {
    const idStr = interruptionId as unknown as string;
    const index = await this.loadIndex(idStr);
    if (index.length === 0) return null;

    const latestId = index[index.length - 1];
    return this.loadEvent(latestId);
  }

  async deleteAll(): Promise<void> {
    // 各 interruptionId ごとの index を消しつつ、イベント本体を削除
    const keys = await AsyncStorage.getAllKeys();
    const resumeEventKeys = keys.filter((k) => k.startsWith('rsm:resume:event:') || k.startsWith('rsm:resume:index:'));
    if (resumeEventKeys.length) await AsyncStorage.multiRemove(resumeEventKeys);
  }

  /* ========== private helpers ========== */

  private async loadIndex(interruptionId: string): Promise<string[]> {
    const raw = await AsyncStorage.getItem(RESUME_INDEX_KEY(interruptionId));
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  private async saveIndex(interruptionId: string, ids: string[]): Promise<void> {
    await AsyncStorage.setItem(
      RESUME_INDEX_KEY(interruptionId),
      JSON.stringify(ids)
    );
  }

  private async loadEvent(id: string): Promise<ResumeEvent | null> {
    const raw = await AsyncStorage.getItem(RESUME_EVENT_KEY(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ResumeEvent;
    } catch {
      return null;
    }
  }
}