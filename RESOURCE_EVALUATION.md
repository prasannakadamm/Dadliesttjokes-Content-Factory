# Resource & Tooling Evaluation Matrix

This document provides a disciplined evaluation of potential tools, libraries, agents, and providers considered for the **Dadliesttjokes Content Factory**. Resources are integrated strictly on the basis of demonstrable project value rather than novelty.

---

## 1. Summary Evaluation Matrix

| Resource / Tool | Current Purpose (Phase 00)                | Possible Future Use                                                         | Current Status                   | Installed?                     | Evaluation / Reason                                                                                             | Target Phase        |
| :-------------- | :---------------------------------------- | :-------------------------------------------------------------------------- | :------------------------------- | :----------------------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------ |
| **Antigravity** | Primary engineering & orchestration agent | Continuous development, automation, and workflow governance                 | Active (Primary Agent)           | Yes (Active Agent Environment) | Core autonomous pair programmer and system maintainer. Standardizes development execution.                      | Phase 00–Phase 10   |
| **Gemini**      | Under evaluation for content intelligence | Video comprehension, comedic beat extraction, caption & metadata generation | Planned (Candidate AI Provider)  | No                             | Industry-leading multimodal reasoning with huge context windows. Ideal for long video ingestion.                | Phase 06            |
| **OpenShorts**  | Under architectural evaluation            | Programmatic video slicing, reframing, and vertical rendering engine        | Planned (Candidate Media Engine) | No                             | Specialized for automated short-form video generation from long video inputs.                                   | Phase 05            |
| **GSD Core**    | Under conceptual evaluation               | Structured task-tracking and rapid execution framework                      | On Hold                          | No                             | Evaluating whether existing Git and phase governance files provide sufficient structure without extra overhead. | Phase 01 / Phase 02 |
| **Roo Code**    | Under evaluation                          | Alternative code generation and tool-calling agent                          | Deferred                         | No                             | Antigravity is the primary active agent. Adding redundant agent layers would create confusion.                  | As needed           |
| **Ralph Loop**  | Under evaluation                          | Autonomous continuous verification and self-healing loop                    | Under Consideration              | No                             | May provide automated regression monitoring or CI validation in later phases.                                   | Phase 09 / Phase 10 |
| **CodeRabbit**  | Under evaluation                          | Automated pull request reviews and static analysis                          | Recommended for CI               | No                             | Excellent automated PR analysis tool. Will be evaluated during GitHub Actions CI setup.                         | Phase 02 / Phase 08 |
| **OmniRoute**   | Under evaluation                          | Multi-model routing and LLM fallback management                             | Under Consideration              | No                             | Useful if routing across multiple LLM providers becomes necessary for high availability.                        | Phase 06            |
| **OpenRouter**  | Under evaluation                          | Unified API gateway for diverse LLM access                                  | Backup/Alternative               | No                             | Provides unified fallback if specific provider APIs encounter quota or availability limits.                     | Phase 06            |

---

## 2. In-Depth Resource Profiles

### 2.1 Antigravity

- **Current Purpose:** Acts as the primary autonomous development agent for Phase 00 bootstrap, codebase governance, and automated verification.
- **Future Use:** Drives architectural implementation, tests execution, file refactoring, and CI/CD coordination across all project milestones.
- **Current Status:** Fully operational in the workspace.
- **Installation Decision:** Retained as primary development system.

### 2.2 Gemini (Google DeepMind)

- **Current Purpose:** None in Phase 00 (strict foundation boundary).
- **Future Use:** Ingestion of long-form audio/video; comedic timing identification; generating captions, punchlines, tags, and platform-tailored descriptions.
- **Current Status:** Selected as the primary AI intelligence candidate.
- **Installation Decision:** Installation deferred to Phase 06 (Gemini Content Engine) to prevent premature SDK clutter before core infrastructure is built.

### 2.3 OpenShorts

- **Current Purpose:** None in Phase 00.
- **Future Use:** Core video composition engine responsible for automated horizontal-to-vertical conversion, facial tracking, scene reframing, and caption burning.
- **Current Status:** Selected as the primary media processing engine candidate.
- **Installation Decision:** Installation deferred to Phase 05 (OpenShorts Integration) when video rendering pipelines are initialized.

### 2.4 GSD Core

- **Current Purpose:** None in Phase 00.
- **Future Use:** Potential structured task execution framework.
- **Current Status:** On hold.
- **Installation Decision:** Not installed. The current phase-gated markdown protocol (`PHASE_STATUS.md`, `DEVELOPMENT_RULES.md`) is cleaner, self-contained, and avoids unnecessary dependencies.

### 2.5 Roo Code

- **Current Purpose:** None in Phase 00.
- **Future Use:** Secondary code generation or specialized editing agent.
- **Current Status:** Deferred.
- **Installation Decision:** Not installed. Having multiple concurrent agents managing the repository without defined boundaries introduces synchronization conflicts.

### 2.6 Ralph Loop

- **Current Purpose:** None in Phase 00.
- **Future Use:** Continuous automated execution and repair loops.
- **Current Status:** Under consideration.
- **Installation Decision:** Not installed. Will be evaluated once automated test suites are established in Phase 02 / Phase 09.

### 2.7 CodeRabbit

- **Current Purpose:** None in Phase 00.
- **Future Use:** Automated code review and security audits on PRs.
- **Current Status:** Recommended for GitHub CI.
- **Installation Decision:** Deferred to Phase 02 / Phase 08 when GitHub repository remotes and pull request pipelines are activated.

### 2.8 OmniRoute

- **Current Purpose:** None in Phase 00.
- **Future Use:** Intelligent dynamic routing between multiple LLM backends based on cost, latency, and context limits.
- **Current Status:** Under consideration.
- **Installation Decision:** Deferred to Phase 06 (Gemini Content Engine).

### 2.9 OpenRouter

- **Current Purpose:** None in Phase 00.
- **Future Use:** Alternate multi-model API provider serving as a failover channel for Gemini if rate limits are reached.
- **Current Status:** Backup candidate.
- **Installation Decision:** Deferred to Phase 06 (Gemini Content Engine).
