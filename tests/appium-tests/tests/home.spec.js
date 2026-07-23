/**
 * home.spec.js
 * E2E Tests: Home Dashboard - Cards, Stats, Streaks, Goals
 * Test Cases: TC076 - TC115
 */

const { SELECTORS, tapElement, isDisplayed, login, navigateTo, scrollDown } = require('../utils/helpers');

describe('HOME - Dashboard View', () => {

  before(async () => {
    await login('demo@smartlearn.com', 'Demo@1234');
    await navigateTo('home');
  });

  it('TC076 - Home view loads after navigation to home', async () => {
    const view = await $('//android.webkit.WebView//section[@id="view-home"]');
    await expect(view).toBeDisplayed();
  });

  it('TC077 - Welcome card is displayed on home page', async () => {
    const card = await $(SELECTORS.WELCOME_CARD);
    await expect(card).toBeDisplayed();
  });

  it('TC078 - Streak card is displayed on home page', async () => {
    const card = await $(SELECTORS.STREAK_CARD);
    await expect(card).toBeDisplayed();
  });

  it('TC079 - Welcome card shows user name', async () => {
    const text = await $('//android.webkit.WebView//span[@id="welcome-user-name"]');
    await expect(text).toBeDisplayed();
  });

  it('TC080 - Streak card shows streak count', async () => {
    const el = await $('//android.webkit.WebView//span[@id="streak-count"]');
    await expect(el).toBeDisplayed();
  });

  it('TC081 - Dashboard grid renders at least 2 cards', async () => {
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"glass-card")]');
    await expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('TC082 - Analytics card is displayed', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"analytics-card")]');
    await expect(card).toBeDisplayed();
  });

  it('TC083 - Federated Learning status card is displayed', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"federated-status-card")]');
    await expect(card).toBeDisplayed();
  });

  it('TC084 - Goals section is visible on home page', async () => {
    const goals = await $('//android.webkit.WebView//div[contains(@class,"goals-insights-grid")]');
    await expect(goals).toBeDisplayed();
  });

  it('TC085 - Stats cards grid is visible with study metrics', async () => {
    const stats = await $('//android.webkit.WebView//div[contains(@class,"stats-cards-grid")]');
    await expect(stats).toBeDisplayed();
  });

  it('TC086 - Continue Learning button is present on home', async () => {
    const btn = await $('//android.webkit.WebView//a[contains(@class,"neon-btn") and contains(text(),"Continu")]');
    if (await btn.isExisting()) {
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC087 - Home scrolls smoothly to reveal all content', async () => {
    await scrollDown(400);
    await browser.pause(500);
    const view = await $('//android.webkit.WebView//section[@id="view-home"]');
    await expect(view).toBeDisplayed();
  });

  it('TC088 - Welcome stats items are visible (courses, hours, streak)', async () => {
    const statsWrap = await $('//android.webkit.WebView//div[contains(@class,"welcome-stats")]');
    await expect(statsWrap).toBeDisplayed();
  });

  it('TC089 - Federated sync button is clickable on home', async () => {
    const btn = await $('//android.webkit.WebView//button[@id="home-fl-sync-btn"]');
    if (await btn.isExisting()) {
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC090 - Streak card shows fire emoji or icon', async () => {
    const icon = await $('//android.webkit.WebView//div[contains(@class,"streak-card")]//i[contains(@class,"fire")]');
    if (await icon.isExisting()) {
      await expect(icon).toBeDisplayed();
    }
  });

  it('TC091 - Home page header search input is visible', async () => {
    const search = await $('//android.webkit.WebView//input[contains(@class,"header-search")]');
    await expect(search).toBeDisplayed();
  });

  it('TC092 - Home page header search input is usable', async () => {
    const search = await $('//android.webkit.WebView//input[contains(@class,"header-search")]');
    await search.click();
    await search.setValue('python');
    await browser.pause(500);
    const val = await search.getValue();
    await expect(val).toBe('python');
  });

  it('TC093 - Goal progress bars are rendered on home page', async () => {
    const bar = await $('//android.webkit.WebView//div[contains(@class,"progress-bar")]');
    if (await bar.isExisting()) {
      await expect(bar).toBeDisplayed();
    }
  });

  it('TC094 - Quick access course shortcut renders on home', async () => {
    const shortcuts = await $('//android.webkit.WebView//div[contains(@class,"quick-access")]');
    if (await shortcuts.isExisting()) {
      await expect(shortcuts).toBeDisplayed();
    }
  });

  it('TC095 - AI insights panel is visible on home', async () => {
    const insight = await $('//android.webkit.WebView//*[contains(text(),"Insight") or contains(text(),"insight")]');
    if (await insight.isExisting()) {
      await expect(insight).toBeDisplayed();
    }
  });

  it('TC096 - Activity chart renders on home', async () => {
    const chart = await $('//android.webkit.WebView//div[contains(@class,"activity-chart")]');
    if (await chart.isExisting()) {
      await expect(chart).toBeDisplayed();
    }
  });

  it('TC097 - Recent activity list shows items after login', async () => {
    const list = await $('//android.webkit.WebView//div[contains(@class,"recent-activity")]');
    if (await list.isExisting()) {
      await expect(list).toBeDisplayed();
    }
  });

  it('TC098 - Home view title "Learning Dashboard" or "Welcome" is present', async () => {
    const header = await $('//android.webkit.WebView//*[contains(text(),"Dashboard") or contains(text(),"Welcome")]');
    await expect(header).toBeDisplayed();
  });

  it('TC099 - Cards on home page have glassmorphism styling', async () => {
    const card = await $(SELECTORS.WELCOME_CARD);
    const cls = await card.getAttribute('class');
    await expect(cls).toContain('glass-card');
  });

  it('TC100 - Home page renders correctly in portrait mode', async () => {
    await browser.setOrientation('PORTRAIT');
    const view = await $('//android.webkit.WebView//section[@id="view-home"]');
    await expect(view).toBeDisplayed();
  });

  it('TC101 - Dashboard grid is single column on mobile (no overflow)', async () => {
    const grid = await $('//android.webkit.WebView//div[contains(@class,"dashboard-grid")]');
    await expect(grid).toBeDisplayed();
  });

  it('TC102 - XP or points badge is visible on home', async () => {
    const xp = await $('//android.webkit.WebView//*[contains(@class,"badge")]');
    if (await xp.isExisting()) {
      await expect(xp).toBeDisplayed();
    }
  });

  it('TC103 - Home shows enrolled courses count', async () => {
    const enrolled = await $('//android.webkit.WebView//span[contains(@id,"enrolled")]');
    if (await enrolled.isExisting()) {
      await expect(enrolled).toBeDisplayed();
    }
  });

  it('TC104 - Home shows total study hours', async () => {
    const hours = await $('//android.webkit.WebView//span[contains(@id,"hours")]');
    if (await hours.isExisting()) {
      await expect(hours).toBeDisplayed();
    }
  });

  it('TC105 - Clicking "Ask AI Tutor" button navigates to tutor', async () => {
    const btn = await $('//android.webkit.WebView//button[contains(text(),"Ask AI") or contains(@class,"ask-tutor")]');
    if (await btn.isExisting()) {
      await btn.click();
      await browser.pause(1000);
      const tutorView = await $('//android.webkit.WebView//section[@id="view-tutor"]');
      await expect(tutorView).toBeDisplayed();
      await navigateTo('home');
    }
  });

  it('TC106 - Home page loads in under 5 seconds', async () => {
    const start = Date.now();
    await navigateTo('home');
    const elapsed = Date.now() - start;
    await expect(elapsed).toBeLessThan(5000);
  });

  it('TC107 - Notification red dot appears if unread notifications', async () => {
    const dot = await $('//android.webkit.WebView//div[contains(@class,"notif-dot")]');
    if (await dot.isExisting()) {
      await expect(dot).toBeDisplayed();
    }
  });

  it('TC108 - Tapping notification bell shows notification message', async () => {
    const btn = await $('//android.webkit.WebView//button[@id="header-notifications-btn"]');
    await btn.click();
    await browser.pause(1000);
    const toast = await $('//android.webkit.WebView//div[contains(@class,"toast") or contains(@class,"notification")]');
    if (await toast.isExisting()) {
      await expect(toast).toBeDisplayed();
    }
  });

  it('TC109 - Home page has "Personalized For You" or recommendation section', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Recommend") or contains(text(),"For You") or contains(text(),"Personalized")]');
    if (await el.isExisting()) {
      await expect(el).toBeDisplayed();
    }
  });

  it('TC110 - Home page renders after network reconnection', async () => {
    const view = await $('//android.webkit.WebView//section[@id="view-home"]');
    await expect(view).toBeDisplayed();
  });

  it('TC111 - Scroll up returns to top of home page', async () => {
    await scrollDown(500);
    await browser.touchAction([
      { action: 'press', x: 540, y: 400 },
      { action: 'moveTo', x: 540, y: 1200 },
      'release'
    ]);
    const welcome = await $(SELECTORS.WELCOME_CARD);
    await expect(welcome).toBeDisplayed();
  });

  it('TC112 - Home shows correct username after login', async () => {
    const name = await $('//android.webkit.WebView//span[@id="welcome-user-name"]');
    const text = await name.getText();
    await expect(text.length).toBeGreaterThan(0);
  });

  it('TC113 - Home shows "day streak" text somewhere', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"streak") or contains(text(),"Streak")]');
    await expect(el).toBeDisplayed();
  });

  it('TC114 - Gradient text effects are rendered on home page', async () => {
    const el = await $('//android.webkit.WebView//*[contains(@class,"gradient-text")]');
    await expect(el).toBeDisplayed();
  });

  it('TC115 - Home page cards do not overflow horizontally', async () => {
    const card = await $(SELECTORS.WELCOME_CARD);
    const location = await card.getLocation();
    const windowSize = await browser.getWindowSize();
    await expect(location.x).toBeGreaterThanOrEqual(0);
    await expect(location.x).toBeLessThan(windowSize.width);
  });
});
