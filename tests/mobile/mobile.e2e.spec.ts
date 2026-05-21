/**
 * Mobile E2E Tests — Browser-based device emulation via Playwright.
 *
 * Note: Playwright does not support native iOS/Android app automation
 * (that is handled by Appium in the Java framework). These tests simulate
 * a mobile trading app running in a mobile browser using Playwright's
 * built-in device emulation (Pixel 5, iPhone 12 — configured in playwright.config.ts).
 *
 * To test a native app, use the Appium project (qa-automation-framework).
 */
import { test, expect } from '../../src/fixtures/fixtures';
import { LoginPage }           from '../../src/pages/web/LoginPage';
import { HomePage }            from '../../src/pages/web/HomePage';
import { config }              from '../../src/utils/config';
import { testData }            from '../../src/utils/testData';

test.describe('Mobile E2E — Login & Portfolio (browser emulation)', () => {

  test('E2E-PW-MOB-001 | Positive: login on mobile viewport shows home screen', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    const homePage = await loginPage.loginAs(config.web.username, config.web.password);

    expect(await homePage.isLoggedIn()).toBe(true);
  });

  test('E2E-PW-MOB-002 | Negative: wrong password on mobile viewport shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await loginPage.attemptLogin(config.web.username, 'WrongPass@999');

    expect(await loginPage.isErrorDisplayed()).toBe(true);
  });

  test('E2E-PW-MOB-003 | Negative: empty credentials on mobile viewport shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await loginPage.attemptLogin('', '');

    expect(await loginPage.isErrorDisplayed()).toBe(true);
  });

  test('E2E-PW-MOB-004 | Positive: full mobile flow — login, navigate, logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    // Step 1 — Login
    const homePage = await loginPage.loginAs(config.web.username, config.web.password);
    expect(await homePage.isLoggedIn()).toBe(true);

    // Step 2 — Navigate to a challenge (simulates portfolio navigation)
    const challengePage = await homePage.navigateToChallenges();
    expect(await page.url()).toContain('challenge');

    // Step 3 — Logout
    await homePage.logout();
    expect(page.url()).not.toContain('dashboard');
  });

  test('E2E-PW-MOB-005 | UI: viewport dimensions match configured mobile device', async ({ page }) => {
    const viewportSize = page.viewportSize();

    expect(viewportSize).not.toBeNull();
    // Pixel 5: 393×851 | iPhone 12: 390×844
    expect(viewportSize!.width).toBeLessThanOrEqual(430);
    expect(viewportSize!.height).toBeGreaterThan(600);
  });

});
