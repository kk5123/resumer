import { InterruptionEvent } from "./types";

export interface InterruptionRepository {
  save(event: InterruptionEvent): Promise<void>;
  findLatest(): Promise<InterruptionEvent | null>;
  listRecent(limit: number): Promise<InterruptionEvent[]>;
  update(event: InterruptionEvent): Promise<void>;
}
