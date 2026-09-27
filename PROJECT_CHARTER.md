# Project Charter: Dadliesttjokes Content Factory

---

## 1. Vision & Executive Summary

The **Dadliesttjokes Content Factory** is envisioned as an autonomous, resilient, cloud-native content pipeline tailored to the brand identity of **Dadliesttjokes**. By pairing advanced generative AI intelligence with scalable video-processing engines, the platform transforms raw, unedited, or long-form media into high-performing, brand-compliant short-form video assets (YouTube Shorts, Instagram Reels, TikTok, Facebook Reels) with minimal human overhead and guaranteed brand consistency.

---

## 2. Project Purpose

The primary business and technical objectives are:

1. **Accelerate Content Velocity:** Dramatically decrease the time elapsed between raw concept/recording and multi-platform distribution.
2. **Preserve Brand Quality & Identity:** Standardize visual typography, comedic timing, punchline highlighting, and audio mastering across every piece of media.
3. **Automate Tedium:** Offload caption synchronization, hashtag generation, platform-specific metadata encoding, and format adaptation to automated pipelines.
4. **Maintain Editorial Governance:** Provide a human-in-the-loop review mechanism where human creators can approve, reject, or fine-tune content prior to public dissemination.
5. **Data-Driven Feedback Loops:** Ingest post-publishing analytics to continuously optimize future content selection, pacing, and hooks.

---

## 3. Scope Boundaries

### In Scope (Long-Term Project Horizon)

- Ingestion of authorized raw audio/video files.
- Audio transcription, punchline identification, and semantic segment scoring.
- Automated 9:16 vertical cropping, reframing, and facial tracking.
- Caption burning and animated text generation following Dadliesttjokes typography guidelines.
- Media asset storage, archiving, and retrieval via cloud object storage.
- Web-based creator dashboard for previewing drafts, editing metadata, and granting publication approval.
- Modular platform adapters for scheduling and publishing across social media platforms.
- Automated Quality Control (QC) detecting desynchronization, aspect errors, clipping audio, or policy violations.
- System metrics, error alerting, and failure recovery orchestration.

### Non-Goals for Phase 00 (Strict Initialization Boundaries)

- **NO Business Logic:** No video processing, transcription, or publishing features are created in Phase 00.
- **NO Third-Party SDK Integrations:** No Gemini API or OpenShorts integrations in Phase 00.
- **NO Live Databases or Schemas:** No PostgreSQL, Redis, or Prisma/Drizzle setups in Phase 00.
- **NO UI Frameworks:** No Next.js or frontend styling code in Phase 00.
- **NO Mock or Fake Implementations:** No fake APIs or mock pipelines masquerading as working software.
- **NO Premature Architecture Commits:** Architecture choices will be formally vetted in Phase 01.

---

## 4. Long-Term Capability Map

```mermaid
flowchart LR
    A[Raw Video Ingestion] --> B[AI Analysis & Slicing\n(Gemini / LLM)]
    B --> C[Video Composition Engine\n(OpenShorts)]
    C --> D[Branding & Dynamic Captions]
    D --> E[Automated QC Check]
    E --> F[Human Review Dashboard\n(Web / PWA)]
    F -->|Approved| G[Multi-Platform Publisher\n(YT, IG, TikTok)]
    F -->|Rejected| B
    G --> H[Analytics Ingestion & Feedback]
```

---

## 5. Quality Principles

1. **Deterministic Verification:** Code must never be assumed to function. Every component must pass automated linting, type-checking, and test suites.
2. **Modularity & Loose Coupling:** AI providers (e.g., Gemini) and rendering engines (e.g., OpenShorts) must sit behind vendor-agnostic adapter interfaces to prevent provider lock-in.
3. **Idempotency & Resilience:** Background tasks and video rendering pipelines must be idempotent and safely retryable upon system crash or network interruption.
4. **Observability by Design:** Every pipeline transition, error, and API request must generate structured logs and traceable transaction identifiers.

---

## 6. Security Principles

1. **Principle of Least Privilege:** System components and adapters receive access strictly to resources necessary for their operation.
2. **Zero Hardcoded Secrets:** Credentials, keys, and tokens are injected via external secret management or runtime environment variables.
3. **Isolation of Client & Server Contexts:** Secret credentials (e.g., API keys, publisher OAuth tokens) must remain strictly on the backend/worker layers and never be bundled into client-facing web bundles.
4. **Authorized Ingestion Only:** Only authorized users and validated sources may upload or initiate media processing.

---

## 7. Phase-Gated Development Model

Development proceeds strictly through numbered sequential phases:

- **Phase 00:** Project Initialization _(Current)_
- **Phase 01:** Architecture & Planning
- **Phase 02:** Development Foundation
- **Phase 03:** Database & Authentication
- **Phase 04:** Web Dashboard
- **Phase 05:** OpenShorts Integration
- **Phase 06:** Gemini Content Engine
- **Phase 07:** Quality Control
- **Phase 08:** Social Publishing
- **Phase 09:** Analytics & Monitoring
- **Phase 10:** Production Hardening
