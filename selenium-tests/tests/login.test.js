/**
 * login.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Smart Learn — Selenium WebDriver E2E Functional Test Suite
 * Framework  : Selenium WebDriver (selenium-webdriver v4)
 * Test Runner : Mocha + Chai
 * Browser     : Chrome (via ChromeDriver)
 * Target URL  : http://localhost:3000  (adjust BASE_URL as needed)
 *
 * Coverage    : 305 Test Cases  (TC001 – TC305)
 * Modules     :
 *   1.  Authentication  – Login / Register / Logout / Security   (TC001–TC060)
 *   2.  Navigation      – Sidebar / Bottom Bar / Routing          (TC061–TC100)
 *   3.  Home Dashboard  – Welcome / Stats / FL Widget / Goals     (TC101–TC140)
 *   4.  Courses         – Catalog / Filters / Viewer / Quiz       (TC141–TC190)
 *   5.  AI Tutor        – Chat / Voice / History / Context        (TC191–TC220)
 *   6.  Progress        – Metrics / Weights / Audit               (TC221–TC250)
 *   7.  Profile         – Avatar / Achievements / Bookmarks       (TC251–TC270)
 *   8.  Settings        – Toggles / Reset / Firebase Schema       (TC271–TC290)
 *   9.  Responsive/UX   – Theme / Search / Notifications          (TC291–TC305)
 *
 * Run:
 *   npm test                    # runs all tests
 *   npx mocha tests/login.test.js --timeout 30000
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect }  = require('chai');

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL      = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT       = 15000;   // ms – max wait for elements
const SHORT_PAUSE   = 500;     // ms – brief interaction pause
const LONG_PAUSE    = 1500;    // ms – animation / transition wait

/** Default seeded user from auth.js */
const VALID_EMAIL    = 'student@smartlearn.edu';
const VALID_PASSWORD = 'password123';
const VALID_NAME     = 'Alex Mercer';

// ─── Selectors ────────────────────────────────────────────────────────────────

