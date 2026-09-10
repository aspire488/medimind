<p align="center">
<img src="https://raw.githubusercontent.com/aspire488/medimind/main/docs/medimind-architecture.svg" alt="MediMind Care architecture" width="100%"/>
</p>

<p align="center">
<a href="https://medimind-seven.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Open-2ea44f?style=for-the-badge" alt="Live demo"/></a>
<img src="https://img.shields.io/badge/Status-Prototype-orange?style=for-the-badge" alt="Prototype"/>
<img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React 18"/>
<img src="https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/github/license/aspire488/medimind?style=for-the-badge" alt="License"/>
</p>

# MediMind Care

**MediMind Care is an AI-assisted health-workflow prototype focused on role-specific UX, deterministic medication reminders, accessibility, and explicit AI safety boundaries.**

## 🚀 Live prototype

**Try it:** https://medimind-seven.vercel.app/

The live deployment is an educational/research prototype using synthetic/demo data.

## ⚠️ Safety boundary

> **MediMind is not a medical device and is not clinical software.** It does not provide diagnosis, treatment decisions, or emergency guidance.

The engineering goal is to demonstrate how AI can assist around a deterministic workflow without becoming the source of truth for safety-critical state.

- Synthetic/demo data only
- No real patient records or credentials
- AI output is untrusted and must be validated
- Reminder/workflow state remains deterministic
- Production clinical use is explicitly out of scope

## 👥 User modes

- **Senior** — simplified controls and medication reminders
- **Patient** — medication tracking and assistant interaction
- **Caregiver** — synthetic alerts and overview workflows

## 🏗️ Architecture

```text
┌─────────────────────────────────────┐
│              React UI               │
│ senior · patient · caregiver views  │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│          Application State           │
│ roles · sessions · workflow state   │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│     Deterministic Reminder Layer    │
│ schedules · reminders · local rules │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│          Local Data Layer            │
│ demo persistence / application data │
└─────────────────────────────────────┘

        ┌─────────────────────────┐
        │ Optional AI assistance  │
        │ bounded + non-authority │
        └─────────────────────────┘
```

See [`docs/medimind-architecture.svg`](docs/medimind-architecture.svg) for the visual architecture.

## 🧪 Engineering status

Current public baseline:

- Node 20 production-build CI
- Explicit environment/credential hygiene
- Prototype-specific security guidance
- Deterministic reminder architecture
- Synthetic-data boundary
- Architecture documentation
- Browser regression testing tracked as the next major validation milestone

## 🛠️ Development

```bash
npm install
npm run dev
npm run build
```

For local AI configuration, copy `.env.example` to `.env` and never commit credentials.

CI validates the production build on Node 20. Dependabot monitors npm and GitHub Actions dependencies weekly.

## 🔭 Roadmap

- [ ] Browser-level regression coverage with Playwright
- [ ] Stronger persistence abstraction
- [ ] More accessibility testing
- [ ] Clearer AI/mock boundaries
- [ ] More synthetic workflow fixtures

## 📌 Related engineering work

- [Issue #2 — Browser-level regression coverage](https://github.com/aspire488/medimind/issues/2)
- [PR #1 — Public-development hardening](https://github.com/aspire488/medimind/pull/1)
- [PR #3 — Safety and testing contract](https://github.com/aspire488/medimind/pull/3)

## 📄 License

Prototype code published for educational and engineering experimentation.