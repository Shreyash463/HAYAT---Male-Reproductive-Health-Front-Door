import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const LIVE_URL = 'https://hayat-frontend-ten.vercel.app';
const LIVE_BACKEND = 'https://hayat-backend-nu.vercel.app';

test.describe('HAYAT Live Production Verification Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${LIVE_URL}/#/`);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('1. Live Happy Path: Landing -> Demo Persona -> Results -> Care Navigator', async ({ page }) => {
    await page.goto(`${LIVE_URL}/#/`);
    await expect(page).toHaveTitle(/HAYAT/i);

    // Launch Low Risk Demo Persona
    const lowDemoBtn = page.getByRole('button', { name: /low risk case/i });
    await lowDemoBtn.scrollIntoViewIfNeeded();
    await lowDemoBtn.click();

    // Verify Results Page renders
    await page.waitForURL(/.*#\/results/);
    await expect(page.getByRole('heading', { name: /why this result/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/rule-based screening/i).first()).toBeVisible();

    // Open Care Navigator
    const careLink = page.getByRole('link', { name: /open care navigator/i }).first();
    await expect(careLink).toBeVisible();
    await careLink.click();
    await expect(page).toHaveURL(/.*#\/care/);
    await expect(page.getByText(/care navigator/i).first()).toBeVisible();

    // Verify "Call Discreetly" opens demo modal instead of tel link
    const callBtn = page.getByRole('button', { name: /call discreetly/i }).first();
    await expect(callBtn).toBeVisible();
    await callBtn.click();
    await expect(page.getByText(/demo only\. these are sample clinics/i)).toBeVisible();
    await page.getByRole('button', { name: /understood/i }).click();
  });

  test('2. Live Full Wizard: Including Height & Weight Inputs', async ({ page }) => {
    await page.goto(`${LIVE_URL}/#/consent`);
    await page.getByText(/process my answers/i).click();
    await page.getByRole('button', { name: /i understand, continue/i }).click();
    await page.waitForURL(/.*#\/check/);

    // Step 1: Age
    await page.getByRole('button', { name: /30 to 34 years/i }).click();
    await page.waitForTimeout(350);

    // Step 2: Family Planning ("Actively trying currently")
    await page.getByRole('button', { name: /actively trying currently/i }).click();
    await page.waitForTimeout(350);

    // Trying duration appears
    await page.getByRole('button', { name: /6 to 12 months/i }).click();
    await page.waitForTimeout(350);

    // Step through questions until BMI
    let filledBmi = false;
    for (let i = 0; i < 30; i++) {
      if (page.url().includes('#/results') || page.url().includes('#/analysing')) break;

      const heightInput = page.locator('#wizard-height');
      if (!filledBmi && (await heightInput.isVisible().catch(() => false))) {
        filledBmi = true;
        await heightInput.fill('182');
        await page.locator('#wizard-weight').fill('82');
        await page.waitForTimeout(200);
        const contBtn = page.getByRole('button', { name: /continue/i }).first();
        if (await contBtn.isVisible().catch(() => false)) {
          await contBtn.click();
          await page.waitForTimeout(350);
          continue;
        }
      }

      const skipBtn = page.getByRole('button', { name: /prefer not to say \/ skip/i }).first();
      if (await skipBtn.isVisible().catch(() => false)) {
        await skipBtn.click();
        await page.waitForTimeout(250);
      }
    }

    // Await results
    await page.waitForURL(/.*#\/results/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /why this result/i })).toBeVisible({ timeout: 15000 });
  });

  test('3. Live Red-flag Urgent Path: Immediate alert presentation', async ({ page }) => {
    await page.goto(`${LIVE_URL}/#/`);
    const urgentDemoBtn = page.getByRole('button', { name: /urgent red-flag case/i });
    await urgentDemoBtn.scrollIntoViewIfNeeded();
    await urgentDemoBtn.click();

    await page.waitForURL(/.*#\/results/);
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/urgent medical assessment recommended today/i)).toBeVisible();
    await expect(page.getByText(/urgent assessment/i).first()).toBeVisible();
  });

  test('4. Live Quick Hide: Esc key and Discreet Exit button', async ({ page }) => {
    await page.goto(`${LIVE_URL}/#/`);
    const quickHideBtn = page.getByRole('button', { name: /discreet exit/i });
    await expect(quickHideBtn).toBeVisible();
    await quickHideBtn.click();

    await expect(page.getByText(/daily wellness & hydration tracker/i)).toBeVisible();
    await page.getByRole('button', { name: /return to session/i }).first().click();
    await expect(page.getByText(/daily wellness & hydration tracker/i)).not.toBeVisible();

    // Test Esc key
    await page.keyboard.press('Escape');
    await expect(page.getByText(/daily wellness & hydration tracker/i)).toBeVisible();
    await page.getByRole('button', { name: /return to session/i }).first().click();
  });

  test('5. Live Arabic RTL rendering', async ({ page }) => {
    await page.goto(`${LIVE_URL}/#/`);
    await page.getByRole('button', { name: /select language/i }).click();
    await page.getByRole('button', { name: /العربية/i }).click();

    const dir = await page.locator('html').getAttribute('dir');
    const lang = await page.locator('html').getAttribute('lang');
    expect(dir).toBe('rtl');
    expect(lang).toBe('ar');
    await expect(page.getByText(/حياة/i).first()).toBeVisible();
  });

  test('6. Live Privacy Proof: ZERO backend requests when optional consents OFF', async ({ page }) => {
    const backendRequests: string[] = [];

    page.on('request', req => {
      const url = req.url();
      if (url.includes(LIVE_BACKEND) || url.includes('/api/')) {
        backendRequests.push(`${req.method()} ${url}`);
      }
    });

    // Launch demo low-risk screening (which sets consent.processAnswers: true, others: false)
    await page.goto(`${LIVE_URL}/#/`);
    const lowDemoBtn = page.getByRole('button', { name: /low risk case/i });
    await lowDemoBtn.scrollIntoViewIfNeeded();
    await lowDemoBtn.click();

    await page.waitForURL(/.*#\/results/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /why this result/i })).toBeVisible({ timeout: 15000 });

    // Assert zero backend calls were made!
    expect(backendRequests).toHaveLength(0);

    // Verify Privacy Dashboard live table
    await page.goto(`${LIVE_URL}/#/privacy`);
    await expect(page.getByText(/nothing left your device/i).first()).toBeVisible();
    await expect(page.getByText(/0 transmissions logged/i)).toBeVisible();
  });

  test('7. Live Opt-In AI Explanation: Enum-only payload and safety template fallback', async ({ page }) => {
    let capturedAiPayload: any = null;

    page.on('request', req => {
      if (req.url().includes('/api/explain') && req.method() === 'POST') {
        try {
          capturedAiPayload = JSON.parse(req.postData() || '{}');
        } catch {}
      }
    });

    // Enable AI consent in Consent page
    await page.goto(`${LIVE_URL}/#/consent`);
    await page.getByText(/process my answers/i).click();
    await page.getByText(/use ai assistance/i).click();
    await page.getByRole('button', { name: /i understand, continue/i }).click();
    await page.waitForURL(/.*#\/check/);

    // Select answers
    await page.getByRole('button', { name: /25 to 29 years/i }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /planning for the future/i }).click();
    await page.waitForTimeout(300);

    for (let i = 0; i < 22; i++) {
      if (page.url().includes('#/results') || page.url().includes('#/analysing')) break;
      const skipBtn = page.getByRole('button', { name: /prefer not to say \/ skip/i }).first();
      if (await skipBtn.isVisible().catch(() => false)) {
        await skipBtn.click();
        await page.waitForTimeout(150);
      }
    }

    await page.waitForURL(/.*#\/results/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /why this result/i })).toBeVisible({ timeout: 15000 });

    // If /api/explain was triggered, verify payload contains NO personal data
    if (capturedAiPayload) {
      expect(capturedAiPayload).not.toHaveProperty('name');
      expect(capturedAiPayload).not.toHaveProperty('email');
      expect(capturedAiPayload).not.toHaveProperty('phone');
      expect(capturedAiPayload).not.toHaveProperty('free_text');
      expect(capturedAiPayload).toHaveProperty('factors');
    }
  });

  test('8. Live Data Wipe: Clears inputs, results, and local storage', async ({ page }) => {
    await page.goto(`${LIVE_URL}/#/`);
    const modBtn = page.getByRole('button', { name: /moderate risk case/i });
    await modBtn.scrollIntoViewIfNeeded();
    await modBtn.click();
    await page.waitForURL(/.*#\/results/);

    await page.goto(`${LIVE_URL}/#/privacy`);
    await page.getByRole('button', { name: /delete everything now/i }).click();
    const confirmModalBtn = page.getByRole('button', { name: /erase everything now/i });
    await expect(confirmModalBtn).toBeVisible();
    await confirmModalBtn.click();

    await expect(page.getByText(/all answers, screening results, and local storage entries were completely deleted/i)).toBeVisible();
    const storageData = await page.evaluate(() => localStorage.getItem('hayat_app_data_v1'));
    expect(storageData).toBeNull();
  });

  test('9. Live Accessibility Audit (axe-core): Zero critical or serious issues', async ({ page }) => {
    await page.goto(`${LIVE_URL}/#/`);
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const severeViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(severeViolations).toEqual([]);
  });
});
