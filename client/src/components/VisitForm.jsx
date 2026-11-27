import TagInput from './TagInput';

const VISIT_TYPES = ['ANC', 'PNC', 'Newborn Care', 'Immunization', 'General'];

export default function VisitForm({ data, onChange, submitting, onSubmit, onEditAgain }) {
  function update(field, val) {
    onChange({ ...data, [field]: val });
  }

  function updateVital(field, val) {
    onChange({
      ...data,
      vitals: { ...data.vitals, [field]: val === '' ? null : Number(val) },
    });
  }

  return (
    <div className="visit-form">
      {data.riskFlags?.length > 0 && (
        <div className="risk-banner">
          {data.riskFlags.map((flag, i) => (
            <span className="risk-flag" key={i}>
              ⚠ {flag}
            </span>
          ))}
        </div>
      )}

      <div className="field-grid">
        <label className="field">
          Patient name
          <input
            value={data.patientName}
            onChange={(e) => update('patientName', e.target.value)}
          />
        </label>

        <label className="field">
          Visit type
          <select value={data.visitType} onChange={(e) => update('visitType', e.target.value)}>
            <option value="">Select…</option>
            {VISIT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          BP systolic
          <input
            type="number"
            value={data.vitals.bloodPressureSystolic ?? ''}
            onChange={(e) => updateVital('bloodPressureSystolic', e.target.value)}
          />
        </label>

        <label className="field">
          BP diastolic
          <input
            type="number"
            value={data.vitals.bloodPressureDiastolic ?? ''}
            onChange={(e) => updateVital('bloodPressureDiastolic', e.target.value)}
          />
        </label>

        <label className="field">
          Weight (kg)
          <input
            type="number"
            value={data.vitals.weightKg ?? ''}
            onChange={(e) => updateVital('weightKg', e.target.value)}
          />
        </label>

        <label className="field">
          Temperature (°C)
          <input
            type="number"
            value={data.vitals.temperatureC ?? ''}
            onChange={(e) => updateVital('temperatureC', e.target.value)}
          />
        </label>

        <label className="field">
          Next follow-up
          <input
            type="date"
            value={data.nextFollowUpDate ?? ''}
            onChange={(e) => update('nextFollowUpDate', e.target.value)}
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
          onChange={(e) => update('notes', e.target.value)}
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
