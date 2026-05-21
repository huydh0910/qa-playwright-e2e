# QA Playwright E2E Framework

A TypeScript-first E2E automation framework built with **Playwright** — covering Web UI, REST API, and Mobile browser emulation. Built as a direct comparison to the [qa-automation-framework](https://github.com/huydh0910/qa-automation-framework) (Java/Selenium/TestNG/RestAssured).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Framework Comparison](#framework-comparison)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Setup](#setup)
6. [Configuration](#configuration)
7. [Running Tests](#running-tests)
8. [Test Suites](#test-suites)
9. [Reports](#reports)
10. [CI/CD — Jenkins](#cicd--jenkins)
11. [BrowserStack Integration](#browserstack-integration)
12. [Mobile Testing Note](#mobile-testing-note)
13. [Coverage](#coverage)

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Language | TypeScript 5 |
| Runtime | Node.js 18+ |
| Test Framework | Playwright 1.44 |
| API Testing | Playwright `request` fixture (built-in) |
| Mobile Emulation | Playwright device emulation |
| Reporting | Playwright HTML + JUnit + JSON (built-in) |
| Config | dotenv |
| CI/CD | Jenkins (declarative pipeline) |
| Cloud Execution | BrowserStack |

---

## Framework Comparison

| Aspect | Java / Selenium | Playwright (this repo) |
|--------|----------------|----------------------|
| Language | Java 11 | TypeScript 5 |
| Browser control | Selenium WebDriver | Playwright CDP |
| Waiting strategy | Explicit `WebDriverWait` | Auto-waiting built-in |
| Driver management | `ThreadLocal<WebDriver>` | Per-worker isolation (automatic) |
| API testing | RestAssured (separate lib) | `request` fixture (built-in) |
| Test lifecycle | TestNG `@Before/@After` + inheritance | `test.extend()` fixtures |
| Token management | `TokenManager` (ThreadLocal) | `apiToken` fixture (per-test scope) |
| Parallel execution | TestNG XML + ThreadLocal | `fullyParallel: true` + workers |
| Mobile native | Appium (separate server) | Browser emulation only |
| Reporting | ExtentReports (third-party) | Built-in HTML/JSON/JUnit |
| Setup overhead | High (JDK, Maven, drivers) | Low (`npm install`) |

---

## Project Structure

```
qa-playwright-e2e/
├── playwright.config.ts          # All projects, reporters, timeouts
├── package.json
├── tsconfig.json
├── Jenkinsfile
├── browserstack.yml
├── .env.example
│
├── config/
│   ├── dev.env
│   ├── qa.env
│   └── staging.env
│
├── src/
│   ├── pages/
│   │   ├── BasePage.ts           # Shared helpers (navigate, isVisible, etc.)
│   │   └── web/
│   │       ├── LoginPage.ts
│   │       ├── HomePage.ts
│   │       ├── ChallengePage.ts
│   │       └── MyChallengesPage.ts
│   ├── api/
│   │   ├── ApiClient.ts          # Base class with header builder
│   │   ├── AuthApi.ts            # POST /login
│   │   ├── UserApi.ts            # GET/PUT/PATCH /users/{id}
│   │   └── types.ts              # Request / response interfaces
│   ├── fixtures/
│   │   └── fixtures.ts           # Custom test.extend() — page objects + apiToken
│   └── utils/
│       ├── config.ts             # Env-aware config (dotenv)
│       └── testData.ts           # Unique name/email generators
│
└── tests/
    ├── web/
    │   ├── login.spec.ts
    │   └── challenge.e2e.spec.ts
    ├── api/
    │   ├── login.api.spec.ts
    │   ├── getUser.api.spec.ts
    │   ├── updateUser.api.spec.ts
    │   └── api.e2e.spec.ts
    └── mobile/
        └── mobile.e2e.spec.ts
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Playwright browsers | Auto-installed | `npx playwright install` |

---

## Setup

### 1. Clone

```bash
git clone https://github.com/huydh0910/qa-playwright-e2e.git
cd qa-playwright-e2e
```

### 2. Install dependencies

```bash
npm install
npx playwright install --with-deps chromium firefox webkit
```

### 3. Configure credentials

Copy the example and fill in your values:

```bash
cp .env.example config/qa.env
```

```env
WEB_USERNAME=your_ctflearn_email@example.com
WEB_PASSWORD=YourCTFPassword
API_EMAIL=eve.holt@reqres.in
API_PASSWORD=cityslicka
```

> **Security:** Never commit real credentials. Use environment variables in CI.

---

## Configuration

The active environment is set with the `ENV` variable (`dev` / `qa` / `staging`).  
`playwright.config.ts` loads `config/${ENV}.env` before any test runs.

| Variable | Default | Description |
|----------|---------|-------------|
| `ENV` | `qa` | Env file to load |
| `BASE_URL` | `https://ctflearn.com` | Web base URL |
| `API_BASE_URL` | `https://reqres.in/api` | API base URL |
| `WEB_USERNAME` | — | CTFLearner login |
| `WEB_PASSWORD` | — | CTFLearner password |
| `API_EMAIL` | `eve.holt@reqres.in` | Reqres API email |
| `API_PASSWORD` | `cityslicka` | Reqres API password |

---

## Running Tests

```bash
# All tests (all projects)
npm test

# Web UI tests only (Chromium)
npm run test:web

# API tests only
npm run test:api

# Mobile emulation tests
npm run test:mobile

# E2E flows only
npm run test:e2e

# Web tests across all browsers (Chrome + Firefox + Safari)
npm run test:all-browsers

# Headed mode (watch the browser)
npm run test:headed

# Debug mode (step through)
npm run test:debug

# Change environment
ENV=staging npm run test:api
ENV=dev     npm test

# Open last HTML report
npm run report
```

### Run a single file

```bash
npx playwright test tests/api/login.api.spec.ts
```

---

## Test Suites

| Script | Project(s) | Files |
|--------|-----------|-------|
| `test:web` | chromium | `tests/web/**` |
| `test:api` | api (no browser) | `tests/api/**` |
| `test:mobile` | mobile-chrome, mobile-safari | `tests/mobile/**` |
| `test:e2e` | chromium | E2E spec files from all layers |
| `test:all-browsers` | chromium, firefox, webkit | `tests/web/**` |

---

## Reports

Playwright generates three report formats after every run:

```
reports/html/index.html   ← Interactive HTML (open in browser)
reports/results.json      ← Machine-readable full results
reports/junit.xml         ← Jenkins JUnit plugin compatible
test-results/             ← Screenshots + videos on failure
```

Open the HTML report:

```bash
npm run report
# or
npx playwright show-report reports/html
```

---

## CI/CD — Jenkins

The `Jenkinsfile` defines a parameterised declarative pipeline:

| Parameter | Options | Default |
|-----------|---------|---------|
| `ENV` | `qa` / `dev` / `staging` | `qa` |
| `SUITE` | `all` / `web` / `api` / `mobile` / `e2e` | `all` |

### Pipeline stages

1. **Install** — `npm ci` + `playwright install --with-deps`
2. **Lint & Type-check** — `tsc --noEmit`
3. **Run Tests** — selected suite with `ENV` injected
4. **Publish Report** — HTML report attached as Jenkins build artifact

### Setup in Jenkins

1. Create a **Pipeline** job → **Pipeline script from SCM**
2. Add BrowserStack credentials as Jenkins secrets:
   - `browserstack-username`
   - `browserstack-access-key`

---

## BrowserStack Integration

`browserstack.yml` configures cloud execution across Chrome, Firefox, Safari, and Edge.

```bash
# Install BrowserStack SDK
npm install --save-dev browserstack-node-sdk

# Run on BrowserStack
BROWSERSTACK_USERNAME=your_user \
BROWSERSTACK_ACCESS_KEY=your_key \
npx browserstack-node-sdk playwright test
```

---

## Mobile Testing Note

Playwright does **not** support native iOS/Android app automation.

| Capability | This repo (Playwright) | Java repo (Appium) |
|------------|----------------------|-------------------|
| Mobile browser emulation | ✅ Pixel 5, iPhone 12 viewport | ❌ |
| Native Android app (.apk) | ❌ | ✅ UiAutomator2 |
| Native iOS app (.ipa) | ❌ | ✅ XCUITest |
| Real device cloud | ✅ BrowserStack browser | ✅ BrowserStack device |

For native mobile app testing, refer to the companion project:  
**[qa-automation-framework](https://github.com/huydh0910/qa-automation-framework)** → `tests/mobile/`

---

## Coverage

| Test ID | Description | Layer | Type |
|---------|-------------|-------|------|
| TC-PW-WEB-001 | Valid credentials login | Web | Positive |
| TC-PW-WEB-002 | Wrong password shows error | Web | Negative |
| TC-PW-WEB-003 | Empty fields show validation | Web | Negative |
| E2E-PW-WEB-001 | Create challenge → verify in My Challenges → logout | Web | E2E |
| E2E-PW-WEB-002 | Submit form without title shows error | Web | Negative |
| API-PW-LOGIN-001 | Valid login returns token | API | Positive |
| API-PW-LOGIN-002 | Token is a non-empty string | API | Positive |
| API-PW-LOGIN-003 | Missing password returns 400 | API | Negative |
| API-PW-LOGIN-004 | Missing email returns 400 | API | Negative |
| API-PW-LOGIN-005 | Unregistered email returns 400 | API | Negative |
| API-PW-GET-001 | GET existing user returns 200 + data | API | Positive |
| API-PW-GET-002 | Response maps to expected shape | API | Positive |
| API-PW-GET-003 | GET user id=1 returns 200 | API | Positive |
| API-PW-GET-004 | GET non-existent user returns 404 | API | Negative |
| API-PW-GET-005 | GET user id=0 returns 4xx | API | Negative |
| API-PW-PUT-001 | PUT returns 200 with updated fields | API | Positive |
| API-PW-PUT-002 | PUT response maps to model shape | API | Positive |
| API-PW-PATCH-003 | PATCH partial update returns 200 | API | Positive |
| API-PW-PUT-004 | PUT empty body no server error | API | Negative |
| API-PW-PUT-005 | PUT non-existent user documented | API | Negative |
| E2E-PW-API-001 | Login → Get User → Update User | API | E2E |
| E2E-PW-MOB-001 | Login on mobile viewport succeeds | Mobile | Positive |
| E2E-PW-MOB-002 | Wrong password on mobile shows error | Mobile | Negative |
| E2E-PW-MOB-003 | Empty credentials on mobile shows error | Mobile | Negative |
| E2E-PW-MOB-004 | Login → navigate → logout on mobile | Mobile | E2E |
| E2E-PW-MOB-005 | Viewport matches configured device dimensions | Mobile | UI |

**Total: 26 test cases** — Web UI, REST API, Mobile (browser emulation).
