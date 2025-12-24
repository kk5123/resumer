import { ISODateTime, Brand, TriggerTagId } from '../common.types'

/** 文字列 → TriggerTagId にキャストするヘルパー */
function tagId(v: string): TriggerTagId {
  return v as TriggerTagId;
}

/** ドメインが知っている「プリセットタグID」の集合 */
export const PRESET_TRIGGER_TAG_IDS: TriggerTagId[] = [
  tagId('fatigue'),      // 疲労
  tagId('hunger'),       // 空腹
  tagId('sleepy'),       // 眠気
  tagId('blocked'),      // 行き詰まり
  tagId('sns'),          // SNS
  tagId('notification'), // 通知
  tagId('person'),       // 人
  tagId('noise'),        // 騒音
];

/** 内部用: 検索用に Set にしておく */
const PRESET_TRIGGER_TAG_ID_SET = new Set<string>(
  PRESET_TRIGGER_TAG_IDS.map((id) => id as unknown as string)
);

/** このIDがプリセットかどうかを判定する純関数 */
export function isPresetTriggerTag(id: TriggerTagId): boolean {
  const key = id as unknown as string;
  return PRESET_TRIGGER_TAG_ID_SET.has(key);
}

export interface CustomTriggerTag {
  id: TriggerTagId;
  createdAt: ISODateTime;
  lastUsedAt: ISODateTime;
  usageCount: number;
}
