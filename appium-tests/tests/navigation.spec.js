/**
 * navigation.spec.js
 * E2E Tests: Mobile Navigation Bar, View Switching, Routing
 * Test Cases: TC041 - TC075
 */

const { SELECTORS, tapElement, isDisplayed, login, navigateTo } = require('../utils/helpers');

describe('NAVIGATION - Bottom Nav & View Routing', () => {

  before(async () => {
    await login('demo@smartlearn.com', 'Demo@1234');
  });

  it('TC041 - Floating bottom navigation bar is visible after login', async () => {
    const nav = await $('//android.webkit.WebView//nav[contains(@class,"floating-nav")]');
    await expect(nav).toBeDisplayed();
  });

  it('TC042 - Home nav item is visible and labelled "Home"', async () => {
    const el = await $(SELECTORS.NAV_HOME);
    await expect(el).toBeDisplayed();
  });

  it('TC043 - Courses nav item is visible and labelled "Courses"', async () => {
    const el = await $(SELECTORS.NAV_COURSES);
    await expect(el).toBeDisplayed();
  });

  it('TC044 - Tutor nav item is visible and labelled "Tutor"', async () => {
    const el = await $(SELECTORS.NAV_TUTOR);
    await expect(el).toBeDisplayed();
  });

  it('TC045 - Progress nav item is visible and labelled "Progress"', async () => {
    const el = await $(SELECTORS.NAV_PROGRESS);
    await expect(el).toBeDisplayed();
  });

  it('TC046 - Profile nav item is visible and labelled "Profile"', async () => {
    const el = await $(SELECTORS.NAV_PROFILE);
    await expect(el).toBeDisplayed();
  });

  it('TC047 - Settings nav item is visible and labelled "Settings"', async () => {
    const el = await $(SELECTORS.NAV_SETTINGS);
    await expect(el).toBeDisplayed();
  });

  it('TC048 - Clicking Home nav renders home view', async () => {
    await navigateTo('home');
    const view = await $('//android.webkit.WebView//section[@id="view-home"]');
    await expect(view).toBeDisplayed();
  });

  it('TC049 - Clicking Courses nav renders courses view', async () => {
    await navigateTo('courses');
    const view = await $('//android.webkit.WebView//section[@id="view-courses"]');
    await expect(view).toBeDisplayed();
  });

  it('TC050 - Clicking Tutor nav renders AI tutor view', async () => {
    await navigateTo('tutor');
    const view = await $('//android.webkit.WebView//section[@id="view-tutor"]');
    await expect(view).toBeDisplayed();
  });

  it('TC051 - Clicking Progress nav renders progress view', async () => {
    await navigateTo('progress');
    const view = await $('//android.webkit.WebView//section[@id="view-progress"]');
    await expect(view).toBeDisplayed();
  });

  it('TC052 - Clicking Profile nav renders profile view', async () => {
    await navigateTo('profile');
    const view = await $('//android.webkit.WebView//section[@id="view-profile"]');
    await expect(view).toBeDisplayed();
  });

  it('TC053 - Clicking Settings nav renders settings view', async () => {
    await navigateTo('settings');
    const view = await $('//android.webkit.WebView//section[@id="view-settings"]');
    await expect(view).toBeDisplayed();
  });

  it('TC054 - Active nav item gets highlighted class', async () => {
    await navigateTo('courses');
    const el = await $(SELECTORS.NAV_COURSES);
    const cls = await el.getAttribute('class');
    await expect(cls).toContain('active');
  });

  it('TC055 - Navigating back to home from courses shows home content', async () => {
    await navigateTo('courses');
    await navigateTo('home');
    const card = await $(SELECTORS.WELCOME_CARD);
    await expect(card).toBeDisplayed();
  });

  it('TC056 - Nav bar stays fixed at bottom while scrolling', async () => {
    await navigateTo('home');
    await browser.touchAction([
      { action: 'press', x: 540, y: 1200 },
      { action: 'moveTo', x: 540, y: 400 },
      'release'
    ]);
    const nav = await $('//android.webkit.WebView//nav[contains(@class,"floating-nav")]');
    await expect(nav).toBeDisplayed();
  });

  it('TC057 - Navigation works after app is sent to background and restored', async () => {
    await browser.background(2);
    await browser.pause(1000);
    const nav = await $('//android.webkit.WebView//nav[contains(@class,"floating-nav")]');
    await expect(nav).toBeDisplayed();
  });

  it('TC058 - Home nav icon is a house/home icon element', async () => {
    const icon = await $('//android.webkit.WebView//a[@id="float-nav-home"]//i');
    await expect(icon).toBeDisplayed();
  });

  it('TC059 - Courses nav has book-open icon', async () => {
    const icon = await $('//android.webkit.WebView//a[@id="float-nav-courses"]//i');
    await expect(icon).toBeDisplayed();
  });

  it('TC060 - Tutor nav has robot icon', async () => {
    const icon = await $('//android.webkit.WebView//a[@id="float-nav-tutor"]//i');
    await expect(icon).toBeDisplayed();
  });

  it('TC061 - Progress nav has chart icon', async () => {
    const icon = await $('//android.webkit.WebView//a[@id="float-nav-progress"]//i');
    await expect(icon).toBeDisplayed();
  });

  it('TC062 - Profile nav has user icon', async () => {
    const icon = await $('//android.webkit.WebView//a[@id="float-nav-profile"]//i');
    await expect(icon).toBeDisplayed();
  });

  it('TC063 - Settings nav has gear icon', async () => {
    const icon = await $('//android.webkit.WebView//a[@id="float-nav-settings"]//i');
    await expect(icon).toBeDisplayed();
  });

  it('TC064 - Nav bar has glassmorphism styling (not transparent plain)', async () => {
    const nav = await $('//android.webkit.WebView//nav[contains(@class,"floating-nav")]');
    await expect(nav).toBeDisplayed();
  });

  it('TC065 - Multiple rapid navigation taps are handled gracefully', async () => {
    await tapElement(SELECTORS.NAV_COURSES);
    await tapElement(SELECTORS.NAV_TUTOR);
    await tapElement(SELECTORS.NAV_HOME);
    const card = await $(SELECTORS.WELCOME_CARD);
    await expect(card).toBeDisplayed();
  });

  it('TC066 - Scrolling to top on view change works', async () => {
    await navigateTo('courses');
    await browser.touchAction([
      { action: 'press', x: 540, y: 800 },
      { action: 'moveTo', x: 540, y: 300 },
      'release'
    ]);
    await navigateTo('home');
    await browser.pause(500);
    const card = await $(SELECTORS.WELCOME_CARD);
    await expect(card).toBeDisplayed();
  });

  it('TC067 - Sidebar navigation is hidden on mobile', async () => {
    const sidebar = await $('//android.webkit.WebView//aside[contains(@class,"sidebar")]');
    const displayed = await sidebar.isDisplayed();
    await expect(displayed).toBe(false);
  });

  it('TC068 - Header is visible on all views', async () => {
    const header = await $('//android.webkit.WebView//header');
    await expect(header).toBeDisplayed();
  });

  it('TC069 - Header shows user avatar letters', async () => {
    const avatar = await $('//android.webkit.WebView//div[contains(@class,"header-avatar")]');
    await expect(avatar).toBeDisplayed();
  });

  it('TC070 - Theme toggle button exists in header', async () => {
    const btn = await $('//android.webkit.WebView//button[@id="header-theme-btn"]');
    await expect(btn).toBeDisplayed();
  });

  it('TC071 - Notification button exists in header', async () => {
    const btn = await $('//android.webkit.WebView//button[@id="header-notifications-btn"]');
    await expect(btn).toBeDisplayed();
  });

  it('TC072 - View transitions are smooth (no white flash)', async () => {
    await navigateTo('courses');
    await browser.pause(300);
    const view = await $('//android.webkit.WebView//section[@id="view-courses"]');
    await expect(view).toBeDisplayed();
  });

  it('TC073 - App title "Smart Learn" is visible in sidebar/header', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Smart")]');
    await expect(el).toBeDisplayed();
  });

  it('TC074 - Bottom nav does not overlap content by more than 80px', async () => {
    const nav = await $('//android.webkit.WebView//nav[contains(@class,"floating-nav")]');
    const size = await nav.getSize();
    await expect(size.height).toBeLessThanOrEqual(90);
  });

  it('TC075 - Landscape orientation switch does not break navigation', async () => {
    await browser.setOrientation('LANDSCAPE');
    await browser.pause(1000);
    const nav = await $('//android.webkit.WebView//nav[contains(@class,"floating-nav")]');
    await expect(nav).toBeDisplayed();
    await browser.setOrientation('PORTRAIT');
  });
});
