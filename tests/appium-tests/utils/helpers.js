/**
 * helpers.js
 * Shared helper utilities for Appium test suites
 */

const SELECTORS = {
  // Auth
  AUTH_MODAL:         '//android.webkit.WebView//div[@id="auth-modal"]',
  LOGIN_EMAIL:        '//android.webkit.WebView//input[@id="login-email"]',
  LOGIN_PASSWORD:     '//android.webkit.WebView//input[@id="login-password"]',
  LOGIN_SUBMIT:       '//android.webkit.WebView//button[@type="submit"]',
  REG_NAME:           '//android.webkit.WebView//input[@id="reg-name"]',
  REG_EMAIL:          '//android.webkit.WebView//input[@id="reg-email"]',
  REG_PASSWORD:       '//android.webkit.WebView//input[@id="reg-password"]',
  AUTH_TAB_REGISTER:  '//android.webkit.WebView//button[@id="auth-tab-register"]',
  AUTH_TAB_LOGIN:     '//android.webkit.WebView//button[@id="auth-tab-login"]',

  // Navigation
  NAV_HOME:           '//android.webkit.WebView//a[@id="float-nav-home"]',
  NAV_COURSES:        '//android.webkit.WebView//a[@id="float-nav-courses"]',
  NAV_TUTOR:          '//android.webkit.WebView//a[@id="float-nav-tutor"]',
  NAV_PROGRESS:       '//android.webkit.WebView//a[@id="float-nav-progress"]',
  NAV_PROFILE:        '//android.webkit.WebView//a[@id="float-nav-profile"]',
  NAV_SETTINGS:       '//android.webkit.WebView//a[@id="float-nav-settings"]',

  // Home
  WELCOME_CARD:       '//android.webkit.WebView//div[contains(@class,"welcome-card")]',
  STREAK_CARD:        '//android.webkit.WebView//div[contains(@class,"streak-card")]',

  // Courses
  COURSES_GRID:       '//android.webkit.WebView//div[@class="courses-grid"]',
  COURSE_CARD:        '//android.webkit.WebView//div[contains(@class,"course-card")]',
  SEARCH_INPUT:       '//android.webkit.WebView//input[@id="courses-search-input"]',

  // AI Tutor
  CHAT_INPUT:         '//android.webkit.WebView//input[@id="tutor-chat-input"]',
  CHAT_SEND_BTN:      '//android.webkit.WebView//button[@id="tutor-send-btn"]',
  MESSAGES_BOX:       '//android.webkit.WebView//div[@id="tutor-messages-box"]',
  MIC_BTN:            '//android.webkit.WebView//button[@id="tutor-mic-btn"]',
  QUICK_QUIZ_BTN:     '//android.webkit.WebView//button[@id="tutor-quick-quiz-btn"]',

  // Settings
  THEME_TOGGLE:       '//android.webkit.WebView//input[@id="settings-theme-toggle"]',
  AUTO_SYNC:          '//android.webkit.WebView//input[@id="settings-auto-sync"]',
  DIFF_PRIV:          '//android.webkit.WebView//input[@id="settings-diff-priv"]',
  SPEECH_OUT:         '//android.webkit.WebView//input[@id="settings-speech-out"]',
  RESET_LOGS_BTN:     '//android.webkit.WebView//button[@id="settings-reset-logs-btn"]',

  // Progress
  STATS_DURATION:     '//android.webkit.WebView//span[@id="stats-duration"]',
  STATS_STREAK:       '//android.webkit.WebView//span[@id="stats-streak"]',
  STATS_TOPICS:       '//android.webkit.WebView//span[@id="stats-topics"]',
  STATS_QUIZ_ACC:     '//android.webkit.WebView//span[@id="stats-quiz-acc"]',

  // Profile
  PROFILE_NAME:       '//android.webkit.WebView//h2[@id="profile-full-name"]',
  PROFILE_EDIT_BTN:   '//android.webkit.WebView//button[@id="profile-edit-btn"]',
};

async function waitForElement(selector, timeout = 15000) {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout });
  return el;
}

async function tapElement(selector, timeout = 15000) {
  const el = await waitForElement(selector, timeout);
  await el.click();
}

async function typeText(selector, text, timeout = 15000) {
  const el = await waitForElement(selector, timeout);
  await el.clearValue();
  await el.setValue(text);
}

async function getElementText(selector, timeout = 15000) {
  const el = await waitForElement(selector, timeout);
  return el.getText();
}

async function isDisplayed(selector, timeout = 8000) {
  try {
    const el = await $(selector);
    return el.waitForDisplayed({ timeout });
  } catch (e) {
    return false;
  }
}

async function login(email = 'test@smartlearn.com', password = 'Test@1234') {
  await tapElement(SELECTORS.AUTH_TAB_LOGIN);
  await typeText(SELECTORS.LOGIN_EMAIL, email);
  await typeText(SELECTORS.LOGIN_PASSWORD, password);
  await tapElement(SELECTORS.LOGIN_SUBMIT);
  await browser.pause(2000);
}

async function register(name, email, password) {
  await tapElement(SELECTORS.AUTH_TAB_REGISTER);
  await typeText(SELECTORS.REG_NAME, name);
  await typeText(SELECTORS.REG_EMAIL, email);
  await typeText(SELECTORS.REG_PASSWORD, password);
  await tapElement(SELECTORS.LOGIN_SUBMIT);
  await browser.pause(2000);
}

async function navigateTo(view) {
  const navMap = {
    home:     SELECTORS.NAV_HOME,
    courses:  SELECTORS.NAV_COURSES,
    tutor:    SELECTORS.NAV_TUTOR,
    progress: SELECTORS.NAV_PROGRESS,
    profile:  SELECTORS.NAV_PROFILE,
    settings: SELECTORS.NAV_SETTINGS,
  };
  await tapElement(navMap[view]);
  await browser.pause(1500);
}

async function scrollDown(amount = 500) {
  const startX = 540;
  const startY = 1200;
  const endY = startY - amount;
  await browser.action('pointer', {
    parameters: { pointerType: 'touch' }
  })
    .move({ x: startX, y: startY })
    .down()
    .move({ x: startX, y: endY, duration: 300 })
    .up()
    .perform();
}

module.exports = {
  SELECTORS,
  waitForElement,
  tapElement,
  typeText,
  getElementText,
  isDisplayed,
  login,
  register,
  navigateTo,
  scrollDown
};
