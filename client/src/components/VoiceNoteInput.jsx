import { useEffect, useRef, useState } from 'react';

// Browser speech-to-text (fallback input method). This is intentionally
// one of two ways to get text into the box below — the textarea itself
// is a plain, standard field so Wispr Flow or any OS-level dictation
// tool can type into it directly without any integration on our part.
const SpeechRecognitionImpl =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function VoiceNoteInput({
  value,
  onChange,
  language,
  onLanguageChange,
  languages,
  disabled,
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += `${piece} `;
        } else {
          interim += piece;
        }
      }
      const base = baseTextRef.current;
      const joiner = base && !base.endsWith(' ') ? ' ' : '';
      onChange(`${base}${joiner}${finalTranscriptRef.current}${interim}`.trim());
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
    // Intentionally only set up once; language is applied via a ref read
    // at start-time so changing it mid-flow doesn't tear down the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    baseTextRef.current = value;
    finalTranscriptRef.current = '';
    recognition.lang = language;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="voice-input">
      <div className="voice-input-toolbar">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={disabled}
          aria-label="Spoken language"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        {SpeechRecognitionImpl ? (
          <button
            type="button"
            className={listening ? 'mic-btn listening' : 'mic-btn'}
            onClick={toggleListening}
            disabled={disabled}
          >
            {listening ? '● Listening… tap to stop' : '🎤 Tap to speak'}
          </button>
        ) : (
          <span className="muted">
            Built-in mic not supported in this browser — use Wispr Flow or your device's dictation
            directly in the box below.
          </span>
        )}
      </div>

      <textarea
        className="transcript-box"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tap the mic and speak, or click here and dictate with Wispr Flow / your device's voice typing…"
        rows={5}
        disabled={disabled}
      />
      <p className="hint">
        This box works with Wispr Flow, OS-level dictation, or any voice-typing tool too — click
        into it and speak with whatever you already use.
      </p>
    </div>
  );
}
