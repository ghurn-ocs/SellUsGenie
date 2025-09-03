import { test, expect } from '@playwright/test';

test.describe('Debug Logo Replacement', () => {
  test('should debug logo replacement process', async ({ page }) => {
    // Capture all console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    // Navigate to Glenn's store
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Log all console messages
    console.log('\n=== Browser Console Messages ===');
    consoleMessages.forEach(msg => {
      if (msg.includes('Logo') || msg.includes('logo') || msg.includes('theme') || msg.includes('Testingmy') || msg.includes('storeData')) {
        console.log(msg);
      }
    });
    
    // Check raw header HTML
    const headerHTML = await page.locator('header.storefront-header').innerHTML();
    console.log('\n=== Header HTML Analysis ===');
    console.log('Contains "Testingmy":', headerHTML.includes('Testingmy'));
    console.log('Contains "store-logo":', headerHTML.includes('store-logo'));
    console.log('Contains "<img":', headerHTML.includes('<img'));
    
    // Check if text widgets have proper theme data
    const textWidgets = page.locator('header [data-widget-type="text"]');
    const widgetCount = await textWidgets.count();
    console.log('\nText widgets count:', widgetCount);
    
    for (let i = 0; i < widgetCount; i++) {
      const widget = textWidgets.nth(i);
      const widgetHTML = await widget.innerHTML();
      const widgetText = await widget.textContent();
      
      console.log(`\nText widget ${i}:`);
      console.log('  Text content:', widgetText?.trim());
      console.log('  Contains Testingmy:', widgetText?.includes('Testingmy'));
      console.log('  HTML preview:', widgetHTML.substring(0, 200));
    }
    
    // Check if PageBuilderRenderer is passing storeData correctly
    const pageBuilderContent = page.locator('.page-builder-content');
    await expect(pageBuilderContent).toBeVisible();
  });

  test('should check theme data availability', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('🎨') || msg.text().includes('theme') || msg.text().includes('storeData')) {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Theme and StoreData Messages ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    // Force trigger some theme processing
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const newMessages: string[] = [];
    page.on('console', msg => newMessages.push(msg.text()));
    
    console.log('\n=== After Reload Messages ===');
    newMessages.slice(-10).forEach(msg => console.log(msg));
  });
});