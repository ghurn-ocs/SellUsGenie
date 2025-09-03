import { test, expect } from '@playwright/test';

test('simple logo test', async ({ page }) => {
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    consoleMessages.push(msg.text());
  });
  
  await page.goto('http://localhost:5173/store/testingmy', { timeout: 10000 });
  
  // Wait a short time for initial rendering
  await page.waitForTimeout(3000);
  
  console.log('\n=== All Console Messages ===');
  consoleMessages.forEach((msg, i) => {
    if (msg.includes('TextView Debug') || msg.includes('Logo') || msg.includes('storeData') || msg.includes('theme')) {
      console.log(`${i}: ${msg}`);
    }
  });
  
  // Just check page loaded
  const header = page.locator('header');
  await expect(header).toBeVisible();
});