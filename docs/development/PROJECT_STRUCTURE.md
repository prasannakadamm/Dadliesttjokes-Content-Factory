# Project Directory Structure Guide

This document establishes the architectural boundaries, ownership domains, and anti-patterns for every directory in the **Dadliesttjokes Content Factory** repository.

---

## 1. Directory Blueprint & Boundary Rules

```text
/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── config/
│   ├── types/
│   └── utils/
├── workers/
├── docs/
│   ├── architecture/
│   ├── development/
│   ├── decisions/
│   └── operations/
├── scripts/
├── tests/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
├── .vscode/
└── .antigravity/
```

---

## 2. Directory Specifications

### `apps/`

Contains deployable application entry points.

- `apps/web/`:
  - **Belongs Here:** Future mobile-first creator web dashboard and PWA (Phase 05+).
  - **Must NOT Be Placed Here:** Heavy background processing logic, database connection pools, un-sanitized server secrets, video rendering engines.
- `apps/api/`:
  - **Belongs Here:** Future HTTP/WebSocket API gateway, request routing, authentication guards, and task dispatchers (Phase 02+).
  - **Must NOT Be Placed Here:** UI components, client-side state hooks, long-running CPU-heavy video rendering processes.

### `packages/`

Contains internal, shared workspace packages consumed by apps and workers.

- `packages/config/`:
  - **Belongs Here:** Shared TypeScript, ESLint, Prettier, or environment validation schemas (Phase 02+).
  - **Must NOT Be Placed Here:** Domain logic or concrete business code.
- `packages/types/`:
  - **Belongs Here:** Shared domain types, DTO interfaces, database entity types, and API contract specifications (Phase 02+).
  - **Must NOT Be Placed Here:** Runtime implementations or heavy libraries.
- `packages/utils/`:
  - **Belongs Here:** Shared pure helper functions, string formatting, date utilities, and common logging wrappers (Phase 02+).
  - **Must NOT Be Placed Here:** App-specific business rules.

### `workers/`

- **Belongs Here:** Background queue consumers, video processing workers, asynchronous transcription jobs, and scheduled cron dispatchers (Phase 03+).
- **Must NOT Be Placed Here:** Synchronous user-facing web handlers or UI templates.

### `docs/`

Authoritative documentation for the project.

- `docs/architecture/`: Technical specifications, data models, baseline architectures, and system component diagrams.
- `docs/development/`: Guides on local setup, developer workflows, conventions, and environment details.
- `docs/decisions/`: Formal Architecture Decision Records (ADRs) tracking options, rationales, and consequences.
- `docs/operations/`: Deployment manifests, operational runbooks, backup/restore procedures, and disaster recovery plans.
- **Must NOT Be Placed Here:** Compiled code, secrets, binaries, or media outputs.

### `scripts/`

- **Belongs Here:** Repository maintenance scripts, seed scripts, database migration runners, and release helper scripts.
- **Must NOT Be Placed Here:** Core application business logic or secrets.

### `tests/`

Multi-package integration and end-to-end test suites.

- `tests/integration/`: Cross-package integration tests (e.g., API interacting with worker queues).
- `tests/e2e/`: Full end-to-end user and publishing simulation tests.
- **Must NOT Be Placed Here:** Package-isolated unit tests (which live adjacent to their source code inside `packages/*` or `apps/*`).

### `.github/`

- **Belongs Here:** GitHub Actions workflows (`.github/workflows/`), issue templates, and pull request guidelines.
- **Must NOT Be Placed Here:** Secrets or private configuration tokens.

### `.vscode/`

- **Belongs Here:** Project-scoped editor settings (`settings.json`) and extension recommendations (`extensions.json`).
- **Must NOT Be Placed Here:** User-specific local overrides, credentials, or personal keybindings.

### `.antigravity/`

- **Belongs Here:** Antigravity IDE configuration, agent execution prompts, and session governance files.
- **Must NOT Be Placed Here:** Application runtime code.
