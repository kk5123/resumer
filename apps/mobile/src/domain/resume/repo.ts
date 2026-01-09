import { InterruptionId } from "../common.types";
import { ResumeEvent } from "./types";

export type ResumeRepo = {
  save(event: ResumeEvent): Promise<void>;
  listByInterruptionId(InterruptionId: InterruptionId): Promise<ResumeEvent[]>;
  findLatestByInterruptionId(interruptionId: InterruptionId): Promise<ResumeEvent | null>;
};
