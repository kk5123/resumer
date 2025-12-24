import { InterruptionId, InterruptionEvent, ISODateTime, InterruptionContext } from "./types";

function generateInterruptionId(): InterruptionId {
  return '0' as InterruptionId;
}

export function addMinutes(
  base: ISODateTime,
  minutes: number
): ISODateTime {
  if (!Number.isFinite(minutes)) {
    throw new Error(`Invalid minutes: ${minutes}`);
  }

  const date = new Date(base);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISODateTime: ${base}`);
  }

  const result = new Date(date.getTime() + minutes * 60_000);
  return result.toISOString();
}

export function createIntteruptionEvent(params: {
  occurredAt: ISODateTime,
  recordedAt: ISODateTime,
  context: InterruptionContext}): InterruptionEvent
{
  const { occurredAt, recordedAt, context } = params;

  return {
    id: generateInterruptionId(),
    occurredAt,
    recordedAt,
    context,
    scheduledResumeAt: addMinutes(occurredAt, context.returnAfterMinutes?? 5),
  }
}
