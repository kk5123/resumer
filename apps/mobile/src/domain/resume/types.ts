import { ISODateTime, InterruptionId, ResumeId } from '../common.types';

export type ResumeSource = 'manual' | 'notification';
export type ResumeStatus = 'resumed' | 'snoozed' | 'abandoned';

export interface ResumeEvent {
  id: ResumeId;
  interruptionId: InterruptionId;   // 紐づく中断
  resumedAt: ISODateTime;           // 復帰しようとした時刻
  source: ResumeSource;
  status: ResumeStatus;             // 成否・スキップ
  snoozeMinutes?: number;
  metadata?: Record<string, unknown>; // 将来拡張（入力経路など）
}
