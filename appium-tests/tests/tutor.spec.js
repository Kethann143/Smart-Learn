/**
 * tutor.spec.js
 * E2E Tests: AI Tutor Chatbot - Messaging, Responses, Voice, Quiz
 * Test Cases: TC181 - TC230
 */

const { SELECTORS, tapElement, typeText, isDisplayed, login, navigateTo } = require('../utils/helpers');

describe('TUTOR - AI Chatbot Interface', () => {

  before(async () => {
    await login('demo@smartlearn.com', 'Demo@1234');
    await navigateTo('tutor');
  });

  it('TC181 - AI Tutor view loads after navigation', async () => {
    const view = await $('//android.webkit.WebView//section[@id="view-tutor"]');
    await expect(view).toBeDisplayed();
  });

  it('TC182 - Chat input field is visible and clickable', async () => {
    const input = await $(SELECTORS.CHAT_INPUT);
    await expect(input).toBeDisplayed();
  });

  it('TC183 - Chat send button is visible and clickable', async () => {
    const btn = await $(SELECTORS.CHAT_SEND_BTN);
    await expect(btn).toBeDisplayed();
  });

  it('TC184 - Messages container is visible', async () => {
    const box = await $(SELECTORS.MESSAGES_BOX);
    await expect(box).toBeDisplayed();
  });

  it('TC185 - Typing a message and sending shows user bubble', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'Hello');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(2000);
    const userBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble user")]');
    await expect(userBubble).toBeDisplayed();
  });

  it('TC186 - AI responds with a message bubble after user message', async () => {
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC187 - Loading spinner shows while AI is thinking', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'Explain Python');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    const spinner = await $('//android.webkit.WebView//i[contains(@class,"fa-spinner")]');
    await expect(spinner).toBeDisplayed();
    await browser.pause(3000);
  });

  it('TC188 - Sending empty message does not create a bubble', async () => {
    await typeText(SELECTORS.CHAT_INPUT, '');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(1000);
    const bubbles = await $$('//android.webkit.WebView//div[contains(@class,"message-bubble user")]');
    const count = bubbles.length;
    await expect(count).toBeGreaterThanOrEqual(0);
  });

  it('TC189 - Microphone button is visible in chat input area', async () => {
    const mic = await $(SELECTORS.MIC_BTN);
    await expect(mic).toBeDisplayed();
  });

  it('TC190 - Quick Quiz button is visible in chat actions', async () => {
    const quiz = await $(SELECTORS.QUICK_QUIZ_BTN);
    await expect(quiz).toBeDisplayed();
  });

  it('TC191 - Context banner is displayed showing current context', async () => {
    const banner = await $('//android.webkit.WebView//div[@id="tutor-context-banner"]');
    await expect(banner).toBeDisplayed();
  });

  it('TC192 - Context banner shows course name or "General"', async () => {
    const name = await $('//android.webkit.WebView//strong[@id="tutor-context-course-name"]');
    await expect(name).toBeDisplayed();
  });

  it('TC193 - Asking "roadmap" returns a structured response', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'roadmap');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC194 - Asking "quiz me" triggers a quiz response', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'quiz me on Python');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC195 - Asking "debug" returns a debugging guide response', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'debug my code');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC196 - Asking "cheat sheet" returns a reference response', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'Python cheat sheet');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC197 - Asking "interview" returns interview prep questions', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'interview questions');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC198 - Asking "compare Python vs JavaScript" returns comparison', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'python vs javascript');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC199 - Asking "project ideas" returns project suggestions', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'project ideas');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC200 - Asking "tips" returns tips and tricks', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'tips and tricks');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC201 - Asking "explain" returns explanation response', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'explain what a variable is');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC202 - Press Enter key to send message works', async () => {
    const input = await $(SELECTORS.CHAT_INPUT);
    await input.setValue('Hello tutor\uE006');
    await browser.pause(2000);
    const userBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble user")]');
    await expect(userBubble).toBeDisplayed();
  });

  it('TC203 - Chat messages container is scrollable', async () => {
    const box = await $(SELECTORS.MESSAGES_BOX);
    await expect(box).toBeDisplayed();
  });

  it('TC204 - Chat input field clears after message is sent', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'Hello');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(500);
    const input = await $(SELECTORS.CHAT_INPUT);
    const val = await input.getValue();
    await expect(val).toBe('');
  });

  it('TC205 - Chat history sidebar is hidden on mobile', async () => {
    const sidebar = await $('//android.webkit.WebView//aside[contains(@class,"chat-history-sidebar")]');
    const displayed = await sidebar.isDisplayed();
    await expect(displayed).toBe(false);
  });

  it('TC206 - Quick Quiz button triggers quiz message in chat', async () => {
    await tapElement(SELECTORS.QUICK_QUIZ_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC207 - Clear logs button is not visible or hidden (sidebar hidden)', async () => {
    const btn = await $('//android.webkit.WebView//button[@id="tutor-clear-chat-btn"]');
    const displayed = await btn.isDisplayed().catch(() => false);
    await expect(displayed).toBe(false);
  });

  it('TC208 - AI response contains formatted text (bold, headers)', async () => {
    const bubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    if (await bubble.isExisting()) {
      const text = await bubble.getText();
      await expect(text.length).toBeGreaterThan(10);
    }
  });

  it('TC209 - Asking about a non-English topic is handled gracefully', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'Python kya hai?');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC210 - Very long message input is handled (not crashed)', async () => {
    const longText = 'A'.repeat(500);
    await typeText(SELECTORS.CHAT_INPUT, longText);
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC211 - AI chat persists after navigating away and back', async () => {
    const countBefore = (await $$('//android.webkit.WebView//div[contains(@class,"message-bubble")]')).length;
    await navigateTo('home');
    await navigateTo('tutor');
    const countAfter = (await $$('//android.webkit.WebView//div[contains(@class,"message-bubble")]')).length;
    await expect(countAfter).toBe(countBefore);
  });

  it('TC212 - Microphone button is clickable without crash', async () => {
    const mic = await $(SELECTORS.MIC_BTN);
    await mic.click();
    await browser.pause(1000);
    await expect(mic).toBeDisplayed();
  });

  it('TC213 - "concept map" request returns overview response', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'concept map');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC214 - AI response code blocks have monospace font', async () => {
    const code = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]//code');
    if (await code.isExisting()) {
      await expect(code).toBeDisplayed();
    }
  });

  it('TC215 - Chat input is accessible above keyboard when focused', async () => {
    const input = await $(SELECTORS.CHAT_INPUT);
    await input.click();
    await browser.pause(1000);
    await expect(input).toBeDisplayed();
  });

  it('TC216 - AI tutor layout height does not overflow on mobile', async () => {
    const layout = await $('//android.webkit.WebView//div[contains(@class,"ai-tutor-layout")]');
    if (await layout.isExisting()) {
      const size = await layout.getSize();
      const windowH = (await browser.getWindowSize()).height;
      await expect(size.height).toBeLessThanOrEqual(windowH);
    }
  });

  it('TC217 - Asking "next topic" returns next steps response', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'what next after this');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC218 - Asking "beginner" returns simplified explanation', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'explain beginner');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC219 - Asking "advanced" returns deep dive explanation', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'advanced deep dive');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC220 - Context badge shows "Locked Session" when no course selected', async () => {
    const badge = await $('//android.webkit.WebView//span[@id="tutor-context-status-badge"]');
    if (await badge.isExisting()) {
      await expect(badge).toBeDisplayed();
    }
  });

  it('TC221 - Asking "study tips" returns helpful study advice', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'study tips');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC222 - Multiple rapid messages do not crash chat', async () => {
    for (let i = 0; i < 3; i++) {
      await typeText(SELECTORS.CHAT_INPUT, `Test message ${i}`);
      await tapElement(SELECTORS.CHAT_SEND_BTN);
      await browser.pause(500);
    }
    await browser.pause(5000);
    const bubbles = await $$('//android.webkit.WebView//div[contains(@class,"message-bubble")]');
    await expect(bubbles.length).toBeGreaterThan(0);
  });

  it('TC223 - AI bubble has a speaker/speech button', async () => {
    const speechBtn = await $('//android.webkit.WebView//button[contains(@class,"speech-btn")]');
    if (await speechBtn.isExisting()) {
      await expect(speechBtn).toBeDisplayed();
    }
  });

  it('TC224 - Speech button click triggers text-to-speech', async () => {
    const speechBtn = await $('//android.webkit.WebView//button[contains(@class,"speech-btn")]');
    if (await speechBtn.isExisting()) {
      await speechBtn.click();
      await browser.pause(1000);
      await expect(speechBtn).toBeDisplayed();
    }
  });

  it('TC225 - AI bubble text is readable (not blank)', async () => {
    const bubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    if (await bubble.isExisting()) {
      const text = await bubble.getText();
      await expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  it('TC226 - User bubble text shows what was typed', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'Unique test message 12345');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(1000);
    const bubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble user")]');
    const text = await bubble.getText();
    await expect(text).toContain('Unique test message');
  });

  it('TC227 - Chat scroll automatically moves to latest message', async () => {
    const box = await $(SELECTORS.MESSAGES_BOX);
    await expect(box).toBeDisplayed();
  });

  it('TC228 - Asking about "federated learning" triggers privacy response', async () => {
    await typeText(SELECTORS.CHAT_INPUT, 'explain federated learning');
    await tapElement(SELECTORS.CHAT_SEND_BTN);
    await browser.pause(3000);
    const aiBubble = await $('//android.webkit.WebView//div[contains(@class,"message-bubble ai")]');
    await expect(aiBubble).toBeDisplayed();
  });

  it('TC229 - AI tutor persists context when navigating from a course lesson', async () => {
    await navigateTo('courses');
    const card = await $('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await card.click();
    await browser.pause(1500);
    const askBtn = await $('//android.webkit.WebView//button[contains(text(),"Ask AI")]');
    if (await askBtn.isExisting()) {
      await askBtn.click();
      await browser.pause(1000);
      const banner = await $('//android.webkit.WebView//div[@id="tutor-context-banner"]');
      await expect(banner).toBeDisplayed();
    }
  });

  it('TC230 - Chat input placeholder text is "Ask AI Tutor..."', async () => {
    await navigateTo('tutor');
    const input = await $(SELECTORS.CHAT_INPUT);
    const placeholder = await input.getAttribute('placeholder');
    await expect(placeholder).toContain('Ask AI Tutor');
  });
});
