import { extractStructuredVisit } from '../services/llmExtraction.service.js';
import { applyRiskFlags } from '../services/riskFlags.service.js';
import { addVisit, getAllVisits, getVisitById } from '../data/visitsStore.js';

// POST /api/visits/extract
// Takes a raw speech transcript and returns a structured, risk-flagged
// draft visit record for the ASHA worker to review before submitting.
export async function extractVisit(req, res, next) {
  try {
    const { transcript, language } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'transcript is required' });
    }

    const structured = await extractStructuredVisit(transcript, { language });
    const extracted = applyRiskFlags(structured);

    res.json({ transcript, language: language || 'en', extracted });
  } catch (err) {
    next(err);
  }
}

// POST /api/visits
// Persists a (possibly worker-edited) structured visit record.
export async function createVisit(req, res, next) {
  try {
    const { transcript, language, extracted } = req.body;
    if (!extracted) {
      return res.status(400).json({ error: 'extracted visit data is required' });
    }

    const flagged = applyRiskFlags(extracted);
    const visit = addVisit({ transcript, language, ...flagged });
    res.status(201).json(visit);
  } catch (err) {
    next(err);
  }
}

// GET /api/visits
export function listVisits(req, res) {
  res.json(getAllVisits());
}

// GET /api/visits/:id
export function getVisit(req, res) {
  const visit = getVisitById(req.params.id);
  if (!visit) return res.status(404).json({ error: 'Visit not found' });
  res.json(visit);
}
