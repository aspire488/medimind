# Security Policy

MediMind is a prototype healthcare-assistance project for research and educational experimentation. It must not be used for diagnosis, treatment decisions, emergency response, or as a substitute for qualified medical care.

## Reporting security issues

Please do not publish secrets, API keys, private health information, or exploit details in a public issue. Report security problems privately through the repository's available GitHub security reporting mechanism or contact the maintainer privately through GitHub.

## Data safety

- Never commit real Gemini/API credentials.
- Never use real patient or medical data in development fixtures.
- Local/demo data should remain synthetic.
- Treat AI output as untrusted assistance and validate it before acting on it.


## Browser API-key boundary

- Never put Gemini, OpenAI, Anthropic, or other provider credentials in `VITE_*` variables. Vite embeds these values in client-side bundles, where every visitor can extract them.
- The public client currently disables direct remote-provider calls and falls back to deterministic local responses.
- Do not re-enable remote providers until calls go through an authenticated, rate-limited server-side endpoint with credentials stored only in server environment variables.
- If a provider key was previously supplied to a public Vite build, assume it was exposed: revoke/rotate it with the provider and inspect deployment assets and build logs.
