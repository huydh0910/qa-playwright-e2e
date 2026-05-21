import { test, expect } from '../../src/fixtures/fixtures';
import { HomePage }      from '../../src/pages/web/HomePage';
import { ChallengePage } from '../../src/pages/web/ChallengePage';
import { testData }      from '../../src/utils/testData';

test.describe('Challenge E2E — Web UI', () => {

  test('E2E-PW-WEB-001 | Create challenge and verify it appears in My Challenges', async ({ authenticatedPage }) => {
    const challengeTitle = testData.uniqueChallengeName();
    const homePage       = new HomePage(authenticatedPage);
    const challengePage  = new ChallengePage(authenticatedPage);

    // Navigate to Challenges → Create
    await homePage.navigateToChallenges();
    await challengePage.clickCreateChallenge();

    // Fill the form
    await challengePage.fillTitle(challengeTitle);
    await challengePage.selectCategory('Binary');
    await challengePage.selectDifficulty('Easy');
    await challengePage.fillDescription(`Automated E2E challenge: ${challengeTitle}`);
    await challengePage.fillFlag(`FLAG{playwright_${Date.now()}}`);
    await challengePage.fillPoints('10');

    // Submit and land on My Challenges
    const myChallengesPage = await challengePage.submitChallenge();

    // Verify the challenge is listed
    expect(await myChallengesPage.isChallengeDisplayed(challengeTitle)).toBe(true);

    // Logout
    await homePage.logout();
  });

  test('E2E-PW-WEB-002 | Negative: submit form without title shows validation error', async ({ authenticatedPage }) => {
    const homePage      = new HomePage(authenticatedPage);
    const challengePage = new ChallengePage(authenticatedPage);

    await homePage.navigateToChallenges();
    await challengePage.clickCreateChallenge();

    // Leave title empty
    await challengePage.fillDescription('Challenge with no title');
    await challengePage.fillFlag('FLAG{no_title_test}');
    await challengePage.submitChallenge();

    expect(await challengePage.isValidationErrorVisible()).toBe(true);
  });

});
