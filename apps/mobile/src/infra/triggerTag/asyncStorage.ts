import { AsyncStorageHelpers } from '../_asyncStorage/helpers';
import { TriggerTagId, ISODateTime } from '@/domain/common.types';
import { CustomTriggerTagRepository, CustomTriggerTag, TriggerTag } from '@/domain/triggerTag';
import { storageKey } from '@/shared/constants/storage';

const CUSTOM_TRIGGER_TAGS_KEY = storageKey('triggerTags:custom');

export class AsyncStorageCustomTriggerTagRepository implements CustomTriggerTagRepository {
  async upsertUsage(tags: TriggerTag[], usedAt: ISODateTime): Promise<void> {
    if (tags.length === 0) return;

    const map = await this.loadAll();
    for (const tag of tags) {
      const key = tag.id as unknown as string;
      const existing = map[key];

      if (existing) {
        map[key] = {
          ...existing,
          lastUsedAt: usedAt,
          usageCount: existing.usageCount + 1,
        };
      } else {
        map[key] = {
          id: tag.id,
          label: tag.label,
          createdAt: usedAt,
          lastUsedAt: usedAt,
          usageCount: 1,
        };
      }
    }

    await this.saveAll(map);
  }

  async listTopUsed(limit: number): Promise<CustomTriggerTag[]> {
    if (limit <= 0) return [];

    const map = await this.loadAll();
    return Object.values(map)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  async findById(id: TriggerTagId): Promise<CustomTriggerTag | null> {
    const map = await this.loadAll();
    return map[id as unknown as string] ?? null;
  }

  async deleteAll(): Promise<void> {
    await this.saveAll({});
  }

  /* ========================
   * private helpers
   * ======================== */

  private loadAll(): Promise<Record<string, CustomTriggerTag>> {
    return AsyncStorageHelpers.loadRecord<CustomTriggerTag>(CUSTOM_TRIGGER_TAGS_KEY);
  }

  private saveAll(map: Record<string, CustomTriggerTag>): Promise<void> {
    return AsyncStorageHelpers.saveRecord(CUSTOM_TRIGGER_TAGS_KEY, map);
  }
}
