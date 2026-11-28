import type { VisitFields } from 'shared';
import type { ExtractedVisit, VisitRecord } from '../types';

const BASE = '/api/visits';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function extractVisit(
  transcript: string,
  language: string,
): Promise<{ transcript: string; language: string; extracted: ExtractedVisit }> {
  return fetch(`${BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, language }),
  }).then((res) => handle(res));
}

export function submitVisit(payload: {
  transcript: string;
  language: string;
  extracted: VisitFields;
}): Promise<VisitRecord> {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((res) => handle(res));
}

export function fetchVisits(): Promise<VisitRecord[]> {
  return fetch(BASE).then((res) => handle(res));
}
