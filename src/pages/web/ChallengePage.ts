import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { MyChallengesPage } from './MyChallengesPage';

export class ChallengePage extends BasePage {
  private readonly createBtn          = this.page.locator('a[href*="create"], button.create-challenge');
  private readonly titleInput         = this.page.locator('#title');
  private readonly categorySelect     = this.page.locator('#category');
  private readonly difficultySelect   = this.page.locator('#difficulty');
  private readonly descriptionInput   = this.page.locator('#description');
  private readonly flagInput          = this.page.locator('#flag');
  private readonly pointsInput        = this.page.locator('#points');
  private readonly submitButton       = this.page.locator('button[type="submit"], input[type="submit"]');
  private readonly successMessage     = this.page.locator('.alert-success, .success-message');
  private readonly validationError    = this.page.locator('.alert-danger, .field-error, .error');

  constructor(page: Page) {
    super(page);
  }

  async clickCreateChallenge(): Promise<this> {
    await this.createBtn.click();
    return this;
  }

  async fillTitle(title: string): Promise<this> {
    await this.titleInput.fill(title);
    return this;
  }

  async selectCategory(category: string): Promise<this> {
    await this.categorySelect.selectOption({ label: category });
    return this;
  }

  async selectDifficulty(difficulty: string): Promise<this> {
    await this.difficultySelect.selectOption({ label: difficulty });
    return this;
  }

  async fillDescription(description: string): Promise<this> {
    await this.descriptionInput.fill(description);
    return this;
  }

  async fillFlag(flag: string): Promise<this> {
    await this.flagInput.fill(flag);
    return this;
  }

  async fillPoints(points: string): Promise<this> {
    await this.pointsInput.fill(points);
    return this;
  }

  async submitChallenge(): Promise<MyChallengesPage> {
    await this.submitButton.click();
    return new MyChallengesPage(this.page);
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    return this.isVisible(this.successMessage);
  }

  async isValidationErrorVisible(): Promise<boolean> {
    return this.isVisible(this.validationError);
  }
}
