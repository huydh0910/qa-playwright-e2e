import { test, expect } from '../../src/fixtures/fixtures';
import { config } from '../../src/utils/config';

test.describe('API E2E — Login → Get User → Update User', () => {

  test('E2E-PW-API-001 | Full flow: login, retrieve user, update user', async ({ authApi, userApi }) => {
    // Step 1 — Login and get token
    const token = await authApi.getToken(config.api.email, config.api.password);
    expect(token).toBeTruthy();

    // Step 2 — Get user details
    const userData = await userApi.getUserData(2, token);
    expect(userData.data).toBeDefined();
    expect(userData.data.id).toBe(2);

    // Step 3 — Update user details
    const updatedName = `Janet E2E ${Date.now()}`;
    const updateData  = await userApi.updateUserData(2, { name: updatedName, job: 'Automation Lead' }, token);

    expect(updateData.name).toBe(updatedName);
    expect(updateData.job).toBe('Automation Lead');
    expect(updateData.updatedAt).toBeTruthy();
  });

});
