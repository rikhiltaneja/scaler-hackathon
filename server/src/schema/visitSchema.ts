// Server-only piece of the Visit schema: the Anthropic tool-use
// definition used to force structured extraction. The actual Visit
// model shape (field names/types) lives in the shared package so
// client and server don't each define it separately.

import type { Tool } from '@anthropic-ai/sdk/resources/messages';
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

// Anthropic tool-use schema: forcing the model to call this tool is what
// guarantees a parseable structured response instead of free text.
export const VISIT_SCHEMA_TOOL: Tool = {
  name: 'record_visit',
  description:
    'Record structured details of an ASHA worker home visit, extracted from a spoken transcript.',
  input_schema: {
    type: 'object',
    properties: {
      patientName: {
        type: 'string',
        description: 'Name of the patient visited. Empty string if not mentioned.',
      },
      visitType: {
        type: 'string',
        enum: VISIT_TYPES,
        description: 'Type of visit, best inferred from context.',
      },
      vitals: {
        type: 'object',
        description: 'Only include values explicitly mentioned. Omit a field entirely if not stated.',
        properties: {
          weightKg: { type: 'number', description: 'Weight in kilograms' },
          temperatureC: { type: 'number', description: 'Body temperature in Celsius' },
        },
      },
      symptoms: {
        type: 'array',
        items: { type: 'string' },
        description: 'Short phrases for any symptoms or complaints mentioned.',
      },
      medicationsGiven: {
        type: 'array',
        items: { type: 'string' },
        description: 'Medicines, supplements, or vaccines administered or given.',
      },
      nextFollowUpDate: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) for the next follow-up, if mentioned. Omit if not stated.',
      },
      notes: {
        type: 'string',
        description: 'Any other relevant free-text detail not captured by the fields above.',
      },
    },
    required: ['patientName', 'visitType', 'symptoms', 'medicationsGiven', 'notes'],
  },
};
