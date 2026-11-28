import { VISIT_TYPES, type Vitals } from 'shared';
import type { ChangeEvent } from 'react';
import type { ExtractedVisit } from '../types';
import TagInput from './TagInput';

interface VisitFormProps {
  data: ExtractedVisit;
  onChange: (data: ExtractedVisit) => void;
  submitting: boolean;
  onSubmit: () => void;
  onEditAgain: () => void;
}

export default function VisitForm({
  data,
  onChange,
  submitting,
  onSubmit,
  onEditAgain,
}: VisitFormProps) {
  function update<K extends keyof ExtractedVisit>(field: K, val: ExtractedVisit[K]) {
    onChange({ ...data, [field]: val });
  }

  function updateVital(field: keyof Vitals, val: string) {
    onChange({
      ...data,
      vitals: { ...data.vitals, [field]: val === '' ? null : Number(val) },
    });
  }

  return (
    <div className="visit-form">
      <div className="field-grid">
        <label className="field">
          Patient name
          <input
            value={data.patientName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update('patientName', e.target.value)}
          />
        </label>

        <label className="field">
          Visit type
          <select
            value={data.visitType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              update('visitType', e.target.value as ExtractedVisit['visitType'])
            }
          >
            <option value="">Select…</option>
            {VISIT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Weight (kg)
          <input
            type="number"
            value={data.vitals.weightKg ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateVital('weightKg', e.target.value)}
          />
        </label>

        <label className="field">
          Temperature (°C)
          <input
            type="number"
            value={data.vitals.temperatureC ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateVital('temperatureC', e.target.value)
            }
          />
        </label>

        <label className="field">
          Next follow-up
          <input
            type="date"
            value={data.nextFollowUpDate ?? ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              update('nextFollowUpDate', e.target.value)
            }
          />
        </label>
      </div>

      <TagInput
        label="Symptoms"
        values={data.symptoms || []}
        onChange={(v) => update('symptoms', v)}
        placeholder="Add symptom, press Enter"
      />
      <TagInput
        label="Medications given"
        values={data.medicationsGiven || []}
        onChange={(v) => update('medicationsGiven', v)}
        placeholder="Add medication, press Enter"
      />

      <label className="field">
        Notes
        <textarea
          rows={3}
          value={data.notes || ''}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('notes', e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={onEditAgain} disabled={submitting}>
          Re-record
        </button>
        <button type="button" className="primary-btn" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Confirm & submit'}
        </button>
      </div>
    </div>
  );
}
