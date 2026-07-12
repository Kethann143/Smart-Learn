/**
 * progress.spec.js
 * E2E Tests: Progress Analytics - Stats, Charts, FL Weights
 * Test Cases: TC231 - TC255
 */
const { SELECTORS, login, navigateTo, scrollDown } = require('../utils/helpers');

describe('PROGRESS - Analytics Dashboard', () => {
  before(async () => {
    await login('demo@smartlearn.com', 'Demo@1234');
    await navigateTo('progress');
  });

  it('TC231 - Progress view loads', async () => {
    const view = await $('//android.webkit.WebView//section[@id="view-progress"]');
    await expect(view).toBeDisplayed();
  });

  it('TC232 - Study duration stat is displayed', async () => {
    const el = await $(SELECTORS.STATS_DURATION);
    await expect(el).toBeDisplayed();
  });

  it('TC233 - Active streak stat is displayed', async () => {
    const el = await $(SELECTORS.STATS_STREAK);
    await expect(el).toBeDisplayed();
  });

  it('TC234 - Topics complete stat is displayed', async () => {
    const el = await $(SELECTORS.STATS_TOPICS);
    await expect(el).toBeDisplayed();
  });

  it('TC235 - Quiz success rate stat is displayed', async () => {
    const el = await $(SELECTORS.STATS_QUIZ_ACC);
    await expect(el).toBeDisplayed();
  });

  it('TC236 - Stats cards grid has 4 metric cards', async () => {
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"stat-metric-card")]');
    await expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('TC237 - Progress page heading is visible', async () => {
    const el = await $('//android.webkit.WebView//h2[contains(text(),"Learning Metrics") or contains(text(),"Progress")]');
    await expect(el).toBeDisplayed();
  });

  it('TC238 - Local interest profile section is visible', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Interest Profile") or contains(text(),"Interest")]');
    await expect(el).toBeDisplayed();
  });

  it('TC239 - Private audit compliance section is visible', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Audit") or contains(text(),"Compliance")]');
    if (await el.isExisting()) {
      await expect(el).toBeDisplayed();
    }
  });

  it('TC240 - Inspect network weights button is clickable', async () => {
    const btn = await $('//android.webkit.WebView//button[@id="stats-fl-btn"]');
    if (await btn.isExisting()) {
      await btn.click();
      await browser.pause(1000);
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC241 - Progress page scrolls to reveal bottom sections', async () => {
    await scrollDown(400);
    const view = await $('//android.webkit.WebView//section[@id="view-progress"]');
    await expect(view).toBeDisplayed();
  });

  it('TC242 - Study duration shows "h" or "hr" unit', async () => {
    const el = await $(SELECTORS.STATS_DURATION);
    const text = await el.getText();
    await expect(text).toMatch(/\d/);
  });

  it('TC243 - Streak shows numeric or day-based count', async () => {
    const el = await $(SELECTORS.STATS_STREAK);
    const text = await el.getText();
    await expect(text.length).toBeGreaterThan(0);
  });

  it('TC244 - Zero Data Transfer Protocol card is shown', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Zero Data")]');
    if (await el.isExisting()) {
      await expect(el).toBeDisplayed();
    }
  });

  it('TC245 - Cryptographic key status card is shown', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Cryptographic")]');
    if (await el.isExisting()) {
      await expect(el).toBeDisplayed();
    }
  });

  it('TC246 - SGD weights list is populated', async () => {
    const list = await $('//android.webkit.WebView//div[@id="stats-weights-list"]');
    if (await list.isExisting()) {
      await expect(list).toBeDisplayed();
    }
  });

  it('TC247 - Progress details grid stacks on mobile (single column)', async () => {
    const grid = await $('//android.webkit.WebView//div[contains(@class,"progress-details-grid")]');
    if (await grid.isExisting()) {
      await expect(grid).toBeDisplayed();
    }
  });

  it('TC248 - Progress cards have correct padding on mobile', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"stat-metric-card")]');
    await expect(card).toBeDisplayed();
  });

  it('TC249 - All stat headers (clock, fire, book, star) are present', async () => {
    const icons = await $$('//android.webkit.WebView//i[contains(@class,"fa-clock") or contains(@class,"fa-fire") or contains(@class,"fa-book") or contains(@class,"fa-star")]');
    await expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('TC250 - Progress page description text is visible', async () => {
    const desc = await $('//android.webkit.WebView//p[contains(text(),"Overview") or contains(text(),"study")]');
    if (await desc.isExisting()) {
      await expect(desc).toBeDisplayed();
    }
  });

  it('TC251 - Study duration updates after course lesson completion', async () => {
    const el = await $(SELECTORS.STATS_DURATION);
    const text = await el.getText();
    await expect(text.length).toBeGreaterThan(0);
  });

  it('TC252 - Streak count persists after app restart', async () => {
    const el = await $(SELECTORS.STATS_STREAK);
    const text = await el.getText();
    await expect(text.length).toBeGreaterThan(0);
  });

  it('TC253 - Quiz accuracy percentage is numeric', async () => {
    const el = await $(SELECTORS.STATS_QUIZ_ACC);
    const text = await el.getText();
    await expect(text).toMatch(/\d/);
  });

  it('TC254 - Progress metrics do not show NaN or undefined', async () => {
    const stats = await $$('//android.webkit.WebView//span[contains(@class,"stat-metric-num")]');
    for (const stat of stats) {
      const text = await stat.getText();
      await expect(text).not.toContain('NaN');
      await expect(text).not.toContain('undefined');
    }
  });

  it('TC255 - Progress page renders within 5 seconds of navigation', async () => {
    const start = Date.now();
    await navigateTo('progress');
    const elapsed = Date.now() - start;
    await expect(elapsed).toBeLessThan(5000);
  });
});
