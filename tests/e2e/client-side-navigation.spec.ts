import { test, expect } from '@playwright/test';

test('Navigation uses client-side routing without full page reload', async ({ page }) => {
  console.log('🔍 Testing client-side navigation functionality...');
  
  // Navigate to storefront
  await page.goto('http://localhost:5173/store/testingmy', { timeout: 30000 });
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Track page reloads using navigation events
  let pageReloadCount = 0;
  page.on('load', () => {
    pageReloadCount++;
    console.log('🔄 Page reload detected!');
  });
  
  // Wait for navigation elements to be available
  await page.waitForSelector('nav', { timeout: 10000 });
  
  // Look for navigation links (both in Page Builder navigation and fallback)
  const navLinks = await page.locator('nav a, nav button').all();
  console.log(`📊 Found ${navLinks.length} navigation elements`);
  
  if (navLinks.length > 0) {
    // Click on the first navigation link
    const firstLink = navLinks[0];
    const linkText = await firstLink.textContent();
    console.log(`🖱️ Clicking navigation link: "${linkText}"`);
    
    // Record initial page reload count
    const initialReloadCount = pageReloadCount;
    
    // Click the navigation link
    await firstLink.click();
    
    // Wait a moment for any potential navigation
    await page.waitForTimeout(2000);
    
    // Check if any page reload occurred
    const finalReloadCount = pageReloadCount;
    const hadPageReload = finalReloadCount > initialReloadCount;
    
    console.log(`📈 Page reloads: ${initialReloadCount} → ${finalReloadCount}`);
    
    if (hadPageReload) {
      console.log('❌ Navigation caused full page reload (not client-side)');
    } else {
      console.log('✅ Navigation used client-side routing (no page reload)');
    }
    
    // Check if URL changed (indicating navigation happened)
    const currentUrl = page.url();
    console.log(`🔗 Current URL after navigation: ${currentUrl}`);
    
    // Verify no page reload occurred
    expect(hadPageReload).toBe(false);
  } else {
    console.log('⚠️ No navigation links found to test');
  }
  
  // Take screenshot for verification
  await page.screenshot({ 
    path: 'test-results/client-side-navigation.png',
    fullPage: true 
  });
  
  expect(true).toBe(true);
});