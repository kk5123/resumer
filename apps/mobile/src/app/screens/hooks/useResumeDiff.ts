import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { InterruptionId } from '@/domain/common.types';
import { getResumePorts } from '@/features/resume/ports';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { useAsyncEffect } from '@/shared/hooks';

export function useResumeDiff(
  interruptionId: InterruptionId | null | undefined
) {
  const [now, setNow] = useState(() => Date.now());
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  useEffect(() => {
    const tId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tId);
  }, []);

  const updateScheduledAt = useCallback(async () => {
    if (!interruptionId) {
      setScheduledAt(null);
      return;
    }

    try {
      const { resumeRepo } = getResumePorts();
      const latestResumeEvent = await resumeRepo.findLatestByInterruptionId(interruptionId);
      if (latestResumeEvent?.status === 'snoozed') {
        const snoozeMinutes = latestResumeEvent.snoozeMinutes ?? 5;

        const resumedAtTime = new Date(latestResumeEvent.resumedAt).getTime();
        const snoozeMs = snoozeMinutes * 60 * 1000 - 1;
        const effectiveScheduledAt = new Date(resumedAtTime + snoozeMs);
        if (Number.isNaN(effectiveScheduledAt.getTime())) {
          return null;
        }

        setScheduledAt(effectiveScheduledAt);
      }
    } catch (e) {
      console.error('[useResumeDiff] failed to reload resume event', e);
    }
  }, [interruptionId]);

  // 初回のみInterruptionEventを取得
  useAsyncEffect(async () => {
    if (!interruptionId) {
      setScheduledAt(null);
      return;
    }
    try {
      const { interruptionRepo } = getInterruptPorts();
      const interruptionEvent = await interruptionRepo.findById(interruptionId);
      setScheduledAt(interruptionEvent?.scheduledResumeAt
        ? new Date(interruptionEvent.scheduledResumeAt)
        : null);
      updateScheduledAt();
    } catch (e) {
      console.error('[useResumeDiff] failed to load interruption event', e);
      setScheduledAt(null);
    }
  }, [interruptionId, updateScheduledAt]);

  const diffMs = useMemo(() => {
    if (!scheduledAt) {
      return null;
    }

    return now - scheduledAt.getTime();
  }, [scheduledAt, now]);

  return { diffMs, reload: updateScheduledAt };
}