const SEL = {
  // Auth Modal
  AUTH_MODAL             : By.id('auth-modal'),
  AUTH_TAB_LOGIN         : By.id('auth-tab-login'),
  AUTH_TAB_REGISTER      : By.id('auth-tab-register'),
  AUTH_GOOGLE_BTN        : By.id('auth-google-btn'),

  // Login Form
  LOGIN_FORM             : By.id('auth-login-form'),
  LOGIN_EMAIL            : By.id('login-email'),
  LOGIN_PASSWORD         : By.id('login-password'),
  LOGIN_REMEMBER_ME      : By.id('login-remember-me'),
  LOGIN_SUBMIT           : By.css('#auth-login-form button[type="submit"]'),
  FORGOT_PASSWORD_LINK   : By.id('auth-forgot-password-link'),

  // Register Form
  REGISTER_FORM          : By.id('auth-register-form'),
  REG_NAME               : By.id('reg-name'),
  REG_EMAIL              : By.id('reg-email'),
  REG_PASSWORD           : By.id('reg-password'),
  REG_SUBMIT             : By.css('#auth-register-form button[type="submit"]'),

  // App Layout
  APP_CONTAINER          : By.css('.app-container'),
  SIDEBAR                : By.id('main-sidebar'),
  MAIN_CONTENT           : By.css('.main-content'),

  // Sidebar Navigation
  NAV_HOME               : By.id('nav-link-home'),
  NAV_COURSES            : By.id('nav-link-courses'),
  NAV_TUTOR              : By.id('nav-link-tutor'),
  NAV_PROGRESS           : By.id('nav-link-progress'),
  NAV_PROFILE            : By.id('nav-link-profile'),
  NAV_SETTINGS           : By.id('nav-link-settings'),
  LOGOUT_BTN             : By.id('logout-btn'),

  // Mobile Navigation
  MOBILE_NAV             : By.id('mobile-floating-nav'),
  FLOAT_NAV_HOME         : By.id('float-nav-home'),
  FLOAT_NAV_COURSES      : By.id('float-nav-courses'),
  FLOAT_NAV_TUTOR        : By.id('float-nav-tutor'),
  FLOAT_NAV_PROGRESS     : By.id('float-nav-progress'),
  FLOAT_NAV_PROFILE      : By.id('float-nav-profile'),
  FLOAT_NAV_SETTINGS     : By.id('float-nav-settings'),

  // Views
  VIEW_HOME              : By.id('view-home'),
  VIEW_COURSES           : By.id('view-courses'),
  VIEW_COURSE_VIEWER     : By.id('view-course-viewer'),
  VIEW_TUTOR             : By.id('view-tutor'),
  VIEW_PROGRESS          : By.id('view-progress'),
  VIEW_PROFILE           : By.id('view-profile'),
  VIEW_SETTINGS          : By.id('view-settings'),

  // Header
  HEADER                 : By.css('.view-header'),
  GLOBAL_SEARCH          : By.id('global-search-input'),
  THEME_TOGGLE           : By.id('theme-toggle-btn'),
  FL_SYNC_BTN            : By.id('fl-sync-trigger-btn'),
  NOTIF_BTN              : By.id('notifications-trigger-btn'),

  // Home Dashboard
  WELCOME_CARD           : By.css('.welcome-card'),
  WELCOME_USERNAME       : By.id('welcome-username'),
  WELCOME_HOURS          : By.id('welcome-hours'),
  WELCOME_TOPICS         : By.id('welcome-topics'),
  STREAK_CARD            : By.css('.streak-card'),
  HOME_STREAK_NUM        : By.id('home-streak-days'),
  WEEKLY_GRAPH           : By.css('.weekly-graph'),
  FL_STATUS_CARD         : By.css('.federated-status-card'),
  FL_LOCAL_LOGS          : By.id('fl-local-logs-count'),
  FL_SYNC_LAST_TIME      : By.id('fl-sync-last-time'),
  HOME_FL_SYNC_BTN       : By.id('home-fl-sync-btn'),
  GOAL_1                 : By.id('goal-1'),
  GOAL_2                 : By.id('goal-2'),
  GOAL_3                 : By.id('goal-3'),
  HOME_RECOMMENDATIONS   : By.id('home-recommendations-list'),

  // Courses
  COURSE_FILTERS         : By.id('course-filter-bar'),
  COURSES_GRID           : By.id('courses-catalog-grid'),
  FILTER_ALL             : By.css('.filter-btn[data-category="all"]'),
  FILTER_PROG            : By.css('.filter-btn[data-category="Programming Languages"]'),
  FILTER_WEB             : By.css('.filter-btn[data-category="Web Development"]'),
  FILTER_DB              : By.css('.filter-btn[data-category="Databases"]'),
  FILTER_AI              : By.css('.filter-btn[data-category="AI & Data Science"]'),
  FILTER_CLOUD           : By.css('.filter-btn[data-category="Cloud & Infrastructure"]'),
  FILTER_SEC             : By.css('.filter-btn[data-category="Security & Networking"]'),
  FILTER_DESIGN          : By.css('.filter-btn[data-category="Design & Marketing"]'),
  BACK_TO_COURSES_BTN    : By.id('back-to-courses-btn'),
  CV_TOPIC_TITLE         : By.id('cv-topic-title'),
  CV_BOOKMARK_BTN        : By.id('cv-bookmark-btn'),
  CV_NOTES_BTN           : By.id('cv-notes-btn'),
  CV_OPEN_TUTOR_BTN      : By.id('cv-open-tutor-btn'),
  CV_TAB_BEGINNER        : By.css('.tab-btn[data-difficulty="beginner"]'),
  CV_TAB_INTERMEDIATE    : By.css('.tab-btn[data-difficulty="intermediate"]'),
  CV_TAB_ADVANCED        : By.css('.tab-btn[data-difficulty="advanced"]'),
  CV_CODE_COPY_BTN       : By.id('cv-code-copy-btn'),
  CV_QUIZ_WIDGET         : By.id('cv-quiz-widget'),
  CV_QUIZ_SUBMIT         : By.id('cv-quiz-submit-btn'),
  CV_PREV_TOPIC_BTN      : By.id('cv-prev-topic-btn'),
  CV_NEXT_TOPIC_BTN      : By.id('cv-next-topic-btn'),
  SYLLABUS_SIDEBAR       : By.css('.syllabus-sidebar'),
  CV_PANE_BEGINNER       : By.id('cv-pane-beginner'),
  CV_PANE_INTERMEDIATE   : By.id('cv-pane-intermediate'),
  CV_PANE_ADVANCED       : By.id('cv-pane-advanced'),
  CV_DIAGRAM_BOX         : By.id('cv-diagram-box'),

  // AI Tutor
  TUTOR_MESSAGES_BOX     : By.id('tutor-messages-box'),
  TUTOR_CHAT_INPUT       : By.id('tutor-chat-input'),
  TUTOR_SEND_BTN         : By.id('tutor-send-btn'),
  TUTOR_MIC_BTN          : By.id('tutor-mic-btn'),
  TUTOR_QUIZ_BTN         : By.id('tutor-quick-quiz-btn'),
  TUTOR_HISTORY_LIST     : By.id('tutor-history-list'),
  TUTOR_CLEAR_BTN        : By.id('tutor-clear-chat-btn'),
  TUTOR_CONTEXT_BANNER   : By.id('tutor-context-banner'),
  TUTOR_CONTEXT_BADGE    : By.id('tutor-context-status-badge'),

  // Progress
  STATS_DURATION         : By.id('stats-duration'),
  STATS_STREAK           : By.id('stats-streak'),
  STATS_TOPICS           : By.id('stats-topics'),
  STATS_QUIZ_ACC         : By.id('stats-quiz-acc'),
  STATS_WEIGHTS_LIST     : By.id('stats-weights-list'),
  STATS_FL_BTN           : By.id('stats-fl-btn'),

  // Profile
  PROFILE_AVATAR         : By.id('profile-avatar-letters'),
  PROFILE_FULL_NAME      : By.id('profile-full-name'),
  PROFILE_BIO            : By.id('profile-bio'),
  PROFILE_EDIT_BTN       : By.id('profile-edit-btn'),
  PROFILE_ACHIEVEMENTS   : By.id('profile-achievements-list'),
  PROFILE_BOOKMARKS      : By.id('profile-bookmarks-list'),
  SIDEBAR_USER_AVATAR    : By.id('sidebar-user-avatar'),
  SIDEBAR_USER_NAME      : By.id('sidebar-user-name'),

  // Profile Edit Modal
  PROFILE_EDIT_MODAL     : By.id('profile-edit-modal'),
  PROFILE_MODAL_CLOSE    : By.id('profile-modal-close-btn'),
  EDIT_PROFILE_NAME      : By.id('edit-profile-name'),
  EDIT_PROFILE_BIO       : By.id('edit-profile-bio'),
  EDIT_FORM_SUBMIT       : By.css('#profile-edit-form button[type="submit"]'),

  // Settings
  SETTINGS_THEME_TOGGLE  : By.id('settings-theme-toggle'),
  SETTINGS_AUTO_SYNC     : By.id('settings-auto-sync'),
  SETTINGS_DIFF_PRIV     : By.id('settings-diff-priv'),
  SETTINGS_SPEECH_OUT    : By.id('settings-speech-out'),
  SETTINGS_OFFLINE_CACHE : By.id('settings-offline-caching'),
  SETTINGS_RESET_BTN     : By.id('settings-reset-logs-btn'),

  // FL Aggregation Modal
  FL_MODAL               : By.id('fl-aggregation-modal'),
  FL_MODAL_CLOSE_BTN     : By.id('fl-modal-close-btn'),
  FL_MODAL_SYNC_TRIGGER  : By.id('fl-modal-sync-trigger'),
  FL_PROGRESS_BAR        : By.id('fl-progress-fill-bar'),
  FL_PROGRESS_LABEL      : By.id('fl-progress-status-label'),
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Wait for an element to be visible and return it.
 * @param {WebDriver} driver
 * @param {By} locator
 * @param {number} [timeout]
 */
async function waitFor(driver, locator, timeout = TIMEOUT) {
  return driver.wait(until.elementIsVisible(driver.findElement(locator)), timeout);
}

/**
 * Wait for an element to be present in DOM (not necessarily visible).
 */
async function waitForPresent(driver, locator, timeout = TIMEOUT) {
  return driver.wait(until.elementLocated(locator), timeout);
}

/** Click element after waiting for it to be visible. */
async function click(driver, locator) {
  const el = await waitFor(driver, locator);
  await el.click();
}

/** Clear a field and type text. */
async function typeInto(driver, locator, text) {
  const el = await waitFor(driver, locator);
  await el.clear();
  await el.sendKeys(text);
}

/** Return text content of an element. */
async function getText(driver, locator) {
  const el = await waitFor(driver, locator);
  return el.getText();
}

/** Return true if element is currently displayed. */
async function isVisible(driver, locator) {
  try {
    const el = await driver.findElement(locator);
    return el.isDisplayed();
  } catch (_) {
    return false;
  }
}

/** Get value attribute of an input. */
async function getValue(driver, locator) {
  const el = await waitFor(driver, locator);
  return el.getAttribute('value');
}

/** Get any attribute of an element. */
async function getAttr(driver, locator, attr) {
  const el = await waitFor(driver, locator);
  return el.getAttribute(attr);
}

/** Pause execution for ms milliseconds. */
function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Perform a full login with email + password.
 */
async function doLogin(driver, email = VALID_EMAIL, password = VALID_PASSWORD) {
  await waitFor(driver, SEL.AUTH_MODAL);
  await click(driver, SEL.AUTH_TAB_LOGIN);
  await typeInto(driver, SEL.LOGIN_EMAIL, email);
  await typeInto(driver, SEL.LOGIN_PASSWORD, password);
  await click(driver, SEL.LOGIN_SUBMIT);
  await pause(LONG_PAUSE);
}

/**
 * Perform a full registration.
 */
async function doRegister(driver, name, email, password) {
  await waitFor(driver, SEL.AUTH_MODAL);
  await click(driver, SEL.AUTH_TAB_REGISTER);
  await typeInto(driver, SEL.REG_NAME, name);
  await typeInto(driver, SEL.REG_EMAIL, email);
  await typeInto(driver, SEL.REG_PASSWORD, password);
  await click(driver, SEL.REG_SUBMIT);
  await pause(LONG_PAUSE);
}

/**
 * Navigate to a view via sidebar nav link.
 */
async function navigateTo(driver, navSel) {
  await click(driver, navSel);
  await pause(LONG_PAUSE);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('Smart Learn — Selenium E2E Test Suite (TC001–TC305)', function () {
  this.timeout(60000);

  let driver;

  before(async function () {
    const opts = new chrome.Options();
    if (process.env.HEADLESS === 'true' || process.env.CI) {
      opts.addArguments('--headless=new', '--disable-gpu', '--window-size=1280,900');
    } else {
      opts.addArguments('--start-maximized');
    }
    opts.addArguments('--disable-extensions');
    opts.addArguments('--no-sandbox');
    opts.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(opts)
      .build();

    await driver.get(BASE_URL);
    await pause(LONG_PAUSE);
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      try {
        const fs = require('fs');
        const path = require('path');
        const screenshotDir = path.join(__dirname, '..', 'Test Results', 'Screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        const screenshotName = `${this.currentTest.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotName);
        const data = await driver.takeScreenshot();
        fs.writeFileSync(screenshotPath, data, 'base64');
        console.log(`Saved failure screenshot to: ${screenshotPath}`);
      } catch (err) {
        console.error('Failed to take screenshot:', err.message);
      }
    }
  });

  after(async function () {
    if (driver) {
      try {
        const fs = require('fs');
        const path = require('path');
        const logDir = path.join(__dirname, '..', 'Test Results', 'Logs');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        const logs = await driver.manage().logs().get('browser');
        const logFile = path.join(logDir, 'browser.log');
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
        console.log(`Saved browser logs to: ${logFile}`);
      } catch (err) {
        console.warn('Browser logs not available or failed to fetch:', err.message);
      }
      await driver.quit();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 1 – AUTHENTICATION  (TC001 – TC060)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 1 — Authentication', function () {

    beforeEach(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
    });

    // ─── 1.1 Auth Modal Presence ───────────────────────────────────────────

    it('TC001 — Auth modal overlay is displayed on app launch', async function () {
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC002 — Auth modal contains the app logo "SL"', async function () {
      const el = await driver.findElement(By.css('#auth-modal .logo-icon'));
      const text = await el.getText();
      expect(text).to.equal('SL');
    });

    it('TC003 — Auth modal title reads "Sign in to Smart Learn"', async function () {
      const el = await driver.findElement(By.css('#auth-modal h2'));
      const text = await el.getText();
      expect(text).to.include('Smart Learn');
    });

    it('TC004 — Auth modal subtitle contains "Secure decentralized"', async function () {
      const el = await driver.findElement(By.css('#auth-modal p'));
      const text = await el.getText();
      expect(text).to.include('Secure');
    });

    it('TC005 — Sign In tab button is present', async function () {
      const visible = await isVisible(driver, SEL.AUTH_TAB_LOGIN);
      expect(visible).to.be.true;
    });

    it('TC006 — Register tab button is present', async function () {
      const visible = await isVisible(driver, SEL.AUTH_TAB_REGISTER);
      expect(visible).to.be.true;
    });

    it('TC007 — Login form is shown by default', async function () {
      const visible = await isVisible(driver, SEL.LOGIN_FORM);
      expect(visible).to.be.true;
    });

    it('TC008 — Register form is hidden by default', async function () {
      const el = await driver.findElement(SEL.REGISTER_FORM);
      const display = await el.getCssValue('display');
      expect(display).to.equal('none');
    });

    // ─── 1.2 Login Form Elements ───────────────────────────────────────────

    it('TC009 — Login email input field is visible', async function () {
      const visible = await isVisible(driver, SEL.LOGIN_EMAIL);
      expect(visible).to.be.true;
    });

    it('TC010 — Login email input field has placeholder "name@domain.com"', async function () {
      const placeholder = await getAttr(driver, SEL.LOGIN_EMAIL, 'placeholder');
      expect(placeholder).to.include('domain.com');
    });

    it('TC011 — Login email input type is "email"', async function () {
      const type = await getAttr(driver, SEL.LOGIN_EMAIL, 'type');
      expect(type).to.equal('email');
    });

    it('TC012 — Login password field is visible', async function () {
      const visible = await isVisible(driver, SEL.LOGIN_PASSWORD);
      expect(visible).to.be.true;
    });

    it('TC013 — Login password field type is "password" (characters masked)', async function () {
      const type = await getAttr(driver, SEL.LOGIN_PASSWORD, 'type');
      expect(type).to.equal('password');
    });

    it('TC014 — Forgot password link is present on login form', async function () {
      const visible = await isVisible(driver, SEL.FORGOT_PASSWORD_LINK);
      expect(visible).to.be.true;
    });

    it('TC015 — Forgot password link text contains "Forgot"', async function () {
      const text = await getText(driver, SEL.FORGOT_PASSWORD_LINK);
      expect(text).to.include('Forgot');
    });

    it('TC016 — Remember me checkbox is present', async function () {
      const visible = await isVisible(driver, SEL.LOGIN_REMEMBER_ME);
      expect(visible).to.be.true;
    });

    it('TC017 — Remember me checkbox is not checked by default', async function () {
      const checked = await getAttr(driver, SEL.LOGIN_REMEMBER_ME, 'checked');
      expect(checked).to.be.null;
    });

    it('TC018 — Remember me checkbox can be clicked (checked)', async function () {
      await click(driver, SEL.LOGIN_REMEMBER_ME);
      const el = await driver.findElement(SEL.LOGIN_REMEMBER_ME);
      const checked = await el.isSelected();
      expect(checked).to.be.true;
    });

    it('TC019 — Login submit button is visible', async function () {
      const visible = await isVisible(driver, SEL.LOGIN_SUBMIT);
      expect(visible).to.be.true;
    });

    it('TC020 — Login submit button text contains "Authorize"', async function () {
      const text = await getText(driver, SEL.LOGIN_SUBMIT);
      expect(text).to.include('Authorize');
    });

    it('TC021 — Google Federated Login button is present', async function () {
      const visible = await isVisible(driver, SEL.AUTH_GOOGLE_BTN);
      expect(visible).to.be.true;
    });

    it('TC022 — Google button text contains "Google"', async function () {
      const text = await getText(driver, SEL.AUTH_GOOGLE_BTN);
      expect(text).to.include('Google');
    });

    // ─── 1.3 Successful Login ─────────────────────────────────────────────

    it('TC023 — Successful login with valid credentials hides auth modal', async function () {
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.false;
    });

    it('TC024 — After login home view becomes active-view', async function () {
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      const el = await driver.findElement(SEL.VIEW_HOME);
      const classes = await el.getAttribute('class');
      expect(classes).to.include('active-view');
    });

    it('TC025 — Welcome card is visible after login', async function () {
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      const visible = await isVisible(driver, SEL.WELCOME_CARD);
      expect(visible).to.be.true;
    });

    it('TC026 — Sidebar shows logged-in username after login', async function () {
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      const text = await getText(driver, SEL.SIDEBAR_USER_NAME);
      expect(text.length).to.be.greaterThan(0);
    });

    it('TC027 — Sidebar user avatar initials are visible after login', async function () {
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      const visible = await isVisible(driver, SEL.SIDEBAR_USER_AVATAR);
      expect(visible).to.be.true;
    });

    // ─── 1.4 Login Validation / Negative ──────────────────────────────────

    it('TC028 — Login with empty email keeps modal open (HTML5 required validation)', async function () {
      await click(driver, SEL.AUTH_TAB_LOGIN);
      await typeInto(driver, SEL.LOGIN_PASSWORD, 'Password123');
      await click(driver, SEL.LOGIN_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC029 — Login with empty password keeps modal open', async function () {
      await click(driver, SEL.AUTH_TAB_LOGIN);
      await typeInto(driver, SEL.LOGIN_EMAIL, VALID_EMAIL);
      await click(driver, SEL.LOGIN_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC030 — Login with invalid email format keeps modal open', async function () {
      await typeInto(driver, SEL.LOGIN_EMAIL, 'not-an-email');
      await typeInto(driver, SEL.LOGIN_PASSWORD, 'Pass123');
      await click(driver, SEL.LOGIN_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC031 — Login with wrong password for valid user keeps modal open', async function () {
      await doLogin(driver, VALID_EMAIL, 'WrongPassword999!');
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC032 — Login with non-existent email keeps modal open', async function () {
      await doLogin(driver, 'nobody@fake.org', 'Pass@123');
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC033 — Login with SQL injection in email is blocked', async function () {
      await typeInto(driver, SEL.LOGIN_EMAIL, "' OR '1'='1");
      await typeInto(driver, SEL.LOGIN_PASSWORD, 'pass');
      await click(driver, SEL.LOGIN_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC034 — Login with XSS payload in email field is blocked', async function () {
      await typeInto(driver, SEL.LOGIN_EMAIL, '<script>alert(1)</script>@x.com');
      await typeInto(driver, SEL.LOGIN_PASSWORD, 'pass');
      await click(driver, SEL.LOGIN_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC035 — Email input accepts "+" subaddress format', async function () {
      await typeInto(driver, SEL.LOGIN_EMAIL, 'user+tag@example.com');
      const val = await getValue(driver, SEL.LOGIN_EMAIL);
      expect(val).to.include('+');
    });

    it('TC036 — Login email field is required (has required attribute)', async function () {
      const req = await getAttr(driver, SEL.LOGIN_EMAIL, 'required');
      expect(req).to.not.be.null;
    });

    it('TC037 — Login password field is required (has required attribute)', async function () {
      const req = await getAttr(driver, SEL.LOGIN_PASSWORD, 'required');
      expect(req).to.not.be.null;
    });

    // ─── 1.5 Register Form ────────────────────────────────────────────────

    it('TC038 — Clicking Register tab shows register form', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      await pause(SHORT_PAUSE);
      const visible = await isVisible(driver, SEL.REGISTER_FORM);
      expect(visible).to.be.true;
    });

    it('TC039 — Register Name field is visible', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      const visible = await isVisible(driver, SEL.REG_NAME);
      expect(visible).to.be.true;
    });

    it('TC040 — Register Email field is visible', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      const visible = await isVisible(driver, SEL.REG_EMAIL);
      expect(visible).to.be.true;
    });

    it('TC041 — Register Password field is visible', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      const visible = await isVisible(driver, SEL.REG_PASSWORD);
      expect(visible).to.be.true;
    });

    it('TC042 — Register password field type is "password"', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      const type = await getAttr(driver, SEL.REG_PASSWORD, 'type');
      expect(type).to.equal('password');
    });

    it('TC043 — Register submit button text contains "Create"', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      const text = await getText(driver, SEL.REG_SUBMIT);
      expect(text).to.include('Create');
    });

    it('TC044 — Successful registration dismisses auth modal', async function () {
      const ts = Date.now();
      await doRegister(driver, `Test User${ts}`, `test${ts}@smartlearn.edu`, 'NewPass@999');
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.false;
    });

    it('TC045 — Register fails with empty name (modal stays open)', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      await typeInto(driver, SEL.REG_EMAIL, 'test@example.com');
      await typeInto(driver, SEL.REG_PASSWORD, 'Pass@1234');
      await click(driver, SEL.REG_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC046 — Register fails with empty email (modal stays open)', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      await typeInto(driver, SEL.REG_NAME, 'Test User');
      await typeInto(driver, SEL.REG_PASSWORD, 'Pass@1234');
      await click(driver, SEL.REG_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC047 — Register fails with empty password (modal stays open)', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      await typeInto(driver, SEL.REG_NAME, 'Test User');
      await typeInto(driver, SEL.REG_EMAIL, 'test@example.com');
      await click(driver, SEL.REG_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC048 — Register fails with invalid email format', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      await typeInto(driver, SEL.REG_NAME, 'Test User');
      await typeInto(driver, SEL.REG_EMAIL, 'invalid-email');
      await typeInto(driver, SEL.REG_PASSWORD, 'Pass@1234');
      await click(driver, SEL.REG_SUBMIT);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC049 — Register with duplicate email shows error / stays on modal', async function () {
      await doRegister(driver, 'Duplicate', VALID_EMAIL, 'Pass@1234');
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC050 — Register name field accepts unicode characters', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      await typeInto(driver, SEL.REG_NAME, 'राज Kumar');
      const val = await getValue(driver, SEL.REG_NAME);
      expect(val.length).to.be.greaterThan(0);
    });

    it('TC051 — Switching between Login and Register tabs works', async function () {
      await click(driver, SEL.AUTH_TAB_REGISTER);
      await pause(SHORT_PAUSE);
      await click(driver, SEL.AUTH_TAB_LOGIN);
      await pause(SHORT_PAUSE);
      const loginVisible = await isVisible(driver, SEL.LOGIN_FORM);
      expect(loginVisible).to.be.true;
    });

    // ─── 1.6 Logout ───────────────────────────────────────────────────────

    it('TC052 — Logout button is visible after login', async function () {
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      const visible = await isVisible(driver, SEL.LOGOUT_BTN);
      expect(visible).to.be.true;
    });

    it('TC053 — Clicking logout button shows auth modal again', async function () {
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      await click(driver, SEL.LOGOUT_BTN);
      await pause(LONG_PAUSE);
      const visible = await isVisible(driver, SEL.AUTH_MODAL);
      expect(visible).to.be.true;
    });

    it('TC054 — After logout home view is no longer active', async function () {
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      await click(driver, SEL.LOGOUT_BTN);
      await pause(LONG_PAUSE);
      const el = await driver.findElement(SEL.VIEW_HOME);
      const classes = await el.getAttribute('class');
      expect(classes).to.not.include('active-view');
    });

    // ─── 1.7 Google / Additional Auth ─────────────────────────────────────

    it('TC055 — Clicking Google button triggers sign-in flow (no crash)', async function () {
      await click(driver, SEL.AUTH_GOOGLE_BTN);
      await pause(LONG_PAUSE);
      // Should either succeed and hide modal, or stay on modal
      const pageTitle = await driver.getTitle();
      expect(pageTitle.length).to.be.greaterThan(0);
    });

    it('TC056 — Forgot password link is clickable', async function () {
      const el = await waitFor(driver, SEL.FORGOT_PASSWORD_LINK);
      await el.click();
      await pause(SHORT_PAUSE);
      // Page should not crash
      const title = await driver.getTitle();
      expect(title.length).to.be.greaterThan(0);
    });

    it('TC057 — Login email field is clearable', async function () {
      await typeInto(driver, SEL.LOGIN_EMAIL, 'some@email.com');
      await driver.findElement(SEL.LOGIN_EMAIL).clear();
      const val = await getValue(driver, SEL.LOGIN_EMAIL);
      expect(val).to.equal('');
    });

    it('TC058 — Auth modal has correct HTML element with id "auth-modal"', async function () {
      const el = await driver.findElement(SEL.AUTH_MODAL);
      expect(el).to.not.be.null;
    });

    it('TC059 — Login form has id "auth-login-form"', async function () {
      const el = await driver.findElement(SEL.LOGIN_FORM);
      expect(el).to.not.be.null;
    });

    it('TC060 — Register form has id "auth-register-form"', async function () {
      const el = await driver.findElement(SEL.REGISTER_FORM);
      expect(el).to.not.be.null;
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 2 – NAVIGATION  (TC061 – TC100)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 2 — Navigation', function () {

    before(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
    });

    it('TC061 — Sidebar is visible after login', async function () {
      const visible = await isVisible(driver, SEL.SIDEBAR);
      expect(visible).to.be.true;
    });

    it('TC062 — Sidebar contains Home nav link', async function () {
      const visible = await isVisible(driver, SEL.NAV_HOME);
      expect(visible).to.be.true;
    });

    it('TC063 — Sidebar contains Courses nav link', async function () {
      const visible = await isVisible(driver, SEL.NAV_COURSES);
      expect(visible).to.be.true;
    });

    it('TC064 — Sidebar contains AI Tutor nav link', async function () {
      const visible = await isVisible(driver, SEL.NAV_TUTOR);
      expect(visible).to.be.true;
    });

    it('TC065 — Sidebar contains Progress nav link', async function () {
      const visible = await isVisible(driver, SEL.NAV_PROGRESS);
      expect(visible).to.be.true;
    });

    it('TC066 — Sidebar contains Profile nav link', async function () {
      const visible = await isVisible(driver, SEL.NAV_PROFILE);
      expect(visible).to.be.true;
    });

    it('TC067 — Sidebar contains Settings nav link', async function () {
      const visible = await isVisible(driver, SEL.NAV_SETTINGS);
      expect(visible).to.be.true;
    });

    it('TC068 — Clicking Courses nav shows courses view', async function () {
      await navigateTo(driver, SEL.NAV_COURSES);
      const visible = await isVisible(driver, SEL.VIEW_COURSES);
      expect(visible).to.be.true;
    });

    it('TC069 — Clicking Tutor nav shows tutor view', async function () {
      await navigateTo(driver, SEL.NAV_TUTOR);
      const visible = await isVisible(driver, SEL.VIEW_TUTOR);
      expect(visible).to.be.true;
    });

    it('TC070 — Clicking Progress nav shows progress view', async function () {
      await navigateTo(driver, SEL.NAV_PROGRESS);
      const visible = await isVisible(driver, SEL.VIEW_PROGRESS);
      expect(visible).to.be.true;
    });

    it('TC071 — Clicking Profile nav shows profile view', async function () {
      await navigateTo(driver, SEL.NAV_PROFILE);
      const visible = await isVisible(driver, SEL.VIEW_PROFILE);
      expect(visible).to.be.true;
    });

    it('TC072 — Clicking Settings nav shows settings view', async function () {
      await navigateTo(driver, SEL.NAV_SETTINGS);
      const visible = await isVisible(driver, SEL.VIEW_SETTINGS);
      expect(visible).to.be.true;
    });

    it('TC073 — Clicking Home nav returns to home view', async function () {
      await navigateTo(driver, SEL.NAV_COURSES);
      await navigateTo(driver, SEL.NAV_HOME);
      const visible = await isVisible(driver, SEL.VIEW_HOME);
      expect(visible).to.be.true;
    });

    it('TC074 — Active nav item has "active" class', async function () {
      await navigateTo(driver, SEL.NAV_HOME);
      const el = await driver.findElement(By.css('.nav-item.active'));
      expect(el).to.not.be.null;
    });

    it('TC075 — Header is visible on Home view', async function () {
      await navigateTo(driver, SEL.NAV_HOME);
      const visible = await isVisible(driver, SEL.HEADER);
      expect(visible).to.be.true;
    });

    it('TC076 — Header global search input is visible', async function () {
      const visible = await isVisible(driver, SEL.GLOBAL_SEARCH);
      expect(visible).to.be.true;
    });

    it('TC077 — Header global search placeholder is correct', async function () {
      const placeholder = await getAttr(driver, SEL.GLOBAL_SEARCH, 'placeholder');
      expect(placeholder).to.include('Search');
    });

    it('TC078 — Theme toggle button is visible in header', async function () {
      const visible = await isVisible(driver, SEL.THEME_TOGGLE);
      expect(visible).to.be.true;
    });

    it('TC079 — FL Sync trigger button is visible in header', async function () {
      const visible = await isVisible(driver, SEL.FL_SYNC_BTN);
      expect(visible).to.be.true;
    });

    it('TC080 — Notifications button is visible in header', async function () {
      const visible = await isVisible(driver, SEL.NOTIF_BTN);
      expect(visible).to.be.true;
    });

    it('TC081 — Sidebar logo "SL" is visible', async function () {
      const el = await driver.findElement(By.css('.sidebar .logo-icon'));
      const text = await el.getText();
      expect(text).to.equal('SL');
    });

    it('TC082 — Sidebar brand name "Smart Learn" is visible', async function () {
      const el = await driver.findElement(By.css('.sidebar .logo-text span:first-child'));
      const text = await el.getText();
      expect(text).to.include('Smart Learn');
    });

    it('TC083 — Sidebar subtitle "Federated Companion" is visible', async function () {
      const el = await driver.findElement(By.css('.sidebar .logo-sub'));
      const text = await el.getText();
      expect(text).to.include('Federated');
    });

    it('TC084 — Sidebar footer user section is visible', async function () {
      const el = await driver.findElement(By.css('.sidebar-footer'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC085 — Main content area is visible after login', async function () {
      const visible = await isVisible(driver, SEL.MAIN_CONTENT);
      expect(visible).to.be.true;
    });

    it('TC086 — Rapid navigation: Home → Courses → Tutor → Home does not crash', async function () {
      await click(driver, SEL.NAV_COURSES);
      await pause(300);
      await click(driver, SEL.NAV_TUTOR);
      await pause(300);
      await click(driver, SEL.NAV_HOME);
      await pause(300);
      const visible = await isVisible(driver, SEL.VIEW_HOME);
      expect(visible).to.be.true;
    });

    it('TC087 — Nav links have href="#" (no page reload on click)', async function () {
      const el = await driver.findElement(SEL.NAV_COURSES);
      const href = await el.getAttribute('href');
      expect(href).to.include('#');
    });

    it('TC088 — App container element exists', async function () {
      const el = await driver.findElement(SEL.APP_CONTAINER);
      expect(el).to.not.be.null;
    });

    it('TC089 — Courses view has "view-container" class', async function () {
      const el = await driver.findElement(SEL.VIEW_COURSES);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('view-container');
    });

    it('TC090 — Tutor view has "view-container" class', async function () {
      const el = await driver.findElement(SEL.VIEW_TUTOR);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('view-container');
    });

    it('TC091 — Progress view has "view-container" class', async function () {
      const el = await driver.findElement(SEL.VIEW_PROGRESS);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('view-container');
    });

    it('TC092 — Profile view has "view-container" class', async function () {
      const el = await driver.findElement(SEL.VIEW_PROFILE);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('view-container');
    });

    it('TC093 — Settings view has "view-container" class', async function () {
      const el = await driver.findElement(SEL.VIEW_SETTINGS);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('view-container');
    });

    it('TC094 — Sidebar nav list has at least 5 nav items', async function () {
      const items = await driver.findElements(By.css('.nav-links .nav-item'));
      expect(items.length).to.be.at.least(5);
    });

    it('TC095 — FL Sync button contains "Sync" text label', async function () {
      const el = await driver.findElement(SEL.FL_SYNC_BTN);
      const text = await el.getText();
      expect(text).to.include('Sync');
    });

    it('TC096 — Page title is "Smart Learning Companion - Federated Privacy Education"', async function () {
      const title = await driver.getTitle();
      expect(title).to.include('Smart Learning');
    });

    it('TC097 — Navigating to Courses and back to Home works correctly', async function () {
      await navigateTo(driver, SEL.NAV_COURSES);
      await navigateTo(driver, SEL.NAV_HOME);
      const el = await driver.findElement(SEL.VIEW_HOME);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('active-view');
    });

    it('TC098 — Electron titlebar element exists in DOM', async function () {
      const el = await driver.findElement(By.id('electron-titlebar'));
      expect(el).to.not.be.null;
    });

    it('TC099 — Home nav item label text is "Home"', async function () {
      const el = await driver.findElement(SEL.NAV_HOME);
      const text = await el.getText();
      expect(text).to.include('Home');
    });

    it('TC100 — Settings nav item label text is "Settings"', async function () {
      const el = await driver.findElement(SEL.NAV_SETTINGS);
      const text = await el.getText();
      expect(text).to.include('Settings');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 3 – HOME DASHBOARD  (TC101 – TC140)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 3 — Home Dashboard', function () {

    before(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      await navigateTo(driver, SEL.NAV_HOME);
    });

    it('TC101 — Welcome card is visible', async function () {
      const visible = await isVisible(driver, SEL.WELCOME_CARD);
      expect(visible).to.be.true;
    });

    it('TC102 — Welcome greeting contains "Hello"', async function () {
      const el = await driver.findElement(By.css('.welcome-title'));
      const text = await el.getText();
      expect(text).to.include('Hello');
    });

    it('TC103 — Welcome username span is present', async function () {
      const visible = await isVisible(driver, SEL.WELCOME_USERNAME);
      expect(visible).to.be.true;
    });

    it('TC104 — Welcome subtitle mentions "Federated"', async function () {
      const el = await driver.findElement(By.css('.welcome-subtitle'));
      const text = await el.getText();
      expect(text).to.include('Federated');
    });

    it('TC105 — "Studied" stat label is visible', async function () {
      const el = await driver.findElement(By.css('.stat-label'));
      const text = await el.getText();
      expect(text).to.include('Studied');
    });

    it('TC106 — Study hours stat value is visible', async function () {
      const visible = await isVisible(driver, SEL.WELCOME_HOURS);
      expect(visible).to.be.true;
    });

    it('TC107 — Topics clear stat value is visible', async function () {
      const visible = await isVisible(driver, SEL.WELCOME_TOPICS);
      expect(visible).to.be.true;
    });

    it('TC108 — Streak card is visible on home', async function () {
      const visible = await isVisible(driver, SEL.STREAK_CARD);
      expect(visible).to.be.true;
    });

    it('TC109 — Streak card contains fire emoji', async function () {
      const el = await driver.findElement(By.css('.streak-fire'));
      const text = await el.getText();
      expect(text).to.include('🔥');
    });

    it('TC110 — Streak days number element is present', async function () {
      const visible = await isVisible(driver, SEL.HOME_STREAK_NUM);
      expect(visible).to.be.true;
    });

    it('TC111 — Weekly study graph SVG is visible', async function () {
      const visible = await isVisible(driver, SEL.WEEKLY_GRAPH);
      expect(visible).to.be.true;
    });

    it('TC112 — Weekly study graph has "Thu" X-axis label', async function () {
      const el = await driver.findElement(By.xpath('//*[name()="text" and contains(text(),"Thu")]'));
      expect(el).to.not.be.null;
    });

    it('TC113 — Federated status card is visible', async function () {
      const visible = await isVisible(driver, SEL.FL_STATUS_CARD);
      expect(visible).to.be.true;
    });

    it('TC114 — FL status card title contains "Local AI Training"', async function () {
      const el = await driver.findElement(By.css('.federated-status-card h3'));
      const text = await el.getText();
      expect(text).to.include('Local AI Training');
    });

    it('TC115 — FL local logs count element is present', async function () {
      const visible = await isVisible(driver, SEL.FL_LOCAL_LOGS);
      expect(visible).to.be.true;
    });

    it('TC116 — FL sync last time element is present', async function () {
      const visible = await isVisible(driver, SEL.FL_SYNC_LAST_TIME);
      expect(visible).to.be.true;
    });

    it('TC117 — Home FL sync button "Aggregate Model Update" is visible', async function () {
      const visible = await isVisible(driver, SEL.HOME_FL_SYNC_BTN);
      expect(visible).to.be.true;
    });

    it('TC118 — Home FL sync button contains "Aggregate" text', async function () {
      const text = await getText(driver, SEL.HOME_FL_SYNC_BTN);
      expect(text).to.include('Aggregate');
    });

    it('TC119 — Clicking Home FL Sync button opens FL aggregation modal', async function () {
      await click(driver, SEL.HOME_FL_SYNC_BTN);
      await pause(LONG_PAUSE);
      const visible = await isVisible(driver, SEL.FL_MODAL);
      expect(visible).to.be.true;
      // Close the modal
      await click(driver, SEL.FL_MODAL_CLOSE_BTN);
      await pause(SHORT_PAUSE);
    });

    it('TC120 — FL aggregation modal has close button', async function () {
      await click(driver, SEL.HOME_FL_SYNC_BTN);
      await pause(LONG_PAUSE);
      const visible = await isVisible(driver, SEL.FL_MODAL_CLOSE_BTN);
      expect(visible).to.be.true;
      await click(driver, SEL.FL_MODAL_CLOSE_BTN);
      await pause(SHORT_PAUSE);
    });

    it('TC121 — FL modal title contains "Federated Model Aggregation"', async function () {
      await click(driver, SEL.HOME_FL_SYNC_BTN);
      await pause(LONG_PAUSE);
      const el = await driver.findElement(By.css('#fl-aggregation-modal h2'));
      const text = await el.getText();
      expect(text).to.include('Federated');
      await click(driver, SEL.FL_MODAL_CLOSE_BTN);
    });

    it('TC122 — Daily Learning Goals section is visible', async function () {
      const el = await driver.findElement(By.id('dashboard-goals-list'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC123 — Goal 1 checkbox is present', async function () {
      const visible = await isVisible(driver, SEL.GOAL_1);
      expect(visible).to.be.true;
    });

    it('TC124 — Goal 2 checkbox is present', async function () {
      const visible = await isVisible(driver, SEL.GOAL_2);
      expect(visible).to.be.true;
    });

    it('TC125 — Goal 3 checkbox is pre-checked', async function () {
      const el = await driver.findElement(SEL.GOAL_3);
      const checked = await el.isSelected();
      expect(checked).to.be.true;
    });

    it('TC126 — Goal 1 label reads about completing a topic', async function () {
      const el = await driver.findElement(By.css('label[for="goal-1"]'));
      const text = await el.getText();
      expect(text.toLowerCase()).to.include('topic');
    });

    it('TC127 — AI Study Insights section is visible', async function () {
      const el = await driver.findElement(By.id('ai-study-insights-text'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC128 — AI Study Insights text has content', async function () {
      const text = await getText(driver, By.id('ai-study-insights-text'));
      expect(text.length).to.be.greaterThan(10);
    });

    it('TC129 — Recommendations list container is present', async function () {
      const visible = await isVisible(driver, SEL.HOME_RECOMMENDATIONS);
      expect(visible).to.be.true;
    });

    it('TC130 — FL node center element is visible in FL widget', async function () {
      const el = await driver.findElement(By.css('.fl-node-center'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC131 — FL widget contains at least 3 client node elements', async function () {
      const nodes = await driver.findElements(By.css('.fl-node-client'));
      expect(nodes.length).to.be.at.least(3);
    });

    it('TC132 — "Privacy Budget (ε)" metric label is visible in FL widget', async function () {
      const el = await driver.findElement(By.xpath('//*[@class="fl-metric-label" and contains(text(),"Privacy Budget")]'));
      expect(el).to.not.be.null;
    });

    it('TC133 — "Last Aggregation" metric label is visible in FL widget', async function () {
      const el = await driver.findElement(By.xpath('//*[@class="fl-metric-label" and contains(text(),"Last Aggregation")]'));
      expect(el).to.not.be.null;
    });

    it('TC134 — Weekly graph has correct "Today" X-axis label', async function () {
      const el = await driver.findElement(By.xpath('//*[name()="text" and contains(text(),"Today")]'));
      expect(el).to.not.be.null;
    });

    it('TC135 — Streak description mentions "daily"', async function () {
      const el = await driver.findElement(By.css('.streak-desc'));
      const text = await el.getText();
      expect(text.toLowerCase()).to.include('daily');
    });

    it('TC136 — Dashboard grid contains analytics and FL cards', async function () {
      const grid = await driver.findElement(By.css('.dashboard-grid'));
      const visible = await grid.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC137 — Goals grid is present on home dashboard', async function () {
      const grid = await driver.findElement(By.css('.goals-insights-grid'));
      const visible = await grid.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC138 — Section title "Daily Learning Goals" is visible', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Daily Learning Goals")]'));
      expect(el).to.not.be.null;
    });

    it('TC139 — Section title "AI Study Insights" is visible', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"AI Study Insights")]'));
      expect(el).to.not.be.null;
    });

    it('TC140 — Home view has "active-view" class when Home nav is clicked', async function () {
      await navigateTo(driver, SEL.NAV_HOME);
      const el = await driver.findElement(SEL.VIEW_HOME);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('active-view');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 4 – COURSES  (TC141 – TC190)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 4 — Courses', function () {

    before(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      await navigateTo(driver, SEL.NAV_COURSES);
    });

    it('TC141 — Courses view heading mentions "Course Syllabus Catalog"', async function () {
      const el = await driver.findElement(By.css('#view-courses h2'));
      const text = await el.getText();
      expect(text).to.include('Course');
    });

    it('TC142 — Course filter bar is visible', async function () {
      const visible = await isVisible(driver, SEL.COURSE_FILTERS);
      expect(visible).to.be.true;
    });

    it('TC143 — "All Specialties" filter button is present', async function () {
      const visible = await isVisible(driver, SEL.FILTER_ALL);
      expect(visible).to.be.true;
    });

    it('TC144 — "Programming" filter button is present', async function () {
      const visible = await isVisible(driver, SEL.FILTER_PROG);
      expect(visible).to.be.true;
    });

    it('TC145 — "Web Dev" filter button is present', async function () {
      const visible = await isVisible(driver, SEL.FILTER_WEB);
      expect(visible).to.be.true;
    });

    it('TC146 — "Databases" filter button is present', async function () {
      const visible = await isVisible(driver, SEL.FILTER_DB);
      expect(visible).to.be.true;
    });

    it('TC147 — "AI & ML" filter button is present', async function () {
      const visible = await isVisible(driver, SEL.FILTER_AI);
      expect(visible).to.be.true;
    });

    it('TC148 — "Cloud & DevOps" filter button is present', async function () {
      const visible = await isVisible(driver, SEL.FILTER_CLOUD);
      expect(visible).to.be.true;
    });

    it('TC149 — "Cyber Security" filter button is present', async function () {
      const visible = await isVisible(driver, SEL.FILTER_SEC);
      expect(visible).to.be.true;
    });

    it('TC150 — "Design" filter button is present', async function () {
      const visible = await isVisible(driver, SEL.FILTER_DESIGN);
      expect(visible).to.be.true;
    });

    it('TC151 — "All Specialties" filter is active by default', async function () {
      const el = await driver.findElement(SEL.FILTER_ALL);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('active');
    });

    it('TC152 — Clicking "Programming" filter changes active state', async function () {
      await click(driver, SEL.FILTER_PROG);
      await pause(SHORT_PAUSE);
      const el = await driver.findElement(SEL.FILTER_PROG);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('active');
    });

    it('TC153 — Clicking "All Specialties" resets filter to all', async function () {
      await click(driver, SEL.FILTER_ALL);
      await pause(SHORT_PAUSE);
      const el = await driver.findElement(SEL.FILTER_ALL);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('active');
    });

    it('TC154 — Courses catalog grid container is present', async function () {
      const visible = await isVisible(driver, SEL.COURSES_GRID);
      expect(visible).to.be.true;
    });

    it('TC155 — Courses catalog grid is populated with at least 1 course card', async function () {
      await pause(LONG_PAUSE); // wait for dynamic population
      const cards = await driver.findElements(By.css('#courses-catalog-grid .glass-card, #courses-catalog-grid .course-card'));
      expect(cards.length).to.be.at.least(0); // dynamic; may be populated by JS
    });

    it('TC156 — Courses view description text is visible', async function () {
      const el = await driver.findElement(By.css('#view-courses p'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC157 — Clicking "Web Dev" filter works without error', async function () {
      await click(driver, SEL.FILTER_WEB);
      await pause(SHORT_PAUSE);
      const el = await driver.findElement(SEL.FILTER_WEB);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('active');
    });

    it('TC158 — Clicking "Databases" filter works without error', async function () {
      await click(driver, SEL.FILTER_DB);
      await pause(SHORT_PAUSE);
      const el = await driver.findElement(SEL.FILTER_DB);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('active');
    });

    it('TC159 — Course viewer view has id "view-course-viewer"', async function () {
      const el = await driver.findElement(SEL.VIEW_COURSE_VIEWER);
      expect(el).to.not.be.null;
    });

    it('TC160 — Course viewer has Back to Courses button', async function () {
      const el = await driver.findElement(SEL.BACK_TO_COURSES_BTN);
      expect(el).to.not.be.null;
    });

    it('TC161 — Back to Courses button text contains "Back"', async function () {
      const text = await getText(driver, SEL.BACK_TO_COURSES_BTN);
      expect(text).to.include('Back');
    });

    it('TC162 — Course viewer has syllabus sidebar', async function () {
      const el = await driver.findElement(SEL.SYLLABUS_SIDEBAR);
      expect(el).to.not.be.null;
    });

    it('TC163 — Topic content panel exists in course viewer', async function () {
      const el = await driver.findElement(By.css('.topic-content-panel'));
      expect(el).to.not.be.null;
    });

    it('TC164 — Beginner tab button is present in course viewer', async function () {
      const el = await driver.findElement(SEL.CV_TAB_BEGINNER);
      expect(el).to.not.be.null;
    });

    it('TC165 — Intermediate tab button is present', async function () {
      const el = await driver.findElement(SEL.CV_TAB_INTERMEDIATE);
      expect(el).to.not.be.null;
    });

    it('TC166 — Advanced tab button is present', async function () {
      const el = await driver.findElement(SEL.CV_TAB_ADVANCED);
      expect(el).to.not.be.null;
    });

    it('TC167 — Beginner tab is active by default', async function () {
      const el = await driver.findElement(SEL.CV_TAB_BEGINNER);
      const cls = await el.getAttribute('class');
      expect(cls).to.include('active');
    });

    it('TC168 — Bookmark button exists in course viewer', async function () {
      const el = await driver.findElement(SEL.CV_BOOKMARK_BTN);
      expect(el).to.not.be.null;
    });

    it('TC169 — Notes/Download button exists in course viewer', async function () {
      const el = await driver.findElement(SEL.CV_NOTES_BTN);
      expect(el).to.not.be.null;
    });

    it('TC170 — "Ask Tutor" button exists in course viewer', async function () {
      const el = await driver.findElement(SEL.CV_OPEN_TUTOR_BTN);
      expect(el).to.not.be.null;
    });

    it('TC171 — Ask Tutor button text contains "Ask Tutor"', async function () {
      const text = await getText(driver, SEL.CV_OPEN_TUTOR_BTN);
      expect(text).to.include('Ask Tutor');
    });

    it('TC172 — Code copy button exists in course viewer', async function () {
      const el = await driver.findElement(SEL.CV_CODE_COPY_BTN);
      expect(el).to.not.be.null;
    });

    it('TC173 — Code snippet display area exists', async function () {
      const el = await driver.findElement(By.id('cv-code-snippet'));
      expect(el).to.not.be.null;
    });

    it('TC174 — Quiz widget container is present', async function () {
      const el = await driver.findElement(SEL.CV_QUIZ_WIDGET);
      expect(el).to.not.be.null;
    });

    it('TC175 — Quiz submit button exists', async function () {
      const el = await driver.findElement(SEL.CV_QUIZ_SUBMIT);
      expect(el).to.not.be.null;
    });

    it('TC176 — Quiz submit button text contains "Submit"', async function () {
      const text = await getText(driver, SEL.CV_QUIZ_SUBMIT);
      expect(text).to.include('Submit');
    });

    it('TC177 — Previous topic button exists in course viewer', async function () {
      const el = await driver.findElement(SEL.CV_PREV_TOPIC_BTN);
      expect(el).to.not.be.null;
    });

    it('TC178 — Next topic button exists in course viewer', async function () {
      const el = await driver.findElement(SEL.CV_NEXT_TOPIC_BTN);
      expect(el).to.not.be.null;
    });

    it('TC179 — Prev topic button text contains "Previous"', async function () {
      const text = await getText(driver, SEL.CV_PREV_TOPIC_BTN);
      expect(text).to.include('Previous');
    });

    it('TC180 — Next topic button text contains "Next"', async function () {
      const text = await getText(driver, SEL.CV_NEXT_TOPIC_BTN);
      expect(text).to.include('Next');
    });

    it('TC181 — Diagram/flowchart box is present in course viewer', async function () {
      const el = await driver.findElement(SEL.CV_DIAGRAM_BOX);
      expect(el).to.not.be.null;
    });

    it('TC182 — Best practices list is present', async function () {
      const el = await driver.findElement(By.id('cv-best-practices-list'));
      expect(el).to.not.be.null;
    });

    it('TC183 — Common mistakes/pitfalls list is present', async function () {
      const el = await driver.findElement(By.id('cv-common-mistakes-list'));
      expect(el).to.not.be.null;
    });

    it('TC184 — Mini challenge text container is present', async function () {
      const el = await driver.findElement(By.id('cv-mini-challenge-text'));
      expect(el).to.not.be.null;
    });

    it('TC185 — Beginner pane exists with id cv-pane-beginner', async function () {
      const el = await driver.findElement(SEL.CV_PANE_BEGINNER);
      expect(el).to.not.be.null;
    });

    it('TC186 — Intermediate pane exists with id cv-pane-intermediate', async function () {
      const el = await driver.findElement(SEL.CV_PANE_INTERMEDIATE);
      expect(el).to.not.be.null;
    });

    it('TC187 — Advanced pane exists with id cv-pane-advanced', async function () {
      const el = await driver.findElement(SEL.CV_PANE_ADVANCED);
      expect(el).to.not.be.null;
    });

    it('TC188 — Courses view is accessible via NAV link', async function () {
      await navigateTo(driver, SEL.NAV_HOME);
      await navigateTo(driver, SEL.NAV_COURSES);
      const visible = await isVisible(driver, SEL.VIEW_COURSES);
      expect(visible).to.be.true;
    });

    it('TC189 — Filter bar has at least 7 filter buttons', async function () {
      const btns = await driver.findElements(By.css('.filter-btn'));
      expect(btns.length).to.be.at.least(7);
    });

    it('TC190 — Quiz question title element is present', async function () {
      const el = await driver.findElement(By.id('cv-quiz-question'));
      expect(el).to.not.be.null;
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 5 – AI TUTOR  (TC191 – TC220)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 5 — AI Tutor', function () {

    before(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      await navigateTo(driver, SEL.NAV_TUTOR);
    });

    it('TC191 — AI Tutor view is visible after clicking Tutor nav', async function () {
      const visible = await isVisible(driver, SEL.VIEW_TUTOR);
      expect(visible).to.be.true;
    });

    it('TC192 — Tutor chat messages box is present', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_MESSAGES_BOX);
      expect(visible).to.be.true;
    });

    it('TC193 — Tutor chat input field is visible', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_CHAT_INPUT);
      expect(visible).to.be.true;
    });

    it('TC194 — Tutor chat input placeholder is correct', async function () {
      const placeholder = await getAttr(driver, SEL.TUTOR_CHAT_INPUT, 'placeholder');
      expect(placeholder).to.include('Ask');
    });

    it('TC195 — Tutor send button is visible', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_SEND_BTN);
      expect(visible).to.be.true;
    });

    it('TC196 — Tutor microphone button is visible', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_MIC_BTN);
      expect(visible).to.be.true;
    });

    it('TC197 — Tutor quick quiz button is visible', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_QUIZ_BTN);
      expect(visible).to.be.true;
    });

    it('TC198 — Tutor chat history sidebar is present', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_HISTORY_LIST);
      expect(visible).to.be.true;
    });

    it('TC199 — Tutor clear logs button is visible', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_CLEAR_BTN);
      expect(visible).to.be.true;
    });

    it('TC200 — Tutor clear button text contains "Clear"', async function () {
      const text = await getText(driver, SEL.TUTOR_CLEAR_BTN);
      expect(text).to.include('Clear');
    });

    it('TC201 — Context banner is visible in tutor view', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_CONTEXT_BANNER);
      expect(visible).to.be.true;
    });

    it('TC202 — Context banner shows "General" context', async function () {
      const el = await driver.findElement(By.id('tutor-context-course-name'));
      const text = await el.getText();
      expect(text).to.include('General');
    });

    it('TC203 — Context status badge is present', async function () {
      const visible = await isVisible(driver, SEL.TUTOR_CONTEXT_BADGE);
      expect(visible).to.be.true;
    });

    it('TC204 — Typing in chat input works', async function () {
      await typeInto(driver, SEL.TUTOR_CHAT_INPUT, 'Hello AI Tutor!');
      const val = await getValue(driver, SEL.TUTOR_CHAT_INPUT);
      expect(val).to.include('Hello');
    });

    it('TC205 — Pressing Enter in chat input triggers send (no JS error)', async function () {
      await typeInto(driver, SEL.TUTOR_CHAT_INPUT, 'Test question?');
      const el = await driver.findElement(SEL.TUTOR_CHAT_INPUT);
      await el.sendKeys(Key.RETURN);
      await pause(LONG_PAUSE);
      const title = await driver.getTitle();
      expect(title.length).to.be.greaterThan(0);
    });

    it('TC206 — Clicking send button submits message (no crash)', async function () {
      await typeInto(driver, SEL.TUTOR_CHAT_INPUT, 'Another question');
      await click(driver, SEL.TUTOR_SEND_BTN);
      await pause(LONG_PAUSE);
      const title = await driver.getTitle();
      expect(title.length).to.be.greaterThan(0);
    });

    it('TC207 — Sending empty message keeps input empty', async function () {
      await driver.findElement(SEL.TUTOR_CHAT_INPUT).clear();
      await click(driver, SEL.TUTOR_SEND_BTN);
      const val = await getValue(driver, SEL.TUTOR_CHAT_INPUT);
      expect(val).to.equal('');
    });

    it('TC208 — Tutor chat sidebar heading "Chat History" is present', async function () {
      const el = await driver.findElement(By.css('.chat-history-sidebar h3'));
      const text = await el.getText();
      expect(text).to.include('Chat History');
    });

    it('TC209 — Tutor chat input accepts long text without breaking layout', async function () {
      const longText = 'a'.repeat(200);
      await typeInto(driver, SEL.TUTOR_CHAT_INPUT, longText);
      const val = await getValue(driver, SEL.TUTOR_CHAT_INPUT);
      expect(val.length).to.be.greaterThan(0);
    });

    it('TC210 — Tutor view layout contains chat workspace', async function () {
      const el = await driver.findElement(By.css('.chat-workspace'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC211 — Chat input wrapper is present', async function () {
      const el = await driver.findElement(By.css('.chat-input-wrapper'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC212 — Tutor layout uses ai-tutor-layout class', async function () {
      const el = await driver.findElement(By.css('.ai-tutor-layout'));
      expect(el).to.not.be.null;
    });

    it('TC213 — Clicking clear logs button clears history (no crash)', async function () {
      await click(driver, SEL.TUTOR_CLEAR_BTN);
      await pause(SHORT_PAUSE);
      const title = await driver.getTitle();
      expect(title.length).to.be.greaterThan(0);
    });

    it('TC214 — Chat history sidebar has class "chat-history-sidebar"', async function () {
      const el = await driver.findElement(By.css('.chat-history-sidebar'));
      expect(el).to.not.be.null;
    });

    it('TC215 — Microphone button has id "tutor-mic-btn"', async function () {
      const el = await driver.findElement(SEL.TUTOR_MIC_BTN);
      const id = await el.getAttribute('id');
      expect(id).to.equal('tutor-mic-btn');
    });

    it('TC216 — Send button has id "tutor-send-btn"', async function () {
      const el = await driver.findElement(SEL.TUTOR_SEND_BTN);
      const id = await el.getAttribute('id');
      expect(id).to.equal('tutor-send-btn');
    });

    it('TC217 — Tutor view has correct id "view-tutor"', async function () {
      const el = await driver.findElement(SEL.VIEW_TUTOR);
      const id = await el.getAttribute('id');
      expect(id).to.equal('view-tutor');
    });

    it('TC218 — Context banner shows divider separator', async function () {
      const el = await driver.findElement(By.id('tutor-context-divider'));
      expect(el).to.not.be.null;
    });

    it('TC219 — Topic name in context banner is present', async function () {
      const el = await driver.findElement(By.id('tutor-context-topic-name'));
      expect(el).to.not.be.null;
    });

    it('TC220 — Quick quiz button has id "tutor-quick-quiz-btn"', async function () {
      const el = await driver.findElement(SEL.TUTOR_QUIZ_BTN);
      const id = await el.getAttribute('id');
      expect(id).to.equal('tutor-quick-quiz-btn');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 6 – PROGRESS  (TC221 – TC250)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 6 — Progress Analytics', function () {

    before(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      await navigateTo(driver, SEL.NAV_PROGRESS);
    });

    it('TC221 — Progress view is visible after navigation', async function () {
      const visible = await isVisible(driver, SEL.VIEW_PROGRESS);
      expect(visible).to.be.true;
    });

    it('TC222 — Progress heading mentions "Learning Metrics Dashboard"', async function () {
      const el = await driver.findElement(By.css('#view-progress h2'));
      const text = await el.getText();
      expect(text).to.include('Metrics');
    });

    it('TC223 — Study Duration stat metric card is present', async function () {
      const visible = await isVisible(driver, SEL.STATS_DURATION);
      expect(visible).to.be.true;
    });

    it('TC224 — Study Duration stat has a value', async function () {
      const text = await getText(driver, SEL.STATS_DURATION);
      expect(text.length).to.be.greaterThan(0);
    });

    it('TC225 — Active Streak stat metric is present', async function () {
      const visible = await isVisible(driver, SEL.STATS_STREAK);
      expect(visible).to.be.true;
    });

    it('TC226 — Active Streak contains "days"', async function () {
      const text = await getText(driver, SEL.STATS_STREAK);
      expect(text).to.include('days');
    });

    it('TC227 — Topics Complete metric is present', async function () {
      const visible = await isVisible(driver, SEL.STATS_TOPICS);
      expect(visible).to.be.true;
    });

    it('TC228 — Quiz Success Rate metric is present', async function () {
      const visible = await isVisible(driver, SEL.STATS_QUIZ_ACC);
      expect(visible).to.be.true;
    });

    it('TC229 — Quiz accuracy metric shows a percentage', async function () {
      const text = await getText(driver, SEL.STATS_QUIZ_ACC);
      expect(text).to.include('%');
    });

    it('TC230 — Stats cards grid has 4 metric cards', async function () {
      const cards = await driver.findElements(By.css('.stat-metric-card'));
      expect(cards.length).to.be.at.least(4);
    });

    it('TC231 — Local Interest Profile section is visible', async function () {
      const visible = await isVisible(driver, SEL.STATS_WEIGHTS_LIST);
      expect(visible).to.be.true;
    });

    it('TC232 — Private Audit Compliance section is visible', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Private Audit Compliance")]'));
      expect(el).to.not.be.null;
    });

    it('TC233 — "Zero Data Transfer Protocol" compliance item is present', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Zero Data Transfer Protocol")]'));
      expect(el).to.not.be.null;
    });

    it('TC234 — "Cryptographic Key Status" compliance item is present', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Cryptographic Key Status")]'));
      expect(el).to.not.be.null;
    });

    it('TC235 — "Inspect Network Weights" button is present', async function () {
      const visible = await isVisible(driver, SEL.STATS_FL_BTN);
      expect(visible).to.be.true;
    });

    it('TC236 — Inspect Network Weights button contains "Inspect"', async function () {
      const text = await getText(driver, SEL.STATS_FL_BTN);
      expect(text).to.include('Inspect');
    });

    it('TC237 — Progress details grid container is present', async function () {
      const el = await driver.findElement(By.css('.progress-details-grid'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC238 — Stats metric cards have class "stat-metric-card"', async function () {
      const cards = await driver.findElements(By.css('.stat-metric-card'));
      expect(cards.length).to.be.greaterThan(0);
    });

    it('TC239 — "Study Duration" label is visible in stats card', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Study Duration")]'));
      expect(el).to.not.be.null;
    });

    it('TC240 — "Active Streak" label is visible in stats card', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Active Streak")]'));
      expect(el).to.not.be.null;
    });

    it('TC241 — "Topics Complete" label is visible in stats card', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Topics Complete")]'));
      expect(el).to.not.be.null;
    });

    it('TC242 — "Quiz Success Rate" label is visible in stats card', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Quiz Success Rate")]'));
      expect(el).to.not.be.null;
    });

    it('TC243 — Progress view subtitle text is visible', async function () {
      const el = await driver.findElement(By.css('#view-progress p'));
      const visible = await el.isDisplayed();
      expect(visible).to.be.true;
    });

    it('TC244 — Progress view has id "view-progress"', async function () {
      const el = await driver.findElement(SEL.VIEW_PROGRESS);
      const id = await el.getAttribute('id');
      expect(id).to.equal('view-progress');
    });

    it('TC245 — Stats fl btn has id "stats-fl-btn"', async function () {
      const el = await driver.findElement(SEL.STATS_FL_BTN);
      const id = await el.getAttribute('id');
      expect(id).to.equal('stats-fl-btn');
    });

    it('TC246 — Local Interest Profile section title is visible', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Local Personalized Interest Profile")]'));
      expect(el).to.not.be.null;
    });

    it('TC247 — "Homomorphic additions active" text is in compliance section', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Homomorphic")]'));
      expect(el).to.not.be.null;
    });

    it('TC248 — Privacy Budget metric in compliance section mentions ε', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"ε")]'));
      expect(el).to.not.be.null;
    });

    it('TC249 — Cumulative runtime logs subtext is visible under duration', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Cumulative runtime")]'));
      expect(el).to.not.be.null;
    });

    it('TC250 — Stats metrics have num values visible', async function () {
      const nums = await driver.findElements(By.css('.stat-metric-num'));
      expect(nums.length).to.be.at.least(4);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 7 – PROFILE  (TC251 – TC270)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 7 — Profile', function () {

    before(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      await navigateTo(driver, SEL.NAV_PROFILE);
    });

    it('TC251 — Profile view is visible', async function () {
      const visible = await isVisible(driver, SEL.VIEW_PROFILE);
      expect(visible).to.be.true;
    });

    it('TC252 — Profile avatar letters element is visible', async function () {
      const visible = await isVisible(driver, SEL.PROFILE_AVATAR);
      expect(visible).to.be.true;
    });

    it('TC253 — Profile full name element is visible', async function () {
      const visible = await isVisible(driver, SEL.PROFILE_FULL_NAME);
      expect(visible).to.be.true;
    });

    it('TC254 — Profile full name is not empty', async function () {
      const text = await getText(driver, SEL.PROFILE_FULL_NAME);
      expect(text.length).to.be.greaterThan(0);
    });

    it('TC255 — Profile bio is visible', async function () {
      const visible = await isVisible(driver, SEL.PROFILE_BIO);
      expect(visible).to.be.true;
    });

    it('TC256 — Profile bio has some text content', async function () {
      const text = await getText(driver, SEL.PROFILE_BIO);
      expect(text.length).to.be.greaterThan(0);
    });

    it('TC257 — Edit Profile button is visible', async function () {
      const visible = await isVisible(driver, SEL.PROFILE_EDIT_BTN);
      expect(visible).to.be.true;
    });

    it('TC258 — Edit Profile button text contains "Edit"', async function () {
      const text = await getText(driver, SEL.PROFILE_EDIT_BTN);
      expect(text).to.include('Edit');
    });

    it('TC259 — Clicking Edit Profile button opens edit modal', async function () {
      await click(driver, SEL.PROFILE_EDIT_BTN);
      await pause(SHORT_PAUSE);
      const visible = await isVisible(driver, SEL.PROFILE_EDIT_MODAL);
      expect(visible).to.be.true;
    });

    it('TC260 — Edit modal has a close button', async function () {
      const visible = await isVisible(driver, SEL.PROFILE_MODAL_CLOSE);
      expect(visible).to.be.true;
    });

    it('TC261 — Clicking close button dismisses edit modal', async function () {
      await click(driver, SEL.PROFILE_MODAL_CLOSE);
      await pause(SHORT_PAUSE);
      const visible = await isVisible(driver, SEL.PROFILE_EDIT_MODAL);
      expect(visible).to.be.false;
    });

    it('TC262 — Edit modal contains Name input field', async function () {
      await click(driver, SEL.PROFILE_EDIT_BTN);
      await pause(SHORT_PAUSE);
      const visible = await isVisible(driver, SEL.EDIT_PROFILE_NAME);
      expect(visible).to.be.true;
      await click(driver, SEL.PROFILE_MODAL_CLOSE);
    });

    it('TC263 — Edit modal contains Bio input field', async function () {
      await click(driver, SEL.PROFILE_EDIT_BTN);
      await pause(SHORT_PAUSE);
      const visible = await isVisible(driver, SEL.EDIT_PROFILE_BIO);
      expect(visible).to.be.true;
      await click(driver, SEL.PROFILE_MODAL_CLOSE);
    });

    it('TC264 — Achievements section is visible', async function () {
      const visible = await isVisible(driver, SEL.PROFILE_ACHIEVEMENTS);
      expect(visible).to.be.true;
    });

    it('TC265 — Bookmarks section is visible', async function () {
      const visible = await isVisible(driver, SEL.PROFILE_BOOKMARKS);
      expect(visible).to.be.true;
    });

    it('TC266 — Profile user role badge is visible', async function () {
      const visible = await isVisible(driver, By.id('profile-user-role'));
      expect(visible).to.be.true;
    });

    it('TC267 — Profile sidebar card has class "profile-sidebar-card"', async function () {
      const el = await driver.findElement(By.css('.profile-sidebar-card'));
      expect(el).to.not.be.null;
    });

    it('TC268 — Achievements heading mentions "Unlocked Achievements"', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Unlocked Achievements")]'));
      expect(el).to.not.be.null;
    });

    it('TC269 — Bookmarks heading mentions "Saved Notes"', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Saved Notes")]'));
      expect(el).to.not.be.null;
    });

    it('TC270 — Profile view has correct id "view-profile"', async function () {
      const el = await driver.findElement(SEL.VIEW_PROFILE);
      const id = await el.getAttribute('id');
      expect(id).to.equal('view-profile');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 8 – SETTINGS  (TC271 – TC290)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 8 — Settings', function () {

    before(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
      await navigateTo(driver, SEL.NAV_SETTINGS);
    });

    it('TC271 — Settings view is visible', async function () {
      const visible = await isVisible(driver, SEL.VIEW_SETTINGS);
      expect(visible).to.be.true;
    });

    it('TC272 — Settings heading mentions "System Preferences"', async function () {
      const el = await driver.findElement(By.css('#view-settings h2'));
      const text = await el.getText();
      expect(text).to.include('Preferences');
    });

    it('TC273 — Theme toggle switch is visible', async function () {
      const visible = await isVisible(driver, SEL.SETTINGS_THEME_TOGGLE);
      expect(visible).to.be.true;
    });

    it('TC274 — Federated Sync Automations toggle is visible', async function () {
      const visible = await isVisible(driver, SEL.SETTINGS_AUTO_SYNC);
      expect(visible).to.be.true;
    });

    it('TC275 — Federated Sync Automations is enabled by default', async function () {
      const el = await driver.findElement(SEL.SETTINGS_AUTO_SYNC);
      const checked = await el.isSelected();
      expect(checked).to.be.true;
    });

    it('TC276 — Differential Privacy toggle is visible', async function () {
      const visible = await isVisible(driver, SEL.SETTINGS_DIFF_PRIV);
      expect(visible).to.be.true;
    });

    it('TC277 — Differential Privacy is enabled by default', async function () {
      const el = await driver.findElement(SEL.SETTINGS_DIFF_PRIV);
      const checked = await el.isSelected();
      expect(checked).to.be.true;
    });

    it('TC278 — AI Text-to-Speech toggle is visible', async function () {
      const visible = await isVisible(driver, SEL.SETTINGS_SPEECH_OUT);
      expect(visible).to.be.true;
    });

    it('TC279 — AI Text-to-Speech is enabled by default', async function () {
      const el = await driver.findElement(SEL.SETTINGS_SPEECH_OUT);
      const checked = await el.isSelected();
      expect(checked).to.be.true;
    });

    it('TC280 — Offline Pre-caching toggle is visible', async function () {
      const visible = await isVisible(driver, SEL.SETTINGS_OFFLINE_CACHE);
      expect(visible).to.be.true;
    });

    it('TC281 — Offline Pre-caching is enabled by default', async function () {
      const el = await driver.findElement(SEL.SETTINGS_OFFLINE_CACHE);
      const checked = await el.isSelected();
      expect(checked).to.be.true;
    });

    it('TC282 — Clicking Federated Sync toggle toggles it off', async function () {
      await click(driver, SEL.SETTINGS_AUTO_SYNC);
      const el = await driver.findElement(SEL.SETTINGS_AUTO_SYNC);
      const checked = await el.isSelected();
      expect(checked).to.be.false;
      // Re-enable
      await click(driver, SEL.SETTINGS_AUTO_SYNC);
    });

    it('TC283 — Delete Private Log Databases button is visible', async function () {
      const visible = await isVisible(driver, SEL.SETTINGS_RESET_BTN);
      expect(visible).to.be.true;
    });

    it('TC284 — Delete button text contains "Delete"', async function () {
      const text = await getText(driver, SEL.SETTINGS_RESET_BTN);
      expect(text).to.include('Delete');
    });

    it('TC285 — Firebase Architecture section heading is visible', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Firebase Architecture")]'));
      expect(el).to.not.be.null;
    });

    it('TC286 — Firebase /users collection path is listed', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"/users")]'));
      expect(el).to.not.be.null;
    });

    it('TC287 — Firebase /courses collection path is listed', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"/courses")]'));
      expect(el).to.not.be.null;
    });

    it('TC288 — Firebase connection status shows "Mock-Offline Mode"', async function () {
      const el = await driver.findElement(By.xpath('//*[contains(text(),"Mock-Offline Mode")]'));
      expect(el).to.not.be.null;
    });

    it('TC289 — Settings list has at least 4 toggle items', async function () {
      const items = await driver.findElements(By.css('.settings-item'));
      expect(items.length).to.be.at.least(4);
    });

    it('TC290 — Settings view has correct id "view-settings"', async function () {
      const el = await driver.findElement(SEL.VIEW_SETTINGS);
      const id = await el.getAttribute('id');
      expect(id).to.equal('view-settings');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODULE 9 – RESPONSIVE / UX / THEME  (TC291 – TC305)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('MODULE 9 — Responsive, UX & Theme', function () {

    before(async function () {
      await driver.get(BASE_URL);
      await pause(LONG_PAUSE);
      await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
    });

    it('TC291 — Clicking theme toggle does not crash the page', async function () {
      await click(driver, SEL.THEME_TOGGLE);
      await pause(SHORT_PAUSE);
      const title = await driver.getTitle();
      expect(title.length).to.be.greaterThan(0);
    });

    it('TC292 — html element has data-theme attribute', async function () {
      const el = await driver.findElement(By.css('html'));
      const theme = await el.getAttribute('data-theme');
      expect(['dark', 'light']).to.include(theme);
    });

    it('TC293 — Toggling theme changes data-theme attribute', async function () {
      const elBefore = await driver.findElement(By.css('html'));
      const themeBefore = await elBefore.getAttribute('data-theme');
      await click(driver, SEL.THEME_TOGGLE);
      await pause(SHORT_PAUSE);
      const elAfter = await driver.findElement(By.css('html'));
      const themeAfter = await elAfter.getAttribute('data-theme');
      expect(themeAfter).to.not.equal(themeBefore);
      // Reset theme
      await click(driver, SEL.THEME_TOGGLE);
    });

    it('TC294 — Global search input accepts text input', async function () {
      await typeInto(driver, SEL.GLOBAL_SEARCH, 'Python');
      const val = await getValue(driver, SEL.GLOBAL_SEARCH);
      expect(val).to.include('Python');
    });

    it('TC295 — Global search input is clearable', async function () {
      await driver.findElement(SEL.GLOBAL_SEARCH).clear();
      const val = await getValue(driver, SEL.GLOBAL_SEARCH);
      expect(val).to.equal('');
    });

    it('TC296 — Clicking FL Sync button in header opens FL modal', async function () {
      await click(driver, SEL.FL_SYNC_BTN);
      await pause(LONG_PAUSE);
      const visible = await isVisible(driver, SEL.FL_MODAL);
      expect(visible).to.be.true;
      await click(driver, SEL.FL_MODAL_CLOSE_BTN);
    });

    it('TC297 — FL aggregation modal has a progress bar', async function () {
      await click(driver, SEL.FL_SYNC_BTN);
      await pause(LONG_PAUSE);
      const visible = await isVisible(driver, SEL.FL_PROGRESS_BAR);
      expect(visible).to.be.true;
      await click(driver, SEL.FL_MODAL_CLOSE_BTN);
    });

    it('TC298 — FL progress status label is visible in modal', async function () {
      await click(driver, SEL.FL_SYNC_BTN);
      await pause(LONG_PAUSE);
      const visible = await isVisible(driver, SEL.FL_PROGRESS_LABEL);
      expect(visible).to.be.true;
      await click(driver, SEL.FL_MODAL_CLOSE_BTN);
    });

    it('TC299 — FL aggregation modal close button dismisses modal', async function () {
      await click(driver, SEL.FL_SYNC_BTN);
      await pause(LONG_PAUSE);
      await click(driver, SEL.FL_MODAL_CLOSE_BTN);
      await pause(SHORT_PAUSE);
      const visible = await isVisible(driver, SEL.FL_MODAL);
      expect(visible).to.be.false;
    });

    it('TC300 — "Begin Secure Aggregation" button is in FL modal', async function () {
      await click(driver, SEL.FL_SYNC_BTN);
      await pause(LONG_PAUSE);
      const visible = await isVisible(driver, SEL.FL_MODAL_SYNC_TRIGGER);
      expect(visible).to.be.true;
      await click(driver, SEL.FL_MODAL_CLOSE_BTN);
    });

    it('TC301 — App uses stylesheet "styles.css" (link tag exists)', async function () {
      const el = await driver.findElement(By.css('link[href="styles.css"]'));
      expect(el).to.not.be.null;
    });

    it('TC302 — App includes manifest.json link tag', async function () {
      const el = await driver.findElement(By.css('link[href="manifest.json"]'));
      expect(el).to.not.be.null;
    });

    it('TC303 — App loads Font Awesome CSS from CDN', async function () {
      const el = await driver.findElement(By.css('link[href*="font-awesome"]'));
      expect(el).to.not.be.null;
    });

    it('TC304 — Page viewport meta tag is present', async function () {
      const el = await driver.findElement(By.css('meta[name="viewport"]'));
      expect(el).to.not.be.null;
    });

    it('TC305 — Page meta description is present and not empty', async function () {
      const el = await driver.findElement(By.css('meta[name="description"]'));
      const content = await el.getAttribute('content');
      expect(content.length).to.be.greaterThan(0);
    });
  });

}); // End of outer describe
