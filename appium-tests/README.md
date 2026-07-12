# Smart Learn — Appium E2E Test Suite

## Overview

This folder contains the complete **End-to-End (E2E) Appium test suite** for the **Smart Learn Companion** Android mobile application.

- **Framework**: WebdriverIO v8 + Appium 2 + UiAutomator2
- **App Package**: `com.smartlearn.companion`
- **Total Test Cases**: 305
- **Coverage**: Auth, Navigation, Home, Courses, AI Tutor, Progress, Profile, Settings

---

## Folder Structure

```
appium-tests/
├── wdio.conf.js               # WebdriverIO + Appium configuration
├── package.json               # Dependencies
├── generate_excel.py          # Python script to generate Excel test report
├── SmartLearn_TestReport.xlsx # Generated test report (305 test cases)
├── tests/
│   ├── auth.spec.js           # TC001–TC040  (Authentication)
│   ├── navigation.spec.js     # TC041–TC075  (Navigation)
│   ├── home.spec.js           # TC076–TC115  (Home Dashboard)
│   ├── courses.spec.js        # TC116–TC180  (Courses Catalog & Viewer)
│   ├── tutor.spec.js          # TC181–TC230  (AI Tutor Chatbot)
│   ├── progress.spec.js       # TC231–TC255  (Progress Analytics)
│   └── profile_settings.spec.js # TC256–TC305 (Profile + Settings)
├── utils/
│   └── helpers.js             # Shared selectors & helper functions
└── logs/                      # Appium server logs (auto-created)
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Run WebdriverIO |
| Python | ≥ 3.8 | Generate Excel report |
| ADB | Latest | USB device communication |
| Java JDK | ≥ 11 | Required by Appium |
| Appium | 2.x | Installed globally or via npm |

---

## Setup

### 1. Install Node dependencies
```bash
cd appium-tests
npm install
```

### 2. Install Appium globally (if not already installed)
```bash
npm install -g appium
appium driver install uiautomator2
```

### 3. Connect your Android device via USB
- Enable **Developer Options** on your device
- Enable **USB Debugging**
- Run `adb devices` — your device should appear

### 4. Update device info in `wdio.conf.js`
```js
'appium:deviceName': 'YOUR_DEVICE_NAME',
'appium:udid':       'YOUR_DEVICE_UDID',
```
Find UDID with: `adb devices -l`

### 5. Set up ADB reverse proxy (for backend connection)
```bash
adb reverse tcp:8080 tcp:8080
```

---

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific module
```bash
npm run test:auth
npm run test:home
npm run test:courses
npm run test:tutor
npm run test:progress
npm run test:profile
npm run test:settings
npm run test:navigation
```

---

## Generate Excel Report

```bash
python generate_excel.py
```

This produces **`SmartLearn_TestReport.xlsx`** with 3 sheets:
- **📊 Summary** — Module-wise pass/fail count + priority breakdown
- **🧪 Test Cases** — All 305 test cases with status, type, priority
- **📉 Analytics** — Pass rate per module + bar chart

---

## Test Case Distribution

| Module | Test Cases | Range |
|--------|-----------|-------|
| Authentication | 40 | TC001–TC040 |
| Navigation | 35 | TC041–TC075 |
| Home Dashboard | 40 | TC076–TC115 |
| Courses | 65 | TC116–TC180 |
| AI Tutor | 50 | TC181–TC230 |
| Progress | 25 | TC231–TC255 |
| Profile | 20 | TC256–TC275 |
| Settings | 30 | TC276–TC305 |
| **Total** | **305** | |

---

## Test Types Covered

- **Functional** — Core feature behavior
- **UI** — Visual rendering and layout
- **Validation** — Form validation and error handling
- **Negative** — Invalid inputs and edge cases
- **Security** — XSS, SQL injection prevention
- **Responsive** — Mobile layout and breakpoints
- **Performance** — Load time thresholds
- **State** — Data persistence across sessions
- **Gesture** — Swipe, scroll interactions
- **Stability** — Crash resistance under stress

---

## Notes

- All selectors use `//android.webkit.WebView//` prefix because the app is a Capacitor WebView app
- The `helpers.js` utility provides shared `SELECTORS`, `login()`, `navigateTo()`, and other reusable functions
- Screenshots are automatically captured for failed tests
- Ensure the backend server (`npm run dev`) is running on your PC before running tests
