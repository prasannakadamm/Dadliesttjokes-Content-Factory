# Project Directory Structure Guide

This document establishes the architectural boundaries, ownership domains, and anti-patterns for every directory in the **Dadliesttjokes Content Factory** repository.

---

## 1. Directory Blueprint & Boundary Rules

```text
/
├── apps/
│   ├── web/                     # Next.js App Router frontend foundation
│   └── api/                     # Fastify micro-service API gateway foundation
├── packages/
│   ├── config/                  # Shared TypeScript presets and Zod environment schemas
│   ├── types/                   # Shared API contracts and foundational response types
│   └── utils/                   # Shared pure utility functions (Phase 02+ placeholder)
├── workers/                     # Background queue consumers and video processors (Phase 05+)
├── docs/
│   ├── architecture/            # Architectural decisions and baseline designs
│   ├── development/             # Environment, setup, and structure guides
│   ├── decisions/               # Architecture Decision Records (ADRs)
│   └── operations/              # Operational runbooks and deployment guides
├── scripts/                     # Operational, CI, and maintenance scripts
├── tests/
│   ├── integration/             # Multi-package integration tests
│   └── e2e/                     # End-to-end workflow verification tests
├── .github/
│   └── workflows/               # CI/CD automation pipelines
├── .vscode/                     # Workspace editor settings and extension recommendations
└── .antigravity/                # Agent runtime instructions and session configurations
```

---

## 2. Directory Specifications

### `apps/`

Contains deployable application entry points.

- `apps/web/`:
  - **Phase 02 Baseline:** Minimal Next.js App Router root layout and foundation status page.
  - **Future Scope (Phase 04+):** Mobile-first creator web dashboard and PWA.
  - **Must NOT Be Placed Here:** Heavy background processing logic, database connection pools, un-sanitized server secrets, video rendering engines.
- `apps/api/`:
  - **Phase 02 Baseline:** Fastify micro-service with structured logging, CORS, error handling, and `/health` process endpoint.
  - **Future Scope (Phase 03+):** Database integration, authentication guards, and task dispatchers.
  - **Must NOT Be Placed Here:** UI components, client-side state hooks, long-running CPU-heavy video rendering processes.

### `packages/`

Contains internal, shared workspace packages consumed by apps and workers.

- `packages/config/`:
  - **Belongs Here:** Shared TypeScript tsconfigs (`tsconfig.base.json`, `tsconfig.node.json`, `tsconfig.next.json`), and validated Zod environment schemas.
  - **Must NOT Be Placed Here:** Domain logic or concrete business code.
- `packages/types/`:
  - **Belongs Here:** Shared foundational contract types (e.g. `HealthCheckResponse`, `ApiResponse<T>`).
  - **Must NOT Be Placed Here:** Runtime implementations or heavy libraries.
- `packages/utils/`:
  - **Belongs Here:** Shared pure helper functions, string formatting, date utilities, and common logging wrappers (when justified).
  - **Must NOT Be Placed Here:** App-specific business rules.

### `workers/`

- **Belongs Here:** Background queue consumers, video processing workers, asynchronous transcription jobs, and scheduled cron dispatchers (Phase 05+).
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
