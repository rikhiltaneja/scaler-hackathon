import { useEffect, useState } from 'react';
import { fetchVisits } from '../api/visits';
import type { VisitRecord } from '../types';

interface VisitHistoryProps {
  refreshKey: number;
}

export default function VisitHistory({ refreshKey }: VisitHistoryProps) {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchVisits()
      .then((data) => active && setVisits(data))
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!visits.length) return <p className="muted">No visits recorded yet.</p>;

  return (
    <ul className="visit-list">
      {visits.map((v) => (
        <li key={v.id} className="visit-item">
          <div className="visit-item-header">
            <strong>{v.patientName || 'Unnamed patient'}</strong>
            <span className="muted">
              {v.visitType || '—'} · {new Date(v.createdAt).toLocaleString()}
            </span>
          </div>
          {v.notes && <p className="muted">{v.notes}</p>}
        </li>
      ))}
    </ul>
  );
}
