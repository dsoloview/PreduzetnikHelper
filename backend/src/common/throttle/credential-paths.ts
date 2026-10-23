const CREDENTIAL_PATHS = new Set(['/api/auth/login', '/api/auth/register']);

export const isCredentialRequest = (path: string): boolean =>
  CREDENTIAL_PATHS.has(path.replace(/\/+$/, ''));
