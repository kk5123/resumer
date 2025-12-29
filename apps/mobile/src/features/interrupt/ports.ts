import { InterruptionRepository } from '@/domain/interruption';
import { CustomTriggerTagRepository } from '@/domain/triggerTag';

export type InterruptPorts = {
  interruptionRepo: InterruptionRepository;
  customTriggerTagRepo: CustomTriggerTagRepository;
};

let interruptPorts: InterruptPorts | undefined;

export function setInterruptPorts(value: InterruptPorts) {
  interruptPorts = value;
  console.log('[setInterruptPorts] called')
}

export function getInterruptPorts(): InterruptPorts {
  if (!interruptPorts) throw new Error('InterruptPorts not initialized');
  return interruptPorts;
}