import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  protected async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  protected async waitForVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
