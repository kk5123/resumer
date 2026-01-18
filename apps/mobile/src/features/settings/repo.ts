export type Theme = 'light';
export type Language = 'ja';
export type WeekStart = 'monday' | 'sunday';

export type Settings = {
  notificationsEnabled: boolean;
  analyticsOptIn: boolean;
  theme: Theme;
  language?: Language;
  weekStart: WeekStart;
};

export const defaultSettings: Settings = {
  notificationsEnabled: true,
  analyticsOptIn: false,
  theme: 'light',
  weekStart: 'sunday',
};

export interface SettingsRepo {
  load(): Promise<Settings>;          // 永続層から読み込み（失敗時は defaultSettings を返す実装を想定）
  save(next: Settings): Promise<void>; // 永続層へ保存
}
