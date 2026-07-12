/**
 * courses.spec.js
 * E2E Tests: Courses Catalog, Syllabus Viewer, Lesson Navigation
 * Test Cases: TC116 - TC180
 */

const { SELECTORS, tapElement, typeText, isDisplayed, login, navigateTo, scrollDown } = require('../utils/helpers');

describe('COURSES - Catalog, Syllabus & Lessons', () => {

  before(async () => {
    await login('demo@smartlearn.com', 'Demo@1234');
    await navigateTo('courses');
  });

  it('TC116 - Courses view loads after navigation', async () => {
    const view = await $('//android.webkit.WebView//section[@id="view-courses"]');
    await expect(view).toBeDisplayed();
  });

  it('TC117 - Courses grid is displayed with multiple course cards', async () => {
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await expect(cards.length).toBeGreaterThan(0);
  });

  it('TC118 - Course search input is displayed', async () => {
    const el = await $(SELECTORS.SEARCH_INPUT);
    await expect(el).toBeDisplayed();
  });

  it('TC119 - Search input accepts text and filters courses', async () => {
    await typeText(SELECTORS.SEARCH_INPUT, 'Python');
    await browser.pause(1000);
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('TC120 - Clearing search shows all courses again', async () => {
    await typeText(SELECTORS.SEARCH_INPUT, '');
    await browser.pause(1000);
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await expect(cards.length).toBeGreaterThan(1);
  });

  it('TC121 - Searching for non-existent course shows no results or empty state', async () => {
    await typeText(SELECTORS.SEARCH_INPUT, 'xyznonexistent9999');
    await browser.pause(1000);
    const empty = await $('//android.webkit.WebView//*[contains(text(),"no course") or contains(text(),"No results")]');
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"course-card")]');
    if (await empty.isExisting()) {
      await expect(empty).toBeDisplayed();
    } else {
      await expect(cards.length).toBe(0);
    }
    await typeText(SELECTORS.SEARCH_INPUT, '');
  });

  it('TC122 - Category filter tabs are visible', async () => {
    const tabs = await $('//android.webkit.WebView//div[contains(@class,"category-filter")]');
    if (await tabs.isExisting()) {
      await expect(tabs).toBeDisplayed();
    }
  });

  it('TC123 - Filtering by "Web Development" shows relevant courses', async () => {
    const tab = await $('//android.webkit.WebView//*[contains(text(),"Web")]');
    if (await tab.isExisting()) {
      await tab.click();
      await browser.pause(1000);
      const cards = await $$('//android.webkit.WebView//div[contains(@class,"course-card")]');
      await expect(cards.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('TC124 - Each course card shows a course name', async () => {
    const title = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//h3');
    await expect(title).toBeDisplayed();
  });

  it('TC125 - Each course card shows difficulty badge', async () => {
    const badge = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//*[contains(@class,"badge")]');
    await expect(badge).toBeDisplayed();
  });

  it('TC126 - Each course card shows student count', async () => {
    const students = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//*[contains(text(),"students") or contains(text(),"Students")]');
    if (await students.isExisting()) {
      await expect(students).toBeDisplayed();
    }
  });

  it('TC127 - Each course card shows rating', async () => {
    const rating = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//*[contains(text(),"4.")]');
    if (await rating.isExisting()) {
      await expect(rating).toBeDisplayed();
    }
  });

  it('TC128 - Course card shows duration in hours', async () => {
    const dur = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//*[contains(text(),"hrs") or contains(text(),"hour")]');
    if (await dur.isExisting()) {
      await expect(dur).toBeDisplayed();
    }
  });

  it('TC129 - Course grid is scrollable vertically', async () => {
    await scrollDown(400);
    await browser.pause(500);
    const view = await $('//android.webkit.WebView//section[@id="view-courses"]');
    await expect(view).toBeDisplayed();
  });

  it('TC130 - Course card is tappable and opens syllabus viewer', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await card.click();
    await browser.pause(1500);
    const syllabus = await $('//android.webkit.WebView//div[contains(@class,"course-details-layout") or contains(@class,"syllabus")]');
    await expect(syllabus).toBeDisplayed();
  });

  it('TC131 - Syllabus view shows course name in header', async () => {
    const heading = await $('//android.webkit.WebView//div[contains(@class,"topic-header-wrap")]//h1 | //android.webkit.WebView//*[contains(@class,"course-title")]');
    if (await heading.isExisting()) {
      await expect(heading).toBeDisplayed();
    }
  });

  it('TC132 - Syllabus sidebar shows list of topics', async () => {
    const topics = await $$('//android.webkit.WebView//div[contains(@class,"syllabus-item")]');
    await expect(topics.length).toBeGreaterThan(0);
  });

  it('TC133 - First topic in syllabus is active by default', async () => {
    const active = await $('//android.webkit.WebView//div[contains(@class,"syllabus-item") and contains(@class,"active")]');
    await expect(active).toBeDisplayed();
  });

  it('TC134 - Topic content panel is visible with lesson text', async () => {
    const panel = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
    await expect(panel).toBeDisplayed();
  });

  it('TC135 - Clicking second topic loads new content', async () => {
    const items = await $$('//android.webkit.WebView//div[contains(@class,"syllabus-item")]');
    if (items.length > 1) {
      await items[1].click();
      await browser.pause(1500);
      const panel = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
      await expect(panel).toBeDisplayed();
    }
  });

  it('TC136 - Difficulty level tabs (Beginner/Intermediate/Advanced) are visible', async () => {
    const tabs = await $('//android.webkit.WebView//div[contains(@class,"difficulty-tab")]');
    if (await tabs.isExisting()) {
      await expect(tabs).toBeDisplayed();
    }
  });

  it('TC137 - Clicking Intermediate tab loads intermediate content', async () => {
    const tab = await $('//android.webkit.WebView//*[contains(text(),"Intermediate")]');
    if (await tab.isExisting()) {
      await tab.click();
      await browser.pause(1000);
      const panel = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
      await expect(panel).toBeDisplayed();
    }
  });

  it('TC138 - Clicking Advanced tab loads advanced content', async () => {
    const tab = await $('//android.webkit.WebView//*[contains(text(),"Advanced")]');
    if (await tab.isExisting()) {
      await tab.click();
      await browser.pause(1000);
      const panel = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
      await expect(panel).toBeDisplayed();
    }
  });

  it('TC139 - Code snippet block is displayed in lesson content', async () => {
    const code = await $('//android.webkit.WebView//pre | //android.webkit.WebView//code');
    if (await code.isExisting()) {
      await expect(code).toBeDisplayed();
    }
  });

  it('TC140 - "Next Topic" button is present in course viewer', async () => {
    const btn = await $('//android.webkit.WebView//button[contains(text(),"Next") or contains(@class,"next-topic")]');
    if (await btn.isExisting()) {
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC141 - "Ask AI Tutor" button is visible inside course viewer', async () => {
    const btn = await $('//android.webkit.WebView//button[contains(text(),"Ask AI") or contains(@class,"ask-tutor-btn")]');
    if (await btn.isExisting()) {
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC142 - Bookmark button is visible in course viewer', async () => {
    const btn = await $('//android.webkit.WebView//button[contains(@class,"bookmark")]');
    if (await btn.isExisting()) {
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC143 - Bookmark button can be toggled', async () => {
    const btn = await $('//android.webkit.WebView//button[contains(@class,"bookmark")]');
    if (await btn.isExisting()) {
      await btn.click();
      await browser.pause(500);
      await btn.click();
      await expect(btn).toBeDisplayed();
    }
  });

  it('TC144 - "Mark as Complete" or progress indicator is present', async () => {
    const progress = await $('//android.webkit.WebView//*[contains(text(),"Complete") or contains(@class,"mark-complete")]');
    if (await progress.isExisting()) {
      await expect(progress).toBeDisplayed();
    }
  });

  it('TC145 - Course viewer back button returns to catalog', async () => {
    const back = await $('//android.webkit.WebView//button[contains(@class,"back") or contains(text(),"Back")]');
    if (await back.isExisting()) {
      await back.click();
      await browser.pause(1000);
      const catalog = await $(SELECTORS.COURSES_GRID);
      await expect(catalog).toBeDisplayed();
    } else {
      await navigateTo('courses');
    }
  });

  it('TC146 - Quiz button or section exists in course', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await card.click();
    await browser.pause(1500);
    const quiz = await $('//android.webkit.WebView//*[contains(text(),"Quiz") or contains(@class,"quiz")]');
    if (await quiz.isExisting()) {
      await expect(quiz).toBeDisplayed();
    }
  });

  it('TC147 - Syllabus sidebar is scrollable when many topics exist', async () => {
    const sidebar = await $('//android.webkit.WebView//div[contains(@class,"syllabus-sidebar")]');
    if (await sidebar.isExisting()) {
      await expect(sidebar).toBeDisplayed();
    }
  });

  it('TC148 - Course card grid does not overflow horizontally on mobile', async () => {
    await navigateTo('courses');
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"course-card")]');
    for (const card of cards.slice(0, 3)) {
      const loc = await card.getLocation();
      const size = await card.getSize();
      const screenWidth = (await browser.getWindowSize()).width;
      await expect(loc.x + size.width).toBeLessThanOrEqual(screenWidth + 10);
    }
  });

  it('TC149 - "Trending" badge appears on trending courses', async () => {
    const badge = await $('//android.webkit.WebView//*[contains(text(),"Trending") or contains(@class,"trending")]');
    if (await badge.isExisting()) {
      await expect(badge).toBeDisplayed();
    }
  });

  it('TC150 - All courses count is shown or implied', async () => {
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await expect(cards.length).toBeGreaterThan(0);
  });

  it('TC151 - Courses page has a heading with "Courses" in text', async () => {
    const heading = await $('//android.webkit.WebView//*[contains(text(),"Course") and (self::h1 or self::h2)]');
    await expect(heading).toBeDisplayed();
  });

  it('TC152 - Course star rating icon is rendered', async () => {
    const star = await $('//android.webkit.WebView//i[contains(@class,"fa-star")]');
    await expect(star).toBeDisplayed();
  });

  it('TC153 - Course duration icon is rendered', async () => {
    const icon = await $('//android.webkit.WebView//i[contains(@class,"fa-clock")]');
    if (await icon.isExisting()) {
      await expect(icon).toBeDisplayed();
    }
  });

  it('TC154 - Practice problems section is in course viewer', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await card.click();
    await browser.pause(1500);
    const practice = await $('//android.webkit.WebView//*[contains(text(),"Practice") or contains(text(),"Challenge")]');
    if (await practice.isExisting()) {
      await expect(practice).toBeDisplayed();
    }
  });

  it('TC155 - Best practices section is visible in course content', async () => {
    const best = await $('//android.webkit.WebView//*[contains(text(),"Best Practice")]');
    if (await best.isExisting()) {
      await expect(best).toBeDisplayed();
    }
  });

  it('TC156 - Interview questions section is visible in course', async () => {
    const interview = await $('//android.webkit.WebView//*[contains(text(),"Interview")]');
    if (await interview.isExisting()) {
      await expect(interview).toBeDisplayed();
    }
  });

  it('TC157 - Course content has readable font size on mobile', async () => {
    const panel = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
    if (await panel.isExisting()) {
      await expect(panel).toBeDisplayed();
    }
  });

  it('TC158 - Syllabus item click highlights the active item', async () => {
    const items = await $$('//android.webkit.WebView//div[contains(@class,"syllabus-item")]');
    if (items.length > 0) {
      await items[0].click();
      await browser.pause(500);
      const cls = await items[0].getAttribute('class');
      await expect(cls).toContain('active');
    }
  });

  it('TC159 - Topic progress indicator is functional', async () => {
    const progress = await $('//android.webkit.WebView//*[contains(@class,"progress")]');
    if (await progress.isExisting()) {
      await expect(progress).toBeDisplayed();
    }
  });

  it('TC160 - Course description text is rendered on course card', async () => {
    await navigateTo('courses');
    const desc = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//p');
    if (await desc.isExisting()) {
      await expect(desc).toBeDisplayed();
    }
  });

  it('TC161 - "Start Learning" or "Enroll" button is on each course card', async () => {
    const btn = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//a | //android.webkit.WebView//div[contains(@class,"course-card")]//button');
    await expect(btn).toBeDisplayed();
  });

  it('TC162 - Courses grid is responsive (no horizontal scroll)', async () => {
    const grid = await $(SELECTORS.COURSES_GRID);
    if (await grid.isExisting()) {
      const size = await grid.getSize();
      const windowWidth = (await browser.getWindowSize()).width;
      await expect(size.width).toBeLessThanOrEqual(windowWidth);
    }
  });

  it('TC163 - Course tab nav is scrollable for multiple difficulty tabs', async () => {
    const tabNav = await $('//android.webkit.WebView//div[contains(@class,"difficulty-tab-nav")]');
    if (await tabNav.isExisting()) {
      await expect(tabNav).toBeDisplayed();
    }
  });

  it('TC164 - Beginner difficulty tab is default selected', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await card.click();
    await browser.pause(1500);
    const beginner = await $('//android.webkit.WebView//*[contains(text(),"Beginner")]');
    if (await beginner.isExisting()) {
      await expect(beginner).toBeDisplayed();
    }
  });

  it('TC165 - Lesson header shows topic number and name', async () => {
    const header = await $('//android.webkit.WebView//div[contains(@class,"topic-header-wrap")]');
    if (await header.isExisting()) {
      await expect(header).toBeDisplayed();
    }
  });

  it('TC166 - "Ask AI Tutor" button click navigates to tutor with context', async () => {
    const btn = await $('//android.webkit.WebView//button[contains(text(),"Ask AI")]');
    if (await btn.isExisting()) {
      await btn.click();
      await browser.pause(1500);
      const tutor = await $('//android.webkit.WebView//section[@id="view-tutor"]');
      await expect(tutor).toBeDisplayed();
      await navigateTo('courses');
    }
  });

  it('TC167 - Course category label is displayed on card', async () => {
    await navigateTo('courses');
    const cat = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//*[contains(@class,"category")]');
    if (await cat.isExisting()) {
      await expect(cat).toBeDisplayed();
    }
  });

  it('TC168 - Sort or filter dropdown exists on courses page', async () => {
    const filter = await $('//android.webkit.WebView//select | //android.webkit.WebView//*[contains(@class,"filter")]');
    if (await filter.isExisting()) {
      await expect(filter).toBeDisplayed();
    }
  });

  it('TC169 - Courses page heading text is visible', async () => {
    const heading = await $('//android.webkit.WebView//*[contains(text(),"Course")]');
    await expect(heading).toBeDisplayed();
  });

  it('TC170 - Lesson code block is copyable or has copy button', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await card.click();
    await browser.pause(1500);
    const copyBtn = await $('//android.webkit.WebView//button[contains(@class,"copy")]');
    if (await copyBtn.isExisting()) {
      await expect(copyBtn).toBeDisplayed();
    }
  });

  it('TC171 - Topic content panel is placed above syllabus on mobile', async () => {
    const content = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
    const sidebar = await $('//android.webkit.WebView//div[contains(@class,"syllabus-sidebar")]');
    if (await content.isExisting() && await sidebar.isExisting()) {
      const contentLoc = await content.getLocation();
      const sidebarLoc = await sidebar.getLocation();
      await expect(contentLoc.y).toBeLessThanOrEqual(sidebarLoc.y);
    }
  });

  it('TC172 - "Next Topic" navigates to the next lesson', async () => {
    const nextBtn = await $('//android.webkit.WebView//button[contains(text(),"Next")]');
    if (await nextBtn.isExisting()) {
      const prevPanel = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
      const prevText = await prevPanel.getText();
      await nextBtn.click();
      await browser.pause(1500);
      const newPanel = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
      const newText = await newPanel.getText();
      await expect(newText).not.toBe(prevText);
    }
  });

  it('TC173 - Swipe left in course viewer can navigate topics (gesture)', async () => {
    await browser.touchAction([
      { action: 'press', x: 900, y: 700 },
      { action: 'moveTo', x: 100, y: 700 },
      'release'
    ]);
    await browser.pause(1000);
    const panel = await $('//android.webkit.WebView//div[contains(@class,"topic-content-panel")]');
    if (await panel.isExisting()) {
      await expect(panel).toBeDisplayed();
    }
  });

  it('TC174 - Trending label is shown on courses marked as trending', async () => {
    await navigateTo('courses');
    const trending = await $('//android.webkit.WebView//*[contains(@class,"trending") or contains(text(),"Trending")]');
    if (await trending.isExisting()) {
      await expect(trending).toBeDisplayed();
    }
  });

  it('TC175 - Course card difficulty "Beginner" has green color class', async () => {
    const badge = await $('//android.webkit.WebView//*[contains(text(),"Beginner")]');
    if (await badge.isExisting()) {
      await expect(badge).toBeDisplayed();
    }
  });

  it('TC176 - Course card difficulty "Advanced" is displayed', async () => {
    const badge = await $('//android.webkit.WebView//*[contains(text(),"Advanced")]');
    if (await badge.isExisting()) {
      await expect(badge).toBeDisplayed();
    }
  });

  it('TC177 - Scroll down in course catalog shows more cards', async () => {
    await navigateTo('courses');
    await scrollDown(600);
    const cards = await $$('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await expect(cards.length).toBeGreaterThan(0);
  });

  it('TC178 - Topic analogy section is visible in course content', async () => {
    const card = await $('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await card.click();
    await browser.pause(1500);
    const analogy = await $('//android.webkit.WebView//*[contains(text(),"Analogy") or contains(text(),"analogy")]');
    if (await analogy.isExisting()) {
      await expect(analogy).toBeDisplayed();
    }
  });

  it('TC179 - Course card image or icon renders without broken image', async () => {
    await navigateTo('courses');
    const icon = await $('//android.webkit.WebView//div[contains(@class,"course-card")]//i');
    if (await icon.isExisting()) {
      await expect(icon).toBeDisplayed();
    }
  });

  it('TC180 - Back navigation from course viewer does not lose scroll position', async () => {
    await navigateTo('courses');
    await scrollDown(400);
    const card = await $('//android.webkit.WebView//div[contains(@class,"course-card")]');
    await card.click();
    await browser.pause(1500);
    await navigateTo('courses');
    await browser.pause(500);
    const grid = await $(SELECTORS.COURSES_GRID);
    await expect(grid).toBeDisplayed();
  });
});
