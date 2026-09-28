import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDbClient } from './client.js';
import { loadApiConfig } from '../config/env.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(customDbClient?: ReturnType<typeof createDbClient>) {
  const config = loadApiConfig();
  const dbClient = customDbClient || createDbClient(config.DATABASE_URL);
  const migrationsFolder = path.resolve(__dirname, '../../drizzle');

  try {
    await migrate(dbClient.db, { migrationsFolder });
    return { success: true, migrationsFolder };
  } finally {
    if (!customDbClient) {
      await dbClient.close();
    }
  }
}

// Auto-run when executed directly via node or tsx
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  runMigrations()
    .then((res) => {
      console.log(`Database migrations applied successfully from ${res.migrationsFolder}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
