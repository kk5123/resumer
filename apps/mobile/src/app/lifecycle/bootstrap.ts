import { setInterruptPorts } from '@/features/interrupt'
import { setResumePorts } from '@/features/resume';
import { AsyncStorageInterruptionRepository } from '@/infra/interruption'
import { AsyncStorageCustomTriggerTagRepository } from '@/infra/triggerTag'
import { AsyncStorageResumeRepository } from '@/infra/resume';
import { setNotificationPorts } from '@/features/notification';
import { AsyncStorageNotificationBindingRepo } from '@/infra/notification';

import { setSettingsPorts } from '@/features/settings';
import { AsyncStorageSettingsRepository } from '@/infra/settings';

export async function bootstrap() {
  setSettingsPorts({
    settingsRepo: new AsyncStorageSettingsRepository()
  });

  setInterruptPorts({
    interruptionRepo: new AsyncStorageInterruptionRepository(),
    customTriggerTagRepo: new AsyncStorageCustomTriggerTagRepository()
  });

  setResumePorts({
    resumeRepo: new AsyncStorageResumeRepository(),
  });

  setNotificationPorts({
    bindingRepo: new AsyncStorageNotificationBindingRepo(),
  })
}
