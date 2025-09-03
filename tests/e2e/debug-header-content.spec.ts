import { test, expect } from '@playwright/test';

test('Debug Header Content Details', async ({ page }) => {
  console.log('🔍 Debugging specific header content and widgets...');
  
  // Capture console messages for header details
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('Header Widget') || text.includes('HEADER') || text.includes('text widget') || text.includes('navigation widget')) {
      console.log('📄 HEADER DETAIL:', text);
    }
  });
  
  // Navigate to storefront
  await page.goto('http://localhost:5173/store/testingmy', { timeout: 30000 });
  
  // Wait for header to load
  await page.waitForTimeout(3000);
  
  // Check for actual header elements
  const headerElement = page.locator('header');
  const headerHTML = await headerElement.innerHTML();
  console.log('📄 Header HTML structure:');
  console.log(headerHTML.substring(0, 500) + '...');
  
  // Look for specific elements
  const logoElement = await page.locator('header img, header [data-widget-type="image"]').count();
  const cartElement = await page.locator('header [data-widget-type="cart"], header button[aria-label*="cart" i]').count();
  const textWidgets = await page.locator('header [data-widget-type="text"]').count();
  const navWidgets = await page.locator('header [data-widget-type="navigation"]').count();
  
  console.log('🔍 Header Element Analysis:');
  console.log(`- Logo/Image widgets: ${logoElement}`);
  console.log(`- Cart widgets: ${cartElement}`);  
  console.log(`- Text widgets: ${textWidgets}`);
  console.log(`- Navigation widgets: ${navWidgets}`);
  
  // Check for hardcoded elements that shouldn't be there
  const shopNowButton = await page.locator('header button:has-text("Shop Now")').count();
  const hardcodedElements = await page.locator('header .storefront-header-content').count();
  
  console.log('🚨 Hardcoded Element Check:');
  console.log(`- "Shop Now" buttons: ${shopNowButton}`);
  console.log(`- Hardcoded header content: ${hardcodedElements}`);
  
  // Check for Page Builder widget attributes
  const pageBuilderWidgets = await page.locator('header [data-widget-type]').count();
  console.log(`- Total Page Builder widgets in header: ${pageBuilderWidgets}`);
  
  if (pageBuilderWidgets === 0) {
    console.log('🚨 CRITICAL: No Page Builder widgets detected in header!');
    console.log('🚨 This means the header is using fallback/hardcoded content');
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-results/header-content-debug.png',
    fullPage: true 
  });
  
  expect(true).toBe(true);
});