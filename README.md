# MediMind Care

**MediMind Care is an AI-assisted medication-reminder and health-workflow prototype** focused on role-specific UX, deterministic reminder state, accessibility, synthetic data, and explicit boundaries around untrusted AI assistance.

> **Project status:** MediMind is now treated as a completed/frozen prototype. The repository has been hardened for public inspection and reproducibility; clinical or production-health development is explicitly out of scope.

## ⚠️ Safety boundary

> **MediMind is not a medical device and is not clinical software.**

It must not be presented as providing diagnosis, treatment decisions, emergency guidance, or clinical authority.

The prototype uses synthetic/demo data only.

- no real patient records
- no real credentials
- AI output is untrusted
- reminder/workflow state remains deterministic
- clinical use is explicitly out of scope

These constraints are part of the engineering design, not optional documentation.

## 👥 User modes

- **Senior** — simplified controls and medication reminders
- **Patient** — medication tracking and assistant interaction
- **Caregiver** — synthetic alerts and overview workflows

## 🏗️ Architecture

```text
React UI
   ↓
Application State
   ↓
Deterministic Reminder Layer
   ↓
Local / Demo Data

Optional AI assistance remains bounded and non-authoritative.
```

See [`docs/medimind-architecture.svg`](docs/medimind-architecture.svg).

## 🧪 Final engineering baseline

- Node 22 development/CI baseline
- deterministic production-build validation
- Playwright browser regression smoke suite in CI
- Chromium installation in CI for browser validation
- CodeQL JavaScript analysis
- Dependabot dependency monitoring
- explicit environment/credential hygiene
- synthetic-data safety boundary
- deterministic workflow state
- architecture and contribution documentation
- deployment security headers
- MIT licensing

The prototype intentionally retains its React 18/Vite 6 application stack rather than introducing an unvalidated framework migration.

## 🔐 Security posture

The deployment includes defensive HTTP headers:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- restrictive `Permissions-Policy`

Never commit API keys, private health information, patient records, session data, or other secrets.

See [`SECURITY.md`](SECURITY.md).

## 🛠️ Development

```bash
npm install
npm run dev
npm run build
npm run test:e2e
```

For local AI configuration, copy `.env.example` to `.env`. The resulting `.env` must never be committed.

## 🧪 Browser validation

The Playwright smoke suite runs against the production preview server.

```bash
npm run build
npm run test:e2e
```

The CI environment installs Chromium and runs the browser regression suite automatically.

## 🤝 Contributing

Maintenance contributions are welcome when they improve correctness, accessibility, security, reproducibility, documentation, or dependency hygiene while preserving the safety boundary.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## 📜 License

MediMind Care is released under the **MIT License**. See [`LICENSE`](LICENSE).

The MIT License is the OSI-approved license identified by SPDX as `MIT`. citeturn0search3