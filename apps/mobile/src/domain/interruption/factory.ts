import { v7 as uuidv7 } from 'uuid';
import { ISODateTime, InterruptionId } from '../common.types';
import { InterruptionEvent, InterruptionContext } from './types';
import { DateHelpers } from '@/shared/utils/date';

function generateInterruptionId(): InterruptionId {
  return uuidv7() as InterruptionId;
}

export function addMinutes(
  base: ISODateTime,
  minutes: number
): ISODateTime {
  if (!Number.isFinite(minutes)) {
    throw new Error(`Invalid minutes: ${minutes}`);
  }
  return DateHelpers.addMinutes(base, minutes).toISOString();
}

export function createInterruptionEvent(params: {
  occurredAt: ISODateTime,
  recordedAt: ISODateTime,
  context: InterruptionContext}): InterruptionEvent
{
  const { occurredAt, recordedAt, context } = params;
  const scheduled =
    context.returnAfterMinutes == null
      ? null
      : addMinutes(recordedAt, context.returnAfterMinutes);

  return {
    id: generateInterruptionId(),
    occurredAt,
    recordedAt,
    context,
    scheduledResumeAt: scheduled,
  }
}
