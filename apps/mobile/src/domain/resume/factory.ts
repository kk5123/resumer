import { v7 as uuidv7 } from 'uuid';
import { ISODateTime, ResumeId } from '@/domain/common.types';
import { ResumeEvent, ResumeSource, ResumeStatus } from './types';

export function generateResumeId(): ResumeId {
  return uuidv7() as ResumeId;
}

export function createResumeEvent(params: {
  interruptionId: ResumeEvent['interruptionId'];
  resumedAt?: ISODateTime;
  source?: ResumeSource;
  status?: ResumeStatus;
  snoozeMinutes?: number;
  metadata?: Record<string, unknown>;
}): ResumeEvent {
  const now = new Date().toISOString();
  return {
    id: generateResumeId(),
    interruptionId: params.interruptionId,
    resumedAt: params.resumedAt ?? now,
    source: params.source ?? 'manual',
    status: params.status ?? 'resumed',
    snoozeMinutes: params.snoozeMinutes,
    metadata: params.metadata,
  };
}
