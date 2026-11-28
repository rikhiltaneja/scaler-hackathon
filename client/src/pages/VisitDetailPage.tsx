import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchVisit } from '../api/visits';
import type { VisitRecord } from '../types';

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<VisitRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError('');
    fetchVisit(id)
      .then((data) => active && setVisit(data))
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <section className="panel">
      <Link to="/" className="link back-link">
        ← Back to visits
      </Link>

      {loading && <p className="muted">Loading…</p>}
      {!loading && error && <p className="error">{error}</p>}

      {!loading && !error && visit && (
        <>
          <h2>{visit.patientName || 'Unnamed patient'}</h2>
          <p className="muted">
            {visit.visitType || '—'} · {new Date(visit.createdAt).toLocaleString()}
          </p>

          {visit.completenessTip && <p className="notice">💡 {visit.completenessTip}</p>}

          <div className="field-grid">
            <div className="field">
              Weight (kg)
              <div className="field-value">{visit.vitals.weightKg ?? '—'}</div>
            </div>
            <div className="field">
              Temperature (°C)
              <div className="field-value">{visit.vitals.temperatureC ?? '—'}</div>
            </div>
            <div className="field">
              Next follow-up
              <div className="field-value">{visit.nextFollowUpDate ?? '—'}</div>
            </div>
            <div className="field">
              Language
              <div className="field-value">{visit.language ?? '—'}</div>
            </div>
            <div className="field">
              Location
              <div className="field-value">
                {visit.location ? (
                  <a
                    href={`https://www.google.com/maps?q=${visit.location.latitude},${visit.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link"
                  >
                    {visit.location.latitude.toFixed(5)}, {visit.location.longitude.toFixed(5)}
                  </a>
                ) : (
                  '—'
                )}
              </div>
            </div>
          </div>

          <div className="field">
            Symptoms
            <div className="tag-input">
              {visit.symptoms.length ? (
                visit.symptoms.map((s, i) => <span className="tag" key={i}>{s}</span>)
              ) : (
                <span className="muted">None recorded</span>
              )}
            </div>
          </div>

          <div className="field">
            Medications given
            <div className="tag-input">
              {visit.medicationsGiven.length ? (
                visit.medicationsGiven.map((m, i) => <span className="tag" key={i}>{m}</span>)
              ) : (
                <span className="muted">None recorded</span>
              )}
            </div>
          </div>

          <div className="field">
            Notes
            <div className="field-value field-value--block">{visit.notes || '—'}</div>
          </div>

          {visit.transcript && (
            <div className="field">
              Original transcript
              <div className="field-value field-value--block">{visit.transcript}</div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
