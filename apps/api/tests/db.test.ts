import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb } from './helpers/test-db.js';
import type { DbClient } from '../src/db/client.js';
import { users } from '../src/db/schema/index.js';
import { eq } from 'drizzle-orm';
import { loadApiConfig } from '../src/config/env.js';

describe('Database Foundation & Schema Lifecycle', () => {
  let testDb: DbClient;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(async () => {
    await testDb.close();
  });

  it('validates database client lifecycle methods', async () => {
    expect(testDb.db).toBeDefined();
    expect(testDb.pool).toBeDefined();
    const alive = await testDb.isAlive();
    expect(alive).toBe(true);
  });

  it('inserts user record and enforces constraints', async () => {
    const [inserted] = await testDb.db
      .insert(users)
      .values({
        email: 'creator@dadliesttjokes.com',
        passwordHash: '$2a$10$hashedpasswordstringforuser',
        role: 'creator',
      })
      .returning();

    expect(inserted).toBeDefined();
    expect(inserted!.id).toBeDefined();
    expect(inserted!.email).toBe('creator@dadliesttjokes.com');
    expect(inserted!.role).toBe('creator');
    expect(inserted!.createdAt).toBeInstanceOf(Date);
    expect(inserted!.updatedAt).toBeInstanceOf(Date);
  });

  it('enforces unique constraint on email', async () => {
    await testDb.db.insert(users).values({
      email: 'unique@dadliesttjokes.com',
      passwordHash: 'hash1',
    });

    await expect(
      testDb.db.insert(users).values({
        email: 'unique@dadliesttjokes.com',
        passwordHash: 'hash2',
      }),
    ).rejects.toThrow();
  });

  it('queries user by email index efficiently', async () => {
    await testDb.db.insert(users).values({
      email: 'lookup@dadliesttjokes.com',
      passwordHash: 'lookup-hash',
    });

    const [found] = await testDb.db
      .select()
      .from(users)
      .where(eq(users.email, 'lookup@dadliesttjokes.com'));

    expect(found).toBeDefined();
    expect(found!.email).toBe('lookup@dadliesttjokes.com');
  });

  it('correctly loads and validates DATABASE_URL from config', () => {
    const config = loadApiConfig({
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_test',
    });
    expect(config.DATABASE_URL).toBe(
      'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_test',
    );
  });
});
