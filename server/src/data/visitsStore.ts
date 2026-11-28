// In-memory store for phase 1. Swap for a real DB (SQLite/Postgres/Mongo)
// once the core voice -> structured form flow is validated end-to-end.

import { randomUUID } from 'crypto';
import type { VisitFields } from 'shared';

// Where a visit was recorded. Deliberately not part of the shared Visit
// model — it's record metadata, not clinical data, and is never sent to
// the LLM (kept out of the extraction request entirely).
export interface VisitLocation {
  latitude: number;
  longitude: number;
}

// What's actually persisted: the shared Visit fields, plus the
// server-assigned id/createdAt, the raw transcript/language it came
// from (kept for audit/traceability), where it was recorded, and the
// model's own note on whether the transcript was detailed enough.
export interface VisitRecord extends VisitFields {
  id: string;
  createdAt: string;
  transcript?: string;
  language?: string;
  location?: VisitLocation | null;
  completenessTip?: string;
}

export type NewVisitRecord = Omit<VisitRecord, 'id' | 'createdAt'>;

const visits: VisitRecord[] = [];

export function addVisit(visitData: NewVisitRecord): VisitRecord {
  const visit: VisitRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...visitData,
  };
  visits.unshift(visit);
  return visit;
}

export function getAllVisits(): VisitRecord[] {
  return visits;
}

export function getVisitById(id: string): VisitRecord | undefined {
  return visits.find((v) => v.id === id);
}
