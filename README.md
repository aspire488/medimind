<p align="center">
<img src="https://raw.githubusercontent.com/aspire488/medimind/main/docs/medimind-architecture.svg" alt="MediMind Care architecture" width="100%"/>
</p>

<p align="center">
<a href="https://medimind-seven.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Open-2ea44f?style=for-the-badge" alt="Live demo"/></a>
<img src="https://img.shields.io/badge/Status-Prototype-orange?style=for-the-badge" alt="Prototype"/>
<img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React 18"/>
<img src="https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
</p>

# MediMind Care

MediMind Care is an AI-assisted medication-reminder and health-workflow prototype exploring role-specific UX, deterministic reminders, accessibility, and bounded AI assistance.

## 🚀 Live Demo

https://medimind-seven.vercel.app/

## ⚠️ Prototype boundary

This is a research/education prototype, not a medical device. It does not provide diagnosis, treatment decisions, or emergency guidance. Use synthetic/demo data only. AI output is untrusted and must be validated.

## 👥 Modes

- **Senior** — simplified controls and medication reminders
- **Patient** — medication tracking and assistant interaction
- **Caregiver** — synthetic alerts and overview workflows

## 🏗 Architecture

React UI → application state → deterministic reminder engine → local data service

Optional AI is isolated behind a bounded context boundary and is not the source of truth for reminder state.

## 🧪 Development

```bash
npm install
npm run dev
npm run build
```

For local AI configuration, copy `.env.example` to `.env` and never commit credentials.

## 🔭 Roadmap

- Browser-level regression coverage with Playwright
- Stronger persistence abstraction
- More accessibility testing
- Clearer AI/mock boundaries

## 📄 License

Prototype code published for educational and engineering experimentation.