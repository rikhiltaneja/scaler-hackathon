import { GoogleGenAI } from '@google/genai';
import type { VisitFields, Vitals } from 'shared';
import dotenv from 'dotenv';
import { createEmptyVisit, createMockVisit, VISIT_RESPONSE_SCHEMA } from '../schema/visitSchema.js';

export type ExtractedVisit = VisitFields & { mockMode?: boolean; completenessTip?: string };

dotenv.config()

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta'

// Client is only created if a key is present. This lets the rest of the
// pipeline (voice input -> transcript -> form) run and be demoed before
// an API key is wired in; see mockExtract() below.
const client = apiKey ? new GoogleGenAI({ apiKey, httpOptions: {apiVersion} }) : null;

/**
 * Turns a raw speech transcript of an ASHA home-visit into a structured
 * visit record. Falls back to a clearly-labeled mock extraction when no
 * GEMINI_API_KEY is configured, so the rest of the app is testable
 * without a key.
 */
export async function extractStructuredVisit(
  transcript: string,
  { language = 'en' }: { language?: string } = {},
): Promise<ExtractedVisit> {
  if (!client) {
    return mockExtract(transcript);
  }

  const response = await client.models.generateContent({
    model,
    contents: `Transcript (spoken language hint: ${language}):\n"""${transcript}"""`,
    config: {
      systemInstruction:
        'You are an assistant that converts a spoken field note from an ASHA (Accredited Social Health ' +
        'Activist, a community health worker in India) home visit into a structured record. ' +
        'The transcript may be in English, Hindi, or a mix of both (Hinglish). ' +
        'Extract only what is explicitly said or very clearly implied. Never invent vitals, dates, or ' +
        'medication names that were not mentioned. Also judge whether the transcript gave enough ' +
        'detail to usefully fill these fields, using completenessTip as described below.',
      responseMimeType: 'application/json',
      responseSchema: VISIT_RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    return mockExtract(transcript);
  }

  try {
    // The model's JSON output is only known at runtime — it's shaped by
    // VISIT_RESPONSE_SCHEMA but not statically typed by the SDK.
    const partial = JSON.parse(text) as Partial<VisitFields> & { completenessTip?: string };
    return mergeWithDefaults(partial);
  } catch {
    return mockExtract(transcript);
  }
}

function mergeWithDefaults(
  partial: Partial<VisitFields> & { completenessTip?: string },
): ExtractedVisit {
  const empty = createEmptyVisit();
  return {
    ...empty,
    ...partial,
    vitals: {
      ...empty.vitals,
      ...(partial.vitals as Partial<Vitals> | undefined),
    },
    completenessTip: partial.completenessTip ?? '',
  };
}

function mockExtract(transcript: string): ExtractedVisit {
  return {
    ...createMockVisit(),
    notes: transcript,
    completenessTip: '',
    mockMode: true,
  };
}
