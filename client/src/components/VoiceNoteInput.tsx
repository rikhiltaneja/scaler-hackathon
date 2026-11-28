import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { Language } from '../types';

// Browser speech-to-text (fallback input method). This is intentionally
// one of two ways to get text into the box below — the textarea itself
// is a plain, standard field so Wispr Flow or any OS-level dictation
// tool can type into it directly without any integration on our part.
// This package declares SpeechRecognition/webkitSpeechRecognition as
// bare globals (not as properties on Window), so we reference them
// directly rather than through `window.`.
const SpeechRecognitionImpl: typeof SpeechRecognition | undefined =
  typeof window === 'undefined'
    ? undefined
    : typeof SpeechRecognition !== 'undefined'
      ? SpeechRecognition
      : typeof webkitSpeechRecognition !== 'undefined'
        ? webkitSpeechRecognition
        : undefined;

// SpeechRecognition streams audio to Google's cloud speech service to
// transcribe it. 'network' here means the browser couldn't reach that
// service (not a bug in this app) — almost always because the browser
// is a Chromium build without Google's official API key baked in
// (Arc, Brave, and most other Chromium forks all fail this way, every
// time, regardless of connectivity), or less commonly a blocked/offline
// connection or a firewall/extension filtering the endpoint.
function describeMicError(code: SpeechRecognitionErrorCode): string {
  switch (code) {
    case 'network':
      return (
        "Couldn't reach the browser's speech service (network error). If you're on Arc, " +
        'Brave, or another Chromium-based browser, this is expected — those builds lack the ' +
        "API key Google's speech backend requires, so this always fails there. Switch to " +
        "Google Chrome for the built-in mic, or just use Wispr Flow / your device's dictation " +
        'in the box below instead — that works in any browser.'
      );
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was blocked. Allow microphone permission for this site and try again.';
    case 'audio-capture':
      return 'No microphone was found. Check your mic is connected, or use the text box below instead.';
    default:
      return `Speech recognition stopped (${code}). You can try again, or use Wispr Flow / your device dictation in the box below.`;
  }
}

interface VoiceNoteInputProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (code: string) => void;
  languages: Language[];
  disabled?: boolean;
}

export default function VoiceNoteInput({
  value,
  onChange,
  language,
  onLanguageChange,
  languages,
  disabled,
}: VoiceNoteInputProps) {
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseTextRef = useRef('');
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' (silence timeout) and 'aborted' (we called stop/abort
      // ourselves) are normal, not failures — don't alarm the user.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setMicError(describeMicError(event.error));
      }
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

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
    setMicError('');
    recognition.lang = language;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="voice-input">
      <div className="voice-input-toolbar">
        <select
          value={language}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onLanguageChange(e.target.value)}
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

      {micError && <p className="error">{micError}</p>}

      <textarea
        className="transcript-box"
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
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
