import { test as base, Page } from '@playwright/test';
import { LoginPage }        from '../pages/web/LoginPage';
import { HomePage }         from '../pages/web/HomePage';
import { ChallengePage }    from '../pages/web/ChallengePage';
import { MyChallengesPage } from '../pages/web/MyChallengesPage';
import { AuthApi }          from '../api/AuthApi';
import { UserApi }          from '../api/UserApi';
import { config }           from '../utils/config';

interface WebFixtures {
  loginPage:         LoginPage;
  homePage:          HomePage;
  challengePage:     ChallengePage;
  myChallengesPage:  MyChallengesPage;
  /** Page already authenticated — login is handled by the fixture */
  authenticatedPage: Page;
}

interface ApiFixtures {
  authApi:   AuthApi;
  userApi:   UserApi;
  /** Bearer token obtained via POST /login — ready to use in API tests */
  apiToken:  string;
}

export const test = base.extend<WebFixtures & ApiFixtures>({

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  challengePage: async ({ page }, use) => {
    await use(new ChallengePage(page));
  },

  myChallengesPage: async ({ page }, use) => {
    await use(new MyChallengesPage(page));
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(config.web.username, config.web.password);
    await use(page);
  },

  authApi: async ({ request }, use) => {
    await use(new AuthApi(request));
  },

  userApi: async ({ request }, use) => {
    await use(new UserApi(request));
  },

  apiToken: async ({ request }, use) => {
    const token = await new AuthApi(request).getToken(
      config.api.email,
      config.api.password
    );
    await use(token);
  },
});

export { expect } from '@playwright/test';
