# Development Rules & Engineering Standards

> **Governing Mantra:**  
> $$\textbf{ONE STEP} \longrightarrow \textbf{VERIFY} \longrightarrow \textbf{LOCK} \longrightarrow \textbf{NEXT STEP}$$

This document outlines the mandatory engineering standards, behavioral constraints, and verification protocols for the **Dadliesttjokes Content Factory** repository. All contributors and AI agents must strictly comply with these rules.

---

## 1. Core Operating Cycle

No task or phase moves forward without adhering to the four-stage cycle:

1. **ONE STEP:** Formulate a singular, well-scoped objective and execute only the minimal changes needed for that objective.
2. **VERIFY:** Execute objective, automated verification commands (linters, formatters, typecheckers, unit/integration tests). Inspect output for 100% clean passes.
3. **LOCK:** Commit changes or freeze the milestone with updated documentation and audit logs.
4. **NEXT STEP:** Only after the current step is locked may the subsequent step or phase begin.

---

## 2. Inviolable Security Rules

- **Zero Secrets in Code:** Never commit passwords, API keys, private keys, database connection strings with credentials, OAuth client secrets, or session cookies.
- **Safe Template Discipline:** Only `.env.example` is committed. It must contain only key names and descriptive, inert placeholders.
- **No Client Exposure:** Server-side environment variables and private keys must never be imported into or bundled with client-side/frontend code.
- **Immediate Rectification:** If any secret is inadvertently introduced, it must be invalidated immediately and purged from Git history.

---

## 3. Dependency & Tooling Discipline

- **No Unnecessary Dependencies:** Every dependency must solve an explicit problem that cannot be solved simply and cleanly with standard libraries or existing tools.
- **No Framework Sprawl:** Application frameworks (Next.js, Fastify, Drizzle, etc.) are strictly prohibited until the designated architecture and implementation phase.
- **Pin Package Managers:** Package manager versions must be explicitly pinned in `package.json` (`packageManager` field).
- **No Duplicate Tooling:** Do not install multiple tools that perform overlapping responsibilities (e.g., mixing ESLint formatters with conflicting Prettier rules).

---

## 4. Integrity of Execution & Error Handling

- **No Silent Errors:** Never suppress, swallow, or ignore errors or warnings (`catch (e) {}` with no logging or recovery is strictly forbidden).
- **No Fake Completion:** Never create stubs, mocks, or empty functions and label them as "complete". If an implementation is incomplete, document it as a work in progress or deferred task.
- **No Pretend Features:** Directories must not be created to deceive reviewers into believing a component is working when it is merely a placeholder.
- **No Unrelated Modifications:** Work strictly within the boundary of the assigned task. Do not reformat or refactor files unrelated to the active objective.

---

## 5. Verification Protocol

- **Evidence-Based Completion:** A phase or task is NOT complete until all verification checks return exit code 0 (`PASS`).
- **Verifiable Reproducibility:** Every verification check must be documented with the exact command executed, expected output, and observed output.
- **Never Claim Success Prematurely:** If a single test fails, the step has failed. Diagnose, fix within scope, rerun, and report the entire audit trail transparently.

---

## 6. Backward Compatibility & Architectural Longevity

- **Modularity:** Core business logic must remain independent of external delivery mechanisms (CLI, REST API, Web UI) and vendor providers (Gemini, OpenShorts).
- **Interface Segregation:** Always program to provider-agnostic interfaces so underlying services can be swapped without rewriting domain logic.
- **Clean Upgrade Paths:** Keep configuration files minimal, declarative, and aligned with upstream best practices.

---

## 7. Documentation Requirements

- Every phase must maintain and update:
  - `PHASE_STATUS.md`: Tracking active status, objectives, checklist, and known issues.
  - `CHANGELOG.md`: Chronological log of actual changes made.
  - Relevant guides under `docs/` (Architecture, Development, Operations).
- Documentation must accurately reflect the present reality of the codebase, never aspirational future states presented as existing facts.

---

## 8. Notion Synchronization Requirement

- Major phase transitions, architectural decisions, resource evaluations, and milestones must be synchronized with the project's external **Notion Workspace**.
- Summaries of verified phases and decisions recorded in `docs/decisions/` must be exported or prepared for integration into the brand's master Notion tracker.
