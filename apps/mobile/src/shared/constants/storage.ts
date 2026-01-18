/**
 * AsyncStorage のキープレフィックス
 * アプリ全体で使用されるストレージキーの共通プレフィックス
 */
export const STORAGE_KEY_PREFIX = 'pm:'; // pause-memo の略

/**
 * ストレージキーを生成するヘルパー関数
 */
export function storageKey(suffix: string): string {
  return `${STORAGE_KEY_PREFIX}${suffix}`;
}
