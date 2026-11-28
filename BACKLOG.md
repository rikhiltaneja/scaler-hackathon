# Backlog

Deferred items, roughly in priority order.

- **In-built text-to-speech (TTS)** — read the auto-filled form fields and risk flags
  back to the ASHA worker so she can confirm by ear instead of reading a screen (useful
  for low-literacy users and noisy/low-light field conditions). Candidate: Web Speech
  API `SpeechSynthesis` on the client, same pattern as the STT fallback already in place.
- **Wire a real `GEMINI_API_KEY`** — pipeline currently runs in mock mode (sample data,
  with the transcript in Notes) until a key is added to `server/.env`.
- **Supervisor dashboard** — aggregate view across ASHA workers for a PHC supervisor:
  filter by risk flag, visit type, date range.
- **Persistent storage** — swap the in-memory `visitsStore` for SQLite/Postgres so data
  survives a server restart.
- **Expand language support** — currently English/Hindi toggle for the Web Speech
  fallback; add more Indian languages (Tamil, Telugu, Marathi, Bengali, …).
- **Installable mobile app** — wrap the web app as a PWA (manifest + service worker) so
  ASHA workers can install it on their phone home screen and use it semi-offline.
- **Offline-first support** — queue visits locally when connectivity drops during a
  home visit, sync when back online.
- **Per-field re-dictation** — let the worker tap a single field (e.g. "Notes") and
  re-speak just that value instead of redoing the whole transcript.
