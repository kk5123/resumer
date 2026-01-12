import * as Notifications from 'expo-notifications';

type ScheduleParams = {
  title: string;
  body?: string;
  triggerDate: Date;
};

export async function scheduleResumeNotification({ title, body, triggerDate }: ScheduleParams) {
  if (triggerDate.getTime() <= Date.now()) return null;
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
  return id;
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}
