import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ChallengePage } from './ChallengePage';
import { MyChallengesPage } from './MyChallengesPage';

export class HomePage extends BasePage {
  private readonly navChallenges    = this.page.locator('a[href*="challenge"]').first();
  private readonly myChallengesLink = this.page.locator('a[href*="my-challenge"], a[href*="mychallenges"]');
  private readonly userMenu         = this.page.locator('.user-menu, .navbar-user, #user-dropdown');
  private readonly logoutLink       = this.page.locator('a[href*="logout"], a[href*="signout"]');

  constructor(page: Page) {
    super(page);
  }

  async isLoggedIn(): Promise<boolean> {
    return (await this.isVisible(this.userMenu)) || (await this.isVisible(this.logoutLink));
  }

  async navigateToChallenges(): Promise<ChallengePage> {
    await this.navChallenges.click();
    return new ChallengePage(this.page);
  }

  async navigateToMyChallenges(): Promise<MyChallengesPage> {
    await this.myChallengesLink.click();
    return new MyChallengesPage(this.page);
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    await this.logoutLink.click();
  }
}
