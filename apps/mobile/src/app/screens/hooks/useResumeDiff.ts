import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { InterruptionId } from '@/domain/common.types';
import { getResumePorts } from '@/features/resume/ports';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { useQueryState } from '@/shared/hooks/useQueryState';
import { DateHelpers } from '@/shared/utils/date';

/*
 * 現状の仕様では、中断記録時に再開予定を設定しなければ、その後snoozeイベントが積まれることはない(UI導線がないため)
 * ただ、この関数としては中断イベントを先に見に行く
 */
async function loadScheduledAt(interruptionId: InterruptionId | null | undefined): Promise<Date | null> {
  if (!interruptionId) return null;

  const { interruptionRepo } = getInterruptPorts();
  const { resumeRepo } = getResumePorts();

  const latestResumeEvent = await resumeRepo.findLatestByInterruptionId(interruptionId);
  if (latestResumeEvent?.status === 'snoozed') {
    const snoozeMinutes = latestResumeEvent.snoozeMinutes ?? 5;
    return DateHelpers.addMinutes(latestResumeEvent.resumedAt, snoozeMinutes);
  }

  const interruptionEvent = await interruptionRepo.findById(interruptionId);
  return interruptionEvent?.scheduledResumeAt ? new Date(interruptionEvent.scheduledResumeAt) : null;
}

export function useResumeDiff(interruptionId: InterruptionId | null | undefined) {
  const query = useQueryState<Date | null>(
    useCallback(() => loadScheduledAt(interruptionId), [interruptionId]),
    null
  );

  useEffect(() => {
    query.reload();
  }, [query.reload]);

  // 1秒ごとに now を更新して差分計算
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tId);
  }, []);

  const diffMs = useMemo(() => {
    if (!query.data) return null;
    return now - query.data.getTime();
  }, [query.data, now]);

  return {
    data: diffMs,
    loading: query.loading,
    error: query.error,
    reload: query.reload
  };
}
