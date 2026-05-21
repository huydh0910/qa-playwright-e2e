import { test, expect } from '../../src/fixtures/fixtures';

test.describe('Update User API — PUT/PATCH /users/{id}', () => {

  test('API-PW-PUT-001 | Positive: PUT returns 200 with updated fields and updatedAt', async ({ userApi, apiToken }) => {
    const response = await userApi.updateUser(2, { name: 'Janet PW', job: 'Senior QA' }, apiToken);
    const body     = await response.json();

    expect(response.status()).toBe(200);
    expect(body.name).toBe('Janet PW');
    expect(body.job).toBe('Senior QA');
    expect(body.updatedAt).toBeTruthy();
  });

  test('API-PW-PUT-002 | Positive: PUT response maps to UpdateUserResponse model', async ({ userApi, apiToken }) => {
    const data = await userApi.updateUserData(2, { name: 'Model Test', job: 'QA Lead' }, apiToken);

    expect(data.name).toBe('Model Test');
    expect(data.job).toBe('QA Lead');
    expect(new Date(data.updatedAt).getFullYear()).toBeGreaterThanOrEqual(2024);
  });

  test('API-PW-PATCH-003 | Positive: PATCH partial update returns 200', async ({ userApi, apiToken }) => {
    const response = await userApi.patchUser(2, { job: 'Principal QA' }, apiToken);
    const body     = await response.json();

    expect(response.status()).toBe(200);
    expect(body.job).toBe('Principal QA');
    expect(body.updatedAt).toBeTruthy();
  });

  test('API-PW-PUT-004 | Negative: PUT empty body does not cause server error', async ({ userApi, apiToken }) => {
    const response = await userApi.updateUser(2, {}, apiToken);

    expect(response.status()).not.toBe(500);
  });

  test('API-PW-PUT-005 | Negative: PUT non-existent user — Reqres mock behaviour is documented', async ({ userApi, apiToken }) => {
    const response = await userApi.updateUser(9999, { name: 'Ghost', job: 'Nobody' }, apiToken);

    // Reqres returns 200 for any PUT — documenting actual mock API behaviour
    expect(response.status()).not.toBe(500);
  });

});
