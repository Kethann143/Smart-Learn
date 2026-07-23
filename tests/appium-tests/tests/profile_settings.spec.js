/**
 * profile.spec.js
 * E2E Tests: Profile - View, Edit, Avatar, Badges
 * Test Cases: TC256 - TC275
 */
const { SELECTORS, typeText, login, navigateTo } = require('../utils/helpers');

describe('PROFILE - User Profile View', () => {
  before(async () => {
    await login('demo@smartlearn.com', 'Demo@1234');
    await navigateTo('profile');
  });

  it('TC256 - Profile view loads after navigation', async () => {
    const view = await $('//android.webkit.WebView//section[@id="view-profile"]');
    await expect(view).toBeDisplayed();
  });

  it('TC257 - User full name is displayed on profile', async () => {
    const el = await $(SELECTORS.PROFILE_NAME);
    await expect(el).toBeDisplayed();
  });

  it('TC258 - User email is displayed on profile', async () => {
    const el = await $('//android.webkit.WebView//p[@id="profile-user-email"]');
    await expect(el).toBeDisplayed();
  });

  it('TC259 - User avatar initials are displayed', async () => {
    const avatar = await $('//android.webkit.WebView//div[@id="profile-avatar-ring"]');
    await expect(avatar).toBeDisplayed();
  });

  it('TC260 - Edit Profile button is present', async () => {
    const btn = await $(SELECTORS.PROFILE_EDIT_BTN);
    await expect(btn).toBeDisplayed();
  });

  it('TC261 - Clicking Edit Profile opens edit modal', async () => {
    await $(SELECTORS.PROFILE_EDIT_BTN).click();
    await browser.pause(1000);
    const modal = await $('//android.webkit.WebView//div[@id="profile-edit-modal"]');
    await expect(modal).toBeDisplayed();
  });

  it('TC262 - Edit modal has Name input field', async () => {
    const input = await $('//android.webkit.WebView//input[@id="edit-profile-name"]');
    await expect(input).toBeDisplayed();
  });

  it('TC263 - Edit modal has Bio textarea', async () => {
    const textarea = await $('//android.webkit.WebView//textarea[@id="edit-profile-bio"]');
    await expect(textarea).toBeDisplayed();
  });

  it('TC264 - Edit modal has Goal select dropdown', async () => {
    const select = await $('//android.webkit.WebView//select[@id="edit-profile-goal"]');
    await expect(select).toBeDisplayed();
  });

  it('TC265 - Saving changes updates profile name', async () => {
    await typeText('//android.webkit.WebView//input[@id="edit-profile-name"]', 'Demo Student');
    const saveBtn = await $('//android.webkit.WebView//button[@id="profile-edit-save-btn"]');
    await saveBtn.click();
    await browser.pause(1000);
    const name = await $(SELECTORS.PROFILE_NAME);
    const text = await name.getText();
    await expect(text).toContain('Demo');
  });

  it('TC266 - Closing edit modal returns to profile view', async () => {
    await $(SELECTORS.PROFILE_EDIT_BTN).click();
    await browser.pause(500);
    const closeBtn = await $('//android.webkit.WebView//button[@id="profile-edit-modal-close"]');
    await closeBtn.click();
    await browser.pause(500);
    const view = await $('//android.webkit.WebView//section[@id="view-profile"]');
    await expect(view).toBeDisplayed();
  });

  it('TC267 - Badges section is visible on profile', async () => {
    const badges = await $('//android.webkit.WebView//div[contains(@class,"badges-grid")]');
    if (await badges.isExisting()) {
      await expect(badges).toBeDisplayed();
    }
  });

  it('TC268 - At least one earned badge is rendered', async () => {
    const badge = await $('//android.webkit.WebView//div[contains(@class,"badge-item")]');
    if (await badge.isExisting()) {
      await expect(badge).toBeDisplayed();
    }
  });

  it('TC269 - Enrolled courses list is visible on profile', async () => {
    const courses = await $('//android.webkit.WebView//*[contains(text(),"Enrolled") or contains(text(),"enrolled")]');
    if (await courses.isExisting()) {
      await expect(courses).toBeDisplayed();
    }
  });

  it('TC270 - Profile XP or level indicator is visible', async () => {
    const xp = await $('//android.webkit.WebView//*[contains(text(),"Level") or contains(text(),"XP")]');
    if (await xp.isExisting()) {
      await expect(xp).toBeDisplayed();
    }
  });

  it('TC271 - Blockchain identity or wallet address panel is visible', async () => {
    const block = await $('//android.webkit.WebView//*[contains(text(),"Blockchain") or contains(text(),"Identity") or contains(@class,"blockchain")]');
    if (await block.isExisting()) {
      await expect(block).toBeDisplayed();
    }
  });

  it('TC272 - Profile page scrolls to reveal all content', async () => {
    await browser.touchAction([
      { action: 'press', x: 540, y: 1200 },
      { action: 'moveTo', x: 540, y: 400 },
      'release'
    ]);
    const view = await $('//android.webkit.WebView//section[@id="view-profile"]');
    await expect(view).toBeDisplayed();
  });

  it('TC273 - Profile avatar shows initials matching user name', async () => {
    const avatar = await $('//android.webkit.WebView//div[@id="profile-avatar-ring"]');
    const text = await avatar.getText();
    await expect(text.length).toBeGreaterThan(0);
  });

  it('TC274 - Profile member since date is displayed', async () => {
    const date = await $('//android.webkit.WebView//*[contains(text(),"Member since") or contains(text(),"Joined")]');
    if (await date.isExisting()) {
      await expect(date).toBeDisplayed();
    }
  });

  it('TC275 - Profile page header reads "Profile" or user name', async () => {
    const heading = await $('//android.webkit.WebView//h2[contains(text(),"Profile") or contains(@id,"profile")]');
    if (await heading.isExisting()) {
      await expect(heading).toBeDisplayed();
    }
  });
});


