# Technology Selection

## 1. Overview

This document formalizes the technology stack selected for the Dadliesttjokes Content Factory during Phase 01. All additions require justification and adherence to the Phase roadmap.

## 2. Core Stack

| Domain              | Selected Technology     | Phase Introduced | Justification                                           |
| :------------------ | :---------------------- | :--------------- | :------------------------------------------------------ |
| **Language**        | TypeScript / Node.js    | Phase 00 / 02    | Universal language across stack; strong ecosystem.      |
| **Package Manager** | pnpm (12.6.0)           | Phase 00         | Fast, space-efficient, native workspace support.        |
| **Formatting**      | Prettier (3.9.9)        | Phase 00         | Deterministic, standard-compliant formatting.           |
| **API Framework**   | Fastify (or Express)    | Phase 02         | Fastify provides superior throughput for JSON APIs.     |
| **Database**        | PostgreSQL              | Phase 03         | Relational integrity, ACID compliance, JSONB support.   |
| **ORM / Query**     | Prisma or Drizzle       | Phase 03         | Type-safe database access, automated migrations.        |
| **Queue / Broker**  | BullMQ + Redis          | Phase 05         | Robust Node.js job queue with built-in retries and UI.  |
| **Web Frontend**    | React + Next.js or Vite | Phase 04         | Industry standard, massive ecosystem, component-driven. |

## 3. External Services

| Domain             | Selected Technology    | Phase Introduced | Justification                                                |
| :----------------- | :--------------------- | :--------------- | :----------------------------------------------------------- |
| **Object Storage** | S3-Compatible (AWS/R2) | Phase 03         | Ubiquitous standard for blob storage.                        |
| **Video Engine**   | OpenShorts / FFmpeg    | Phase 05         | Programmatic video compositing and reframing.                |
| **Intelligence**   | Google Gemini          | Phase 06         | Leading multimodal capabilities, native video comprehension. |
| **Analytics**      | TBD                    | Phase 09         | To be evaluated based on platform data ingestion needs.      |
