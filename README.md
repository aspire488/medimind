# MediMind Care

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=180&section=header&text=MediMind%20Care&fontSize=42&fontColor=ffffff&desc=AI-Assisted%20Medication%20Reminder%20%26%20Health%20Workflow%20Prototype&descAlignY=62&descSize=15" width="100%"/>
</p>

<p align="center">
  <a href="https://medimind-seven.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Open-2ea44f?style=for-the-badge" alt="Live demo"/></a>
  <img src="https://img.shields.io/badge/status-prototype-orange?style=for-the-badge" alt="Prototype"/>
  <img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React 18"/>
  <img src="https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
</p>

> **Prototype warning:** MediMind is an experimental healthcare-assistance interface for research and education. It is **not a medical device** and must not be used for diagnosis, treatment decisions, emergency response, or medication decisions.

## What is MediMind?

MediMind explores how a medication reminder and health-assistance application can adapt its interface to different users while keeping application state separate from the AI layer.

The prototype currently demonstrates three experiences:

- **Senior Citizen** — large controls, voice reminders, simplified navigation and SOS access.
- **Standard Patient** — medication schedules, adherence information, and AI assistance.
- **Caregiver/Nurse** — multi-patient monitoring, alerts and adherence views.

## Architecture

```text
                    ┌─────────────────────┐
                    │      React UI        │
                    │ Senior / Patient /   │
                    │      Caregiver       │
                    └──────────┬──────────┘
                               │
                 ┌─────────────▼─────────────┐
                 │        React State        │
                 │ Auth / Medicine / Alert  │
                 │       / Conversation     │
                 └─────────────┬─────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
      DataService        ReminderEngine       AI Layer
      localStorage       60s ticker            │
                                                ├─ local fallback
                                                ├─ query cache
                                                ├─ context builder
                                                └─ Gemini (optional)
```

### AI boundary

The AI layer does **not** access storage directly. `PatientContextBuilder` converts current application state into a bounded prompt context. Local rules and caching can satisfy common requests without an API call.

Supported local-style intents include:

- next medicine/dose
- today's intake summary
- medicine count
- adherence/streak information
- medicine list
- reminder snooze
- greetings

## Core features

| Area | Current prototype capability |
|---|---|
| Medication | schedules, intake logging, missed-dose state |
| Reminders | periodic schedule checking and alerts |
| Adherence | daily history, streaks and weekly visualization |
| AI assistant | Gemini integration with local fallback and cache |
| Voice | browser speech recognition + text-to-speech |
| Accessibility | senior-oriented large controls and typography |
| Caregiver | patient cards, alerts and detail views |
| Storage | localStorage behind a `DataService` abstraction |
| Hardware concept | simulated dispenser view |
| Language | English + Malayalam preference paths |

## Quick start

```bash
npm ci
npm run dev
```

Open the local Vite URL shown in the terminal.

### Demo accounts

| User | PIN | Mode |
|---|---:|---|
| Arjun Nair | `1234` | Standard patient |
| Leela Menon | `0000` | Senior citizen |
| Priya Nair | `9999` | Caregiver |

## AI configuration

The safe development default is mock/local mode.

```bash
cp .env.example .env.development
```

For live Gemini experimentation, set the appropriate Vite environment variables locally. **Never commit a real API key.**

## Development validation

```bash
npm ci
npm run build
```

GitHub Actions runs the production build on pushes and pull requests to `main`.

## Repository structure

```text
src/
├── components/       # reusable UI components
├── contexts/         # application state
├── hooks/            # React integration hooks
├── screens/          # role-specific and shared screens
├── services/         # storage, reminders and AI services
└── utils/            # helpers and demo seed data
```

## Design principles

1. **AI is an assistant, not the source of truth.**
2. **Application state stays outside the model.**
3. **Common deterministic intents should not require an API call.**
4. **Sensitive or clinical claims must not be presented as authoritative medical advice.**
5. **Status indicators use text as well as color.**
6. **The storage layer is replaceable without rewriting the UI.**

## Prototype roadmap

- [x] Three role-oriented interfaces
- [x] Medication/reminder state model
- [x] Local fallback and response cache
- [x] Gemini integration path
- [x] Accessibility-focused senior mode
- [x] Production build validation in CI
- [x] Safe environment template
- [ ] Automated browser/e2e coverage
- [ ] Stronger test coverage for reminder and adherence logic
- [ ] Replace local-only persistence with an explicitly designed backend
- [ ] Formal privacy/threat model before handling any real user data

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Keep changes focused, preserve the prototype boundary, and use synthetic data only.

## Security

See [`SECURITY.md`](SECURITY.md). Do not commit credentials or real medical/personal data.

## License

See [`LICENSE`](LICENSE).

## Links

- **Live demo:** https://medimind-seven.vercel.app/
- **Repository:** https://github.com/aspire488/medimind

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2c5364,100:0f2027&height=110&section=footer" width="100%"/>
</p>
