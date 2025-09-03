import { test, expect } from '@playwright/test';

test('Debug Header Page Builder Configuration', async ({ page }) => {
  console.log('🎨 Starting header Page Builder debug test...');
  
  // Capture console messages
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('HEADER VISUAL PAGE BUILDER CONFIG') || text.includes('Header Widget') || text.includes('Header Section')) {
      console.log('📄 CONSOLE:', text);
    }
  });
  
  // Navigate to storefront
  await page.goto('http://localhost:5173/store/testingmy', { timeout: 30000 });
  
  // Wait for page load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/header-debug.png',
    fullPage: true 
  });
  
  // Check header styling
  const header = page.locator('header');
  const headerExists = await header.count() > 0;
  console.log(`📊 Header exists: ${headerExists}`);
  
  if (headerExists) {
    // Get computed styles
    const headerBgColor = await header.evaluate(el => getComputedStyle(el).backgroundColor);
    const headerPadding = await header.evaluate(el => getComputedStyle(el).padding);
    const headerMinHeight = await header.evaluate(el => getComputedStyle(el).minHeight);
    
    console.log('🎨 Header Styling:', {
      backgroundColor: headerBgColor,
      padding: headerPadding,
      minHeight: headerMinHeight
    });
  }
  
  // Check for Page Builder theme variables
  const themeVars = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return null;
    
    const computedStyle = getComputedStyle(header);
    return {
      colorPrimary: computedStyle.getPropertyValue('--color-primary'),
      colorBgPrimary: computedStyle.getPropertyValue('--color-bg-primary'),
      colorTextPrimary: computedStyle.getPropertyValue('--color-text-primary')
    };
  });
  
  console.log('🎨 Page Builder Theme Variables:', themeVars);
  
  // Log relevant console messages
  console.log('📋 Page Builder Configuration Messages:');
  consoleLogs.forEach((log, index) => {
    if (log.includes('🎨') || log.includes('Header Widget') || log.includes('HEADER VISUAL')) {
      console.log(`${index}: ${log}`);
    }
  });
  
  expect(true).toBe(true);
});