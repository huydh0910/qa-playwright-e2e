import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { config } from '../../utils/config';
import { HomePage } from './HomePage';

export class LoginPage extends BasePage {
  private readonly usernameInput  = this.page.locator('#username');
  private readonly passwordInput  = this.page.locator('#password');
  private readonly loginButton    = this.page.locator('button[type="submit"]');
  private readonly errorMessage   = this.page.locator('.alert-danger, .error-message');
  private readonly logoutLink     = this.page.locator('a[href*="logout"]');

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<this> {
    await this.navigate(`${config.baseUrl}/user/login`);
    return this;
  }

  /** Reusable login — shared across all web test cases */
  async loginAs(username: string, password: string): Promise<HomePage> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    return new HomePage(this.page);
  }

  async attemptLogin(username: string, password: string): Promise<this> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    return this;
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isVisible(this.errorMessage);
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
