import { useCallback } from 'react';
import { useToast } from '@/shared/components/ToastProvider';
import { createResumeEvent } from '@/domain/resume/factory';
import { getResumePorts } from '../ports';
import { t } from '@/shared/i18n/strings';
import { InterruptionEvent } from '@/domain/interruption';
import { cancelResumeNotification, upsertResumeNotification } from '@/features/notification';

/**
 * 中断イベントに紐づく再開/スヌーズ/放棄アクションを提供するフック
 */
export function useResumeActions(event: InterruptionEvent | null, onDone?: () => void) {
  const { showToast } = useToast();
  const { resumeRepo } = getResumePorts();

  const markResumed = useCallback(async () => {
    if (!event) return;
    const ev = createResumeEvent({ interruptionId: event.id, status: 'resumed' });
    await resumeRepo.save(ev);
    await cancelResumeNotification({ interruptionId: event.id });
    showToast(t('home.toast.resume'), { type: 'success' });

    onDone?.();
  },
    [event?.id, resumeRepo, showToast],
  );

  const markSnoozed = useCallback(async () => {
    if (!event) return;
    const ev = createResumeEvent({ interruptionId: event.id, status: 'snoozed', snoozeMinutes: 5 });
    await resumeRepo.save(ev);

    await upsertResumeNotification({
      interruptionId: event.id,
      triggerDate: new Date(Date.now() + 5 * 60_000),
    });

    showToast(t('home.toast.snooze'), { type: 'info' });
    onDone?.();
  }, [event?.id, resumeRepo, showToast]);

  const markAbandoned = useCallback(async () => {
    if (!event) return;
    const ev = createResumeEvent({ interruptionId: event.id, status: 'abandoned' });
    await resumeRepo.save(ev);

    await cancelResumeNotification({ interruptionId: event.id });

    showToast(t('home.toast.abandon'), { type: 'success' });
    onDone?.();
  }, [event?.id, resumeRepo, showToast]);

  return { markResumed, markSnoozed, markAbandoned };
}
