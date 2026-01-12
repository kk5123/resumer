import { InterruptionEvent } from "@/domain/interruption";
import { ResumeEvent } from "@/domain/resume/types";

export type HistoryItem = InterruptionEvent & {
  occurredLocal: string;
  scheduledLocal?: string | null;
  resumeStatus?: ResumeEvent['status'];
};
