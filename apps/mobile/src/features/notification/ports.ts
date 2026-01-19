import { createPorts } from '@/shared/ports';
import { NotificationBindingRepo } from './repo';

export type NotificationPorts = {
  bindingRepo: NotificationBindingRepo;
}

const { set, get } = createPorts<NotificationPorts>('NotificationPorts');
export const setNotificationPorts = set;
export const getNotificationPorts = get;
