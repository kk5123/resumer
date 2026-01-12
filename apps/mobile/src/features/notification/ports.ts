import { NotificationBindingRepo } from './repo';

export type NotificationPorts = {
  bindingRepo: NotificationBindingRepo;
}

let notificationPorts: NotificationPorts | undefined;

export function setNotificationPorts(value: NotificationPorts) {
  notificationPorts = value;
  console.log('[setNotificationPorts] called')
}

export function getNotificationPorts(): NotificationPorts {
  if (!notificationPorts) throw new Error('NotificationPorts not initialized');
  return notificationPorts;
}
