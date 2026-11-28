// Server-only piece of the Visit schema: the Gemini structured-output
// definition used to force structured extraction. The actual Visit
// model shape (field names/types) lives in the shared package so
// client and server don't each define it separately.

import { Type, type Schema } from '@google/genai';
import { Visit, VISIT_TYPES } from 'shared';

// The Visit class requires every field — deciding what "empty" means is
// an application-level concern, so that default instance is built here
// on the server rather than baked into the shared model itself.
export function createEmptyVisit(): Visit {
  return new Visit({
    patientName: '',
    visitType: '',
    vitals: { weightKg: null, temperatureC: null },
    symptoms: [],
    medicationsGiven: [],
    nextFollowUpDate: null,
    notes: '',
  });
}

// Sample visit used when running without a GEMINI_API_KEY, so the
// demo shows a believably filled-in form instead of a blank one. The
// follow-up date is computed relative to today so it never looks stale.
export function createMockVisit(): Visit {
  const followUp = new Date();
  followUp.setDate(followUp.getDate() + 14);

  return new Visit({
    patientName: 'Sunita Devi',
    visitType: 'ANC',
    vitals: { weightKg: 58, temperatureC: 37 },
    symptoms: ['mild fatigue'],
    medicationsGiven: ['Iron folic acid tablets'],
    nextFollowUpDate: followUp.toISOString().slice(0, 10),
    notes: '',
  });
}

// Gemini structured-output schema: paired with responseMimeType:
// 'application/json' this forces the model to return JSON matching this
// shape instead of free text.
export const VISIT_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    patientName: {
      type: Type.STRING,
      description: 'Name of the patient visited. Empty string if not mentioned.',
    },
    visitType: {
      type: Type.STRING,
      format: 'enum',
      enum: [...VISIT_TYPES],
      description: 'Type of visit, best inferred from context.',
    },
    vitals: {
      type: Type.OBJECT,
      description: 'Only include values explicitly mentioned. Omit a field entirely if not stated.',
      properties: {
        weightKg: { type: Type.NUMBER, description: 'Weight in kilograms' },
        temperatureC: { type: Type.NUMBER, description: 'Body temperature in Celsius' },
      },
    },
    symptoms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Short phrases for any symptoms or complaints mentioned.',
    },
    medicationsGiven: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Medicines, supplements, or vaccines administered or given.',
    },
    nextFollowUpDate: {
      type: Type.STRING,
      description: 'ISO date (YYYY-MM-DD) for the next follow-up, if mentioned. Omit if not stated.',
    },
    notes: {
      type: Type.STRING,
      description: 'Any other relevant free-text detail not captured by the fields above.',
    },
  },
  required: ['patientName', 'visitType', 'symptoms', 'medicationsGiven', 'notes'],
};
