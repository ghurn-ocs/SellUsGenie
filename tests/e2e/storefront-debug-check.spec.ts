import { test } from '@playwright/test';

test.describe('Storefront Debug Check', () => {
  test('should identify the correct store URL and check HTML rendering', async ({ page }) => {
    console.log('=== STOREFRONT DEBUG ANALYSIS ===');
    
    // First, try to access the home page to see available routes
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    const homeTitle = await page.title();
    console.log('Home page title:', homeTitle);
    
    // Look for any store-related text or links
    const pageContent = await page.content();
    const storeMatches = pageContent.match(/\/store\/[\w-]+/g);
    if (storeMatches) {
      console.log('Found store URLs:', storeMatches.slice(0, 3));
    }
    
    // Try different potential store URLs
    const testUrls = [
      'http://localhost:5173/store/testingmy',
      'http://localhost:5173/store/testing-my', 
      'http://localhost:5173/store/teststore',
      'http://localhost:5173/store/default',
      'http://localhost:5173/store/any-slug-should-work-now' // Test public access
    ];
    
    for (const url of testUrls) {
      console.log(`Testing URL: ${url}`);
      try {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        const isStoreFound = !await page.locator('text=Store Not Found').isVisible();
        
        if (isStoreFound) {
          console.log(`✅ SUCCESS: Found working store at ${url}`);
          console.log(`Title: ${title}`);
          
          // Now check for HTML rendering issues
          const rawHtmlCount = await page.locator('text=/\\&lt;|\\&gt;|&quot;/').count();
          const textWidgets = await page.locator('[data-widget-type="text"]').count();
          
          console.log(`Raw HTML entities found: ${rawHtmlCount}`);
          console.log(`Text widgets found: ${textWidgets}`);
          
          // Check for the actual text content that might contain HTML
          const textContent = await page.locator('body').textContent();
          const hasRawHtmlTags = textContent?.includes('<div') || textContent?.includes('<header') || false;
          
          console.log(`Raw HTML tags visible in text: ${hasRawHtmlTags}`);
          
          if (hasRawHtmlTags) {
            console.log('🔍 FOUND THE ISSUE: Raw HTML is being displayed as text');
          }
          
          // Take screenshot of working store
          await page.screenshot({ 
            path: `test-results/working-store-${new Date().getTime()}.png`,
            fullPage: true 
          });
          
          break;
        } else {
          console.log(`❌ Store not found at ${url}`);
        }
      } catch {
        console.log(`❌ Error accessing ${url}:`);
      }
    }
    
    // Also try to access the debug interface directly
    try {
      await page.goto('http://localhost:5173/debug');
      await page.waitForLoadState('networkidle');
      const debugContent = await page.locator('body').textContent();
      if (debugContent && debugContent.includes('Store Information')) {
        console.log('✅ Debug interface accessible');
        
        // Extract store information
        const storeInfo = debugContent.match(/Store Name: (.*?)\\n/)?.[1];
        const storeId = debugContent.match(/Store ID: (.*?)\\n/)?.[1];
        
        if (storeInfo && storeId) {
          console.log(`Found store info - Name: ${storeInfo}, ID: ${storeId}`);
        }
      }
    } catch {
      console.log('Debug interface not accessible');
    }
  });
});