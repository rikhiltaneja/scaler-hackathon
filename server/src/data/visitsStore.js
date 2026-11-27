// In-memory store for phase 1. Swap for a real DB (SQLite/Postgres/Mongo)
// once the core voice -> structured form flow is validated end-to-end.

import { randomUUID } from 'crypto';

const visits = [];

export function addVisit(visitData) {
  const visit = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...visitData,
  };
  visits.unshift(visit);
  return visit;
}

export function getAllVisits() {
  return visits;
}

export function getVisitById(id) {
  return visits.find((v) => v.id === id);
}
