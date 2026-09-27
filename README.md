# Dadliesttjokes Content Factory

> **Current Phase: Phase 00 — Project Initialization & Development Foundation Bootstrap**  
> **Status:** FOUNDATION ESTABLISHED (Application functionality NOT implemented yet)

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

> **CRITICAL PHASE 00 NOTICE:**  
> **Application functionality is NOT implemented yet.**  
> Phase 00 establishes only the project skeleton, workspace boundaries, repository governance, documentation baseline, and development environment standards. No business features, APIs, database models, processing pipelines, or UI frameworks are active in this phase.

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

| Capability Domain       | Future Responsibility                                                 | Target Implementation Phase |
| :---------------------- | :-------------------------------------------------------------------- | :-------------------------- |
| **Workspace & API**     | Central orchestration, REST/GraphQL endpoints, task dispatching       | Phase 02+                   |
| **Web Dashboard**       | Mobile-first responsive web/PWA dashboard for approvals and metrics   | Phase 05+                   |
| **Media Engine**        | Video ingestion, slicing, rendering, vertical formatting (OpenShorts) | Phase 04+                   |
| **AI Intelligence**     | Punchline detection, captioning, metadata synthesis (Gemini)          | Phase 04+                   |
| **Quality Control**     | Automated QC validation layer (audio, video, duration, compliance)    | Phase 04+                   |
| **Publishing Adapters** | Modular social platform adapters (YouTube, Instagram, TikTok)         | Phase 06+                   |
| **Analytics Engine**    | Ingestion of reach, retention, and engagement statistics              | Phase 07+                   |

---

## 4. Repository Structure

```text
/
├── apps/
│   ├── web/                     # Future web dashboard (PWA)
│   └── api/                     # Future central API orchestrator
├── packages/
│   ├── config/                  # Future shared workspace configurations
│   ├── types/                   # Future shared domain types and schemas
│   └── utils/                   # Future shared utility libraries
├── workers/                     # Future background task and processing workers
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
- **Node.js:** `>=20.0.0` (Active LTS recommended; currently verified with Node.js v24.15.0)
- **Package Manager:** `pnpm` pinned to `12.6.0` (via corepack or `npm install -g pnpm`)
- **Git:** `>=2.40.0` (configured with local identity)
- **Antigravity IDE / VS Code:** Recommended extensions configured in `.vscode/extensions.json`

---

## 6. Baseline Verification Commands

The following commands are available and verified in Phase 00:

```bash
# Check code and document formatting
pnpm run format:check

# Format files according to repository standards
pnpm run format:write
```

---

## 7. Security Principles

1. **Zero Credential Storage in Git:** No passwords, tokens, API keys, or private certificates are ever committed.
2. **Safe Templates Only:** `.env.example` provides variable keys and placeholder descriptions only.
3. **No `.env` Commits:** `.gitignore` blocks `.env` and all related credential files.
4. **Boundary Isolation:** Server-side secrets must never leak into client-accessible bundles or packages.

---

## 8. Phase-Gated Workflow

Every phase transitions only after comprehensive verification:

```text
[Phase 00: Initialization & Bootstrap] (COMPLETED & VERIFIED)
                ↓
[Phase 01: Architecture & Planning] (UPCOMING)
                ↓
[Phase 02: Core Monorepo & Backend Foundation]
                ↓
[Phase 03: Storage & Ingestion Pipeline]
                ↓
[Phase 04: AI & Video Processing Engines]
                ↓
[Phase 05: Web Dashboard & Human Approval UI]
                ↓
[Phase 06: Publishing Adapters & Automation]
                ↓
[Phase 07: Analytics, Monitoring & Hardening]
```
