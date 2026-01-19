import { createPorts } from '@/shared/ports';
import { SettingsRepo } from './repo';

export type SettingsPorts = {
  settingsRepo: SettingsRepo;
}

const { set, get } = createPorts<SettingsPorts>('SettingsPorts');
export const setSettingsPorts = set;
export const getSettingsPorts = get;
