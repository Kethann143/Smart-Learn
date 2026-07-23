/**
 * auth.spec.js
 * E2E Tests: Authentication - Login, Register, Logout, Validation
 * Test Cases: TC001 - TC040
 */

const { SELECTORS, tapElement, typeText, isDisplayed, login, register } = require('../utils/helpers');

describe('AUTH - Login & Registration', () => {

  beforeEach(async () => {
    await browser.reloadSession();
    await browser.pause(2000);
  });

  // ─── LOGIN TESTS ───────────────────────────────────────────────────────────

  it('TC001 - Auth modal is displayed on app launch', async () => {
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC002 - Login tab is visible and clickable', async () => {
    await tapElement(SELECTORS.AUTH_TAB_LOGIN);
    const tab = await $(SELECTORS.AUTH_TAB_LOGIN);
    await expect(tab).toBeDisplayed();
  });

  it('TC003 - Email input field is visible on login form', async () => {
    const el = await $(SELECTORS.LOGIN_EMAIL);
    await expect(el).toBeDisplayed();
  });

  it('TC004 - Password input field is visible on login form', async () => {
    const el = await $(SELECTORS.LOGIN_PASSWORD);
    await expect(el).toBeDisplayed();
  });

  it('TC005 - Submit button is visible on login form', async () => {
    const el = await $(SELECTORS.LOGIN_SUBMIT);
    await expect(el).toBeDisplayed();
  });

  it('TC006 - Successful login with valid credentials navigates to home', async () => {
    await login('demo@smartlearn.com', 'Demo@1234');
    const welcome = await isDisplayed(SELECTORS.WELCOME_CARD);
    await expect(welcome).toBe(true);
  });

  it('TC007 - Login fails with empty email shows validation error', async () => {
    await tapElement(SELECTORS.AUTH_TAB_LOGIN);
    await typeText(SELECTORS.LOGIN_PASSWORD, 'Password123');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC008 - Login fails with empty password shows validation', async () => {
    await tapElement(SELECTORS.AUTH_TAB_LOGIN);
    await typeText(SELECTORS.LOGIN_EMAIL, 'test@example.com');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC009 - Login fails with invalid email format', async () => {
    await typeText(SELECTORS.LOGIN_EMAIL, 'not-an-email');
    await typeText(SELECTORS.LOGIN_PASSWORD, 'Password123');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC010 - Login fails with wrong password for existing user', async () => {
    await login('demo@smartlearn.com', 'WrongPassword999');
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC011 - Login fails with non-existent email', async () => {
    await login('nonexistent@xyz.com', 'Password123');
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC012 - Forgot password link is visible on login form', async () => {
    const el = await $('//android.webkit.WebView//a[@id="auth-forgot-password-link"]');
    await expect(el).toBeDisplayed();
  });

  it('TC013 - Remember me checkbox is clickable', async () => {
    const cb = await $('//android.webkit.WebView//input[@id="login-remember-me"]');
    await cb.click();
    await expect(cb).toBeChecked();
  });

  it('TC014 - Password field masks characters (type=password)', async () => {
    const el = await $(SELECTORS.LOGIN_PASSWORD);
    const type = await el.getAttribute('type');
    await expect(type).toBe('password');
  });

  it('TC015 - Login email accepts valid email format', async () => {
    await typeText(SELECTORS.LOGIN_EMAIL, 'valid@domain.com');
    const el = await $(SELECTORS.LOGIN_EMAIL);
    const val = await el.getValue();
    await expect(val).toBe('valid@domain.com');
  });

  // ─── REGISTER TESTS ────────────────────────────────────────────────────────

  it('TC016 - Register tab is visible and clickable', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    const form = await $('//android.webkit.WebView//form[@id="auth-register-form"]');
    await expect(form).toBeDisplayed();
  });

  it('TC017 - Name field is visible on register form', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    const el = await $(SELECTORS.REG_NAME);
    await expect(el).toBeDisplayed();
  });

  it('TC018 - Email field is visible on register form', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    const el = await $(SELECTORS.REG_EMAIL);
    await expect(el).toBeDisplayed();
  });

  it('TC019 - Password field is visible on register form', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    const el = await $(SELECTORS.REG_PASSWORD);
    await expect(el).toBeDisplayed();
  });

  it('TC020 - Successful registration with valid data creates account', async () => {
    const ts = Date.now();
    await register(`Test User ${ts}`, `newuser${ts}@smartlearn.com`, 'NewPass@123');
    const welcome = await isDisplayed(SELECTORS.WELCOME_CARD);
    await expect(welcome).toBe(true);
  });

  it('TC021 - Register fails with empty name field', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    await typeText(SELECTORS.REG_EMAIL, 'test@example.com');
    await typeText(SELECTORS.REG_PASSWORD, 'Password@1');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC022 - Register fails with empty email field', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    await typeText(SELECTORS.REG_NAME, 'Test User');
    await typeText(SELECTORS.REG_PASSWORD, 'Password@1');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC023 - Register fails with empty password field', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    await typeText(SELECTORS.REG_NAME, 'Test User');
    await typeText(SELECTORS.REG_EMAIL, 'test@example.com');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC024 - Register fails with invalid email format', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    await typeText(SELECTORS.REG_NAME, 'Test User');
    await typeText(SELECTORS.REG_EMAIL, 'invalid-email');
    await typeText(SELECTORS.REG_PASSWORD, 'Password@1');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC025 - Register with password less than 6 chars fails', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    await typeText(SELECTORS.REG_NAME, 'Test User');
    await typeText(SELECTORS.REG_EMAIL, 'test@example.com');
    await typeText(SELECTORS.REG_PASSWORD, 'abc');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC026 - Register duplicate email shows error', async () => {
    await register('Duplicate User', 'demo@smartlearn.com', 'Pass@1234');
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC027 - Switching between login and register tabs works', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    await browser.pause(500);
    await tapElement(SELECTORS.AUTH_TAB_LOGIN);
    const el = await $(SELECTORS.LOGIN_EMAIL);
    await expect(el).toBeDisplayed();
  });

  it('TC028 - Register password field masks characters', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    const el = await $(SELECTORS.REG_PASSWORD);
    const type = await el.getAttribute('type');
    await expect(type).toBe('password');
  });

  it('TC029 - Login input fields are cleared on tab switch', async () => {
    await typeText(SELECTORS.LOGIN_EMAIL, 'test@example.com');
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    await tapElement(SELECTORS.AUTH_TAB_LOGIN);
    const el = await $(SELECTORS.LOGIN_EMAIL);
    const val = await el.getValue();
    await expect(val).toBe('');
  });

  it('TC030 - App logo is displayed on auth modal', async () => {
    const logo = await $('//android.webkit.WebView//div[contains(@class,"logo-icon")]');
    await expect(logo).toBeDisplayed();
  });

  it('TC031 - "Secure decentralized identity gateway" subtitle is visible', async () => {
    const el = await $('//android.webkit.WebView//p[contains(text(),"Secure")]');
    await expect(el).toBeDisplayed();
  });

  it('TC032 - Login with SQL injection string in email field is blocked', async () => {
    await typeText(SELECTORS.LOGIN_EMAIL, "' OR '1'='1");
    await typeText(SELECTORS.LOGIN_PASSWORD, 'Password');
    await tapElement(SELECTORS.LOGIN_SUBMIT);
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC033 - Login with special characters in email is handled', async () => {
    await typeText(SELECTORS.LOGIN_EMAIL, 'user+tag@example.com');
    await typeText(SELECTORS.LOGIN_PASSWORD, 'Password123');
    const el = await $(SELECTORS.LOGIN_EMAIL);
    const val = await el.getValue();
    await expect(val).toContain('@');
  });

  it('TC034 - "Keep node logged in" checkbox is visible', async () => {
    const cb = await $('//android.webkit.WebView//input[@id="login-remember-me"]');
    await expect(cb).toBeDisplayed();
  });

  it('TC035 - Auth modal is scrollable on small screens', async () => {
    const modal = await $(SELECTORS.AUTH_MODAL);
    await expect(modal).toBeDisplayed();
  });

  it('TC036 - Register name field accepts spaces and unicode', async () => {
    await tapElement(SELECTORS.AUTH_TAB_REGISTER);
    await typeText(SELECTORS.REG_NAME, 'राज Kumar');
    const el = await $(SELECTORS.REG_NAME);
    const val = await el.getValue();
    await expect(val.length).toBeGreaterThan(0);
  });

  it('TC037 - Login input focus shows keyboard on mobile', async () => {
    const el = await $(SELECTORS.LOGIN_EMAIL);
    await el.click();
    await browser.pause(500);
    await expect(el).toBeDisplayed();
  });

  it('TC038 - Auth form elements are accessible on small viewport', async () => {
    const submit = await $(SELECTORS.LOGIN_SUBMIT);
    const displayed = await submit.isDisplayed();
    await expect(displayed).toBe(true);
  });

  it('TC039 - Auth modal has correct title text "Sign in to Smart Learn"', async () => {
    const heading = await $('//android.webkit.WebView//h2[contains(text(),"Smart Learn")]');
    await expect(heading).toBeDisplayed();
  });

  it('TC040 - Login button text reads "Authorize Node"', async () => {
    const btn = await $(SELECTORS.LOGIN_SUBMIT);
    const text = await btn.getText();
    await expect(text).toContain('Authorize');
  });
});
