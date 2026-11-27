// Shared schema describing a structured ASHA home-visit record.
// Used both to shape the LLM's structured extraction (as an Anthropic
// tool definition) and as the single source of truth for default/empty
// values on the server.

export const VISIT_TYPES = ['ANC', 'PNC', 'Newborn Care', 'Immunization', 'General'];

export const EMPTY_VISIT = {
  patientName: '',
  visitType: '',
  vitals: {
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    weightKg: null,
    temperatureC: null,
  },
  symptoms: [],
  medicationsGiven: [],
  nextFollowUpDate: null,
  notes: '',
};

// Anthropic tool-use schema: forcing the model to call this tool is what
// guarantees a parseable structured response instead of free text.
export const VISIT_SCHEMA_TOOL = {
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
          bloodPressureSystolic: { type: 'number', description: 'Systolic BP, e.g. 120' },
          bloodPressureDiastolic: { type: 'number', description: 'Diastolic BP, e.g. 80' },
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
