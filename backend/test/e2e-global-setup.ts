import { execSync } from 'child_process';
import * as path from 'path';
import {
  createRunDatabase,
  newRunDatabaseName,
  runDatabaseUrl,
} from './e2e-database';

/** Creates this run's database and applies the migrations, which also checks that they apply cleanly */
export default async function globalSetup(): Promise<void> {
  const dbName = newRunDatabaseName();
  await createRunDatabase(dbName);
  // Read by e2e-env.ts in the test worker and by the teardown
  process.env.E2E_RUN_DATABASE = dbName;

  execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: runDatabaseUrl(dbName) },
    stdio: 'inherit',
  });
}
