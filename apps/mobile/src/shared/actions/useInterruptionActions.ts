import { useCallback } from 'react';
import { useToast } from '@/shared/components/ToastProvider';
import { InterruptionId } from '@/domain/common.types';
import { createResumeEvent } from '@/domain/resume/factory';
import { getResumePorts } from '@/features/resume/ports';
import { t } from '@/shared/i18n/strings';
import { InterruptionEvent } from '@/domain/interruption';

export function useInterruptionActions() {
  const { showToast } = useToast();
  const { resumeRepo } = getResumePorts();

  const markResumed = useCallback(async (event: InterruptionEvent) => {
    const ev = createResumeEvent({ interruptionId: event.id, status: 'resumed' });
    await resumeRepo.save(ev);
    showToast(t('home.toast.resume'), { type: 'success' });
  }, [resumeRepo, showToast]);

  const markSnoozed = useCallback(async (event: InterruptionEvent, minutes = 5) => {
    const ev = createResumeEvent({
      interruptionId: event.id,
      status: 'snoozed',
      snoozeMinutes: minutes,
    });
    await resumeRepo.save(ev);
    showToast(t('home.toast.snooze'), { type: 'info' });
  }, [resumeRepo, showToast]);

  const markAbandoned = useCallback(async (event: InterruptionEvent) => {
    const ev = createResumeEvent({ interruptionId: event.id, status: 'abandoned' });
    await resumeRepo.save(ev);
    showToast(t('home.toast.abandon'), { type: 'success' });
  }, [resumeRepo, showToast]);

  return { markResumed, markSnoozed, markAbandoned };
}
