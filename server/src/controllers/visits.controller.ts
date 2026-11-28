import type { Request, Response, NextFunction } from 'express';
import type { VisitFields } from 'shared';
import { extractStructuredVisit } from '../services/llmExtraction.service.js';
import { addVisit, getAllVisits, getVisitById, type VisitLocation } from '../data/visitsStore.js';

// POST /api/visits/extract
// Takes a raw speech transcript and returns a structured draft visit
// record for the ASHA worker to review before submitting.
export async function extractVisit(req: Request, res: Response, next: NextFunction) {
  try {
    const { transcript, language } = req.body as { transcript?: string; language?: string };
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'transcript is required' });
    }

    const extracted = await extractStructuredVisit(transcript, { language });

    res.json({ transcript, language: language || 'en', extracted });
  } catch (err) {
    next(err);
  }
}

// POST /api/visits
// Persists a (possibly worker-edited) structured visit record. Location
// is only ever attached here, at save time — it's never part of the
// /extract request, so it's never sent to the LLM.
export async function createVisit(req: Request, res: Response, next: NextFunction) {
  try {
    const { transcript, language, location, extracted } = req.body as {
      transcript?: string;
      language?: string;
      location?: VisitLocation | null;
      extracted?: VisitFields & { completenessTip?: string };
    };
    if (!extracted) {
      return res.status(400).json({ error: 'extracted visit data is required' });
    }

    const visit = addVisit({ transcript, language, location, ...extracted });
    res.status(201).json(visit);
  } catch (err) {
    next(err);
  }
}

// GET /api/visits
export function listVisits(req: Request, res: Response) {
  res.json(getAllVisits());
}

// GET /api/visits/:id
export function getVisit(req: Request, res: Response) {
  const visit = getVisitById(req.params.id as string);
  if (!visit) return res.status(404).json({ error: 'Visit not found' });
  res.json(visit);
}
