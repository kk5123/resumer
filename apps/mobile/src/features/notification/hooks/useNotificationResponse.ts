import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { InterruptionId } from '@/domain/common.types';

export function useNotificationResponse(onOpen: (interruptionId: InterruptionId) => void) {
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!lastResponse) return;
    const id = lastResponse.notification.request.content.data?.interruptionId as InterruptionId | undefined;
    if (id) onOpen(id);
  }, [lastResponse, onOpen]);
}
