# Changelog

All notable changes to the **Dadliesttjokes Content Factory** repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - Phase 03 Database & Authentication

### Added

- **PostgreSQL & Drizzle ORM Foundation:**
  - Integrated Drizzle ORM (`drizzle-orm`) and PostgreSQL client (`pg`) into `apps/api`.
  - Implemented centralized database connection client and lifecycle management in `apps/api/src/db/client.ts`.
  - Added programmatic database migration runner `apps/api/src/db/migrate.ts` and `drizzle.config.ts`.
  - Added deterministic root migration scripts: `db:generate` and `db:migrate`.
  - Generated and committed initial migration `0000_acoustic_namor.sql`.
- **User & Session Data Models:**
  - `users` table: UUID PK, unique email with index, bcrypt password hash, role (`creator`), created/updated timestamps.
  - `sessions` table: UUID PK, user foreign key with cascade delete, unique SHA-256 token hash with index, expiration timestamp with index, created timestamp.
- **Password Security:**
  - Bcrypt password hashing with 10 salt rounds and constant-time verification in `apps/api/src/services/password.ts`.
  - Password strength validation policy (8-128 chars, alphanumeric).
  - Timing attack mitigation via dummy verification for non-existent accounts.
- **Authentication & Session Services:**
  - Domain services in `apps/api/src/services/auth.ts`: `registerUser`, `loginUser`, `createSession`, `authenticateSessionToken`, `invalidateSession`, `toUserDto`.
  - Cryptographically secure 32-byte hex session tokens, stored in DB exclusively as SHA-256 hashes.
  - Sanitized user representations ensuring password hashes are never exposed.
- **Authentication API Routes:**
  - `POST /auth/register`: User registration with input validation, session creation, and HttpOnly cookie issuance (zero raw token in JSON response).
  - `POST /auth/login`: Credential validation with uniform error responses to mitigate account enumeration, issuing HttpOnly session cookie (zero raw token in JSON response).
  - `POST /auth/logout`: Session revocation and cookie clearance.
  - `GET /auth/me`: Protected route returning authenticated user identity.
- **Authentication & Authorization Middleware:**
  - Fastify authentication plugin `apps/api/src/middleware/auth.ts` with `@fastify/cookie`.
  - Pre-handler decorators `fastify.authenticate` and `fastify.requireRole` establishing the authorization foundation.
  - Primary session transport via secure HttpOnly cookie with fallback support for Authorization Bearer headers.
- **Environment Configuration:**
  - Extended `packages/config/src/env.ts` with `DATABASE_URL`, `AUTH_SECRET`, `SESSION_TTL_HOURS`.
  - Added strict production validation: requires an explicitly supplied `DATABASE_URL` in production, rejecting missing values, default dev credentials, and localhost placeholders.
  - Added safe placeholder defaults to `.env.example`.
- **Testing & Security Suite:**
  - In-memory PostgreSQL testing via `pg-mem` and `drizzle-pgmem` ensuring isolated, deterministic test runs without external daemon dependencies.
  - 55 automated tests across all packages (unit, integration, and security audit tests).

### Changed

- **Security Hardening:**
  - Hardened production database configuration to strictly reject missing `DATABASE_URL` and development/localhost placeholders.
  - Removed raw session token exposure from `POST /auth/register` and `POST /auth/login` JSON responses to eliminate unnecessary credential exposure; authentication relies securely on HttpOnly session cookies.
- **Phase Status:** Phase 03 implementation completed, hardened, and reconciled; status is ACTIVE / VERIFICATION PENDING. Phase 04 marked NOT STARTED.
- **Documentation:** Updated `README.md`, `PHASE_STATUS.md`, `docs/development/SETUP.md`, `docs/development/ENVIRONMENT.md`.

---

## [0.2.0] - Phase 02 Development Foundation

### Added

- **Monorepo Workspace Foundation:**
  - Configured `pnpm-workspace.yaml` with `apps/*`, `packages/*`, and `workers` boundaries; enabled `allowBuilds` for `esbuild` and `unrs-resolver` for pnpm 12.6.0.
  - Added deterministic root scripts in `package.json`: `dev`, `development`, `build`, `typecheck`, `lint`, `test`, `format:write`, `format:check`.
- **Shared Configuration Package (`packages/config`):**
  - Added shared TypeScript base presets: `tsconfig.base.json`, `tsconfig.node.json`, `tsconfig.next.json`.
  - Added Zod-based environment variable validation utilities (`apiEnvSchema`, `webEnvSchema`, `validateEnv`).
  - Added unit test suite for environment validation.
- **Shared Types Package (`packages/types`):**
  - Added foundational response and contract interfaces (`HealthCheckResponse`, `ApiResponse<T>`, `AppEnvironment`).
  - Added unit test suite verifying contract integrity.
- **API Application Foundation (`apps/api`):**
  - Fastify micro-service application foundation using TypeScript.
  - Process-only `/health` endpoint returning uptime, timestamp, environment, and service identification.
  - Configured CORS middleware with configurable origin.
  - Centralized structured error handling and custom 404 handler.
  - Graceful process termination handling for `SIGINT` and `SIGTERM`.
  - Added integration tests covering health check, 404 responses, error handling, and CORS headers.
