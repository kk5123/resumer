// useTodaySummary.ts
import { useMemo } from 'react';
import { useHistory } from '@/features/history';

export function useTodaySummary(limit = 200) {
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const { items, loading, error, reload } = useHistory({ limit });

  const todayItems = useMemo(
    () => items.filter((it) => new Date(it.occurredAt).getTime() >= startOfToday),
    [items, startOfToday]
  );

  const summary = useMemo(() => {
    const resumed = todayItems.filter((it) => it.resumeStatus === 'resumed').length;
    const abandoned = todayItems.filter((it) => it.resumeStatus === 'abandoned').length;
    const snoozed = todayItems.filter((it) => it.resumeStatus === 'snoozed').length;
    return {
      total: todayItems.length,
      resumed,
      abandoned,
      snoozed,
    };
  }, [todayItems]);

  return { summary, loading, error, reload, items: todayItems };
}
