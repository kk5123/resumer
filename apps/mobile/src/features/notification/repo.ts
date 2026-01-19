import { InterruptionId } from "@/domain/common.types";
import { NotificationId } from "./types";

export interface NotificationBindingRepo {
  save(interruptionId: InterruptionId, notificationId: NotificationId): Promise<void>;
  find(interruptionId: InterruptionId): Promise<NotificationId | null>;
  delete(interruptionId: InterruptionId): Promise<void>;

  deleteAll(): Promise<void>;

  listAll(): Promise<NotificationId[]>;
}
