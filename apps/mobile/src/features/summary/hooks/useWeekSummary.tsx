// useTodaySummary.ts
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from '@/features/history';
import { TriggerTagId } from '@/domain/common.types';
import { PRESET_TRIGGER_TAGS } from '@/domain/triggerTag';
import { getInterruptPorts } from '@/features/interrupt/ports';

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
  const { startOfWeek, endOfWeek, weekRangeLabel } = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    
    // 月曜日を週の開始日とする
    const dayOfWeek = d.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const start = new Date(d);
    start.setDate(start.getDate() - daysToMonday);
    
    // 週の終了日（日曜日 23:59:59）
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    // 週の範囲を表示用にフォーマット
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    const weekRangeLabel = `${formatDate(start)}〜${formatDate(end)}`;
    
    return {
      startOfWeek: start.getTime(),
      endOfWeek: end.getTime(),
      weekRangeLabel,
    };
  }, []);

  const { items, loading, error, reload } = useHistory({ limit });
  const [frequentLabel, setFrequentLabel] = useState<string>('-');

  const weekItems = useMemo(
    () => items.filter((it) => {
      const occurred = new Date(it.occurredAt).getTime();
      return occurred >= startOfWeek && occurred <= endOfWeek;
    }),
    [items, startOfWeek, endOfWeek]
  );

  // ... 既存のfrequentTriggerロジック ...

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
