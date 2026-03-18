# MediMind Care

> AI-powered medicine reminder and health assistant application

A production-quality React + Vite mobile-first web app supporting **three interface modes** — Senior Citizen, Standard Patient, and Caregiver/Nurse — with a full AI assistant pipeline powered by Google Gemini.

---

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

### Demo accounts

| Account         | PIN    | Mode             |
|-----------------|--------|------------------|
| Arjun Nair      | `1234` | Standard patient |
| Leela Menon     | `0000` | Senior citizen   |
| Priya Nair      | `9999` | Caregiver        |

---

## Project Structure

```
src/
├── App.jsx                          # Router + role-gated routes
├── main.jsx                         # Entry point
├── styles/
│   └── global.css                   # Design tokens + utility classes
│
├── services/
│   ├── DataService.js               # localStorage abstraction layer
│   └── ai/
│       ├── ChatService.js           # 5-layer AI orchestrator
│       ├── GeminiService.js         # Gemini API + retry/backoff
│       ├── FallbackService.js       # Rule-based local responses
│       ├── QueryCache.js            # TTL response cache
│       ├── PatientContextBuilder.js # Builds AI context from state
│       ├── SpeechRecognitionService.js  # Web Speech API wrapper
│       └── TextToSpeechService.js   # speechSynthesis wrapper
│
├── contexts/
│   ├── AuthContext.jsx              # User session + role
│   ├── MedicineContext.jsx          # Medicine schedule state
│   ├── ReminderContext.jsx          # Reminder engine (60s ticker)
│   └── ChatContext.jsx              # AI conversation state
│
├── hooks/
│   └── useAIChat.js                 # Wires all 5 AI services
│
├── components/common/
│   ├── NavigationBar.jsx            # 3-tab (Senior) / 4-tab (others)
│   ├── MedicineCard.jsx             # Large + compact variants
│   ├── ReminderAlert.jsx            # Full-screen reminder modal
│   ├── AdherenceRing.jsx            # SVG circular progress
│   ├── AIChatBubble.jsx             # User + AI message bubbles
│   ├── PatientCard.jsx              # Caregiver patient card
│   ├── StatusBadge.jsx              # Color + text status (always paired)
│   ├── WeeklyBar.jsx                # 7-day adherence bar chart
│   └── SOSButton.jsx                # Emergency SOS trigger
│
├── screens/
│   ├── auth/
│   │   ├── SplashScreen.jsx
│   │   └── LoginScreen.jsx
│   ├── senior/
│   │   ├── SeniorDashboard.jsx
│   │   └── SeniorScreens.jsx        # SeniorMedicines, SeniorAI
│   ├── standard/
│   │   ├── StandardDashboard.jsx
│   │   └── StandardScreens.jsx      # Medicines, AddMedicine, AI, Profile
│   ├── caregiver/
│   │   └── CaregiverScreens.jsx     # Dashboard, Patients, Alerts, Detail, Profile
│   └── shared/
│       ├── ConfirmationSuccess.jsx
│       ├── MissedDose.jsx
│       ├── DispenserView.jsx        # Hardware simulation
│       ├── AdherenceHistory.jsx     # 30-day calendar
│       └── MedicineDetail.jsx
│
└── utils/
    ├── helpers.js                   # Formatting, adherence, streak calc
    └── seedData.js                  # Demo data seeder
```

---

## Three Interface Modes

### 1. Senior Mode (`/senior`)
Designed for elderly users. PIN: `0000`

- Minimum 20px body text, medicine names 24–30px
- Buttons minimum 64px tall, TAKE MEDICINE full-width 72px
- 3-tab navigation: Home · Medicines · AI Help
- Voice reminders auto-fire on every alert (TTS)
- Large PIN keypad
- Suggestion chips in English and Malayalam
- SOS button always visible

### 2. Standard Mode (`/standard`)
For tech-comfortable patients. PIN: `1234`

- Compact 11–16px typography
- Dark navy header with stat strip
- 4-tab navigation: Home · Medicines · AI Chat · Profile
- 4-step Add Medicine form with segmented controls
- Weekly bar chart + adherence ring
- "Switch to Senior Mode" in Profile settings

### 3. Caregiver Mode (`/caregiver`)
Multi-patient monitoring dashboard. PIN: `9999`

- Priority-sorted patient cards (Critical → Warning → Resolved)
- Alert panel with active/resolved sections
- Patient detail: timeline, weekly chart, quick actions
- Filter chips: All · Missed · Due Soon · Good
- Privacy enforcement: AI chat always hidden from caregivers

