// useTodaySummary.ts
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from '@/features/history';
import { TriggerTagId } from '@/domain/common.types';
import { PRESET_TRIGGER_TAGS } from '@/domain/triggerTag';
import { getInterruptPorts } from '@/features/interrupt/ports';
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

export function useTodaySummary(limit = 200) {
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const { items, loading, error, reload } = useHistory({ limit });
  const [frequentLabel, setFrequentLabel] = useState<string>('-');

  const todayItems = useMemo(
    () => items.filter((it) => new Date(it.occurredAt).getTime() >= startOfToday),
    [items, startOfToday]
  );

  const frequentTrigger = useMemo<FrequentTrigger | null>(() => {
    const stats = new Map<string, { count: number; lastUsedAt: number }>();
  
    for (const it of todayItems) {
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
  }, [todayItems]);

  useAsyncEffect(async () => {
    if (!frequentTrigger) {
      setFrequentLabel('-');
      return;
    }
    const label = await labelFor(frequentTrigger.tagId as TriggerTagId);
    setFrequentLabel(`${label}     ${frequentTrigger.count}`);
  }, [frequentTrigger]);

  const summary = useMemo(() => {
    const resumed = todayItems.filter((it) => it.resumeStatus === 'resumed').length;
    const abandoned = todayItems.filter((it) => it.resumeStatus === 'abandoned').length;
    const snoozed = todayItems.filter((it) => it.resumeStatus === 'snoozed').length;
    return {
      total: todayItems.length,
      resumed,
      abandoned,
      snoozed,
      frequentTrigger: frequentLabel,
    };
  }, [todayItems, frequentLabel]);

  return { summary, loading, error, reload, items: todayItems };
}
