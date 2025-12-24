// src/infra/interruption/AsyncStorageInterruptionRepository.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  InterruptionEvent,
  InterruptionId,
  InterruptionRepository
} from '@/domain/interruption';

const INTERRUPTION_INDEX_KEY = "interruption:index";

function eventKey(id: string): string {
  return `interruption:event:${id}`;
}

export class AsyncStorageInterruptionRepository
  implements InterruptionRepository {

  /* ========================
   * save
   * ======================== */
  async save(event: InterruptionEvent): Promise<void> {
    const id = event.id as unknown as string;

    // 1. イベント本体保存
    await AsyncStorage.setItem(
      eventKey(id),
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
      eventKey(id),
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
    const raw = await AsyncStorage.getItem(eventKey(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as InterruptionEvent;
    } catch {
      return null;
    }
  }
}
