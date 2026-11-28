import { useState } from 'react';
import VoiceNoteInput from '../components/VoiceNoteInput';
import VisitForm from '../components/VisitForm';
import VisitHistory from '../components/VisitHistory';
import Modal from '../components/Modal';
import { extractVisit, submitVisit } from '../api/visits';
import { getCurrentLocation } from '../utils/geolocation';
import type { AppStatus, ExtractedVisit, Language } from '../types';

const LANGUAGES: Language[] = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
];

export default function HomePage() {
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0].code);
  const [extracted, setExtracted] = useState<ExtractedVisit | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [historyVersion, setHistoryVersion] = useState(0);

  async function handleFillForm() {
    if (!transcript.trim()) return;
    setStatus('extracting');
    setGenerateError('');
    try {
      const { extracted: result } = await extractVisit(transcript, language);
      setMockMode(Boolean(result.mockMode));
      setExtracted(result);
      setStatus('review');
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : String(err));
      setStatus('idle');
    }
  }

  async function handleSubmit() {
    if (!extracted) return;
    setStatus('submitting');
    setError('');
    try {
      // Only fetched here, at save time — never sent to /extract, so it
      // never reaches the LLM. Permission denied/unavailable just means
      // the visit saves without a location, not a blocked submission.
      const location = await getCurrentLocation();
      await submitVisit({ transcript, language, location, extracted });
      setTranscript('');
      setExtracted(null);
      setHistoryVersion((v) => v + 1);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('review');
    }
  }

  function handleEditAgain() {
    setExtracted(null);
    setStatus('idle');
  }

  return (
    <>
      <section className="panel">
        <h2>1. Speak the visit notes</h2>
        <VoiceNoteInput
          value={transcript}
          onChange={setTranscript}
          language={language}
          onLanguageChange={setLanguage}
          languages={LANGUAGES}
          disabled={status === 'extracting' || status === 'submitting'}
        />
        <button
          type="button"
          className="primary-btn"
          onClick={handleFillForm}
          disabled={!transcript.trim() || status === 'extracting' || status === 'submitting'}
        >
          {status === 'extracting' ? 'Filling form…' : 'Fill form from speech'}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      {status === 'extracting' && (
        <Modal>
          <div className="modal-spinner" aria-hidden="true" />
          <p>Generating visit from your recording…</p>
        </Modal>
      )}

      {generateError && (
        <Modal onClose={() => setGenerateError('')}>
          <h3>Couldn't generate the visit</h3>
          <p className="error">{generateError}</p>
          <button type="button" className="primary-btn" onClick={() => setGenerateError('')}>
            Close
          </button>
        </Modal>
      )}

      {extracted && (
        <section className="panel">
          <h2>2. Review &amp; confirm</h2>
          {mockMode && (
            <p className="notice">
              LLM extraction isn't configured yet (no <code>GEMINI_API_KEY</code>) — showing
              sample data, with your transcript in Notes. Add a key in{' '}
              <code>server/.env</code> to enable real auto-fill.
            </p>
          )}
          {extracted.completenessTip && <p className="notice">💡 {extracted.completenessTip}</p>}
          <VisitForm
            data={extracted}
            onChange={setExtracted}
            submitting={status === 'submitting'}
            onSubmit={handleSubmit}
            onEditAgain={handleEditAgain}
          />
        </section>
      )}

      <section className="panel">
        <h2>Recent visits</h2>
        <VisitHistory refreshKey={historyVersion} />
      </section>
    </>
  );
}
