import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load env-specific config before any test runs
const env = process.env.ENV ?? 'qa';
dotenv.config({ path: path.resolve(__dirname, `config/${env}.env`) });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,

  reporter: [
    ['html',  { outputFolder: 'reports/html', open: 'never' }],
    ['json',  { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL:    process.env.BASE_URL ?? 'https://ctflearn.com',
    trace:      'on-first-retry',
    screenshot: 'only-on-failure',
    video:      'on-first-retry',
  },

  projects: [
    // ── Desktop browsers ──────────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/web/**/*.spec.ts', '**/api/**/*.spec.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/web/**/*.spec.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/web/**/*.spec.ts'],
    },

    // ── Mobile browser emulation ──────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/mobile/**/*.spec.ts'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: ['**/mobile/**/*.spec.ts'],
    },

    // ── API-only (no browser) ─────────────────────────────────────────────
    {
      name: 'api',
      testMatch: ['**/api/**/*.spec.ts'],
    },
  ],
});
