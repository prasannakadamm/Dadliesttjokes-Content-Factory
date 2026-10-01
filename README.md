# Dadliesttjokes Content Factory

> **Current Phase: Phase 04 — Web Dashboard**<br />
> **Status:** ACTIVE / VERIFICATION PENDING (Phase 05 NOT STARTED)

---

## 1. Project Purpose

The **Dadliesttjokes Content Factory** is designed as a cloud-based AI content automation platform engineered specifically for the **Dadliesttjokes** social-media brand.

The long-term objective of this platform is to automate the end-to-end content lifecycle:

- Ingest authorized video uploads and raw media sources.
- Transform long-form video material into high-engagement short-form vertical videos (9:16).
- Generate intelligent captions, hashtags, and metadata aligned with the brand's humor and style.
- Apply automated brand styling, watermarks, intro/outro cards, and punchline timing.
- Perform automated quality control (audio clarity, aspect ratios, visual fidelity, pacing).
- Maintain organized storage for raw sources, project files, and processed media.
- Facilitate human-in-the-loop review and multi-stage approval workflows.
- Schedule and publish content across supported social media platforms (YouTube Shorts, Instagram Reels, TikTok, Facebook).
- Ingest and analyze post-publishing performance metrics.
- Provide continuous platform health monitoring and automated failure recovery.

> **CRITICAL PHASE 04 NOTICE:**<br />
> **Web Dashboard Only.**<br />
> Phase 04 establishes the web dashboard and creator UI: Tailwind CSS integration, UI components, responsive layout, App Router navigation, frontend API consumption, and frontend authentication guards.<br />
> **Phase 05 (OpenShorts Integration) is NOT STARTED.** No video rendering, AI features, or queue workers are implemented.

---

## 2. Core Development Philosophy

This project strictly adheres to the principle:

$$\textbf{ONE STEP} \longrightarrow \textbf{VERIFY} \longrightarrow \textbf{LOCK} \longrightarrow \textbf{NEXT STEP}$$

- **No Assumptions:** Every phase requires explicit verification before it can be marked complete.
- **Evidence-Based Progress:** No claim of success without verifiable automated tests or commands.
- **Strict Phase Boundaries:** Features belonging to future phases must never be prematurely implemented.
- **Zero Unverified Dependencies:** Dependencies are added strictly when required and justified by concrete phase goals.
- **Transparent Logging:** Every decision, deviation, and status change is recorded across project governance docs.

---

## 3. Phase Status & Roadmap

| Phase Domain | Responsibility                                                        | Status                            |
| :----------- | :-------------------------------------------------------------------- | :-------------------------------- |
| **Phase 00** | Project Initialization & Repository Setup                             | **VERIFIED / LOCKED** (6958dbf)   |
| **Phase 01** | Architecture & Planning Baseline                                      | **VERIFIED / LOCKED** (42b9d81)   |
| **Phase 02** | Development Foundation (Monorepo, Fastify, Next.js, Tooling)          | **VERIFIED / LOCKED** (c48ccc5)   |
| **Phase 03** | Database & Authentication Foundation (PostgreSQL, Drizzle, Sessions)  | **VERIFIED / LOCKED** (900a8e9)   |
| **Phase 04** | Web Dashboard (Creator Review, Management UI)                         | **ACTIVE / VERIFICATION PENDING** |
| **Phase 05** | OpenShorts Integration (Automated Video Slicing & Vertical Rendering) | NOT STARTED                       |
| **Phase 06** | Gemini Content Engine (Multimodal Comedy Beat Detection)              | Planned                           |
| **Phase 07** | Quality Control Engine (Automated Audio/Video Validation)             | Planned                           |
| **Phase 08** | Social Publishing Engine (YouTube, Instagram, TikTok Adapters)        | Planned                           |
| **Phase 09** | Analytics & Monitoring (Performance Ingestion & Alerts)               | Planned                           |
| **Phase 10** | Production Hardening (Disaster Recovery & High Availability)          | Planned                           |

---

## 4. Repository Structure

```text
/
├── apps/
│   ├── web/                     # Next.js App Router web foundation
│   └── api/                     # Fastify micro-service API with Drizzle ORM & Auth
│       ├── drizzle/             # Committed SQL migration files
│       ├── src/
│       │   ├── config/          # Environment configuration
│       │   ├── db/              # Database client, lifecycle, and schemas
│       │   │   └── schema/      # Drizzle tables (users, sessions)
│       │   ├── middleware/      # Auth & authorization plugins
│       │   ├── routes/          # API route handlers (/health, /auth/*)
│       │   └── services/        # Auth, password, and session services
│       └── tests/               # Unit, integration, and security tests
├── packages/
│   ├── config/                  # Shared TypeScript presets & Zod environment schemas
│   ├── types/                   # Shared API contracts & foundational response types
│   └── utils/                   # Shared pure utility libraries (Phase 02+ placeholder)
├── workers/                     # Background queue consumers and video processors (Phase 05+)
├── docs/
│   ├── architecture/            # Architectural decisions and baseline designs
│   ├── development/             # Environment, setup, and structure guides
│   ├── decisions/               # Architecture Decision Records (ADRs)
│   └── operations/              # Operational runbooks and deployment guides
├── .gitignore                   # Multi-layer exclusion list (secrets, media, caches)
├── .env.example                 # Safe environment variable template
├── package.json                 # Root monorepo configuration & scripts
├── pnpm-workspace.yaml          # Monorepo package boundaries definition
├── README.md                    # Project overview and index
├── PHASE_STATUS.md              # Real-time phase milestone tracking
└── CHANGELOG.md                 # Controlled audit log of project changes
```

