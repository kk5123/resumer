import { useMemo, useState } from 'react';
import { useHistory } from '@/features/history';
import { TriggerTagId } from '@/domain/common.types';
import { PRESET_TRIGGER_TAGS } from '@/domain/triggerTag';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useAsyncEffect } from '@/shared/hooks';
import { DateHelpers } from '@/shared/utils/date';

export type FrequentTrigger = { tagId: TriggerTagId; count: number };

async function labelFor(id: TriggerTagId): Promise<string> {
  const preset = PRESET_TRIGGER_TAGS.find(t => t.id === id);
  if (preset) return preset.label;

  const { customTriggerTagRepo } = getInterruptPorts();
  const tag = await customTriggerTagRepo.findById(id);
  if (!tag) {
    throw new Error('');
  }

  return tag.label;
}

export function useWeekSummary(limit = 200) {
  const { settings } = useSettings();
  const { data: items, loading, error, reload } = useHistory({ limit });
  const [frequentLabel, setFrequentLabel] = useState<string>('-');

  // 週の範囲とラベルを計算
  const { weekRange, weekRangeLabel } = useMemo(() => {
    const { start, end } = DateHelpers.getWeekRange(new Date(), settings.weekStart);
    const today = DateHelpers.startOfDay();
    
    // 終了日が今日を超えている場合は今日までに制限
    const displayEnd = end > today ? today : end;
    
    const weekRangeLabel = `${DateHelpers.formatWithWeekday(start)}〜${DateHelpers.formatWithWeekday(displayEnd)}`;
    
    return {
      weekRange: { start, end },
      weekRangeLabel,
    };
  }, [settings.weekStart]);

  // 最新1件がオープンかどうかを判定
  const latestOpenItem = useMemo(() => {
    if (items.length === 0) return null;
    const latest = items[0];
    const isOpen = latest.resumeStatus !== 'abandoned' && latest.resumeStatus !== 'resumed';
    return isOpen ? latest : null;
  }, [items]);

  // 週の範囲内のアイテムをフィルタリング
  const weekItems = useMemo(() => {
    const filtered = items.filter((it) => {
      const occurred = new Date(it.occurredAt).getTime();
      return occurred >= weekRange.start.getTime() && occurred <= weekRange.end.getTime();
    });

    // 最新1件がオープンで、かつ週の範囲内にある場合は除外
    if (latestOpenItem && filtered.length > 0) {
      const latestInWeek = filtered[0];
      if (latestInWeek.id === latestOpenItem.id) {
        return filtered.slice(1);
      }
    }

    return filtered;
  }, [items, weekRange, latestOpenItem]);

  // 最も頻繁に使われたトリガータグを計算
  const frequentTrigger = useMemo<FrequentTrigger | null>(() => {
    const stats = new Map<string, { count: number; lastUsedAt: number }>();

    for (const it of weekItems) {
      const lastUsedAt = new Date(it.occurredAt).getTime();
      (it.context.triggerTagIds ?? []).forEach((tagId) => {
        const key = tagId as string;
        const prev = stats.get(key);
        if (!prev) {
          stats.set(key, { count: 1, lastUsedAt });
        } else {
          stats.set(key, {
            count: prev.count + 1,
            lastUsedAt: Math.max(prev.lastUsedAt, lastUsedAt),
          });
        }
      });
    }

    if (stats.size === 0) return null;

    const best = Array.from(stats.entries())
      .map(([tagId, v]) => ({ tagId: tagId as TriggerTagId, count: v.count, lastUsedAt: v.lastUsedAt }))
      .sort((a, b) => (b.count !== a.count ? b.count - a.count : b.lastUsedAt - a.lastUsedAt))[0];

    return { tagId: best.tagId, count: best.count };
  }, [weekItems]);

  // frequentTriggerからラベルを取得
  useAsyncEffect(async () => {
    if (!frequentTrigger) {
      setFrequentLabel('-');
      return;
    }
    const label = await labelFor(frequentTrigger.tagId as TriggerTagId);
    setFrequentLabel(`${label}     ${frequentTrigger.count}`);
  }, [frequentTrigger]);

  const summary = useMemo(() => {
    const resumed = weekItems.filter((it) => it.resumeStatus === 'resumed').length;
    const abandoned = weekItems.filter((it) => it.resumeStatus === 'abandoned').length;
    const snoozed = weekItems.filter((it) => it.resumeStatus === 'snoozed').length;
    return {
      total: weekItems.length,
      resumed,
      abandoned,
      snoozed,
      frequentTrigger: frequentLabel,
    };
  }, [weekItems, frequentLabel]);

  return {
    summary,
    loading,
    error,
    reload,
    items: weekItems,
    weekRangeLabel,
  };
}
