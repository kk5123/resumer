import { setInterruptPorts } from '@/features/interrupt/ports'
import { AsyncStorageInterruptionRepository } from '@/infra/interruption'
import { AsyncStorageCustomTriggerTagRepository } from '@/infra/triggerTag'

export async function bootstrap() {
  setInterruptPorts({
    interruptionRepo: new AsyncStorageInterruptionRepository(),
    customTriggerTagRepo: new AsyncStorageCustomTriggerTagRepository()
  });
}
