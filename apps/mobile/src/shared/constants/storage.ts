/**
 * AsyncStorage のキープレフィックス
 * アプリ全体で使用されるストレージキーの共通プレフィックス
 */
export const STORAGE_KEY_PREFIX = 'pm'; // pause-memo の略

/**
 * ストレージキーを生成するヘルパー関数
 */
function storageKey(suffix: string): string {
  return `${STORAGE_KEY_PREFIX}:${suffix}`;
}

export const STORAGE_KEY = {
  interruptionIndex: storageKey('interruption:index'),
  interruptionEvent: storageKey('interruption:event'),
  resumeIndex: storageKey('resume:index'),
  resumeEvent: storageKey('resume:event'),
  notificationBindings: storageKey('notificationBindings'),
  settings: storageKey('settings'),
  triggerTagsCustom: storageKey('triggerTags:custom'),
  tutorialSeen: storageKey('tutorialSeen'),
};
