import { setInterruptPorts } from '@/features/interrupt/ports'
import { setResumePorts } from '@/features/resume/ports';
import { AsyncStorageInterruptionRepository } from '@/infra/interruption'
import { AsyncStorageCustomTriggerTagRepository } from '@/infra/triggerTag'
import { AsyncStorageResumeRepository } from '@/infra/resume';
import { setNotificationPorts } from '@/features/notification';
import { AsyncStorageNotificationBindingRepo } from '@/infra/notification';

export async function bootstrap() {
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