---

## AI Assistant

### Architecture (5 services)

```
User message
  → SpeechRecognitionService  (Web Speech API, en/ml)
  → ChatService               (5-layer guard)
      Layer 1: Debounce 600ms + pending guard
      Layer 2: DEV_MODE mock bypass
      Layer 3: Local fallback (7 rule patterns)
      Layer 4: QueryCache (TTL: 2/5/30 min)
      Layer 5: GeminiService (retry + backoff)
  → PatientContextBuilder     (state → prompt context)
  → GeminiService             (gemini-2.0-flash)
  → TextToSpeechService       (speechSynthesis, en/ml)
  → ChatContext               (message history)
```

### Key design rule

**The AI never touches the database directly.** `PatientContextBuilder` reads from React state (MedicineContext + ReminderContext) and serialises it to a flat text summary injected into every Gemini prompt. This keeps the AI grounded in accurate, real-time data.

### Supported queries (handled locally without API call)

| Pattern | Response |
|---|---|
| "next medicine / dose" | Next scheduled dose |
| "did I take / have I taken" | Today's intake summary |
| "remind me in N minutes" | Sets snooze |
| "how many medicines today" | Count |
| "streak / adherence" | Stats |
| "my medicines / list" | Full schedule |
| "hello / good morning" | Personalised greeting |

### Rate limit protection

| Layer | Strategy | API calls saved |
|---|---|---|
| `.env.development` | `VITE_AI_MODE=mock` — zero API during UI dev | 100% |
| StrictMode guard | `useRef(false)` prevents double-mount | 50% |
| Singleton service | Survives HMR cycles | Prevents re-init |
| Pending guard | Drops while request in flight | Eliminates stacking |
| Debounce 600ms | Drops rapid consecutive calls | 90% of typing |
| Query cache | TTL-keyed by question + context hash | 60–70% repeated |
| Local fallback | 7 regex rules, zero API cost | 60% of real usage |
| Retry backoff | 2s → 4s → 8s on 429 | Handles quota bursts |

---

## Configuration

### Enable real Gemini AI

1. Get a free API key from [ai.google.dev](https://ai.google.dev)
2. Edit `.env.development`:

```env
VITE_AI_MODE=live
VITE_GEMINI_KEY=your-actual-key-here
```

Leave `VITE_AI_MODE=mock` during UI development to avoid burning quota.

### Language support

Users can set language preference (`en` or `ml`) in their profile. The AI assistant and TTS auto-switch to English or Malayalam based on this preference.

---

## Reminder Engine

The `ReminderContext` runs a 60-second ticker that:

1. Compares `Date.now()` against each medicine's scheduled time
2. Fires `ReminderAlert` modal within ±2 minutes of scheduled time  
3. Waits 10 minutes for confirmation
4. On confirm: logs intake, updates streak, invalidates cache
5. On timeout: marks missed, saves alert for caregiver, shows missed banner

---

## Color System

Shared across all three modes — meaning never changes:

| Color | Hex | Meaning |
|---|---|---|
| Green | `#28A06E` | Medicine taken · Success · On track |
| Amber | `#E8A020` | Due soon · Warning · Pending |
| Red | `#D43A3A` | Missed · Critical · SOS · Danger |
| Blue | `#1A6FBD` | Primary action · Active tab · Selected |
| Navy | `#0F1B35` | Headers · Dark surfaces |

**Rule enforced everywhere:** Every status indicator shows color AND text label. Never color alone.

---

## Data Storage

The prototype uses `localStorage` via `DataService.js`. All data access goes through this abstraction layer — upgrading to SQLite or a REST API requires only changing `DataService.js`, nothing else.

### Stores

| Key | Contents |
|---|---|
| `mm_users` | User accounts (name, PIN, role, linkedPatients) |
| `mm_medicines` | Medicine schedules per patient |
| `mm_intake_logs` | Daily intake confirmations |
| `mm_alerts` | Caregiver alerts (missed doses, SOS) |
| `mm_settings` | Per-user notification preferences |

### Privacy boundary

`DataService.getPatientAdherenceData()` intentionally excludes `ai_chat_history` and `personal_notes`. These fields are never returned to caregiver queries.

---

## Development Notes

- `VITE_AI_MODE=mock` is set in `.env.development` — safe to develop the entire UI without any API calls
- Demo data is seeded automatically on first launch by `seedData.js`
- The app is mobile-first (max-width 430px shell) but works in any browser
- All screens are fully functional offline (reminders, medicines, adherence) — only AI chat requires network when in live mode
