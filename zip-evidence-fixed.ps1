$files = @(
  "phase05-independent-audit-evidence.md",
  "apps/api/src/services/video/provider.ts",
  "apps/api/src/services/video/openshorts.ts",
  "apps/api/src/services/video/service.ts",
  "apps/api/src/routes/video.ts",
  "apps/api/src/db/schema/jobs.ts",
  "apps/api/src/config/env.ts",
  "packages/config/src/env.ts",
  "apps/api/src/app.ts",
  "apps/api/drizzle/0001_amused_gamma_corps.sql",
  "apps/api/drizzle/0002_parched_marvel_zombies.sql",
  "apps/web/src/app/dashboard/videos/page.tsx",
  "apps/web/src/components/AppShell.tsx",
  "apps/api/tests/app.test.ts"
)

$validFiles = $files | Where-Object { Test-Path $_ } | Select-Object -Unique
Compress-Archive -Path $validFiles -DestinationPath "phase05-independent-audit-evidence.zip" -Force
