/* ============================================================================
 * Domain Schema: Interruption
 * - このアプリのコア概念は「中断イベント（InterruptionEvent）」
 * - 中断モーダルで集めた内容は InterruptionContext として保持
 * ========================================================================== */

import { ISODateTime, TriggerTagId, InterruptionId } from "../common.types";

/** 
 * 中断のコンテキスト
 * - すべて「任意入力」が前提
 * - UIモーダルで収集する内容にほぼ 1:1 対応
 */
export interface InterruptionContext {
  /**
   * 中断のきっかけを表すタグIDの配列
   * - プリセット（例: "fatigue", "sns"）と自由入力（例: "会議", "Slack"）が混在
   * - 0件でもOK（何も選ばず保存も許容）
   */
  triggerTagIds: TriggerTagId[];

  /**
   * 理由メモ（任意・1行想定）
   * - 例: "API設計の境界が決めきれない"
   * - 短い主観メモ。空文字や undefined を許容。
   */
  reasonText?: string;

  /**
   * 復帰後の「最初の一手」（任意・1行）
   * - 例: "index.ts の export を1つ追加"
   * - 再開時の意思決定コストを下げるためのメモ。
   */
  firstStepText?: string;

  /**
   * 何分後に戻るつもりか（任意）
   * - UIではデフォルト5分だが、保存時は undefined もあり得る
   * - 「だいたいこのくらい」の目安なので厳密でなくてよい
   */
  returnAfterMinutes?: number;
}

/**
 * 中断イベント（ドメインのコア単位）
 * - 「いつ」「どんな状態で」「どんな中断だったか」を表現
 * - InterruptionContext はここに内包する
 */
export interface InterruptionEvent {
  /** 中断イベントの一意なID */
  id: InterruptionId;

  /**
   * 中断が「実際に起きた」とみなす時刻
   * - 基本は InterruptButton 押下時のタイムスタンプ
   */
  occurredAt: ISODateTime;

  /**
   * 中断として「保存された」時刻
   * - モーダルで「保存して休憩する」が押された瞬間
   * - ネットワーク遅延・非同期保存があっても、ユーザー操作時刻を固定で記録できる
   */
  recordedAt: ISODateTime;

  /**
   * UIモーダルでユーザーが入力した中断コンテキスト
   * - すべて任意入力
   */
  context: InterruptionContext;

  /**
   * 何分後に戻るつもりかから計算された「予定復帰時刻」
   * - occurredAt + returnAfterMinutes を使ってアプリ側で算出（optional）
   * - 通知機能や分析（予定 vs 実際）に使える
   * - returnAfterMinutes がない場合は null/undefined
   */
  scheduledResumeAt?: ISODateTime | null;

  /**
   * 将来用のメタデータ置き場（端末・バージョンなど）
   * - MVPでは空でOK、後から拡張しても既存イベントを壊さない
   */
  metadata?: {
  };
}
