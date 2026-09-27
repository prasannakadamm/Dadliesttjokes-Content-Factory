# Architecture Decisions (Phase 01)

## 1. Overview

This document serves as the master record for Architecture Decision Records (ADRs) established during Phase 01.

## 2. Decision Log

### ADR-001: Monorepo Architecture

- **Status**: Accepted
- **Context**: The project involves multiple interconnected services (Web UI, API Gateway, Background Workers, Shared libraries).
- **Decision**: Use a strict pnpm workspace monorepo.
- **Consequences**: Ensures dependency consistency, simplifies refactoring across boundaries, but requires robust CI/CD caching to prevent slow builds.

### ADR-002: TypeScript as Universal Language

- **Status**: Accepted
- **Context**: Need high velocity, strong typing, and minimal context switching.
- **Decision**: Standardize on TypeScript (Node.js) for the API, Web UI, Workers, and internal packages.
- **Consequences**: Enables sharing interfaces (e.g., `JobPayload`, `VideoMetadata`) directly between the client, API, and worker.

### ADR-003: Postgres as Primary Data Store

- **Status**: Accepted
- **Context**: We need relational integrity for users, projects, and publication states.
- **Decision**: PostgreSQL will serve as the primary relational database.
- **Consequences**: Excellent JSONB support for storing unstructured AI metadata while maintaining relational safety for billing and auth.

### ADR-004: Event-Driven Video Processing

- **Status**: Accepted
- **Context**: Video rendering and AI analysis take significant time and cannot block HTTP requests.
- **Decision**: Implement an asynchronous queue architecture (Redis + BullMQ) for all heavy tasks.
- **Consequences**: High availability for the API, but requires complex state management (state machine) to update the client on job progress.

### ADR-005: Strict Phase Gating

- **Status**: Accepted
- **Context**: AI-driven projects often succumb to "demo-ware" where complex SDKs are integrated before the foundation is secure.
- **Decision**: Enforce the ONE STEP → VERIFY → LOCK → NEXT STEP governance model outlined in `DEVELOPMENT_RULES.md`.
- **Consequences**: Slower initial visual progress in exchange for a highly robust, secure, and production-ready foundation.

### ADR-006: Backend API Framework

- **Status**: Accepted
- **Context**: High throughput and schema validation are required for API and worker interactions.
- **Decision**: Use Fastify instead of Express.
- **Consequences**: Better performance and native JSON schema integration, at the cost of a slightly smaller middleware ecosystem.

### ADR-007: ORM Selection

- **Status**: Accepted
- **Context**: Need type-safe DB access without heavy runtime overhead.
- **Decision**: Drizzle ORM.
- **Consequences**: No heavy Rust binaries (unlike Prisma), edge-compatible, but requires more manual SQL knowledge.

### ADR-008: Cloud Storage Provider

- **Status**: Accepted
- **Context**: High volumes of media will result in massive egress fees on standard AWS S3.
- **Decision**: Cloudflare R2.
- **Consequences**: Zero egress fees, S3-compatible API, slight latency variance compared to AWS native.

### ADR-009: Web Frontend Framework

- **Status**: Accepted
- **Context**: Dashboard needs SEO, rapid routing, and potential SSR.
- **Decision**: Next.js (App Router).
- **Consequences**: Industry standard, unifies frontend and BFF (Backend-for-Frontend) if needed, though can be opinionated.

---

## 3. Provider Decision Evidence (Phase 01)

### Cloudflare R2

- **Storage Model**: S3-compatible object storage.
- **Operation Model**: Global edge distribution.
- **Egress/Pricing**: Zero egress fees, crucial for media-heavy workloads transferring video files frequently.
- **Constraints**: Slight variance in latency compared to region-locked AWS S3 natively.
- **Architectural Fit**: Perfect for large-scale media ingest and distribution without prohibitive bandwidth costs.
- **Official Source URL**: https://developers.cloudflare.com/r2/
- **Date Checked**: 2026-09-27

### Fastify

- **Framework Characteristics**: High-performance Node.js web framework.
- **JSON Schema Validation**: Native JSON Schema support for validation and serialization, greatly increasing throughput.
- **Architectural Fit**: Ideal for the API Gateway and worker task dispatching requiring high speed and schema enforcement.
- **Limitations**: Slightly smaller middleware ecosystem compared to Express.
- **Official Source URL**: https://fastify.dev/
- **Date Checked**: 2026-09-27

### Drizzle ORM

- **Type-safe SQL**: Offers type-safe SQL-like queries with TypeScript.
- **Runtime Characteristics**: Edge-compatible, no heavy Rust binaries (unlike Prisma), fast cold starts.
- **Architectural Fit**: Fits perfectly into a scalable backend connecting to PostgreSQL.
- **Constraints**: Requires more SQL knowledge for complex relational queries compared to abstract ORMs.
- **Official Source URL**: https://orm.drizzle.team/
- **Date Checked**: 2026-09-27

### Next.js App Router

- **Architecture**: React-based framework utilizing the modern App Router (Server Components).
- **Dashboard Characteristics**: Built-in API routes, Server-Side Rendering (SSR) capability, file-system based routing.
- **Architectural Fit**: The standard choice for robust, SEO-friendly, and highly interactive web dashboards.
- **Constraints**: Can be highly opinionated regarding data fetching and component boundaries (Client vs Server).
- **Official Source URL**: https://nextjs.org/docs/app
- **Date Checked**: 2026-09-27

### PostHog

- **Capabilities**: Open-source product operating system (product analytics, session recording, feature flags).
- **Event-based**: Native event-driven analytics architecture suitable for tracking video rendering milestones.
- **Pricing Model**: Generous free tier and transparent event-based pricing.
- **Architectural Fit**: Unifies monitoring of frontend user interaction and backend video processing events.
- **Constraints**: Self-hosting can be complex; managed service requires data egress.
- **Official Source URL**: https://posthog.com/
- **Date Checked**: 2026-09-27

### OpenShorts

- **Integration Model**: Headless/programmatic video composition.
- **Repository Facts**: Specific licensing and enterprise pricing could not be confirmed authoritatively; this detail is explicitly deferred until evaluation in Phase 05.
- **Constraints**: Authoritative limits could not be confirmed; deferred.
- **Architectural Fit**: Evaluated as the primary intended target for automated vertical reframing, replacing manual FFmpeg scripts.
- **Official Source URL**: (Authoritative URL deferred pending Phase 05 integration vetting)
- **Date Checked**: 2026-09-27

### Google Gemini

- **Multimodal Capabilities**: Native support for video and audio comprehension directly within the context window.
- **Video Capability**: Capable of processing long-context video inputs (e.g., Gemini 1.5 Pro) to identify comedic beats and generate synchronized transcripts.
- **Applicable Limits**: Quotas depend on tier; long video processing consumes significant token context up to 2M tokens.
- **Pricing Considerations**: Priced per token; video frame extraction is billed based on length and resolution.
- **Architectural Fit**: The most capable AI provider for direct long-form video ingestion and humor extraction.
- **Official Source URL**: https://ai.google.dev/
- **Date Checked**: 2026-09-27
