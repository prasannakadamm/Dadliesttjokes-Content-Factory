# Dadliesttjokes Content Factory

> **Current Phase: Phase 02 — Development Foundation**<br />
> **Status:** FOUNDATION VERIFIED & LOCKED (Phase 03 NOT STARTED)

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

> **CRITICAL PHASE 02 NOTICE:**<br />
> **Engineering Foundation Only.**<br />
> Phase 02 establishes the developer foundation: pnpm workspace monorepo, Next.js App Router web foundation, Fastify API gateway foundation, shared TypeScript presets, Zod environment validation, deterministic tooling scripts, and automated test foundation.<br />
> **Phase 03 (Database & Authentication) is NOT STARTED.** No database runtime, schemas, authentication, business logic, or creator dashboards are implemented.

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

## 3. High-Level Future Capabilities

| Capability Domain          | Responsibility                                                        | Implementation Phase | Status            |
| :------------------------- | :-------------------------------------------------------------------- | :------------------- | :---------------- |
| **Project Initialization** | Repository setup, governance docs, environment inspection             | Phase 00             | VERIFIED & LOCKED |
| **Architecture Baseline**  | Technical architecture, data models, async topology, technology stack | Phase 01             | VERIFIED & LOCKED |
| **Development Foundation** | Monorepo setup, Fastify API, Next.js Web, shared types & tooling      | Phase 02             | VERIFIED & LOCKED |
| **Database & Auth**        | Persistent storage schemas, user accounts, and authentication guards  | Phase 03             | **NOT STARTED**   |
| **Web Dashboard**          | Mobile-first responsive web/PWA dashboard for creator review & edits  | Phase 04             | Planned           |
| **OpenShorts Integration** | Automated video slicing, reframing, and vertical rendering engine     | Phase 05             | Planned           |
| **Gemini Content Engine**  | Multimodal comedic beat detection, captions, and metadata synthesis   | Phase 06             | Planned           |
| **Quality Control**        | Automated QC validation layer (audio, video, duration, compliance)    | Phase 07             | Planned           |
| **Social Publishing**      | Modular social platform publishing adapters (YouTube, IG, TikTok)     | Phase 08             | Planned           |
| **Analytics & Monitoring** | Ingestion of performance metrics, system health, and alerting         | Phase 09             | Planned           |
| **Production Hardening**   | Fault-tolerance, disaster recovery, security audits, and deployment   | Phase 10             | Planned           |

---

## 4. Repository Structure

```text
/
├── apps/
│   ├── web/                     # Next.js App Router web foundation
│   └── api/                     # Fastify micro-service API foundation
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
├── scripts/                     # Operational, CI, and maintenance scripts
├── tests/
│   ├── integration/             # Multi-package integration tests
│   └── e2e/                     # End-to-end workflow verification tests
├── .github/
│   └── workflows/               # CI/CD automation pipelines
├── .vscode/                     # Workspace editor settings and extension recommendations
├── .antigravity/                # Agent runtime instructions and session configurations
├── .gitignore                   # Multi-layer exclusion list (secrets, media, caches)
├── .env.example                 # Safe environment variable template
├── .editorconfig                # Universal indentation and encoding standards
├── package.json                 # Root monorepo configuration & scripts
├── pnpm-workspace.yaml          # Monorepo package boundaries definition
├── README.md                    # Project overview and index
├── PROJECT_CHARTER.md           # Vision, goals, scope, and quality principles
├── DEVELOPMENT_RULES.md         # Absolute development constraints and operational rules
├── RESOURCE_EVALUATION.md       # Tooling and provider evaluation matrix
├── PHASE_STATUS.md              # Real-time phase milestone tracking
└── CHANGELOG.md                 # Controlled audit log of project changes
```

---

## 5. Prerequisites

- **Operating System:** Windows 10/11, macOS, or Linux
- **Node.js:** `>=20.0.0` (Active LTS recommended; verified on Node.js `v24.15.0`)
- **Package Manager:** `pnpm` pinned to `12.6.0`
- **Git:** `>=2.40.0`
- **Editor:** Antigravity IDE or Visual Studio Code

---

## 6. Monorepo Verification & Execution Commands

The following commands are fully operational and verified:

```bash
# 1. Install all dependencies across workspace
pnpm install

# 2. Start applications in development mode (concurrent)
pnpm run dev
# (or: pnpm run development)

# 3. Compile and build all workspace projects
pnpm run build

# 4. Typecheck all workspace packages (TypeScript strict mode)
pnpm run typecheck

# 5. Run ESLint checks across workspace
pnpm run lint

# 6. Execute automated test suites (Vitest)
pnpm run test

# 7. Check code and document formatting (Prettier 3.9.9)
pnpm run format:check

# 8. Auto-format files
pnpm run format:write
```

---

## 7. Security Principles

1. **Zero Credential Storage in Git:** No passwords, tokens, API keys, or private certificates are ever committed.
2. **Safe Templates Only:** `.env.example` provides variable keys and inert placeholder descriptions only.
3. **No `.env` Commits:** `.gitignore` strictly blocks `.env` and all related credential files.
4. **Boundary Isolation:** Server-side secrets must never leak into client-accessible bundles or packages.

---

## 8. Phase-Gated Workflow

Every phase transitions only after comprehensive verification:

```text
[Phase 00: Project Initialization] (COMPLETED & VERIFIED)
                ↓
[Phase 01: Architecture & Planning] (COMPLETED & VERIFIED)
                ↓
[Phase 02: Development Foundation] (VERIFIED & LOCKED)
                ↓
[Phase 03: Database & Authentication] (NOT STARTED)
                ↓
[Phase 04: Web Dashboard]
                ↓
[Phase 05: OpenShorts Integration]
                ↓
[Phase 06: Gemini Content Engine]
                ↓
[Phase 07: Quality Control]
                ↓
[Phase 08: Social Publishing]
                ↓
[Phase 09: Analytics & Monitoring]
                ↓
[Phase 10: Production Hardening]
```
