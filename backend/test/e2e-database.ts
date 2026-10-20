import { Client } from 'pg';

/**
 * Each e2e run creates its own database next to the one E2E_DATABASE_URL points at, applies the
 * migrations to it and drops it afterwards. Existing databases are never modified, so pointing
 * E2E_DATABASE_URL at the dev server is safe.
 */
const RUN_DB_PREFIX = 'preduzetnik_e2e_';

export const getAdminDatabaseUrl = (): string => {
  const url = process.env.E2E_DATABASE_URL;
  if (!url) {
    throw new Error(
      'E2E_DATABASE_URL is not set. Point it at any database on a Postgres server where the user may create databases, ' +
        'e.g. postgresql://preduzetnik:preduzetnik@localhost:5432/preduzetnik',
    );
  }
  return url;
};

/** The URL of this run's database: same server and credentials, different database name */
export const runDatabaseUrl = (dbName: string): string => {
  const url = new URL(getAdminDatabaseUrl());
  url.pathname = `/${dbName}`;
  return url.toString();
};

export const newRunDatabaseName = (): string =>
  `${RUN_DB_PREFIX}${Date.now()}_${process.pid}`;

const withAdminClient = async (fn: (client: Client) => Promise<void>) => {
  const client = new Client({ connectionString: getAdminDatabaseUrl() });
  await client.connect();
  try {
    await fn(client);
  } finally {
    await client.end();
  }
};

export const createRunDatabase = (dbName: string) =>
  withAdminClient(async (client) => {
    await client.query(`CREATE DATABASE "${dbName}"`);
  });

/** Drops only a database this test run created */
export const dropRunDatabase = (dbName: string) => {
  if (!dbName.startsWith(RUN_DB_PREFIX)) {
    throw new Error(`Refusing to drop "${dbName}": not an e2e run database`);
  }
  return withAdminClient(async (client) => {
    await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  });
};
