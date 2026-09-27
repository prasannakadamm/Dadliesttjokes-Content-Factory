# Security Architecture

## 1. Overview

This document outlines the security boundaries, authentication mechanisms, and data protection strategies for the platform.

## 2. Authentication & Authorization (Phase 03)

```mermaid
flowchart TD
    Client["Client (Web/PWA)"]
    API["API Gateway"]
    JWT["JWT Validator"]
    DB[(PostgreSQL)]

    Client -->|1. Login (Email/Pass)| API
    API -->|2. Verify| DB
    API -->|3. Issue JWT| Client
    Client -->|4. Request + JWT| API
    API --> JWT
    JWT -->|Valid| API
```

### 2.1 Role-Based Access Control (RBAC)

- **ADMIN**: Full access to platform configuration, billing, and user management.
- **CREATOR**: Can upload media, review drafts, edit metadata, and approve publications.
- **VIEWER**: Read-only access to published media analytics and content calendar.

## 3. Secret Management

- **Rule of Zero Commit**: No secrets are committed to the repository. `.env.example` serves as the sole safe template.
- **Runtime Injection**: API keys (Gemini, Social Platforms) and database credentials are injected at runtime via environment variables (`process.env`).
- **Client Isolation**: The client-side dashboard receives NO third-party API keys. All integrations are proxied securely through the API Gateway.

## 4. Media Security

- **Presigned URLs**: Direct-to-S3 uploads utilize short-lived (e.g., 15-minute) presigned URLs to prevent unauthorized storage consumption.
- **Private Buckets**: The `raw-inbox` and `media-archive` buckets are strictly private, accessible only by authenticated API and Worker processes. Only the `renders-outbox` items selected for publication or preview might be exposed via signed CDNs.

## 5. Network Boundaries

- The API Gateway is the sole public ingress point.
- The PostgreSQL database, Redis instance, and Worker nodes reside in a private subnet, completely isolated from public internet access, communicating only within the VPC.
