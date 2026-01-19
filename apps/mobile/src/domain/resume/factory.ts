import { v7 as uuidv7 } from 'uuid';
import { ISODateTime, ResumeId } from '@/domain/common.types';
import { ResumeEvent, ResumeSource, ResumeStatus } from './types';

export function generateResumeId(): ResumeId {
  return uuidv7() as ResumeId;
}

export function createResumeEvent(params: {
  interruptionId: ResumeEvent['interruptionId'];
  status: ResumeStatus;
  source?: ResumeSource;
  snoozeMinutes?: number;
  metadata?: Record<string, unknown>;
}): ResumeEvent {
  const now = new Date().toISOString();
  return {
    id: generateResumeId(),
    interruptionId: params.interruptionId,
    resumedAt: now,
    source: 'manual',
    status: params.status,
    snoozeMinutes: params.snoozeMinutes,
    metadata: params.metadata,
  };
}
