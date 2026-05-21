export const testData = {
  uniqueChallengeName: (): string =>
    `QA_Challenge_${Date.now()}`,

  uniqueEmail: (): string =>
    `qa_${Date.now()}@automation.test`,

  uniqueString: (prefix: string): string =>
    `${prefix}_${Date.now()}`,

  longString: (length: number): string =>
    'A'.repeat(length),
};
