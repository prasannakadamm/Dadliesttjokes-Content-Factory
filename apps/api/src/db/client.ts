import pg from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index.js';

export type AppDatabase = NodePgDatabase<typeof schema>;

export interface DbClient {
  pool: pg.Pool;
  db: AppDatabase;
  close: () => Promise<void>;
  isAlive: () => Promise<boolean>;
}

export function createDbClient(
  connectionStringOrPool: string | pg.Pool,
  poolConfig?: pg.PoolConfig,
): DbClient {
  let pool: pg.Pool;

  if (typeof connectionStringOrPool === 'string') {
    pool = new pg.Pool({
      connectionString: connectionStringOrPool,
      max: poolConfig?.max ?? 10,
      idleTimeoutMillis: poolConfig?.idleTimeoutMillis ?? 30000,
      connectionTimeoutMillis: poolConfig?.connectionTimeoutMillis ?? 5000,
      ...poolConfig,
    });
  } else {
    pool = connectionStringOrPool;
  }

  const db = drizzle(pool, { schema });

  const close = async () => {
    try {
      await pool.end();
    } catch {
      // Ignore if pool is already closed
    }
  };

  const isAlive = async (): Promise<boolean> => {
    try {
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch {
      return false;
    }
  };

  return {
    pool,
    db,
    close,
    isAlive,
  };
}
