import { ensureNotificationPermission } from '@/features/notification/services/ensurePermissions';
import { ScheduleParams, scheduleResumeNotification, cancelNotification } from '@/features/notification/services/schedule';
import { getNotificationPorts } from '@/features/notification/ports';
import { NotificationId } from '@/features/notification/types';
import { InterruptionId } from '@/domain/common.types';
import { getSettingsPorts } from '@/features/settings/ports';

type UpsertArgs = { interruptionId: InterruptionId } & ScheduleParams;

export async function upsertResumeNotification({
  interruptionId,
  title,
  body,
  triggerDate,
}: UpsertArgs): Promise<NotificationId | null> {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  if (triggerDate.getTime() <= Date.now()) return null;

  const { settingsRepo } = getSettingsPorts();
  const settings = await settingsRepo.load();
  if (!settings.notificationsEnabled) return null;

  const { bindingRepo } = getNotificationPorts();

  // 既存があればキャンセル
  const existing = await bindingRepo.find(interruptionId);
  if (existing) {
    await cancelNotification(existing);
  }

  // スケジュール
  const id = await scheduleResumeNotification({ interruptionId, title, body, triggerDate });
  await bindingRepo.save(interruptionId, id);
  return id;
}

type CancelArgs = { interruptionId: InterruptionId };

export async function cancelResumeNotification({ interruptionId }: CancelArgs): Promise<void> {
  const { bindingRepo } = getNotificationPorts();
  const existing = await bindingRepo.find(interruptionId);
  if (existing) {
    await cancelNotification(existing);
  }
  await bindingRepo.delete(interruptionId);
}

export async function cancelAllResumeNotifications(): Promise<void> {
  const { bindingRepo } = getNotificationPorts();
  const notifications = await bindingRepo.listAll();
  await Promise.all(notifications.map((notification) => cancelNotification(notification)));
  await bindingRepo.deleteAll();
}
