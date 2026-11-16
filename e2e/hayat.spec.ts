import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('HAYAT End-to-End Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('1. Happy path: Landing -> Consent -> Wizard -> Results -> Care Navigator', async ({ page }) => {
    await page.goto('/#/');
    await expect(page).toHaveTitle(/HAYAT/i);

    // Click Hero Start Check CTA (links to #/consent)
    const heroBtn = page.locator('main a[href="#/consent"]').first();
    await expect(heroBtn).toBeVisible();
    await heroBtn.click();
    await expect(page).toHaveURL(/.*#\/consent/);

    // Toggle required consent "Process my answers" to ON
    await page.getByText(/process my answers/i).click();

    // Click "I understand, continue"
    const acceptBtn = page.getByRole('button', { name: /i understand, continue/i });
    await expect(acceptBtn).toBeEnabled();
    await acceptBtn.click();
    await expect(page).toHaveURL(/.*#\/check/);

    // Step 1: Select age (25-29) -> auto-advances
    await page.getByRole('button', { name: /25 to 29 years/i }).click();
    await page.waitForTimeout(400);

    // Step 2: Select Family Planning ("Planning for the future") -> auto-advances
    await page.getByRole('button', { name: /planning for the future/i }).click();
    await page.waitForTimeout(400);

    // Advance through the remaining questions using the skip button
    for (let i = 0; i < 24; i++) {
      if (page.url().includes('#/results') || page.url().includes('#/analysing')) break;

      const skipBtn = page.getByRole('button', { name: /prefer not to say \/ skip/i }).first();
      if (await skipBtn.isVisible().catch(() => false)) {
        await skipBtn.click();
        await page.waitForTimeout(200);
      }
    }

    // Wait for results page (Analysing page takes ~2.3s)
    await page.waitForURL(/.*#\/results/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /why this result/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/rule-based screening/i).first()).toBeVisible();

    // Navigate to Care Navigator
    const careLink = page.getByRole('link', { name: /open care navigator/i }).first();
    await expect(careLink).toBeVisible();
    await careLink.click();
    await expect(page).toHaveURL(/.*#\/care/);
    await expect(page.getByText(/care navigator/i).first()).toBeVisible();
  });

  test('2. Conditional logic: tryingDuration is ONLY asked when Actively Trying is chosen', async ({ page }) => {
    await page.goto('/#/consent');
    await page.getByText(/process my answers/i).click();
    await page.getByRole('button', { name: /i understand, continue/i }).click();
    await page.waitForURL(/.*#\/check/);

    // Select Age (auto-advances after 260ms)
    await page.getByRole('button', { name: /30 to 34 years/i }).click();
    await page.waitForTimeout(350);

    // Select "Planning for the future" (auto-advances)
    await page.getByRole('button', { name: /planning for the future/i }).click();
    await page.waitForTimeout(350);

    // The next question should NOT be tryingDuration (it is journeyNote)
    const tryingQuestion = page.getByText(/how long have you been actively trying to conceive/i);
    await expect(tryingQuestion).not.toBeVisible();

    // Click back to return to family planning
    await page.getByRole('button', { name: /back/i }).click();
    await page.waitForTimeout(200);

    // Now choose "Actively trying currently" (auto-advances)
    await page.getByRole('button', { name: /actively trying currently/i }).click();
    await page.waitForTimeout(350);

    // Now tryingDuration MUST appear
    await expect(page.getByText(/how long have you been actively trying to conceive/i)).toBeVisible();
  });

  test('3. Red-flag urgent path: severe pain triggers immediate Urgent Assessment', async ({ page }) => {
    await page.goto('/#/');
    // Scroll to demo personas and click urgent demo
    const urgentDemoBtn = page.getByRole('button', { name: /urgent red-flag case/i });
    await urgentDemoBtn.scrollIntoViewIfNeeded();
    await expect(urgentDemoBtn).toBeVisible();
    await urgentDemoBtn.click();

    await page.waitForURL(/.*#\/results/, { timeout: 15000 });
    // Alert card must render with urgent notification
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/urgent medical assessment recommended today/i)).toBeVisible();
    await expect(page.getByText(/urgent assessment/i).first()).toBeVisible();
  });

  test('4. Privacy Proof: ZERO outbound network requests when optional consents are OFF', async ({ page }) => {
    const outboundNetworkCalls: string[] = [];

    page.on('request', request => {
      const url = request.url();
      if (
        !url.includes('@vite') &&
        !url.includes('.js') &&
        !url.includes('.css') &&
        !url.includes('.svg') &&
        !url.includes('.png') &&
        !url.includes('node_modules') &&
        !url.includes('localhost:3000/src/') &&
        !url.includes('favicon')
      ) {
        if (request.method() === 'POST' || url.includes('/api/')) {
          outboundNetworkCalls.push(`${request.method()} ${url}`);
        }
      }
    });

    // Launch demo low-risk screening (which sets consent.processAnswers: true, others: false)
    await page.goto('/#/');
    const lowDemoBtn = page.getByRole('button', { name: /low risk case/i });
    await lowDemoBtn.scrollIntoViewIfNeeded();
    await lowDemoBtn.click();

    await page.waitForURL(/.*#\/results/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /why this result/i })).toBeVisible({ timeout: 15000 });

    // Assert absolute zero outbound health / tracking calls
    expect(outboundNetworkCalls).toHaveLength(0);

    // Verify Privacy Dashboard live audit
    await page.goto('/#/privacy');
    await expect(page.getByText(/nothing left your device/i).first()).toBeVisible();
    await expect(page.getByText(/0 transmissions logged/i)).toBeVisible();
  });

  test('5. Quick Hide: Escape key or button instantly activates discreet wellness screen', async ({ page }) => {
    await page.goto('/#/');
    // Click Quick Hide button in the header (has aria-label "Discreet exit (Esc key)")
    const quickHideBtn = page.getByRole('button', { name: /discreet exit/i });
    await expect(quickHideBtn).toBeVisible();
    await quickHideBtn.click();

    await expect(page.getByText(/daily wellness & hydration tracker/i)).toBeVisible();

    // Return to session
    await page.getByRole('button', { name: /return to session/i }).first().click();
    await expect(page.getByText(/daily wellness & hydration tracker/i)).not.toBeVisible();
  });

  test('6. Data wipe: Delete everything clears all inputs and localStorage', async ({ page }) => {
    await page.goto('/#/');
    // Prefill with moderate risk case
    const modBtn = page.getByRole('button', { name: /moderate risk case/i });
    await modBtn.scrollIntoViewIfNeeded();
    await modBtn.click();
    await page.waitForURL(/.*#\/results/);

    // Go to privacy dashboard
    await page.goto('/#/privacy');
    await page.getByRole('button', { name: /delete everything now/i }).click();

    // Confirm wipe in modal
    const confirmModalBtn = page.getByRole('button', { name: /erase everything now/i });
    await expect(confirmModalBtn).toBeVisible();
    await confirmModalBtn.click();

    // Verify wipe notification
    await expect(page.getByText(/all answers, screening results, and local storage entries were completely deleted/i)).toBeVisible();

    // Verify localStorage is empty
    const storageData = await page.evaluate(() => localStorage.getItem('hayat_app_data_v1'));
    expect(storageData).toBeNull();
  });

  test('7. Localization & Arabic RTL layout', async ({ page }) => {
    await page.goto('/#/');

    // Open language dropdown and select Arabic
    await page.getByRole('button', { name: /select language/i }).click();
    await page.getByRole('button', { name: /العربية/i }).click();

    // Verify RTL HTML attributes
    const dir = await page.locator('html').getAttribute('dir');
    const lang = await page.locator('html').getAttribute('lang');
    expect(dir).toBe('rtl');
    expect(lang).toBe('ar');

    // Verify translated Arabic text is visible
    await expect(page.getByText(/حياة/i).first()).toBeVisible();

    // Switch to Hindi
    await page.getByRole('button', { name: /select language/i }).click();
    await page.getByRole('button', { name: /हिन्दी/i }).click();
    const hiLang = await page.locator('html').getAttribute('lang');
    expect(hiLang).toBe('hi');
    await expect(page.getByText(/हयात/i).first()).toBeVisible();
  });

  test('8. Accessibility: zero critical or serious WCAG violations', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });
});
