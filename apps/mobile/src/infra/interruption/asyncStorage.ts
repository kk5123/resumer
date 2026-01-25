import { InterruptionId } from '@/domain/common.types';
import { InterruptionEvent, InterruptionRepository, HistoryQuery } from '@/domain/interruption';

import { IndexManager } from '../_asyncStorage/IndexManager';
import { STORAGE_KEY } from '@/shared/constants/storage';

export class AsyncStorageInterruptionRepository implements InterruptionRepository {
  private indexManager = new IndexManager(
    STORAGE_KEY.interruptionIndex,
    STORAGE_KEY.interruptionEvent);

  /* ========================
   * save
   * ======================== */
  async save(event: InterruptionEvent): Promise<void> {
    const id = event.id as string;
    await this.indexManager.saveEntity(id, event);
    await this.indexManager.addToIndex(id);
  }

  /* ========================
   * update（saveとほぼ同じ）
   * ======================== */
  async update(event: InterruptionEvent): Promise<void> {
    const id = event.id as string;
    await this.indexManager.saveEntity(id, event);
  }

  /* ========================
   * 最新1件取得
   * ======================== */
  async findLatest(): Promise<InterruptionEvent | null> {
    const index = await this.indexManager.loadIndex();
    if (index.length === 0) return null;

    const latestId = index[index.length - 1];
    return this.indexManager.loadEntity<InterruptionEvent>(latestId);
  }

  /* ========================
   * 最近N件取得（新しい順）
   * ======================== */
  async listRecent(limit: number): Promise<InterruptionEvent[]> {
    const index = await this.indexManager.loadIndex();;
    if (index.length === 0) return [];

    const ids = index.slice(-limit).reverse();

    const events = await Promise.all(
      ids.map((id) => this.indexManager.loadEntity<InterruptionEvent>(id)));

    // null除外（壊れたデータ対策）
    return events.filter(
      (e): e is InterruptionEvent => e != null
    );
  }

  async findById(id: InterruptionId): Promise<InterruptionEvent | null> {
    return this.indexManager.loadEntity<InterruptionEvent>(id as string);
  }

  async listByPeriod(params: HistoryQuery): Promise<InterruptionEvent[]> {
    const { from, to, limit = 50 } = params;
    const fromMs = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
    const toMs = to ? new Date(to).getTime() : Number.POSITIVE_INFINITY;
    if (Number.isNaN(fromMs) || Number.isNaN(toMs) || fromMs > toMs) return [];

    const index = await this.indexManager.loadIndex();
    if (index.length === 0) return [];

    const events: InterruptionEvent[] = [];

    for (let i = index.length - 1; i >= 0; --i) {
      const ev = await this.indexManager.loadEntity<InterruptionEvent>(index[i]);
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
    const index = await this.indexManager.loadIndex();
    await Promise.all(index.map((id) => this.indexManager.deleteEntity(id)));
    await this.indexManager.saveIndex([]);
  }
}
