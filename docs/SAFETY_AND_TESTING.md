# MediMind safety and testing contract

MediMind is a healthcare-workflow prototype for research and education. It is not a medical device, diagnostic system, treatment system, or emergency service.

## Safety boundaries

- Use synthetic/demo data only during development.
- Never commit API keys, credentials, or real patient information.
- AI output is untrusted text and must not be treated as clinical authority.
- Deterministic reminders and application state should remain independent of model availability.
- A missing or failing AI provider must not prevent the core prototype workflow from operating in mock mode.

## Engineering model

```text
User interaction
      |
      v
Role-specific UI
      |
      +------> deterministic reminder / workflow state
      |
      +------> bounded AI assistance (optional)
      |
      v
Accessible feedback
```

The AI layer is intentionally a dependency at the assistance boundary rather than the source of truth for application state.

## Testing contract

Every new feature should preserve these layers:

1. **Build:** production bundle succeeds with no secret dependency.
2. **Unit:** deterministic workflow logic has focused tests where practical.
3. **Browser:** critical journeys should be covered as Playwright coverage is introduced.
4. **Safety:** tests must use synthetic fixtures and must not require a live medical service.

## Browser regression roadmap

The next high-value test suite should cover:

- application boot without an API key
- patient medication workflow
- senior accessibility/control workflow
- caregiver synthetic-alert workflow
- AI mock/fallback behavior

These tests should validate observable user behavior rather than implementation details.

## Prototype boundary

The project should prefer a smaller, reliable workflow over claims of clinical intelligence. Any future clinical-facing capability would require a separate validation, privacy, security, and regulatory review process.
