// In-memory store for phase 1. Swap for a real DB (SQLite/Postgres/Mongo)
// once the core voice -> structured form flow is validated end-to-end.

import { randomUUID } from 'crypto';
import type { VisitFields } from 'shared';

// What's actually persisted: the shared Visit fields, plus the
// server-assigned id/createdAt and the raw transcript/language it came
// from (kept for audit/traceability).
export interface VisitRecord extends VisitFields {
  id: string;
  createdAt: string;
  transcript?: string;
  language?: string;
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
