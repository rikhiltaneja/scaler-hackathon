# Sahayika Voice Intake

**Scaler × Wispr Flow Hackathon — Theme: Healthcare Access**

A voice-first home-visit intake tool for ASHA (Accredited Social Health Activist) workers.
Instead of handwriting notes on a paper register and later re-typing them into a digital
portal, the worker simply **speaks** a natural summary of the visit — the app transcribes
it, extracts a structured record, flags anything risky (e.g. high blood pressure, fever),
and lets her confirm with a single tap.

## Why this problem

ASHA workers do home visits (antenatal checkups, newborn care, immunization tracking) and
currently record data by hand, then separately re-enter it into apps like ANMOL/RCH —
often in a script they're not fast at typing, on a small screen, after a long day. That
causes double work, delays, and missed escalations. Replacing the typing step with speech
removes the main friction without changing what already works for them.

## How voice input works

The transcript box is a plain, standard text field, filled in one of two ways:

1. **Built-in mic button** — browser `SpeechRecognition` (Web Speech API), works
   standalone with no setup, good fallback for any device/browser that supports it.
   **Use Google Chrome for this** — Arc, Brave, and most other Chromium-based browsers
   omit the API key Google's cloud speech backend requires, so the mic button fails
   there with a `network` error every time, regardless of connectivity. The app surfaces
   this in the UI and points the user to option 2 below when it happens.
2. **Any external dictation tool** — Wispr Flow, OS-level voice typing (Windows, macOS,
   Android/Gboard), etc. Since the box is a normal textarea, these tools can type into it
   directly — no integration needed on our side, and it works in any browser.

Either way, the same transcript flows into the same pipeline: **transcript → LLM
structured extraction → editable auto-filled form → rule-based risk flags → confirm &
submit.**

## Tech stack

- **Frontend**: React (Vite) — `client/`
- **Backend**: Express — `server/`
- **Structured extraction**: Anthropic Claude (tool-use for guaranteed JSON output).
  Runs in a clearly-labeled **mock mode** (echoes the transcript into Notes, no auto-fill)
  until an `ANTHROPIC_API_KEY` is set — the rest of the app is fully testable without one.
- **Storage**: in-memory for now (see [BACKLOG.md](./BACKLOG.md))

## Project structure

```
client/   React app (voice input, review form, visit history)
server/   Express API (extraction, risk flags, visit storage)
```

## Setup

```bash
npm run install:all     # installs client + server dependencies
```

Copy `server/.env.example` to `server/.env` and fill in `ANTHROPIC_API_KEY` to enable
real structured extraction (optional — leave blank to run in mock mode).

## Running locally

```bash
npm run dev    # runs client (http://localhost:5173) and server (http://localhost:5050) together
```

Or individually: `npm run dev:client` / `npm run dev:server`.

The Vite dev server proxies `/api/*` to the Express backend (see `client/vite.config.js`),
so the frontend never hardcodes a backend port.

## API

- `POST /api/visits/extract` — `{ transcript, language }` → structured, risk-flagged draft
- `POST /api/visits` — persist a (possibly edited) structured visit
- `GET /api/visits` — list recent visits
- `GET /api/visits/:id` — fetch one visit

## Backlog

See [BACKLOG.md](./BACKLOG.md) — notably **in-built text-to-speech** to read the filled
form back to the worker, and wiring a real LLM key.
