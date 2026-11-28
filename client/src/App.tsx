import { useState } from 'react';
import VoiceNoteInput from './components/VoiceNoteInput';
import VisitForm from './components/VisitForm';
import VisitHistory from './components/VisitHistory';
import { extractVisit, submitVisit } from './api/visits';
import type { AppStatus, ExtractedVisit, Language } from './types';
import './App.css';

const LANGUAGES: Language[] = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
];

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0].code);
  const [extracted, setExtracted] = useState<ExtractedVisit | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState('');
  const [historyVersion, setHistoryVersion] = useState(0);

  async function handleFillForm() {
    if (!transcript.trim()) return;
    setStatus('extracting');
    setError('');
    try {
      const { extracted: result } = await extractVisit(transcript, language);
      setMockMode(Boolean(result.mockMode));
      setExtracted(result);
      setStatus('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('idle');
    }
  }

  async function handleSubmit() {
    if (!extracted) return;
    setStatus('submitting');
    setError('');
    try {
      await submitVisit({ transcript, language, extracted });
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
    <div className="app">
      <header className="app-header">
        <h1>Sahayika Voice Intake</h1>
        <p>Speak the home visit notes — the form fills itself.</p>
      </header>

      <main className="app-main">
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

        {extracted && (
          <section className="panel">
            <h2>2. Review &amp; confirm</h2>
            {mockMode && (
              <p className="notice">
                LLM extraction isn't configured yet (no <code>ANTHROPIC_API_KEY</code>) — showing
                the raw transcript in Notes. Add a key in <code>server/.env</code> to enable
                auto-fill.
              </p>
            )}
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
      </main>
    </div>
  );
}
