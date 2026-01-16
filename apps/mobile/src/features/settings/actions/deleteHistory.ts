import { getInterruptPorts } from '@/features/interrupt/ports';
import { getResumePorts } from '@/features/resume/ports';
import { getNotificationPorts } from '@/features/notification/ports';

type DeleteOptions = {
  deleteTriggerTags?: boolean; // トリガータグの使用履歴も消す場合 true
};

export async function deleteAllHistoryData(options: DeleteOptions = {}) {
  const { deleteTriggerTags = false } = options;

  const { interruptionRepo, customTriggerTagRepo } = getInterruptPorts();
  const { resumeRepo } = getResumePorts();
  const { bindingRepo } = getNotificationPorts();

  await bindingRepo.deleteAll();
  await resumeRepo.deleteAll();
  await interruptionRepo.deleteAll();

  if (deleteTriggerTags)
    await customTriggerTagRepo.deleteAll();
}
