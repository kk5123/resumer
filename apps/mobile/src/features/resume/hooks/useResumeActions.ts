import { useCallback } from 'react';
import { useToast } from '@/shared/components/ToastProvider';
import { createResumeEvent } from '@/domain/resume/factory';
import { getResumePorts } from '../ports';
import { t } from '@/shared/i18n/strings';
import { InterruptionEvent } from '@/domain/interruption';

/**
 * 中断イベントに紐づく再開/スヌーズ/放棄アクションを提供するフック
 */
export function useResumeActions(event: InterruptionEvent | null) {
  const { showToast } = useToast();
  const { resumeRepo } = getResumePorts();

  const markResumed = useCallback(async () => {
      if (!event) return;
      const ev = createResumeEvent({ interruptionId: event.id, status: 'resumed' });
      await resumeRepo.save(ev);
      showToast(t('home.toast.resume'), { type: 'success' });
    },
    [event?.id, resumeRepo, showToast],
  );

  const markSnoozed = useCallback(async (minutes = 5) => {
      if (!event) return;
      const ev = createResumeEvent({
        interruptionId: event.id,
        status: 'snoozed',
        snoozeMinutes: minutes,
      });
      await resumeRepo.save(ev);
      showToast(t('home.toast.snooze'), { type: 'info' });
    },
    [event?.id, resumeRepo, showToast],
  );

  const markAbandoned = useCallback(async () => {
      if (!event) return;
      const ev = createResumeEvent({ interruptionId: event.id, status: 'abandoned' });
      await resumeRepo.save(ev);
      showToast(t('home.toast.abandon'), { type: 'success' });
    },
    [event?.id, resumeRepo, showToast],
  );

  return { markResumed, markSnoozed, markAbandoned };
}
