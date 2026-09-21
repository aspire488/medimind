# Contributing

Thanks for contributing to MediMind Care.

MediMind is an educational/research prototype for AI-assisted health workflows. Contributions should preserve the project's explicit safety boundary and keep deterministic workflow state separate from untrusted AI output.

## What to contribute

Useful contributions include:
- bug fixes and regression tests
- accessibility improvements
- browser-level and component test coverage
- deterministic workflow improvements
- documentation and architecture clarification
- security and credential-hygiene improvements
- dependency updates that can be validated against the prototype

## Safety boundary

MediMind is **not a medical device or clinical software**.

Do not add features that present the prototype as providing diagnosis, treatment decisions, emergency guidance, or clinical authority.

Use synthetic/demo data only. Never commit real patient information, credentials, API keys, or other secrets.

AI output must remain untrusted. Safety-critical workflow state should remain deterministic and independently validated.

## Development

```bash
npm install
npm run dev
npm run build
```

For local AI configuration, copy `.env.example` to `.env` and never commit the resulting `.env` file.

## Pull requests

1. Create a focused branch, for example `feature/accessibility-fix`.
2. Keep the change scoped to one problem.
3. Add or update tests when behavior changes.
4. Run the relevant validation locally.
5. Explain the problem, implementation, and validation in the PR.
6. Avoid unrelated formatting or dependency churn.

For dependency updates, include the affected package and validation result where practical.

## Documentation accuracy

Claims about performance, security, test coverage, AI behavior, or clinical capabilities should be backed by reproducible evidence.

Do not add fabricated metrics, users, test results, clinical claims, or production-readiness claims.

## License

By contributing, you agree that your contributions are licensed under the repository's existing license.
