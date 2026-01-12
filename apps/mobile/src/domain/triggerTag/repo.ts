import { ISODateTime, TriggerTagId } from "../common.types";
import { TriggerTag, CustomTriggerTag } from "./types";

export interface CustomTriggerTagRepository {
  upsertUsage(tags: TriggerTag[], usedAt: ISODateTime): Promise<void>;
  listTopUsed(limit: number): Promise<CustomTriggerTag[]>;

  findById(tagId: TriggerTagId): Promise<CustomTriggerTag | null>;
}
