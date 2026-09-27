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
