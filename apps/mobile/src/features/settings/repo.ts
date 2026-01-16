export type Theme = 'system' | 'light' | 'dark';
export type Language = 'ja' | 'en';

export type Settings = {
  notificationsEnabled: boolean;
  analyticsOptIn: boolean;
  theme: Theme;
  language?: Language;
};

export const defaultSettings: Settings = {
  notificationsEnabled: true,
  analyticsOptIn: true,
  theme: 'system',
};

export interface SettingsRepo {
  load(): Promise<Settings>;          // 永続層から読み込み（失敗時は defaultSettings を返す実装を想定）
  save(next: Settings): Promise<void>; // 永続層へ保存
}
