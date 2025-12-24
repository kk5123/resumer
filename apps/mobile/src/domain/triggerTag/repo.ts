import { ISODateTime, TriggerTagId } from "../common.types";
import { CustomTriggerTag } from "./types";

export interface CustomTriggerTagRepository {
  upsertUsage(ids: TriggerTagId[], usedAt: ISODateTime): Promise<void>;
  listTopUsed(limit: number): Promise<CustomTriggerTag[]>;
}