---

## 5. Prerequisites

- **Operating System:** Windows 10/11, macOS, or Linux
- **Node.js:** `>=20.0.0` (Active LTS recommended; verified on Node.js `v24.15.0`)
- **Package Manager:** `pnpm` pinned to `12.6.0`
- **PostgreSQL:** `>=15.0` (for local development database)
- **Git:** `>=2.40.0`

---

## 6. Monorepo Verification & Execution Commands

The following commands are fully operational and verified:

```bash
# 1. Install all dependencies across workspace
pnpm install

# 2. Start applications in development mode (concurrent)
pnpm run dev

# 3. Compile and build all workspace projects
pnpm run build

# 4. Typecheck all workspace packages (TypeScript strict mode)
pnpm run typecheck

# 5. Run ESLint checks across workspace
pnpm run lint

# 6. Execute automated test suites (Vitest across all packages)
pnpm run test

# 7. Check code and document formatting (Prettier 3.9.9)
pnpm run format:check

# 8. Auto-format files
pnpm run format:write

# 9. Database schema migrations
pnpm run db:generate   # Generate migration SQL from Drizzle schema
pnpm run db:migrate    # Apply pending migrations to PostgreSQL database
```

---

## 7. Database & Authentication Architecture (Phase 03)

### Database Foundation

- **ORM:** Drizzle ORM (`drizzle-orm`) with `node-postgres` (`pg`).
- **Connection Lifecycle:** Centralized `createDbClient` in `apps/api/src/db/client.ts` with explicit connection pool teardown on application shutdown (`onClose` hook).
- **Migration System:** Schema migrations are generated into `apps/api/drizzle/` and tracked deterministically via `drizzle-kit` and programmatic migration runner `apps/api/src/db/migrate.ts`.
- **Test Isolation:** Unit and integration tests run deterministically using `pg-mem` and `drizzle-pgmem` without requiring an external PostgreSQL daemon.

### User & Session Model

- **`users` Table:**
  - `id`: UUID primary key (default `gen_random_uuid()`)
  - `email`: `varchar(255)` unique, indexed, case-normalized
  - `password_hash`: `text` bcrypt hash (10 salt rounds)
  - `role`: `varchar(32)` default `'creator'`
  - `created_at`, `updated_at`: Timestamps with time zone
- **`sessions` Table:**
  - `id`: UUID primary key
  - `user_id`: Foreign key referencing `users(id)` with `ON DELETE CASCADE`
  - `token_hash`: `varchar(64)` unique SHA-256 hash of random 32-byte hex token
  - `expires_at`: Expiration timestamp (default 168 hours / 7 days)
  - `created_at`: Timestamp with time zone

### Authentication API Endpoints

- `POST /auth/register`: Create user account and active session.
- `POST /auth/login`: Authenticate email and password, issue new session.
- `POST /auth/logout`: Revoke active session in database and clear cookie.
- `GET /auth/me`: Retrieve current authenticated user profile (protected route).

### Session & Token Security

- **HttpOnly Cookie Authentication:** The session credential is maintained securely through an `HttpOnly` cookie and is strictly NOT returned in JSON response bodies (`POST /auth/register`, `POST /auth/login`), preventing XSS credential theft.
- **Dual Transport:** Protected API routes accept authentication via the primary `session_token` cookie or `Authorization: Bearer <token>` header for headless API clients.
- **Cookie Security:** Cookies are configured with `HttpOnly: true`, `SameSite: Lax`, `Path: /`, explicit `maxAge`, and `Secure: true` (in production).
- **Zero Plaintext Token Storage:** The database stores only the SHA-256 hash of session tokens; raw tokens are never persisted.
- **Zero Password Hash Exposure:** Password hashes are stripped before any API response is sent.
- **Timing Attack Mitigation:** Authentication verifies a dummy hash on non-existent accounts to eliminate timing differentials.

---

## 8. Environment Variables

Copy `.env.example` to `.env` before running locally:

| Variable              | Description                                                     | Default / Example                                                  |
| :-------------------- | :-------------------------------------------------------------- | :----------------------------------------------------------------- |
| `NODE_ENV`            | Runtime environment (`development`, `production`, `test`)       | `development`                                                      |
| `PORT`                | Next.js web application port                                    | `3000`                                                             |
| `NEXT_PUBLIC_API_URL` | Base URL for API calls from browser                             | `http://localhost:4000`                                            |
| `API_PORT`            | Fastify API server port                                         | `4000`                                                             |
| `HOST`                | Bind address for API server                                     | `0.0.0.0`                                                          |
| `CORS_ORIGIN`         | Allowed CORS origin (wildcard prohibited with credentials)      | `http://localhost:3000`                                            |
| `DATABASE_URL`        | PostgreSQL connection string                                    | `postgresql://postgres:postgres@localhost:5432/dadliesttjokes_dev` |
| `AUTH_SECRET`         | Secret for cookie signing and session derivation (min 16 chars) | Safe dev placeholder in `.env.example`                             |
| `SESSION_TTL_HOURS`   | Session time-to-live in hours                                   | `168` (7 days)                                                     |
