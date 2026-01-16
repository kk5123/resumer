import { SettingsRepo } from './repo';

export type SettingsPorts = {
  settingsRepo: SettingsRepo;
}

let settingsPorts: SettingsPorts | undefined;

export function setSettingsPorts(value: SettingsPorts) {
  settingsPorts = value;
  console.log('[setSettingsPorts] called')
}

export function getSettingsPorts(): SettingsPorts {
  if (!settingsPorts) throw new Error('SettingsPorts not initialized');
  return settingsPorts;
}
