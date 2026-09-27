# Technology Selection

## 1. Overview

This document formalizes the technology stack selected for the Dadliesttjokes Content Factory during Phase 01. All additions require justification and adherence to the Phase roadmap.

## 2. Core Stack

| Domain              | Selected Technology  | Phase Introduced | Justification                                                                  |
| :------------------ | :------------------- | :--------------- | :----------------------------------------------------------------------------- |
| **Language**        | TypeScript / Node.js | Phase 00 / 02    | Universal language across stack; strong ecosystem.                             |
| **Package Manager** | pnpm (12.6.0)        | Phase 00         | Fast, space-efficient, native workspace support.                               |
| **Formatting**      | Prettier (3.9.9)     | Phase 00         | Deterministic, standard-compliant formatting.                                  |
| **API Framework**   | Fastify              | Phase 02         | Fastify provides superior throughput and schema validation for JSON APIs.      |
| **Database**        | PostgreSQL           | Phase 03         | Relational integrity, ACID compliance, JSONB support.                          |
| **ORM / Query**     | Drizzle ORM          | Phase 03         | Lightweight, type-safe database access without heavy runtime engines.          |
| **Queue / Broker**  | BullMQ + Redis       | Phase 05         | Robust Node.js job queue with built-in retries and UI.                         |
| **Web Frontend**    | Next.js (App Router) | Phase 04         | Industry standard, built-in API routes, optimal for SEO and dashboard routing. |

## 3. External Services

| Domain             | Selected Technology | Phase Introduced | Justification                                                                              |
| :----------------- | :------------------ | :--------------- | :----------------------------------------------------------------------------------------- |
| **Object Storage** | Cloudflare R2       | Phase 03         | S3-compatible, zero egress fees, optimal for heavy media processing.                       |
| **Video Engine**   | OpenShorts          | Phase 05         | Programmatic video compositing and reframing. FFmpeg retained only as internal dependency. |
| **Intelligence**   | Google Gemini       | Phase 06         | Leading multimodal capabilities, native video comprehension.                               |
| **Analytics**      | PostHog             | Phase 09         | Event-driven analytics, open-source compatibility, comprehensive user tracking.            |
