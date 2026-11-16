import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const LIVE_URL = 'https://hayat-frontend-ten.vercel.app';
const OUT_DIR = path.resolve('docs', 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    // 1. Home
    await page.goto(`${LIVE_URL}/#/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-home.png`), fullPage: false });

    // 2. Wizard Question
    await page.goto(`${LIVE_URL}/#/consent`, { waitUntil: 'networkidle' });
    await page.getByText(/process my answers/i).click();
    await page.getByRole('button', { name: /i understand, continue/i }).click();
    await page.waitForURL(/.*#\/check/);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-wizard.png`), fullPage: false });

    // 3. Results (via moderate demo persona)
    await page.goto(`${LIVE_URL}/#/`, { waitUntil: 'networkidle' });
    const modBtn = page.getByRole('button', { name: /moderate risk case/i });
    await modBtn.scrollIntoViewIfNeeded();
    await modBtn.click();
    await page.waitForURL(/.*#\/results/);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-results.png`), fullPage: false });

    // 4. Care Navigator
    await page.goto(`${LIVE_URL}/#/care`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-care-navigator.png`), fullPage: false });

    // 5. Privacy Dashboard ("What left your device")
    await page.goto(`${LIVE_URL}/#/privacy`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-privacy-dashboard.png`), fullPage: false });

    // 6. Evidence
    await page.goto(`${LIVE_URL}/#/evidence`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-evidence.png`), fullPage: false });

    // 7. How It Works
    await page.goto(`${LIVE_URL}/#/how-it-works`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}-how-it-works.png`), fullPage: false });

    await page.close();
  }

  await browser.close();
  console.log('Successfully captured all screenshots in docs/screenshots/');
}

capture().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
