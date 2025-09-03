import { test, expect } from '@playwright/test';

test('Debug Footer Raw HTML Issue', async ({ page }) => {
  console.log('🔍 Starting footer debug test...');
  
  // Capture console messages
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('FOOTER DEBUG') || text.includes('Footer Widget')) {
      console.log('📄 CONSOLE:', text);
    }
  });
  
  // Navigate to storefront
  await page.goto('http://localhost:5173/store/testingmy', { timeout: 30000 });
  
  // Wait for page load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/footer-debug.png',
    fullPage: true 
  });
  
  // Check for raw HTML in footer
  const rawHtmlElements = page.locator('text=/&lt;|&gt;|<div|<\\/div>|<h[1-6]|<\\/h[1-6]>/');
  const rawHtmlCount = await rawHtmlElements.count();
  
  console.log('📊 Raw HTML Analysis:');
  console.log(`- Raw HTML elements found: ${rawHtmlCount}`);
  
  // Get footer content
  const footerContent = await page.locator('footer').textContent();
  console.log('🦶 Footer content preview:', footerContent?.substring(0, 300));
  
  // Check for text widgets
  const textWidgets = await page.locator('[data-widget-type="text"]').count();
  console.log(`- Text widgets found: ${textWidgets}`);
  
  // Log all console messages for analysis
  console.log('📋 All Console Messages:');
  consoleLogs.forEach((log, index) => {
    if (log.includes('🔍') || log.includes('Footer Widget') || log.includes('FOOTER DEBUG')) {
      console.log(`${index}: ${log}`);
    }
  });
  
  // The test passes regardless - we're just debugging
  expect(true).toBe(true);
});