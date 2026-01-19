import { createPorts } from '@/shared/ports';
import { InterruptionRepository } from '@/domain/interruption';
import { CustomTriggerTagRepository } from '@/domain/triggerTag';

export type InterruptPorts = {
  interruptionRepo: InterruptionRepository;
  customTriggerTagRepo: CustomTriggerTagRepository;
};

const { set, get } = createPorts<InterruptPorts>('InterruptPorts');
export const setInterruptPorts = set;
export const getInterruptPorts = get;
