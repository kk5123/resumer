/** ISO 8601 datetime string (例: "2025-12-23T10:15:00+09:00") */
export type ISODateTime = string;

/** Branded ID 型（単なる string の取り違えを防ぐ） */
export type Brand<K, T extends string> = K & { readonly __brand: T };

export type InterruptionId = Brand<string, "InterruptionId">;
export type TriggerTagId   = Brand<string, "TriggerTagId">;

export type ResumeId = Brand<string, 'ResumeID'>;

export type DateRange = { from?: Date; to?: Date; };
