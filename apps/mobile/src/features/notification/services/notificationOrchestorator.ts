import { ensureNotificationPermission } from '@/features/notification/services/ensurePermissions';
import { ScheduleParams, scheduleResumeNotification, cancelNotification, getScheduledNotificationContent } from '@/features/notification/services/schedule';
import { getNotificationPorts } from '@/features/notification/ports';
import { NotificationId } from '@/features/notification/types';
import { InterruptionId } from '@/domain/common.types';
import { getInterruptPorts } from '@/features/interrupt/ports';
import { getSettingsPorts } from '@/features/settings/ports';
import { t } from '@/shared/i18n/strings';

async function buildContentFromInterruption(
  interruptionId: InterruptionId
): Promise<{ title: string; body: string }> {
  const { interruptionRepo } = getInterruptPorts();
  const ev = await interruptionRepo.findById(interruptionId);
  if (!ev) {
    throw new Error('[buildContentFromInterruption] not found interruptionId');
  }

  const title = t('app.title');
  const body = ev.context.firstStepText?.trim() || t('notification.fallback');
  return { title, body };
}

type UpsertArgs = { interruptionId: InterruptionId, triggerDate: Date };

export async function upsertResumeNotification({
  interruptionId,
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

  const { title, body } = await buildContentFromInterruption(interruptionId);

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
