# Host Environment & System Specification

This document details the exact hardware, operating system, and software environment inspected and verified during the Phase 00 bootstrap.

---

## 1. Operating System & Hardware

| Parameter                    | Inspected Value                                                  |
| :--------------------------- | :--------------------------------------------------------------- |
| **Operating System**         | Microsoft Windows 11 Home Single Language                        |
| **OS Version / Build**       | Windows NT 10.0.26200.0                                          |
| **CPU Architecture**         | AMD64 (x86_64)                                                   |
| **Primary System Disk (C:)** | ~19.8 GB free (235 GB used)                                      |
| **Secondary Data Disk (D:)** | ~340 GB free (449 GB used)                                       |
| **Initial Folder State**     | Empty directory prior to initialization                          |
| **Repository Path**          | `C:\Users\kadam\OneDrive\Desktop\Dadliesttjokes Content Factory` |

---

## 2. Tooling Inventory

| Tool / Runtime      | Version            | Status               | Notes                                             |
| :------------------ | :----------------- | :------------------- | :------------------------------------------------ |
| **Node.js**         | `v24.15.0`         | Installed            | Meets minimum requirement (`>=20.0.0`)            |
| **npm**             | `11.12.1`          | Installed            | Bundled with Node.js                              |
| **corepack**        | `0.34.6`           | Available            | User-level pnpm installed via npm prefix          |
| **pnpm**            | `12.6.0`           | Installed & Verified | Configured in `packageManager` field              |
| **Git**             | `2.52.0.windows.1` | Installed & Active   | Configured with user `mr.devill`                  |
| **Python**          | `3.13.7`           | Installed            | Available for future scripting if needed          |
| **Docker**          | Not Found          | Deferred             | Will be evaluated in Phase 02 for local databases |
| **Docker Compose**  | Not Found          | Deferred             | Will be evaluated in Phase 02                     |
| **Antigravity IDE** | Active             | Primary Platform     | Antigravity IDE custom extensions enabled         |

---

## 3. IDE Extensions Status (Antigravity IDE)

The following extensions were verified in the Antigravity IDE environment:

- `esbenp.prettier-vscode` (v12.4.0) — Installed & Active
- `dbaeumer.vscode-eslint` (v3.0.34) — Installed & Active
- `editorconfig.editorconfig` (v0.18.2) — Installed & Active
- `mikestead.dotenv` (v1.0.1) — Installed & Active
- `redhat.vscode-yaml` (v1.24.0) — Installed & Active
- `yzhang.markdown-all-in-one` (v3.6.2) — Installed & Active
- `ms-azuretools.vscode-docker` (v1.29.6) — Installed & Active

---

## 4. Setup Assumptions & Reproducibility Notes

1. **Path Formatting:** While the workspace resides on a Windows filesystem, cross-platform path handling (POSIX style `/`) is enforced in all configuration files and scripts.
2. **Line Endings:** `.editorconfig` enforces LF (`\n`) for all text files to ensure deterministic checksums across Windows, Linux CI, and containerized runtimes.
3. **Admin Privileges:** Direct system modification (such as running global modifications in `C:\Program Files\nodejs`) was intentionally avoided. Package manager tooling is installed and isolated to user-level paths (`C:\Users\kadam\AppData\Roaming\npm`).
