// useTodaySummary.ts
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from '@/features/history';
import { TriggerTagId } from '@/domain/common.types';
import { PRESET_TRIGGER_TAGS } from '@/domain/triggerTag';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useAsyncEffect } from '@/shared/hooks';

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

// useWeekSummary.ts
export function useWeekSummary(limit = 200) {
  const { settings } = useSettings(); // 追加
  const weekStart = settings.weekStart; // 追加

  const { startOfWeek, endOfWeek, weekRangeLabel } = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const today = new Date(d);
    
    // 設定に応じて週の開始日を決定
    const dayOfWeek = d.getDay();
    let daysToStart: number;
    
    if (weekStart === 'monday') {
      daysToStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    } else {
      daysToStart = dayOfWeek;
    }
    
    const start = new Date(d);
    start.setDate(start.getDate() - daysToStart);
    
    // 週の終了日（開始日から6日後 23:59:59）
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    // 終了日が今日を超えている場合は今日までに制限
    const displayEnd = end > today ? today : end;
    
    // 週の範囲を表示用にフォーマット（曜日を含む）
    const formatDateWithWeekday = (date: Date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(date);
      return `${month}/${day}(${weekday})`;
    };
    
    // 終了日が今日の場合、特別な表示を追加
    const endLabel = displayEnd.getTime() === today.getTime() 
      ? formatDateWithWeekday(displayEnd)
      : formatDateWithWeekday(displayEnd);
    
    const weekRangeLabel = `${formatDateWithWeekday(start)}〜${endLabel}`;
    
    return {
      startOfWeek: start.getTime(),
      endOfWeek: end.getTime(), // フィルタリング用は元の週の終了日を保持
      weekRangeLabel,
    };
  }, [weekStart]);

  const { items, loading, error, reload } = useHistory({ limit });
  const [frequentLabel, setFrequentLabel] = useState<string>('-');

  // 最新1件がオープンかどうかを判定
  const latestOpenItem = useMemo(() => {
    if (items.length === 0) return null;
    const latest = items[0];
    const isOpen = latest.resumeStatus !== 'abandoned' && latest.resumeStatus !== 'resumed';
    return isOpen ? latest : null;
  }, [items]);

  const weekItems = useMemo(
    () => {
      const filtered = items.filter((it) => {
        const occurred = new Date(it.occurredAt).getTime();
        return occurred >= startOfWeek && occurred <= endOfWeek;
      });

      // 最新1件がオープンで、かつ週の範囲内にある場合は除外
      if (latestOpenItem && filtered.length > 0) {
        const latestInWeek = filtered[0];
        if (latestInWeek.id === latestOpenItem.id) {
          return filtered.slice(1);
        }
      }

      return filtered;
    },
    [items, startOfWeek, endOfWeek, latestOpenItem]
  );

  // frequentTriggerの計算ロジックを追加
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
    weekRangeLabel, // 追加
  };
}