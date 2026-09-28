# Local Developer Setup Guide

This document describes the verified setup procedure and baseline commands for working within the **Dadliesttjokes Content Factory** repository.

---

## 1. Prerequisites

Before setting up the repository, ensure your development environment has the following tools installed and accessible via PATH:

- **Node.js:** `>=20.0.0` (Verified on Node.js `v24.15.0`)
- **Package Manager:** `pnpm` (Verified on `pnpm` `12.6.0`)
  - Install via: `npm install -g pnpm`
- **PostgreSQL:** `>=15.0` (for local development database execution)
- **Git:** `>=2.40.0` (Verified on `git version 2.52.0.windows.1`)
- **Editor:** Antigravity IDE or Visual Studio Code

---

## 2. Initial Setup Steps

Clone the repository and enter the directory:

```bash
git clone <repository-url>
cd "Dadliesttjokes Content Factory"
```

Verify that the pinned package manager is present:

```bash
pnpm --version
# Expected output: 12.6.0
```

Install workspace dependencies:

```bash
pnpm install
```

Configure your local environment:

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` points to your local PostgreSQL instance:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dadliesttjokes_dev
AUTH_SECRET=dev_insecure_auth_secret_must_change_in_production
SESSION_TTL_HOURS=168
```

Run database migrations to apply the initial schema:

```bash
pnpm run db:migrate
```

---

## 3. Verified Baseline Commands

The following commands are tested and verified to work with exit code 0:

### Development Startup

Starts both Web and API applications concurrently in development mode:

```bash
pnpm run dev
# or: pnpm run development
```

- Web runs at: `http://localhost:3000`
- API runs at: `http://localhost:4000` (Health check: `http://localhost:4000/health`)

### Database Migrations

Generate and run Drizzle migrations:

```bash
# Generate SQL migration from schema changes
pnpm run db:generate

# Apply pending SQL migrations to PostgreSQL
pnpm run db:migrate
```

### Production Build

Compiles TypeScript packages, builds the Fastify API, and creates optimized Next.js production bundles:

```bash
pnpm run build
```

### Type Checking

Executes TypeScript compiler across all workspace packages and apps without emitting files:

```bash
pnpm run typecheck
```

### Linting

Runs ESLint checks across all apps and packages:

```bash
pnpm run lint
```

### Automated Testing

Runs Vitest test suites across all packages and apps (55/55 passing):

```bash
pnpm run test
```

> **Note on Test Database Isolation:**
> Automated tests execute against an isolated in-memory PostgreSQL instance (`pg-mem` + `drizzle-pgmem`). They do not depend on or alter your local or developer PostgreSQL database.

### Code Formatting

Check or apply Prettier formatting across the entire monorepo:

```bash
# Check formatting
pnpm run format:check

# Format files
pnpm run format:write
```

---

## 4. Phase Boundary Status

- **Phase 00 (Project Initialization):** VERIFIED / LOCKED (6958dbf)
- **Phase 01 (Architecture & Planning):** VERIFIED / LOCKED at 42b9d81
- **Phase 02 (Development Foundation):** VERIFIED / LOCKED at c48ccc5
- **Phase 03 (Database & Authentication):** ACTIVE / VERIFICATION PENDING
- **Phase 04 (Web Dashboard):** NOT STARTED
