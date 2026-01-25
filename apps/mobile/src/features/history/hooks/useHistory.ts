import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { getResumePorts } from '@/features/resume/ports';
import { formatLocalShort } from '@/shared/utils/date';
import { HistoryItem } from '../types';
import { DateHelpers } from '@/shared/utils/date';
import { DateRange } from '@/domain/common.types';
import { useQueryState } from '@/shared/hooks/useQueryState';

type Query = DateRange & { limit?: number };

export function useHistory({ from, to, limit = 50}: Query = {}) {
  const { interruptionRepo } = getInterruptPorts();
  const { resumeRepo } = getResumePorts();

  const loader = useMemo(() => {
    return async() : Promise<HistoryItem[]> => {
      const events = await interruptionRepo.listByPeriod(
        { from: from?.toISOString(), to: to?.toISOString(), limit }
      );
      const resolved = await Promise.all(
        events.map(async (ev) => {
          const latestResume = await resumeRepo.findLatestByInterruptionId(ev.id);
          const scheduled =
            ev.context.returnAfterMinutes != null
              ? DateHelpers.addMinutes(ev.occurredAt, ev.context.returnAfterMinutes).toISOString()
              : null;
          return {
            ...ev,
            occurredLocal: formatLocalShort(ev.occurredAt),
            scheduledLocal: scheduled ? formatLocalShort(scheduled) : null,
            resumeStatus: latestResume?.status,
          };
        })
      );

      return resolved;
    };
  }, [from, to, limit]);

  const query = useQueryState<HistoryItem[]>(loader, []);

  useEffect(() => {
    query.reload();
  }, [loader]);

  return query;
}
