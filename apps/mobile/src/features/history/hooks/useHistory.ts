import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { getResumePorts } from '@/features/resume/ports';
import { formatLocalShort } from '@/shared/utils/date';
import { HistoryItem } from '../types';

type Options = { limit?: number };

export function useHistory(options: Options = {}) {
  const { limit = 50 } = options;
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const { interruptionRepo } = getInterruptPorts();
  const { resumeRepo } = getResumePorts();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await interruptionRepo.listRecent(limit);
      const resolved = await Promise.all(
        events.map(async (ev) => {
          const latestResume = await resumeRepo.findLatestByInterruptionId(ev.id);
          const scheduled =
            ev.context.returnAfterMinutes != null
              ? new Date(
                  new Date(ev.occurredAt).getTime() + ev.context.returnAfterMinutes * 60_000
                ).toISOString()
              : null;
          return {
            ...ev,
            occurredLocal: formatLocalShort(ev.occurredAt),
            scheduledLocal: scheduled ? formatLocalShort(scheduled) : null,
            resumeStatus: latestResume?.status,
          };
        })
      );
      setItems(resolved);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [interruptionRepo, resumeRepo, limit]);

  // 初回ロード
  useEffect(() => { reload(); }, [reload]);

  // 画面フォーカス時に再ロード
  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {};
    }, [reload])
  );

  return { items, loading, error };
}
