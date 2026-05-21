import { test, expect } from '../../src/fixtures/fixtures';

test.describe('Get User API — GET /users/{id}', () => {

  test('API-PW-GET-001 | Positive: existing user returns 200 with full data', async ({ userApi, apiToken }) => {
    const response = await userApi.getUser(2, apiToken);
    const body     = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.id).toBe(2);
    expect(body.data.email).toBeTruthy();
    expect(body.data.first_name).toBeTruthy();
    expect(body.data.last_name).toBeTruthy();
    expect(body.data.avatar).toBeTruthy();
    expect(body.support).toBeDefined();
  });

  test('API-PW-GET-002 | Positive: response data maps to expected shape', async ({ userApi, apiToken }) => {
    const data = await userApi.getUserData(2, apiToken);

    expect(data.data.id).toBe(2);
    expect(data.data.email).toContain('@');
    expect(data.support.url).toBeTruthy();
  });

  test('API-PW-GET-003 | Positive: retrieve a different valid user (id=1)', async ({ userApi, apiToken }) => {
    const response = await userApi.getUser(1, apiToken);

    expect(response.status()).toBe(200);
    expect((await response.json()).data.id).toBe(1);
  });

  test('API-PW-GET-004 | Negative: non-existent user returns 404', async ({ userApi, apiToken }) => {
    const response = await userApi.getUser(9999, apiToken);

    expect(response.status()).toBe(404);
  });

  test('API-PW-GET-005 | Negative: user id 0 returns 4xx error', async ({ userApi, apiToken }) => {
    const response = await userApi.getUser(0, apiToken);

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

});