- **Web Application Foundation (`apps/web`):**
  - Next.js 14 App Router application foundation using TypeScript.
  - Minimal root layout and developer foundation status page.
  - Configured production build with optimized static bundle output.
  - Added unit test suite for web foundation component.
- **Tooling & Code Quality:**
  - ESLint configuration across workspace with TypeScript support.
  - Pinned `prettier@3.9.9` formatting preserved.
  - Vitest test runners configured across workspace packages.

### Changed

- **CORS Security:** Prohibited wildcard CORS origin ("*") when credentials are enabled at both schema validation and runtime application levels.
- **Phase Status:** Phase 02 implementation complete; status is ACTIVE / VERIFICATION PENDING awaiting independent external audit. Phase 03 is NOT STARTED.
- **Documentation:** Updated `README.md`, `PHASE_STATUS.md`, `docs/development/PROJECT_STRUCTURE.md`, `docs/development/SETUP.md`.

---

## [0.1.0] - Phase 01 Architecture & Planning

### Added

- **Architecture Documentation:** Authored comprehensive architectural guidelines and diagrams.
  - `docs/architecture/SYSTEM_ARCHITECTURE.md`: High-level system topology and core subsystems.
  - `docs/architecture/COMPONENT_ARCHITECTURE.md`: Internal structures of API, Worker, and Web clients.
  - `docs/architecture/DATA_ARCHITECTURE.md`: PostgreSQL relational schema (ERD) and Cloudflare R2 object storage lifecycle.
  - `docs/architecture/ASYNC_PROCESSING.md`: Worker queue topology and video processing state machine.
  - `docs/architecture/SECURITY_ARCHITECTURE.md`: RBAC, secret management, and network boundaries.
  - `docs/architecture/INTEGRATION_ARCHITECTURE.md`: Adapter patterns for Gemini and OpenShorts.
  - `docs/architecture/DEPLOYMENT_ARCHITECTURE.md`: Cloud infrastructure topology and CI/CD pipelines.
  - `docs/architecture/ARCHITECTURE_DECISIONS.md`: Log of Architecture Decision Records (ADRs).
  - `docs/architecture/TECHNOLOGY_SELECTION.md`: Finalized tech stack matrix (Node.js, PostgreSQL, Fastify, BullMQ, Next.js).
  - `docs/architecture/PHASE_DEPENDENCIES.md`: Component traceability to the canonical 11-phase roadmap.

### Changed

- **Phase Status:** Prepared Phase 01 for independent verification.
- **Roadmap:** Phase 02 remains NOT STARTED.

---

## [0.0.0] - Phase 00 Initialization

### Added

- **Project Structure:** Established clean mono-repository directory skeleton:
  - `apps/web`, `apps/api`
  - `packages/config`, `packages/types`, `packages/utils`
  - `workers`
  - `docs/architecture`, `docs/development`, `docs/decisions`, `docs/operations`
  - `scripts`
  - `tests/integration`, `tests/e2e`
  - `.github/workflows`
  - `.vscode`
  - `.antigravity`
- **Documentation Foundation:**
  - `README.md`: Project purpose, future capabilities, repository structure, prerequisites, baseline commands, and phase warning.
  - `PROJECT_CHARTER.md`: Vision, goals, scope, and quality principles.
  - `DEVELOPMENT_RULES.md`: Core operating rules, security policies, dependency restrictions, error handling standards, and Notion sync protocol.
  - `RESOURCE_EVALUATION.md`: Matrix evaluating Antigravity, Gemini, OpenShorts, GSD Core, Roo Code, Ralph Loop, CodeRabbit, OmniRoute, and OpenRouter.
  - `PHASE_STATUS.md`: Phase 00 completion tracking, verification checklist, and phase roadmap.
  - `docs/development/ENVIRONMENT.md`: Host environment specifications, tool versions, and reproducibility notes.
  - `docs/development/PROJECT_STRUCTURE.md`: Boundary guide and future responsibilities for every directory.
  - `docs/development/SETUP.md`: Prerequisites and verified execution commands.
  - `docs/architecture/ARCHITECTURE_BASELINE.md`: Architectural baseline document for Phase 01 validation.
- **Repository & Workspace Configuration:**
  - `package.json`: Root package configuration with `pnpm@12.6.0` pinned, scripts for `format:check` and `format:write`.
  - `pnpm-workspace.yaml`: Configured workspace patterns for `apps/*`, `packages/*`, and `workers`.
  - `.gitignore`: Multi-tiered ignore file protecting against secret leakage, media bloat, build artifacts, and OS cache files.
  - `.env.example`: Secure environment variable template containing inert placeholders.
  - `.editorconfig`: Universal character encoding and indentation rules.
  - `.prettierrc.json` & `.prettierignore`: Code and documentation formatting standards.
  - `.vscode/settings.json` & `.vscode/extensions.json`: Local workspace formatting configuration and extension recommendations.
- **Dependencies:**
  - `prettier` (`3.9.9`): Root devDependency for deterministic file formatting verification.
- **Git Repository:**
  - Initialized Git repository on branch `main`.
