import { isCredentialRequest } from './credential-paths';

describe('isCredentialRequest', () => {
  it('covers login and registration', () => {
    expect(isCredentialRequest('/api/auth/login')).toBe(true);
    expect(isCredentialRequest('/api/auth/register/')).toBe(true);
  });

  it('leaves token refresh and logout to the default limit', () => {
    expect(isCredentialRequest('/api/auth/refresh')).toBe(false);
    expect(isCredentialRequest('/api/auth/logout')).toBe(false);
    expect(isCredentialRequest('/api/invoices')).toBe(false);
  });
});
