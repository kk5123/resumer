import { ISODateTime } from "../common.types";
import { InterruptionEvent } from "./types";

export type HistoryQuery = {
  from?: ISODateTime;
  to?: ISODateTime;
  limit?: number;
}

export interface InterruptionRepository {
  save(event: InterruptionEvent): Promise<void>;
  findLatest(): Promise<InterruptionEvent | null>;
  listRecent(limit: number): Promise<InterruptionEvent[]>;
  update(event: InterruptionEvent): Promise<void>;

  listByPeriod(params: HistoryQuery): Promise<InterruptionEvent[]>;
}
