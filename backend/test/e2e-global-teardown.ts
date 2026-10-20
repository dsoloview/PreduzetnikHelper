import { dropRunDatabase } from './e2e-database';

export default async function globalTeardown(): Promise<void> {
  const dbName = process.env.E2E_RUN_DATABASE;
  if (dbName) await dropRunDatabase(dbName);
}
