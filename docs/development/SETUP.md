# Local Developer Setup Guide

This document describes the verified setup procedure and baseline commands for working within the **Dadliesttjokes Content Factory** repository.

---

## 1. Prerequisites

Before setting up the repository, ensure your development environment has the following tools installed and accessible via PATH:

- **Node.js:** `>=20.0.0` (Verified on Node.js `v24.15.0`)
- **Package Manager:** `pnpm` (Verified on `pnpm` `12.6.0`)
  - Install via: `npm install -g pnpm`
- **Git:** `>=2.40.0` (Verified on `git version 2.52.0.windows.1`)
- **Editor:** Antigravity IDE or Visual Studio Code

---

## 2. Initial Setup Steps

Clone the repository and enter the directory:

```bash
git clone <repository-url>
cd "Dadliesttjokes Content Factory"
```

Verify that the pinned package manager is present:

```bash
pnpm --version
# Expected output: 12.6.0
```

Install root workspace dependencies:

```bash
pnpm install
```

---

## 3. Verified Baseline Commands

The following commands have been tested and verified to work cleanly in this environment:

### Verify Code & Documentation Formatting

Runs Prettier across all markdown, JSON, YAML, and configuration files:

```bash
pnpm run format:check
```

### Auto-Format Files

Formats repository files in accordance with `.prettierrc.json` and `.editorconfig`:

```bash
pnpm run format:write
```

---

## 4. Verification Policy

> **RULE:** Only commands that have been directly executed and confirmed with exit code 0 are documented here. Commands for future frameworks (e.g. `pnpm run dev`, `pnpm run build`, `pnpm test`) are intentionally absent until their respective phases are implemented and validated.
