# Smart Learn — Android Appium E2E Functional Testing & Deployment Guide

This guide details the integration of automated Android app building, emulator setup, live Appium E2E testing, and HTML/Excel report hosting on GitHub Pages.

---

## 1. Directory & Folder Structure

The testing suite and reporting system are organized in the following layout:

```text
Smart Learn/
│
├── .github/
│   └── workflows/
│       ├── security-review.yml       # Phase 1-6 Security workflow
│       ├── deploy-and-test.yml       # Phase 7 Frontend Selenium workflow
│       └── android-e2e.yml           # Appium Mobile E2E workflow & Pages hosting
│
├── appium-tests/
│   ├── package.json                  # NPM packages for WebdriverIO/Appium
│   ├── wdio.conf.js                  # WebdriverIO capabilities, services, hooks
│   ├── generate_excel.py             # Parses JSON lookup outcomes & updates Excel report
│   ├── README.md                     # Framework overview
│   ├── APPIUM_E2E_GUIDE.md           # This document
│   │
│   ├── utils/
│   │   ├── helpers.js                # Page Object Model selectors and interaction helpers
│   │   └── generateReport.js         # Compiles runs, outputs HTML dashboard and runs Excel update
│   │
│   └── tests/
│       ├── auth.spec.js              # Authentication specs (TC001–TC040)
│       ├── navigation.spec.js        # Navigation specs (TC041–TC075)
│       ├── home.spec.js              # Dashboard specs (TC076–TC115)
│       ├── courses.spec.js           # Course progress & viewer specs (TC116–TC165)
│       ├── tutor.spec.js             # AI tutor dialogue specs (TC166–TC200)
│       ├── progress.spec.js          # Learning graphs & weights specs (TC201–TC235)
│       ├── profile_settings.spec.js  # Avatar, settings, resetting logs (TC236–TC305)
│       └── ...
```

---

## 2. Page Object Model (POM) Design

Selectors and UI actions are separated into `appium-tests/utils/helpers.js`:

1. **Selectors Map (`SELECTORS`)**: Uses XPath to locate elements inside the Android WebView container:
   ```javascript
   const SELECTORS = {
     AUTH_MODAL:   '//android.webkit.WebView//div[@id="auth-modal"]',
     LOGIN_EMAIL:  '//android.webkit.WebView//input[@id="login-email"]',
     // ...
   };
   ```
2. **Page Interaction Methods**:
   - `waitForElement(selector, timeout)`: Explicit wait for rendering.
   - `tapElement(selector, timeout)`: Safely taps elements on mobile touch layouts.
   - `typeText(selector, text, timeout)`: Clears and writes values.
   - `login(email, password)`: Complete login sequence.
   - `register(name, email, password)`: Complete registration sequence.
   - `navigateTo(view)`: Switches view tabs.

---

## 3. Local Execution Guide

To execute Appium E2E tests locally on your machine:

### Prerequisites
- Java (JDK 17)
- Android SDK & SDK Platform-tools (with `adb` in your PATH)
- Node.js (v18+)
- Python 3 (with `openpyxl` installed)
- An active Android emulator running or a physical device connected via USB with **USB Debugging enabled**

### Setup & Installation
1. Install mobile assets locally:
   ```bash
   npm run build-mobile
   ```
2. Synchronize Capacitor files with Android framework:
   ```bash
   npx cap sync android
   ```
3. Open `android/` directory in Android Studio or run:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   This builds `android/app/build/outputs/apk/debug/app-debug.apk`.
4. Open the `appium-tests` directory and install dependencies:
   ```bash
   cd ../appium-tests
   npm install
   pip install openpyxl
   ```

### Running Tests
Make sure an emulator or device is running, then execute:
```bash
npm test
```
To update the Excel and HTML dashboards after execution, run:
```bash
npm run report
```
The reports are generated under the `appium-tests/Test Results/` folder.

---

## 4. CI/CD Pipeline & GitHub Pages Publishing Guide

Every code commit triggers the `.github/workflows/android-e2e.yml` workflow:

1. **Build Step**: Sets up Java/Gradle, compiles the static site, runs the Capacitor bridge, and builds the Android `.apk`.
2. **Emulator Execution**:
   - Spawns a hardware-accelerated Android Emulator (API level 30) using macOS runner instances.
   - Launches Appium server inside the runner environment.
   - Installs the compiled `.apk` to the emulator via ADB.
   - Executes Jasmine spec files. On any failure, takes visual screenshots and saves them to `Test Results/Screenshots/`.
3. **Report Compilation**: Evaluates output files, updates the Excel report sheet (`Automation_Test_Report.xlsx`), generates the interactive HTML dashboard (`execution-report.html`), and formats the summary.
4. **Deploying Reports to GitHub Pages**:
   Pushes the generated reports directory to the `gh-pages` branch. The reports are laid out as:
   - **Latest Report**: `https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`
   - **Execution History**: `https://<github-username>.github.io/<repository-name>/reports/history/build-<build-num>/execution-report.html`
   - **Screenshots and Logs**: Embedded directly.
5. **GHA Summary**: Outputs metrics and the live deployment links to the workflow run overview page.
