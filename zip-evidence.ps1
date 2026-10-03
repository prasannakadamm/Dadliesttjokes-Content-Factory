$files = @("phase05-independent-audit-evidence.md")\n$files += "apps/api/src/services/video/provider.ts"\n$files += "apps/api/src/services/video/openshorts.ts"\n$files += "apps/api/src/services/video/service.ts"\n$files += "apps/api/src/routes/video.ts"\n$files += "apps/api/src/db/schema/jobs.ts"\n$files += "apps/api/src/config/env.ts"\n$files += "packages/config/src/env.ts"\n$files += "apps/api/src/app.ts"\n$files += "apps/api/drizzle/0000_acoustic_namor.sql"\n$files += "apps/api/drizzle/0001_amused_gamma_corps.sql"\n$files += "apps/api/drizzle/0002_parched_marvel_zombies.sql"\n$files += "apps/web/src/app/dashboard/videos/page.tsx"\n$files += "apps/web/src/components/AppShell.tsx"\n$files += ".env.example
apps/api/drizzle/0001_amused_gamma_corps.sql
apps/api/drizzle/0002_parched_marvel_zombies.sql
apps/api/drizzle/meta/0001_snapshot.json
apps/api/drizzle/meta/0002_snapshot.json
apps/api/drizzle/meta/_journal.json
apps/api/src/app.ts
apps/api/src/db/schema/index.ts
apps/api/src/db/schema/jobs.ts
apps/api/src/routes/video.ts
apps/api/src/services/video/index.ts
apps/api/src/services/video/openshorts.ts
apps/api/src/services/video/provider.ts
apps/api/src/services/video/service.ts
apps/api/tests/app.test.ts
apps/web/src/app/dashboard/videos/page.tsx
apps/web/src/components/AppShell.tsx
packages/config/package.json
packages/config/src/env.ts
phase05-implementation.zip"\n$validFiles = $files | Where-Object { Test-Path $_ } | Select-Object -Unique\nCompress-Archive -Path $validFiles -DestinationPath "phase05-independent-audit-evidence.zip" -Force