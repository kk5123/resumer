// src/infra/interruption/AsyncStorageInterruptionRepository.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storageKey } from "@/shared/constants/storage";
import {
  InterruptionEvent,
  InterruptionRepository,
  HistoryQuery
} from '@/domain/interruption';
import { InterruptionId } from "@/domain/common.types";

const INTERRUPTION_INDEX_KEY = storageKey('interruption:index');
const INTERRUPTION_EVENT_KEY = (id: string) => storageKey(`interruption:event:${id}`);

export class AsyncStorageInterruptionRepository
  implements InterruptionRepository {

  /* ========================
   * save
   * ======================== */
  async save(event: InterruptionEvent): Promise<void> {
    const id = event.id as unknown as string;

    // 1. イベント本体保存
    await AsyncStorage.setItem(
      INTERRUPTION_EVENT_KEY(id),
      JSON.stringify(event)
    );

    // 2. index 更新
    const index = await this.loadIndex();

    if (!index.includes(id)) {
      index.push(id);
      await this.saveIndex(index);
    }
  }

  /* ========================
   * update（saveとほぼ同じ）
   * ======================== */
  async update(event: InterruptionEvent): Promise<void> {
    const id = event.id as unknown as string;

    await AsyncStorage.setItem(
      INTERRUPTION_EVENT_KEY(id),
      JSON.stringify(event)
    );
    // index は触らない（IDは既に存在している前提）
  }

  /* ========================
   * 最新1件取得
   * ======================== */
  async findLatest(): Promise<InterruptionEvent | null> {
    const index = await this.loadIndex();
    if (index.length === 0) return null;

    const latestId = index[index.length - 1];
    return this.loadEvent(latestId);
  }

  /* ========================
   * 最近N件取得（新しい順）
   * ======================== */
  async listRecent(limit: number): Promise<InterruptionEvent[]> {
    const index = await this.loadIndex();
    if (index.length === 0) return [];

    const ids = index.slice(-limit).reverse();

    const events = await Promise.all(
      ids.map((id) => this.loadEvent(id))
    );

    // null除外（壊れたデータ対策）
    return events.filter(
      (e): e is InterruptionEvent => e != null
    );
  }

  async findById(id: InterruptionId): Promise<InterruptionEvent | null> {
    return this.loadEvent(id);
  }

  async listByPeriod(params: HistoryQuery): Promise<InterruptionEvent[]> {
    const { from, to, limit = 50 } = params;
    const fromMs = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
    const toMs = to ? new Date(to).getTime() : Number.POSITIVE_INFINITY;
    if (Number.isNaN(fromMs) || Number.isNaN(toMs) || fromMs > toMs) return [];

    const index = await this.loadIndex();
    if (index.length === 0) return [];

    const events: InterruptionEvent[] = [];

    for (let i = index.length - 1; i >= 0; --i) {
      const ev = await this.loadEvent(index[i]);
      if (!ev) continue;

      const recordedMs = new Date(ev.recordedAt).getTime();
      if (Number.isNaN(recordedMs)) continue;
      if (recordedMs > toMs) continue;
      if (recordedMs < fromMs) break;

      events.push(ev);
      if (events.length >= limit) break;
    }

    return events;
  }

  async deleteAll(): Promise<void> {
    const index = await this.loadIndex();
    await Promise.all(index.map((id) => AsyncStorage.removeItem(INTERRUPTION_EVENT_KEY(id))));
    await AsyncStorage.removeItem(INTERRUPTION_INDEX_KEY);
  }

  /* ========================
   * private helpers
   * ======================== */

  private async loadIndex(): Promise<string[]> {
    const raw = await AsyncStorage.getItem(INTERRUPTION_INDEX_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  private async saveIndex(ids: string[]): Promise<void> {
    await AsyncStorage.setItem(
      INTERRUPTION_INDEX_KEY,
      JSON.stringify(ids)
    );
  }

  private async loadEvent(
    id: string
  ): Promise<InterruptionEvent | null> {
    const raw = await AsyncStorage.getItem(INTERRUPTION_EVENT_KEY(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as InterruptionEvent;
    } catch {
      return null;
    }
  }
}
