# Playwright E2E Framework — Complete Instructor Guide

> **Who this is for:** QA engineers new to Playwright or TypeScript who want to understand *why* each
> decision was made — not just *how* to use the framework.
>
> **Companion framework:** See `qa-automation-framework/GUIDE.md` for the Java / Selenium / TestNG version.
> Both projects cover the same test scenarios so you can compare approaches side-by-side.

---

## Table of Contents

1. [Why Playwright — Not Selenium](#1-why-playwright--not-selenium)
2. [Why TypeScript — Not JavaScript](#2-why-typescript--not-javascript)
3. [Why These Dependencies](#3-why-these-dependencies)
4. [Prerequisites & Setup](#4-prerequisites--setup)
5. [Project Structure Explained](#5-project-structure-explained)
6. [How playwright.config.ts Works](#6-how-playwrightconfigts-works)
7. [Environment Config — How dotenv Works](#7-environment-config--how-dotenv-works)
8. [Page Object Model in Playwright](#8-page-object-model-in-playwright)
9. [Fixtures — The Core of This Framework](#9-fixtures--the-core-of-this-framework)
10. [Built-in API Testing — No Extra Library](#10-built-in-api-testing--no-extra-library)
11. [Mobile Browser Emulation vs Appium](#11-mobile-browser-emulation-vs-appium)
12. [Step-by-Step: Writing a New Test](#12-step-by-step-writing-a-new-test)
13. [All Run Commands Reference](#13-all-run-commands-reference)
14. [Reading Playwright HTML Reports & Traces](#14-reading-playwright-html-reports--traces)
15. [CI/CD — Jenkins Setup](#15-cicd--jenkins-setup)
16. [BrowserStack Integration](#16-browserstack-integration)
17. [Troubleshooting Table](#17-troubleshooting-table)
18. [Best Practices Checklist](#18-best-practices-checklist)
19. [Java vs Playwright — Side-by-Side Comparison](#19-java-vs-playwright--side-by-side-comparison)

---

## 1. Why Playwright — Not Selenium

This is the most important question to answer. Both tools automate browsers, so why choose one over the other?

### The Root Difference: Communication Protocol

```
Selenium (WebDriver protocol — W3C spec):
  Your Test → HTTP → WebDriver Server → CDP/native driver → Browser

Playwright (CDP + browser-native protocol):
  Your Test → WebSocket (persistent) → Browser DevTools Protocol (CDP) → Browser
```

Selenium goes through an HTTP request-response cycle for *every action*. Playwright keeps a persistent
WebSocket connection open and sends commands directly via CDP. This is why Playwright is faster and why
it can intercept network requests, mock responses, and capture traces without extra setup.

### Auto-Waiting — The Biggest Day-to-Day Win

**Selenium:**
```java
// You must write this manually on every element interaction
WebElement btn = new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.elementToBeClickable(By.id("submit")));
btn.click();
```

**Playwright:**
```typescript
// Playwright automatically retries until the element is actionable
await page.locator('#submit').click();
```

Playwright's auto-waiting polls the element state (visible, enabled, stable, not obscured) before acting.
If an element is covered by a spinner overlay, Playwright waits for the overlay to disappear. You never
write `WebDriverWait` or `ExpectedConditions` again.

### Other Key Advantages

| Feature | Selenium | Playwright |
|---|---|---|
| Auto-waiting on actions | Manual `WebDriverWait` required | Built-in, every action |
| Network interception | Third-party proxy (BrowserMob) | `page.route()` built-in |
| API testing | External library (RestAssured) | Built-in `request` fixture |
| Trace viewer | No equivalent | Visual step-by-step DOM snapshots |
| Screenshots | Manual TakesScreenshot | `screenshot: 'only-on-failure'` config |
| Video recording | No equivalent | `video: 'on-first-retry'` config |
| Multiple tabs / contexts | Complex to manage | First-class `BrowserContext` support |
| `iframes` | `driver.switchTo().frame()` | `frameLocator()` — no switching |
| Test isolation | Share driver state (risk) | Each test gets isolated `BrowserContext` |

### When Selenium is Still the Right Choice

- You need to test IE11 or legacy Edge (Playwright dropped IE support)
- Your team has years of Selenium expertise and existing infrastructure
- You use Appium for native mobile — Selenium + Appium share the same WebDriver protocol
- Your company has a standardised Selenium Grid already in place

---

## 2. Why TypeScript — Not JavaScript

The framework is written in TypeScript. If you've only used JavaScript, here is what changes:

### Type Safety Prevents Runtime Surprises

```typescript
// TypeScript catches this at COMPILE time — before the test even runs
const response: LoginResponse = await authApi.login('a@b.com', 'pass');
response.tooken;                  // ← Error: Property 'tooken' does not exist
                                  //   Did you mean 'token'?
```

In JavaScript, `response.tooken` would silently return `undefined` and your assertion would fail with
a cryptic message. TypeScript surfaces the typo immediately in your editor.

### Interface Contracts Between API and Tests

```typescript
// src/api/types.ts
export interface LoginResponse {
  token: string;
}

// Your test — TypeScript guarantees the response matches the interface
const body: LoginResponse = await response.json();
expect(body.token).toBeTruthy();  // auto-complete shows 'token' is valid
```

This is essentially a schema validation built into the language. If the API changes its response
structure, TypeScript shows you every test that needs updating.

### IDE Support (IntelliJ / VS Code)

With TypeScript:
- Full autocomplete on `page.`, `expect.`, and your own page objects
- "Go to definition" works on every class and method
- Refactoring (rename method) updates all call sites

Without TypeScript (plain JS), the IDE can only guess based on JSDoc comments or usage patterns.

---

## 3. Why These Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.44.0",  // test runner + browser automation — everything in one
    "@types/node":      "^20.12.0", // TypeScript types for Node.js built-ins (path, process, etc.)
    "dotenv":           "^16.4.5",  // load .env files — one line of code, zero complexity
    "typescript":       "^5.4.5",   // TypeScript compiler
    "eslint":           "^8.57.0",  // static analysis
    "@typescript-eslint/parser":    "^7.8.0", // lets ESLint understand TypeScript syntax
    "@typescript-eslint/eslint-plugin": "^7.8.0" // TypeScript-aware lint rules
  }
}
```

**Notice what's NOT here:**

- No `selenium-webdriver` — Playwright replaces it
- No `jest` / `mocha` — `@playwright/test` is the test runner
- No `axios` / `supertest` — Playwright's `request` fixture handles API calls
- No `appium` — Playwright does mobile via browser emulation (see section 11)
- No `webdriver-manager` — Playwright downloads browsers via `npx playwright install`

This is the entire dependency list. Simpler dependency tree = fewer version conflicts, faster `npm install`.

---

## 4. Prerequisites & Setup

### System Requirements

| Tool | Minimum Version | Check Command |
|---|---|---|
| Node.js | 18.x LTS | `node --version` |
| npm | 9.x | `npm --version` |
| Git | Any | `git --version` |

### First-Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/huydh0910/qa-playwright-e2e.git
cd qa-playwright-e2e

# 2. Install Node dependencies
npm install

# 3. Install browser binaries (Chromium, Firefox, WebKit)
#    This downloads ~300MB of browsers — only needed once
npx playwright install

# 4. (Optional) Install system dependencies for Linux/CI
npx playwright install-deps

# 5. Copy environment template and fill in credentials
copy .env.example config/qa.env
# Then edit config/qa.env with real values
```

### VS Code Setup (Recommended)

Install the **Playwright Test for VS Code** extension (ms-playwright.playwright).

This gives you:
- Run/debug individual tests from the editor gutter
- "Pick locator" tool — click an element in the browser, get the locator
- Test results panel with inline pass/fail badges

### Verify Installation

```bash
# Should print Playwright version, then run the API tests as a smoke check
npx playwright test tests/api/login.api.spec.ts --project=chromium
```

---

## 5. Project Structure Explained

```
qa-playwright-e2e/
│
├── playwright.config.ts          ← central config: browsers, retries, reporters, timeouts
├── package.json                  ← scripts + dependencies
├── tsconfig.json                 ← TypeScript compiler settings
├── .env.example                  ← template — copy to config/qa.env
│
├── config/                       ← per-environment .env files (not committed)
│   ├── dev.env
│   ├── qa.env
│   └── staging.env
│
├── src/
│   ├── api/                      ← API client layer
│   │   ├── ApiClient.ts          ← abstract base: baseUrl + headers() helper
│   │   ├── AuthApi.ts            ← POST /login — returns token
│   │   ├── UserApi.ts            ← GET/PUT/PATCH /users/{id}
│   │   └── types.ts              ← TypeScript interfaces for all request/response shapes
│   │
│   ├── pages/                    ← Page Object Model
│   │   ├── BasePage.ts           ← shared: navigate(), waitForVisible(), getTitle()
│   │   └── web/
│   │       ├── LoginPage.ts
│   │       ├── HomePage.ts
│   │       ├── ChallengePage.ts
│   │       └── MyChallengesPage.ts
│   │
│   ├── fixtures/
│   │   └── fixtures.ts           ← CORE: test.extend() with all page + API fixtures
│   │
│   └── utils/
│       ├── config.ts             ← typed config object (reads from .env)
│       └── testData.ts           ← shared test data constants
│
├── tests/                        ← actual test files
│   ├── web/                      ← browser UI tests
│   ├── api/                      ← REST API tests
│   └── mobile/                   ← mobile emulation tests
│
├── features/                     ← BDD Gherkin feature files
│   ├── web/
│   ├── api/
│   └── mobile/
│
└── reports/                      ← generated at runtime, not committed
    ├── html/                     ← open with: npm run report
    ├── results.json
    └── junit.xml
```

**Key architectural insight:** There is a deliberate separation between `src/` (reusable code) and
`tests/` (test scenarios). Page objects, API clients, and fixtures live in `src/`. Tests are thin —
they declare fixtures they need and write assertions. This mirrors how good production code separates
concerns.

---

## 6. How playwright.config.ts Works

This is the brain of the framework. Understanding it unlocks everything.

```typescript
// playwright.config.ts

const env = process.env.ENV ?? 'qa';           // default to qa if ENV not set
dotenv.config({ path: `config/${env}.env` });  // load env file before any test runs

export default defineConfig({
  testDir: './tests',       // where to find test files
  fullyParallel: true,      // run tests within a file in parallel (not just between files)
  forbidOnly: !!process.env.CI, // fail if test.only() left in code — enforced on CI
  retries: process.env.CI ? 2 : 0, // retry flaky tests on CI; none locally
  workers: process.env.CI ? 4 : undefined, // 4 workers on CI; auto (CPU count) locally
  timeout: 30_000,          // 30s per test by default

  reporter: [...],          // 4 reporters run simultaneously (see section 14)

  use: {                    // defaults applied to ALL projects
    baseURL:    process.env.BASE_URL,
    trace:      'on-first-retry',    // capture trace only when a test is being retried
    screenshot: 'only-on-failure',   // capture screenshot only on failure
    video:      'on-first-retry',    // record video only when retrying
  },

  projects: [...]           // define browser/device combinations (see below)
});
```

### Projects — Browser Matrix

Each `project` is an independent runner that uses a specific browser / device profile:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] }, // spread all Chrome device settings
    testMatch: ['**/web/**/*.spec.ts', '**/api/**/*.spec.ts'], // only these paths
  },
  {
    name: 'mobile-chrome',
    use: { ...devices['Pixel 5'] },        // 393x851 viewport, mobile user-agent
    testMatch: ['**/mobile/**/*.spec.ts'],
  },
]
```

**Why `testMatch` per project?** Without it, every project runs every test. API tests in the
`mobile-chrome` project would fail because there's no browser viewport to test. `testMatch` ensures
each project only runs tests that make sense for its context.

### Running a Specific Project

```bash
# Run only in Firefox
npx playwright test --project=firefox

# Run web tests in all three desktop browsers
npx playwright test --project=chromium --project=firefox --project=webkit tests/web/
```

---

## 7. Environment Config — How dotenv Works

### The Flow

```
ENV=staging npm run test:web
         │
         ▼
playwright.config.ts reads ENV variable
         │
         ▼
dotenv.config({ path: 'config/staging.env' })   ← loads file into process.env
         │
         ▼
src/utils/config.ts reads process.env.BASE_URL etc.
         │
         ▼
config object is imported by fixtures.ts, page objects, and API clients
```

### What a .env File Looks Like

```bash
# config/qa.env
BASE_URL=https://ctflearn.com
API_BASE_URL=https://reqres.in/api

WEB_USERNAME=your_ctflearn_username
WEB_PASSWORD=your_ctflearn_password

API_EMAIL=eve.holt@reqres.in
API_PASSWORD=cityslicka

MOBILE_EMAIL=mobile@test.com
MOBILE_PASSWORD=mobile_password
```

### Why Not Hardcode Values in Tests?

```typescript
// BAD — environment locked in source code
await loginPage.loginAs('my_username', 'my_password');

// GOOD — reads from config, switch env by changing one variable
await loginPage.loginAs(config.web.username, config.web.password);
```

With the config approach, you run against staging by just setting `ENV=staging`. No code changes.

### Why `as const` in config.ts

```typescript
export const config = {
  timeouts: {
    default: 30_000,
  },
} as const;   // ← makes all values readonly
```

`as const` prevents accidental mutation (`config.timeouts.default = 5000` would be a TypeScript error).
It also makes the type narrow — TypeScript knows `config.timeouts.default` is `30000`, not just `number`.

### Adding a New Config Key

1. Add the variable to all three `.env` files (`dev.env`, `qa.env`, `staging.env`)
2. Add it to `src/utils/config.ts`:
   ```typescript
   export const config = {
     // existing keys...
     newFeature: {
       someKey: process.env.SOME_KEY ?? 'default_value',
     },
   } as const;
   ```
3. Import and use: `import { config } from '../utils/config';`

---

## 8. Page Object Model in Playwright

### Why Use Page Objects?

Without POM, tests contain raw locators:
```typescript
// WITHOUT POM — brittle, duplicated, hard to maintain
await page.fill('input[name="email"]', 'user@test.com');
await page.fill('input[name="password"]', 'pass123');
await page.click('button[type="submit"]');
expect(await page.url()).toContain('/dashboard');
```

If the email input's `name` attribute changes to `username`, you update every test that mentions it.

With POM, the locator is in one place:
```typescript
// LoginPage.ts — change the locator here, all tests using loginAs() still pass
private emailInput    = this.page.locator('input[name="email"]');
private passwordInput = this.page.locator('input[name="password"]');
private loginButton   = this.page.locator('button[type="submit"]');

async loginAs(email: string, password: string): Promise<HomePage> {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
  return new HomePage(this.page);
}
```

### BasePage — Shared Infrastructure

```typescript
// src/pages/BasePage.ts
export abstract class BasePage {
  constructor(protected page: Page) {}  // 'protected' means subclasses can access it

  protected async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  // expect().toBeVisible() already has auto-waiting built in
  protected async waitForVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }
}
```

**`abstract class` means:** You cannot instantiate `new BasePage(page)` directly. It exists only to
be extended. This enforces that every page object provides its own constructor and methods.

### Playwright Locators vs Selenium By

| Selenium `By` | Playwright `page.locator()` | Notes |
|---|---|---|
| `By.id("x")` | `page.locator('#x')` | CSS selector |
| `By.name("x")` | `page.locator('[name="x"]')` | attribute selector |
| `By.xpath("//div")` | `page.locator('xpath=//div')` | explicit xpath prefix |
| No equivalent | `page.getByRole('button', {name: 'Login'})` | semantic locator — preferred |
| No equivalent | `page.getByTestId('login-btn')` | requires `data-testid` attribute |
| No equivalent | `page.getByText('Submit')` | text-based — good for CTAs |

**Prefer `getByRole` and `getByTestId` over CSS selectors** — they are more resilient to UI changes
and test what users actually see (role + visible name).

---

## 9. Fixtures — The Core of This Framework

This is the most important concept to understand in Playwright. If you come from TestNG, it replaces
`@BeforeMethod`, `@AfterMethod`, and the entire `BaseTest` inheritance hierarchy.

### What a Fixture Is

A fixture is a factory function that:
1. Sets up a resource (a page object, an API client, a token)
2. Passes that resource to the test via `use(resource)`
3. Runs cleanup code after `use()` returns

```typescript
// Conceptual model — the fixture lifecycle
async function loginPageFixture({ page }, use) {
  // SETUP
  const loginPage = new LoginPage(page);   // create the page object

  await use(loginPage);                     // ← test runs HERE, with loginPage available

  // TEARDOWN (runs after test, even if test fails)
  // nothing to clean up for a stateless page object
}
```

The `use()` call divides setup from teardown — everything before is setup, everything after is teardown.
This is called the **coroutine pattern** and is much cleaner than paired `@Before`/`@After` annotations
because setup and teardown for one resource live in the same function.

### How test.extend() Wires Everything Together

```typescript
// src/fixtures/fixtures.ts
export const test = base.extend<WebFixtures & ApiFixtures>({

  // SIMPLE FIXTURE: wrap page object around Playwright's built-in 'page' fixture
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
    // no teardown needed — Playwright closes the page automatically
  },

  // COMPOSED FIXTURE: do real work before the test (auto-login)
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginAs(config.web.username, config.web.password);
    await use(page);  // test receives an already-authenticated Page
  },

  // API FIXTURE: uses 'request' (Playwright's built-in HTTP client) not 'page'
  apiToken: async ({ request }, use) => {
    const token = await new AuthApi(request).getToken(
      config.api.email,
      config.api.password
    );
    await use(token);  // test receives a ready-to-use Bearer token string
  },
});
```

### Using Fixtures in Tests

```typescript
// tests/web/login.spec.ts
import { test, expect } from '../../src/fixtures/fixtures';  // ← our extended test

test('valid credentials log in', async ({ loginPage }) => {
  //                                      ↑ fixture name = parameter name (by convention)
  const homePage = await loginPage.loginAs('user@test.com', 'pass');
  expect(await homePage.isLoggedIn()).toBe(true);
});

// Need to start logged in? Use authenticatedPage
test('view challenge list', async ({ authenticatedPage }) => {
  //                                 ↑ Playwright handles login before this test body runs
  await authenticatedPage.goto('/challenges');
  // ...
});

// Need token without a browser? Use apiToken
test('GET /users/2 returns 200', async ({ userApi, apiToken }) => {
  //                                       ↑ two fixtures at once — Playwright resolves dependencies
  const response = await userApi.getUser(2, apiToken);
  expect(response.status()).toBe(200);
});
```

### Fixtures vs BaseTest Inheritance (Java Comparison)

```
Java TestNG approach (inheritance):
  BaseTest                 ← WebDriver lifecycle, config, reports
    └── BaseApiTest        ← token lifecycle
          └── LoginApiTest ← actual test methods

Problem: a test that needs BOTH web and API must extend one and call the other manually.
Deep inheritance trees are hard to trace and compose poorly.

Playwright fixtures approach (composition):
  test('my test', async ({ loginPage, apiToken }) => { ... })
                                ↑           ↑
                           web fixture  api fixture
                           resolves     resolves
                           independently  independently

No class hierarchy. Request what you need. Playwright handles the rest.
```

### Fixture Dependency Graph

```
base.page          base.request
     │                   │
     ▼                   ▼
loginPage          authApi
homePage           userApi
challengePage           │
     │                  ▼
authenticatedPage   apiToken
```

Playwright automatically resolves dependencies. If `apiToken` needs `request`, Playwright
creates a `request` context and passes it. You never wire this up manually.

---

## 10. Built-in API Testing — No Extra Library

In the Java framework, API testing requires RestAssured (a separate 5MB JAR). In Playwright,
API testing is built into `@playwright/test` via the `APIRequestContext` interface.

### ApiClient.ts — The Base

```typescript
// src/api/ApiClient.ts
export abstract class ApiClient {
  protected readonly baseUrl: string;

  constructor(protected request: APIRequestContext) {
    // 'request' is Playwright's HTTP client — injected by fixtures
    this.baseUrl = config.apiBaseUrl;
  }

  protected headers(token?: string): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
    // conditional header: if token is undefined, no Authorization header added
  }
}
```

### AuthApi.ts — Making Actual HTTP Requests

```typescript
// src/api/AuthApi.ts
export class AuthApi extends ApiClient {

  async login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/login`, {
      headers: this.headers(),       // no token for login
      data:    { email, password },  // auto-serialised to JSON
    });
  }

  async getToken(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    const body     = await response.json();         // deserialise JSON
    if (!body.token) throw new Error('Login failed — no token in response');
    return body.token;
  }
}
```

### Making an API Call in a Test

```typescript
// tests/api/login.api.spec.ts
test('valid credentials return a token', async ({ authApi }) => {
  const response = await authApi.login(config.api.email, config.api.password);
  const body     = await response.json();

  expect(response.status()).toBe(200);         // status code assertion
  expect(body.token).toBeTruthy();             // body field assertion
});
```

**Key difference from RestAssured:** Playwright's API response is async-by-default. You `await` the
call, then `await response.json()` separately. RestAssured parses the body synchronously inline.
Neither is "better" — just a difference in the async/sync model.

### Playwright API vs RestAssured Side-by-Side

```
RestAssured (Java):
given()
  .baseUri("https://reqres.in/api")
  .header("Authorization", "Bearer " + token)
  .contentType(ContentType.JSON)
.when()
  .get("/users/2")
.then()
  .statusCode(200)
  .body("data.id", equalTo(2));

Playwright (TypeScript):
const response = await request.get(`${baseUrl}/users/2`, {
  headers: { Authorization: `Bearer ${token}` }
});
const body = await response.json();
expect(response.status()).toBe(200);
expect(body.data.id).toBe(2);
```

Both are clear and readable. Playwright's approach feels more like regular async JavaScript;
RestAssured's fluent DSL can be more concise for complex schema validation.

---

## 11. Mobile Browser Emulation vs Appium

### What This Framework Does

The `mobile-chrome` and `mobile-safari` projects in `playwright.config.ts` use:

```typescript
{
  name: 'mobile-chrome',
  use: { ...devices['Pixel 5'] },  // ← device emulation
}
```

This sets:
- Viewport: 393 × 851 pixels
- User-agent string: `Mozilla/5.0 (Linux; Android 11; Pixel 5)...`
- Touch events: enabled
- Device pixel ratio: 2.75

Your test is still running in a **desktop Chromium browser** pretending to be a Pixel 5. It is
**not** running on an Android emulator or a real device.

### Playwright Emulation vs Appium

| | Playwright Device Emulation | Java + Appium |
|---|---|---|
| What runs | Desktop browser in mobile viewport | Native app on Android/iOS |
| Tests | Mobile web / PWA / responsive design | Native `.apk` / `.ipa` app |
| Setup | Zero — just set `devices['Pixel 5']` | Android SDK + Appium Server + emulator |
| Coverage | CSS breakpoints, touch events, UA-specific code | Native UI elements, gestures, permissions |
| Speed | Same as desktop tests | Slower (emulator boot time) |
| Limitation | Cannot test native app features | Full device access |

### When to Use Each

**Use Playwright emulation when:**
- Your app is a web app / PWA with responsive design
- You want to verify the mobile layout looks correct
- You need to test viewport-specific behavior (hamburger menu, swipe carousel)

**Use Appium when:**
- You're testing a React Native / Flutter / native iOS / native Android app
- You need to test native device features: camera, GPS, biometrics, push notifications
- You need to verify app behavior on real iOS 17 vs iOS 16

### Testing Viewport in a Test

```typescript
// tests/mobile/mobile.e2e.spec.ts
test('screen width matches Pixel 5 dimensions', async ({ page }) => {
  const viewport = page.viewportSize();
  expect(viewport?.width).toBeLessThanOrEqual(430);
  expect(viewport?.height).toBeGreaterThanOrEqual(600);
});
```

---

## 12. Step-by-Step: Writing a New Test

Follow these 4 steps every time you add a test. The steps are the same whether it's a web, API, or mobile test.

### Step 1 — Create or Update the Page Object (web tests only)

If the page does not have a page object yet, create one in `src/pages/web/`:

```typescript
// src/pages/web/ProfilePage.ts
import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProfilePage extends BasePage {
  // Locators — define once, use everywhere
  private readonly displayName = this.page.getByTestId('profile-display-name');
  private readonly editButton  = this.page.getByRole('button', { name: 'Edit Profile' });

  constructor(page: Page) {
    super(page);
  }

  async getDisplayName(): Promise<string> {
    return this.displayName.innerText();
  }

  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }
}
```

Naming rules:
- File: `PascalCase.ts` matching class name
- Locators: `private readonly` (never exposed to tests directly)
- Methods: `async`, return `Promise<void>` or `Promise<PageType>` for navigation

### Step 2 — Add the Fixture (if using the new page)

In `src/fixtures/fixtures.ts`:

```typescript
// Add to the WebFixtures interface
interface WebFixtures {
  // ... existing fixtures
  profilePage: ProfilePage;   // ← add this
}

// Add the fixture implementation
export const test = base.extend<WebFixtures & ApiFixtures>({
  // ... existing fixtures

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
});
```

### Step 3 — Write the Test

```typescript
// tests/web/profile.spec.ts
import { test, expect } from '../../src/fixtures/fixtures';
import { config } from '../../src/utils/config';

test.describe('User Profile', () => {

  // Use authenticatedPage when you need to start logged in
  test('TC-WEB-NEW-001 | display name is visible on profile page',
    async ({ authenticatedPage, profilePage }) => {
      await authenticatedPage.goto('/profile');
      const name = await profilePage.getDisplayName();
      expect(name).not.toBe('');
    });
});
```

### Step 4 — Run Your Test

```bash
# Run just your new test file
npx playwright test tests/web/profile.spec.ts

# Run with browser visible
npx playwright test tests/web/profile.spec.ts --headed

# Run in debug mode (step through actions)
npx playwright test tests/web/profile.spec.ts --debug

# Open the report after
npm run report
```

### Step-by-Step for an API Test

For API tests, steps 1 and 2 apply to the API client layer:

```typescript
// Step 1 — Add a method to UserApi.ts (or create a new client)
async deleteUser(userId: number, token: string): Promise<APIResponse> {
  return this.request.delete(`${this.baseUrl}/users/${userId}`, {
    headers: this.headers(token),
  });
}

// Step 2 — No new fixture needed; 'userApi' and 'apiToken' already exist

// Step 3 — Write the test
test('DELETE /users/2 returns expected status', async ({ userApi, apiToken }) => {
  const response = await userApi.deleteUser(2, apiToken);
  expect(response.status()).toBe(204);  // or 200, depending on the API
});
```

---

## 13. All Run Commands Reference

### npm Scripts (from package.json)

| Command | What It Runs |
|---|---|
| `npm test` | All tests, all configured projects |
| `npm run test:web` | All tests in `tests/web/` |
| `npm run test:api` | All tests in `tests/api/` |
| `npm run test:mobile` | Mobile emulation tests (Pixel 5 + iPhone 12) |
| `npm run test:e2e` | The three E2E spec files |
| `npm run test:all-browsers` | Web tests in Chromium + Firefox + WebKit |
| `npm run test:headed` | Web tests with browser window visible |
| `npm run test:debug` | Open Playwright Inspector, step through actions |
| `npm run report` | Open HTML report in browser |
| `npm run typecheck` | TypeScript compile-check without running tests |
| `npm run lint` | ESLint static analysis |

### Direct `npx playwright` Commands

```bash
# Run a single test by title (grep)
npx playwright test --grep "valid credentials"

# Run with a specific project (browser)
npx playwright test --project=firefox

# Run against a different environment
ENV=staging npm run test:web

# Run with N parallel workers
npx playwright test --workers=2

# Run and update snapshots (visual regression)
npx playwright test --update-snapshots

# List all available tests without running
npx playwright test --list

# Generate test code via recorder
npx playwright codegen https://ctflearn.com
```

---

## 14. Reading Playwright HTML Reports & Traces

### Opening the Report

```bash
npm run report
# Opens reports/html/index.html in your default browser
```

### What Each Column Means

| Column | What It Shows |
|---|---|
| Status badge | PASSED (green) / FAILED (red) / FLAKY (yellow — passed on retry) |
| Test name | From `test.describe` + `test` title |
| Duration | Wall-clock time including retries |
| Retry count | How many times it ran before final status |
| Attachments icon | Screenshot / video / trace available |

### Drill Into a Failure

1. Click the failed test row
2. You see the **error message** and **stack trace** at the top
3. Scroll down to see:
   - **Screenshots** — automatic if `screenshot: 'only-on-failure'` is set
   - **Video** — if `video: 'on-first-retry'` is set (visible on second attempt)
   - **Trace** — ZIP file of DOM snapshots + network log

### Reading a Trace File

```bash
# Method 1: through the report (click Trace icon next to a failed test)
# Method 2: directly from command line
npx playwright show-trace reports/html/data/<trace-file>.zip
```

The trace viewer shows:
- **Timeline** — every action as a bar (click, fill, navigate, assertion)
- **DOM snapshots** — the page DOM at the exact moment of each action
- **Network log** — every HTTP request including API calls
- **Console log** — browser console messages

**Practical debugging:** When a test fails with "element not found", open the trace, click the
failing action in the timeline, and look at the DOM snapshot to see what was actually on the page.

---

## 15. CI/CD — Jenkins Setup

### The Jenkinsfile

```groovy
// Jenkinsfile
pipeline {
  agent any

  parameters {
    choice(name: 'ENV',     choices: ['qa', 'staging', 'dev'],  description: 'Target environment')
    choice(name: 'SUITE',   choices: ['all', 'web', 'api', 'mobile', 'e2e'], description: 'Test suite')
    string(name: 'WORKERS', defaultValue: '4', description: 'Parallel workers')
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'                        // ci = clean install, exact versions from package-lock
        sh 'npx playwright install'        // download browsers
      }
    }

    stage('Run Tests') {
      steps {
        sh """
          ENV=${params.ENV} \
          npx playwright test tests/${params.SUITE == 'all' ? '' : params.SUITE + '/'} \
          --workers=${params.WORKERS} \
          --reporter=html,junit,list
        """
      }
    }

    stage('Publish Report') {
      post {
        always {
          publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            reportDir: 'reports/html',
            reportFiles: 'index.html',
            reportName: 'Playwright HTML Report'
          ])
          junit 'reports/junit.xml'
        }
      }
    }
  }
}
```

**Why `npm ci` instead of `npm install` in CI?**
`npm ci` deletes `node_modules`, reads `package-lock.json`, and installs exactly those versions.
`npm install` may upgrade packages within the semver range and update `package-lock.json`.
In CI, you want reproducible builds — `npm ci` guarantees that.

### Environment Variables in Jenkins

In Jenkins Pipeline, set secrets as **Secret text credentials** and inject them:

```groovy
environment {
  WEB_PASSWORD = credentials('ctflearn-web-password')  // Jenkins Credential ID
  API_PASSWORD = credentials('reqres-api-password')
}
```

Never put real passwords in `Jenkinsfile` or `.env` files committed to Git.

---

## 16. BrowserStack Integration

### Configuration File

```yaml
# browserstack.yml
userName: ${BROWSERSTACK_USERNAME}     # from environment variable
accessKey: ${BROWSERSTACK_ACCESS_KEY}  # from environment variable

browsers:
  - browser: chrome
    browser_version: latest
    os: Windows
    os_version: 11
  - browser: firefox
    browser_version: latest
    os: OS X
    os_version: Ventura
  - browser: safari
    browser_version: 16
    os: OS X
    os_version: Ventura

devices:
  - device: Samsung Galaxy S23
    os_version: 13
    browser: chrome
  - device: iPhone 14
    os_version: 16
    browser: safari

parallelsPerPlatform: 2
projectName: QA Playwright E2E
buildName: ${BUILD_NAME}
```

### Running on BrowserStack

```bash
# Install BrowserStack CLI once
npm install -g browserstack-cypress-cli

# For Playwright specifically, use the official SDK
npm install @browserstack/playwright

# Set credentials
export BROWSERSTACK_USERNAME=your_username
export BROWSERSTACK_ACCESS_KEY=your_key

# Run
BROWSERSTACK_USERNAME=$BROWSERSTACK_USERNAME \
BROWSERSTACK_ACCESS_KEY=$BROWSERSTACK_ACCESS_KEY \
npx playwright test --config=browserstack.playwright.config.ts
```

**Why BrowserStack?** Playwright's built-in WebKit is a good approximation of Safari, but it is
not the same as Safari on real macOS hardware. BrowserStack runs your tests on actual cloud-hosted
machines and devices, catching Safari-specific CSS bugs and touch behavior differences that
WebKit emulation might miss.

---

## 17. Troubleshooting Table

| Error / Symptom | Likely Cause | Fix |
|---|---|---|
| `browserType.launch: Executable doesn't exist` | Browsers not downloaded | `npx playwright install` |
| `Cannot find module '../../src/fixtures/fixtures'` | Wrong relative import path | Count `../` levels from test file to `src/fixtures/` |
| `Error: Process exited with code 1` (no other info) | TypeScript compile error | Run `npm run typecheck` to see the TS error |
| `expect(received).toBe(expected)` — value is `undefined` | Accessing wrong JSON key | `console.log(await response.json())` to inspect actual shape |
| Test passes locally, fails in CI | Environment variables not set in CI | Add credentials to Jenkins environment / GitHub secrets |
| `Timeout 30000ms exceeded` on `goto()` | Page is slow / wrong URL | Increase `navigationTimeout` or check `BASE_URL` in `.env` |
| `Timeout 30000ms exceeded` on `locator().click()` | Element not visible / wrong locator | Use `--debug` flag, then use "Pick locator" in Playwright Inspector |
| `Page closed` error | Test is `async` but missing `await` | Check every `async` call has a matching `await` |
| `Cannot read property 'x' of null` | `page.viewportSize()` returns null | Set a viewport in `playwright.config.ts` `use:` block |
| All API tests fail | Wrong `API_BASE_URL` in .env | Check `config/qa.env` — should be `https://reqres.in/api` |
| `net::ERR_NAME_NOT_RESOLVED` | No network / wrong host | Check you're not on VPN that blocks external, check URL |
| Tests flaky on CI but stable locally | CI has fewer CPUs / slower network | Reduce `workers`, add `retries: 2`, increase timeouts for CI |
| `error TS2307: Cannot find module` | Missing `@types/node` or wrong tsconfig | `npm install --save-dev @types/node`, check `tsconfig.json` |

---

## 18. Best Practices Checklist

Use this before merging any test code:

**Page Objects**
- [ ] All locators are `private readonly` — tests never access locators directly
- [ ] Navigation methods return the destination page object (`Promise<HomePage>`)
- [ ] No assertions in page objects — only in test files
- [ ] Use `getByRole` / `getByTestId` over raw CSS selectors where possible

**Fixtures**
- [ ] Every resource that needs setup/teardown is a fixture, not inline test code
- [ ] If multiple tests share setup (e.g., login), use `authenticatedPage` fixture
- [ ] Fixtures that depend on each other are declared in the correct order in `WebFixtures` interface

**Tests**
- [ ] Each `test()` is independent — order does not matter
- [ ] No `test.only()` or `test.skip()` left in merged code (`forbidOnly: true` catches this in CI)
- [ ] Test ID in the test title (e.g., `TC-WEB-001`) for traceability
- [ ] Use `test.describe()` to group related tests
- [ ] `expect()` assertions are specific — avoid `toBeTruthy()` when `toBe('exact value')` is possible

**Config & Environment**
- [ ] No hardcoded credentials in any `.ts` file
- [ ] New config keys added to all three `.env` files (`dev`, `qa`, `staging`)
- [ ] `.env` files with real credentials never committed to Git (`.gitignore` covers `config/*.env`)

**TypeScript**
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] All API response shapes have matching `interface` definitions in `src/api/types.ts`

**CI/CD**
- [ ] Tests pass with `CI=true npx playwright test` (respects retry + worker settings)
- [ ] Reports are published as Jenkins artifacts

---

## 19. Java vs Playwright — Side-by-Side Comparison

This section is for those running both frameworks and wanting to understand the tradeoffs.

| Concern | Java / Selenium / TestNG | Playwright / TypeScript |
|---|---|---|
| **Language** | Java 11 | TypeScript 5 |
| **Test Runner** | TestNG 7.9 | `@playwright/test` 1.44 |
| **Browser driver** | WebDriverManager (auto-download) | `npx playwright install` |
| **Parallel isolation** | `ThreadLocal<WebDriver>` | Worker processes (OS-level) |
| **Auto-waiting** | `WebDriverWait` + `ExpectedConditions` | Built-in, every action |
| **API testing** | RestAssured 5.4 | Built-in `request` fixture |
| **Dependency injection** | Manual via `@BeforeMethod` in BaseTest | `test.extend()` fixtures |
| **Config management** | `.properties` files + `ConfigManager` singleton | `.env` files + `config.ts` |
| **Reporting** | ExtentReports (HTML with screenshots) | Built-in HTML + trace viewer |
| **Mobile** | Appium (native app) | Device emulation (mobile web) |
| **IDE support** | IntelliJ (excellent for Java) | VS Code / IntelliJ (excellent with TS) |
| **CI setup** | Maven `-P` profiles | `ENV=` env variable + npm scripts |
| **Learning curve** | Higher (Maven + TestNG config) | Lower (single config file) |
| **Debugging** | Remote debug port + breakpoints | Playwright Inspector (`--debug`) |
| **Video/Trace** | ExtentReports screenshots only | Built-in video + trace ZIP |
| **Suitable for** | Enterprise teams, native mobile, legacy | Modern web apps, API-heavy, fast setup |

### Which Should You Choose?

**Choose Java/Selenium when:**
- Your project includes native Android / iOS apps (Appium uses the same WebDriver protocol)
- Your organisation is a Java shop with existing Selenium infrastructure
- You need Cucumber/JVM for BDD with living documentation tools
- The team is larger and needs strong compile-time guarantees of Java

**Choose Playwright when:**
- You're testing a web application (SPA, PWA, or traditional)
- You want the fastest time-to-first-test (one `npm install`, one `npx playwright install`)
- Your API layer is the primary testing target
- You want built-in trace/video debugging without extra setup
- The team is small/medium and speed of writing tests matters more than framework depth

---

*Guide version: 1.0 — created alongside qa-playwright-e2e v1.0.0*
*Companion: `qa-automation-framework/GUIDE.md` — Java/Selenium/TestNG equivalent*