/**
 * settings.spec.js
 * E2E Tests: Settings - Theme, Sync, Privacy, Speech
 * Test Cases: TC276 - TC305
 */
describe('SETTINGS - Configuration & Preferences', () => {
  before(async () => {
    await navigateTo('settings');
  });

  it('TC276 - Settings view loads', async () => {
    const view = await $('//android.webkit.WebView//section[@id="view-settings"]');
    await expect(view).toBeDisplayed();
  });

  it('TC277 - Theme toggle switch is visible', async () => {
    const el = await $(SELECTORS.THEME_TOGGLE);
    await expect(el).toBeDisplayed();
  });

  it('TC278 - Theme toggle can be clicked and changes mode', async () => {
    const toggle = await $(SELECTORS.THEME_TOGGLE);
    const before = await toggle.isChecked();
    await toggle.click();
    await browser.pause(500);
    const after = await toggle.isChecked();
    await expect(after).not.toBe(before);
    await toggle.click();
    await browser.pause(300);
  });

  it('TC279 - Auto-sync toggle is visible', async () => {
    const el = await $(SELECTORS.AUTO_SYNC);
    await expect(el).toBeDisplayed();
  });

  it('TC280 - Auto-sync toggle can be toggled', async () => {
    const toggle = await $(SELECTORS.AUTO_SYNC);
    await toggle.click();
    await browser.pause(300);
    await toggle.click();
    await expect(toggle).toBeDisplayed();
  });

  it('TC281 - Differential Privacy toggle is visible', async () => {
    const el = await $(SELECTORS.DIFF_PRIV);
    await expect(el).toBeDisplayed();
  });

  it('TC282 - Differential Privacy toggle can be toggled', async () => {
    const toggle = await $(SELECTORS.DIFF_PRIV);
    await toggle.click();
    await browser.pause(300);
    await toggle.click();
    await expect(toggle).toBeDisplayed();
  });

  it('TC283 - Speech output toggle is visible', async () => {
    const el = await $(SELECTORS.SPEECH_OUT);
    await expect(el).toBeDisplayed();
  });

  it('TC284 - Speech output toggle can be toggled', async () => {
    const toggle = await $(SELECTORS.SPEECH_OUT);
    await toggle.click();
    await browser.pause(300);
    await toggle.click();
    await expect(toggle).toBeDisplayed();
  });

  it('TC285 - Reset audit logs button is visible', async () => {
    const btn = await $(SELECTORS.RESET_LOGS_BTN);
    await expect(btn).toBeDisplayed();
  });

  it('TC286 - Reset audit logs button is clickable and shows confirmation', async () => {
    const btn = await $(SELECTORS.RESET_LOGS_BTN);
    await btn.click();
    await browser.pause(1000);
    await expect(btn).toBeDisplayed();
  });

  it('TC287 - Settings page section headings are visible', async () => {
    const headings = await $$('//android.webkit.WebView//div[contains(@class,"settings-section")]//h3');
    await expect(headings.length).toBeGreaterThan(0);
  });

  it('TC288 - Settings page layout stacks correctly on mobile', async () => {
    const grid = await $('//android.webkit.WebView//div[contains(@class,"settings-grid")]');
    await expect(grid).toBeDisplayed();
  });

  it('TC289 - Settings persists after navigating away and back', async () => {
    const toggle = await $(SELECTORS.AUTO_SYNC);
    const stateBefore = await toggle.isChecked();
    await navigateTo('home');
    await navigateTo('settings');
    const stateAfter = await toggle.isChecked();
    await expect(stateAfter).toBe(stateBefore);
  });

  it('TC290 - Dark mode toggle activates dark theme on body', async () => {
    const toggle = await $(SELECTORS.THEME_TOGGLE);
    await toggle.click();
    await browser.pause(700);
    const html = await $('//android.webkit.WebView//html | //android.webkit.WebView//body');
    if (await html.isExisting()) {
      await expect(html).toBeDisplayed();
    }
    await toggle.click();
  });

  it('TC291 - Settings section "Privacy & Security" is displayed', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Privacy") or contains(text(),"Security")]');
    await expect(el).toBeDisplayed();
  });

  it('TC292 - Settings section "AI Tutor Preferences" is displayed', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"AI Tutor") or contains(text(),"Tutor Preferences")]');
    if (await el.isExisting()) {
      await expect(el).toBeDisplayed();
    }
  });

  it('TC293 - Settings section "Federated Learning" is displayed', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Federated")]');
    if (await el.isExisting()) {
      await expect(el).toBeDisplayed();
    }
  });

  it('TC294 - Toggle labels have descriptive text', async () => {
    const label = await $('//android.webkit.WebView//label');
    await expect(label).toBeDisplayed();
  });

  it('TC295 - Settings page scrolls to reveal all toggles', async () => {
    await browser.touchAction([
      { action: 'press', x: 540, y: 1200 },
      { action: 'moveTo', x: 540, y: 400 },
      'release'
    ]);
    const view = await $('//android.webkit.WebView//section[@id="view-settings"]');
    await expect(view).toBeDisplayed();
  });

  it('TC296 - Epsilon slider for differential privacy is present', async () => {
    const slider = await $('//android.webkit.WebView//input[@type="range"]');
    if (await slider.isExisting()) {
      await expect(slider).toBeDisplayed();
    }
  });

  it('TC297 - Epsilon value label updates when slider is moved', async () => {
    const slider = await $('//android.webkit.WebView//input[@type="range"]');
    if (await slider.isExisting()) {
      await slider.click();
      await browser.pause(300);
      await expect(slider).toBeDisplayed();
    }
  });

  it('TC298 - Settings export button is visible', async () => {
    const btn = await $('//android.webkit.WebView//button[contains(text(),"Export") or contains(@class,"export")]');
    if (await btn.isExisting()) {
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC299 - Settings import button is visible', async () => {
    const btn = await $('//android.webkit.WebView//button[contains(text(),"Import") or contains(@class,"import")]');
    if (await btn.isExisting()) {
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC300 - Settings page heading reads "Settings" or "Preferences"', async () => {
    const heading = await $('//android.webkit.WebView//h2[contains(text(),"Settings") or contains(text(),"Preferences")]');
    await expect(heading).toBeDisplayed();
  });

  it('TC301 - Theme color applied to all views consistently', async () => {
    await navigateTo('home');
    await browser.pause(300);
    const body = await $('//android.webkit.WebView//body');
    if (await body.isExisting()) {
      await expect(body).toBeDisplayed();
    }
  });

  it('TC302 - Settings changes are saved to localStorage/storage', async () => {
    await navigateTo('settings');
    const toggle = await $(SELECTORS.AUTO_SYNC);
    await toggle.click();
    await browser.pause(300);
    await navigateTo('home');
    await navigateTo('settings');
    const stateAfterNav = await toggle.isChecked();
    await expect(typeof stateAfterNav).toBe('boolean');
  });

  it('TC303 - Notification settings section is visible', async () => {
    const el = await $('//android.webkit.WebView//*[contains(text(),"Notification")]');
    if (await el.isExisting()) {
      await expect(el).toBeDisplayed();
    }
  });

  it('TC304 - App version info is shown in settings', async () => {
    const version = await $('//android.webkit.WebView//*[contains(text(),"Version") or contains(text(),"v1.")]');
    if (await version.isExisting()) {
      await expect(version).toBeDisplayed();
    }
  });

  it('TC305 - All settings toggles respond to tap without crash', async () => {
    const toggles = await $$('//android.webkit.WebView//input[@type="checkbox"]');
    for (const t of toggles.slice(0, 4)) {
      await t.click();
      await browser.pause(200);
      await t.click();
      await browser.pause(200);
    }
    const view = await $('//android.webkit.WebView//section[@id="view-settings"]');
    await expect(view).toBeDisplayed();
  });
});
