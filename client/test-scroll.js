import { test, chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:5174/');
  
  // Wait a moment for page to load.
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
