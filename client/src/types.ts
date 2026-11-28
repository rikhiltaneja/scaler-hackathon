import type { VisitFields } from 'shared';

export interface Language {
  code: string;
  label: string;
}

// What the extraction endpoint returns: the shared Visit fields, plus a
// flag telling the UI the server has no LLM key configured yet, and the
// model's own note on whether the transcript was detailed enough.
export type ExtractedVisit = VisitFields & { mockMode?: boolean; completenessTip?: string };

// Where a visit was recorded. Deliberately not part of the shared Visit
// model — it's record metadata, not clinical data, and is never sent to
// the LLM.
export interface VisitLocation {
  latitude: number;
  longitude: number;
}

// What a persisted visit looks like once the server has stored it.
export interface VisitRecord extends VisitFields {
  id: string;
  createdAt: string;
  transcript?: string;
  language?: string;
  location?: VisitLocation | null;
  completenessTip?: string;
}

export type AppStatus = 'idle' | 'extracting' | 'review' | 'submitting';
