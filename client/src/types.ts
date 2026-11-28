import type { VisitFields } from 'shared';

export interface Language {
  code: string;
  label: string;
}

// What the extraction endpoint returns: the shared Visit fields, plus a
// flag telling the UI the server has no LLM key configured yet.
export type ExtractedVisit = VisitFields & { mockMode?: boolean };

// What a persisted visit looks like once the server has stored it.
export interface VisitRecord extends VisitFields {
  id: string;
  createdAt: string;
  transcript?: string;
  language?: string;
}

export type AppStatus = 'idle' | 'extracting' | 'review' | 'submitting';
