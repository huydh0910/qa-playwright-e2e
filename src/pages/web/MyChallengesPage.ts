import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MyChallengesPage extends BasePage {
  private readonly challengeItems = this.page.locator('.challenge-list .challenge-item, table.challenges tbody tr');
  private readonly pageHeader     = this.page.locator('h1, .page-title');
  private readonly emptyState     = this.page.locator('.empty-state, .no-challenges');

  constructor(page: Page) {
    super(page);
  }

  async isChallengeDisplayed(title: string): Promise<boolean> {
    const names = await this.getChallengeNames();
    return names.some(n => n.includes(title));
  }

  async getChallengeNames(): Promise<string[]> {
    const items = await this.challengeItems.all();
    return Promise.all(
      items.map(el =>
        el.locator('.challenge-title, td.title').textContent()
          .then(t => t ?? el.textContent().then(t2 => t2 ?? ''))
      )
    );
  }

  async getChallengeCount(): Promise<number> {
    return this.challengeItems.count();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.isVisible(this.emptyState);
  }
}
