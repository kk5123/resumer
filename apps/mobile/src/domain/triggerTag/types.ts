import { ISODateTime, Brand, TriggerTagId } from '../common.types'

export interface TriggerTag {
  id: TriggerTagId;
  label: string;
}

/** 文字列 → TriggerTagId にキャストするヘルパー */
export function generateTriggerTagIdFromLabel(v: string): TriggerTagId {
  return v.trim().toLowerCase().replace(/ +/g, ' ') as TriggerTagId;
}

const PRESET_TRIGGER_TAG_LABELS: string[] = [
  '疲労',
  '空腹',
  '眠気',
  '行き詰まり',
  'SNS',
  '通知',
  '人',
  '騒音',
];

export const PRESET_TRIGGER_TAGS: TriggerTag[] =
  PRESET_TRIGGER_TAG_LABELS.map((l) => { return { id: generateTriggerTagIdFromLabel(l), label: l }});

export interface CustomTriggerTag {
  id: TriggerTagId;
  label: string;
  createdAt: ISODateTime;
  lastUsedAt: ISODateTime;
  usageCount: number;
}
