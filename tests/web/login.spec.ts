import { test, expect } from '../../src/fixtures/fixtures';
import { config } from '../../src/utils/config';

test.describe('Login — Web UI', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('TC-PW-WEB-001 | Positive: valid credentials log in successfully', async ({ loginPage }) => {
    const homePage = await loginPage.loginAs(config.web.username, config.web.password);
    expect(await homePage.isLoggedIn()).toBe(true);
  });

  test('TC-PW-WEB-002 | Negative: wrong password displays error message', async ({ loginPage }) => {
    await loginPage.attemptLogin(config.web.username, 'WrongPassword@999');
    expect(await loginPage.isErrorDisplayed()).toBe(true);
  });

  test('TC-PW-WEB-003 | Negative: empty fields display validation message', async ({ loginPage }) => {
    await loginPage.attemptLogin('', '');
    expect(await loginPage.isErrorDisplayed()).toBe(true);
  });

});
