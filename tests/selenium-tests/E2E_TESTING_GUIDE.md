# Smart Learn — Live E2E Functional Testing & Deployment Guide

This guide details the integration of automated GitHub Pages deployment and live Selenium WebDriver testing for the Smart Learn frontend.

---

## 1. Directory & Folder Structure

The testing suite and reporting system are organized in the following directory layout:

```text
Smart Learn/
│
├── .github/
│   └── workflows/
│       ├── security-review.yml       # Phase 1-6 Security workflow
│       └── deploy-and-test.yml       # Phase 7 Deployment & Live E2E Testing
│
├── selenium-tests/
│   ├── package.json                  # NPM packages for Selenium runner
│   ├── generate_excel.py             # Base Excel styling and master metadata
│   ├── generate_final_reports.py     # Parses JSON results & updates Excel + Markdown
│   ├── E2E_TESTING_GUIDE.md          # This instruction document
│   └── tests/
│       └── login.test.js             # 305 test cases (functional, validation, security)
│
└── Test Results/                     # Auto-generated on test run
    ├── Excel/
    │   └── Automation_Test_Report.xlsx
    ├── HTML/
    │   └── execution-report.html     # Mochawesome HTML runner report
    ├── Screenshots/                  # Captured automatically on failure
    ├── Logs/                         # Console & execution output logs
    └── Summary/
        └── summary.md                # Markdown run metrics (for GHA step summary)
```

---

## 2. Page Object Model (POM) Design

The framework employs a clean Page Object design located in `selenium-tests/tests/login.test.js`:

1. **Selectors Dictionary (`SEL`)**: Centralizes element locators by DOM identifier:
   ```javascript
   const SEL = {
     AUTH_MODAL             : By.id('auth-modal'),
     LOGIN_EMAIL            : By.id('login-email'),
     LOGIN_PASSWORD         : By.id('login-password'),
     LOGIN_SUBMIT           : By.css('#auth-login-form button[type="submit"]'),
     // ...
   };
   ```
2. **Page Interactions / Helper Methods**: Wraps WebDriver interactions with explicit waits:
   - `waitFor(driver, locator, timeout)`: Waits for element visibility.
   - `click(driver, locator)`: Clicks elements safely.
   - `typeInto(driver, locator, text)`: Safely types text into input fields.
   - `doLogin(driver, email, password)`: Orchestrates the auth sequence.
   - `doRegister(driver, name, email, password)`: Orchestrates the register sequence.

---

## 3. GitHub Pages Deployment Configuration

To allow automated deployment, the application is set up in `.github/workflows/deploy-and-test.yml` using GitHub's native Pages actions:

- **Permissions Required**:
  ```yaml
  permissions:
    contents: read
    pages: write
    id-token: write
  ```
- **Deployment Action**:
  Uses `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4` to publish the static client directly without requiring external keys or dedicated branches.

---

## 4. Live Verification & Base URL Config

The tests run directly against the live deployed instance. 
- **Verifying Deployment**: The CI pipeline includes a verification step that polls the target domain until an HTTP `200` status is received.
- **Configurability**: The test script reads `BASE_URL` from the environment variable:
  ```javascript
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  ```
  In GitHub Actions, the URL is set dynamically to:
  `https://<github-username>.github.io/<repository-name>/`

---

## 5. Local Execution Guide

To execute the test suite and compile reports locally on your machine:

### Prerequisites
- Node.js (v16+)
- Python 3 (with `pip`)
- Google Chrome browser installed

### Setup & Installation
1. Navigate to the tests directory:
   ```bash
   cd selenium-tests
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Install python dependencies:
   ```bash
   pip install openpyxl
   ```

### Running Tests
- **Graphical Mode (Local)**:
  ```bash
  BASE_URL="http://localhost:8080" npm test
  ```
- **Headless Mode**:
  ```bash
  BASE_URL="http://localhost:8080" HEADLESS=true npm run test:headless
  ```

### Compiling Excel & HTML Reports
After tests complete, run the report generator:
```bash
python generate_final_reports.py
```
This generates the unified dashboard under the `Test Results/` folder.

---

## 6. CI/CD Pipeline Execution Guide

Every code commit triggers the `.github/workflows/deploy-and-test.yml` workflow:

1. **Deploy Job**:
   - Checks out the frontend.
   - Archives the static files.
   - Deploys the application directly to GitHub Pages.
2. **Test Job**:
   - Loops and waits until the target GitHub Pages URL is live (returns HTTP `200`).
   - Launches Chrome in headless mode inside the runner container.
   - Runs all Mocha/Selenium tests.
   - If a test fails, Chrome takes a PNG screenshot and saves it to the `Screenshots/` folder.
   - Runs `generate_final_reports.py` to compile the dark-themed Excel workbook.
   - Uploads all testing resources (Excel, HTML, Screenshots, Logs, Summary) as artifacts.
   - Appends the markdown summary output to the GitHub Actions Job Summary.
