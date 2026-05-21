import { test, expect } from '../../src/fixtures/fixtures';
import { config } from '../../src/utils/config';

test.describe('Login API — POST /login', () => {

  test('API-PW-LOGIN-001 | Positive: valid credentials return a token', async ({ authApi }) => {
    const response = await authApi.login(config.api.email, config.api.password);
    const body     = await response.json();

    expect(response.status()).toBe(200);
    expect(body.token).toBeTruthy();
  });

  test('API-PW-LOGIN-002 | Positive: token is a non-empty string', async ({ authApi }) => {
    const token = await authApi.getToken(config.api.email, config.api.password);

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('API-PW-LOGIN-003 | Negative: missing password returns 400 with error field', async ({ authApi }) => {
    const response = await authApi.login(config.api.email, '');
    const body     = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toBe('Missing password');
  });

  test('API-PW-LOGIN-004 | Negative: missing email returns 400 with error field', async ({ authApi }) => {
    const response = await authApi.login('', config.api.password);
    const body     = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toBeTruthy();
  });

  test('API-PW-LOGIN-005 | Negative: unregistered email returns 400', async ({ authApi }) => {
    const response = await authApi.login('ghost@reqres.in', 'password123');
    const body     = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toBeTruthy();
  });

});
