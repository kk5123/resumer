import AsyncStorage from '@react-native-async-storage/async-storage';
import { TriggerTagId, ISODateTime } from '@/domain/common.types';
import { CustomTriggerTagRepository, CustomTriggerTag, TriggerTag } from '@/domain/triggerTag';

const CUSTOM_TRIGGER_TAGS_KEY = 'rsm:triggerTags:custom';

/**
 * AsyncStorage 実装:
 * - 1キーに JSON で `Record<string, CustomTriggerTag>` を保存
 * - key は TriggerTagId の中身 (string) をそのまま使う
 */
export class AsyncStorageCustomTriggerTagRepository
  implements CustomTriggerTagRepository
{
  public async upsertUsage(
    tags: TriggerTag[],
    usedAt: ISODateTime
  ): Promise<void> {
    if (tags.length === 0) return;

    const map = await this.loadAll();
    const usedTime = usedAt;

    for (const tag of tags) {
      const key = tag.id as unknown as string;
      const existing = map[key];

      if (existing) {
        map[key] = {
          ...existing,
          lastUsedAt: usedTime,
          usageCount: existing.usageCount + 1,
        };
      } else {
        const nowTag: CustomTriggerTag = {
          id: tag.id,
          label: tag.label,
          createdAt: usedTime,
          lastUsedAt: usedTime,
          usageCount: 1,
        };
        map[key] = nowTag;
      }
    }

    await this.saveAll(map);
  }

  public async listTopUsed(limit: number): Promise<CustomTriggerTag[]> {
    if (limit <= 0) return [];

    const map = await this.loadAll();
    const all = Object.values(map);

    return all
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  public async findById(id: TriggerTagId): Promise<CustomTriggerTag | null> {
    const map = await this.loadAll();
    const hit = map[id as unknown as string];
    return hit ?? null;
  }

  public async deleteAll(): Promise<void> {
    this.saveAll({});
  }

  /* ========================
   * private helpers
   * ======================== */

  private async loadAll(): Promise<Record<string, CustomTriggerTag>> {
    const raw = await AsyncStorage.getItem(CUSTOM_TRIGGER_TAGS_KEY);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as Record<string, CustomTriggerTag>;
      // ここで必要なら schema チェックや補正をしてもよい
      return parsed;
    } catch {
      // 破損していたら、ひとまず空として扱う
      return {};
    }
  }

  private async saveAll(
    map: Record<string, CustomTriggerTag>
  ): Promise<void> {
    const json = JSON.stringify(map);
    await AsyncStorage.setItem(CUSTOM_TRIGGER_TAGS_KEY, json);
  }
}
