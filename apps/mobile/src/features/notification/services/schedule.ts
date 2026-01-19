import * as Notifications from 'expo-notifications';
import { NotificationId } from '../types';
import { InterruptionId } from '@/domain/common.types';

export type ScheduleParams = {
  interruptionId: InterruptionId;
  title: string;
  body?: string;
  triggerDate: Date;
};

export async function scheduleResumeNotification(
  { interruptionId, title, body, triggerDate }: ScheduleParams
): Promise<NotificationId> {
  if (triggerDate.getTime() <= Date.now())
    throw new Error('[scheduleResumeNotification] triggerDate is in the past');

  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, data: { interruptionId } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });

  if (!id)
    throw new Error('[scheduleResumeNotification] failed to schedule notification');

  return id as NotificationId;
}

export async function cancelNotification(id: NotificationId): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function getScheduledNotificationContent(id: NotificationId) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const hit = all.find((n) => n.identifier === id);
  return hit?.content ?? null;
}
