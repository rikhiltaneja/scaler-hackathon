// Canonical Visit model, shared by client and server so it's defined
// once instead of duplicated in each project.
//
// This class only declares the required shape of a visit — it does not
// supply "empty"/default values itself. Deciding what an empty visit
// looks like is left to the consumer (the server constructs one from
// this class where it needs a starting point).

export const VISIT_TYPES = ['ANC', 'PNC', 'Newborn Care', 'Immunization', 'General'] as const;

export type VisitType = (typeof VISIT_TYPES)[number] | '';

export interface Vitals {
  weightKg: number | null;
  temperatureC: number | null;
}

export interface VisitFields {
  patientName: string;
  visitType: VisitType;
  vitals: Vitals;
  symptoms: string[];
  medicationsGiven: string[];
  nextFollowUpDate: string | null;
  notes: string;
}

export class Visit implements VisitFields {
  patientName: string;
  visitType: VisitType;
  vitals: Vitals;
  symptoms: string[];
  medicationsGiven: string[];
  nextFollowUpDate: string | null;
  notes: string;

  constructor(fields: VisitFields) {
    this.patientName = fields.patientName;
    this.visitType = fields.visitType;
    this.vitals = fields.vitals;
    this.symptoms = fields.symptoms;
    this.medicationsGiven = fields.medicationsGiven;
    this.nextFollowUpDate = fields.nextFollowUpDate;
    this.notes = fields.notes;
  }
}
