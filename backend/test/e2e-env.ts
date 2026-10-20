import { runDatabaseUrl } from './e2e-database';

const dbName = process.env.E2E_RUN_DATABASE;
if (!dbName) {
  throw new Error(
    'E2E_RUN_DATABASE is not set: run e2e tests via `pnpm test:e2e`',
  );
}

// Real environment variables win over backend/.env in ConfigModule, so the app talks to this run's database
process.env.DATABASE_URL = runDatabaseUrl(dbName);
process.env.JWT_SECRET ??= 'e2e-jwt-secret-that-is-long-enough-for-tests';
process.env.PDF_PROVIDER = 'pdfmake';
process.env.NODE_ENV = 'test';
process.env.THROTTLE_AUTH_LIMIT = '1000';
