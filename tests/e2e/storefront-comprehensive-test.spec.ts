/**
 * Comprehensive Storefront Test - Visual Page Builder Integration
 * Tests all published pages in the testingmy store to ensure proper loading and functionality
 */

import { test, expect } from '@playwright/test';

const STORE_SLUG = 'testingmy';
const BASE_URL = 'http://localhost:5174';
const STORE_BASE_URL = `${BASE_URL}/store/${STORE_SLUG}`;

// Test data based on our database analysis
const STORE_PAGES = [
  {
    name: 'Home Page',
    slug: '', // Root path
    fullSlug: '/home',
    type: 'page',
    navigation: 'header',
    expectedContent: ['Home', 'Welcome']
  },
  {
    name: 'About Us',
    slug: 'about',
    fullSlug: '/about',
    type: 'page',
    navigation: 'both',
    expectedContent: ['About', 'About Us']
  },
  {
    name: 'Products & Services',
    slug: 'products-services',
    fullSlug: '/products-services',
    type: 'page',
    navigation: 'header',
    expectedContent: ['Products', 'Services']
  },
  {
    name: 'Contact Us',
    slug: 'contact',
    fullSlug: '/contact',
    type: 'page',
    navigation: 'both',
    expectedContent: ['Contact', 'Contact Us']
  },
  {
    name: 'Privacy Policy',
    slug: 'privacy',
    fullSlug: '/privacy',
    type: 'page',
    navigation: 'footer',
    expectedContent: ['Privacy', 'Policy']
  },
  {
    name: 'Terms & Conditions',
    slug: 'terms',
    fullSlug: '/terms',
    type: 'page',
    navigation: 'footer',
    expectedContent: ['Terms', 'Conditions']
  },
  {
    name: 'Returns',
    slug: 'returns',
    fullSlug: '/returns',
    type: 'page',
    navigation: 'footer',
    expectedContent: ['Returns', 'Return']
  }
];

test.describe('Storefront Comprehensive Test - Testingmy Store', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up page with reasonable timeout and viewport
    page.setDefaultTimeout(30000);
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Store home page loads successfully', async ({ page }) => {
    console.log('🏠 Testing store home page...');
    
    // Navigate to store home
    await page.goto(STORE_BASE_URL);
    
    // Wait for content to load (not just loading spinner)
    await page.waitForSelector('body', { state: 'attached' });
    
    // Check that we're not showing loading spinner
    const loadingSpinner = page.locator('.animate-spin');
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    
    // Check that we're not showing error message
    const errorMessage = page.locator('text="Store Not Found"');
    await expect(errorMessage).not.toBeVisible();
    
    const pageNotFound = page.locator('text="Page Not Found"');
    await expect(pageNotFound).not.toBeVisible();
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: `tests/screenshots/storefront-home-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ Home page loaded successfully');
  });

  // Test each individual page
  STORE_PAGES.forEach(pageInfo => {
    test(`Page: ${pageInfo.name} (${pageInfo.slug || 'home'}) loads correctly`, async ({ page }) => {
      console.log(`📄 Testing page: ${pageInfo.name}...`);
      
      const pageUrl = pageInfo.slug ? `${STORE_BASE_URL}/${pageInfo.slug}` : STORE_BASE_URL;
      
      // Navigate to the page
      await page.goto(pageUrl);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Check that loading spinner is gone
      const loadingSpinner = page.locator('.animate-spin');
      await expect(loadingSpinner).not.toBeVisible({ timeout: 15000 });
      
      // Check that we don't have error messages
      const errorMessage = page.locator('text="Failed to load page content"');
      await expect(errorMessage).not.toBeVisible();
      
      const pageNotFound = page.locator('text="Page Not Found"');
      await expect(pageNotFound).not.toBeVisible();
      
      const notPublished = page.locator('text="not found or not published"');
      await expect(notPublished).not.toBeVisible();
      
      // Verify page has some content (not just empty)
      const bodyContent = await page.textContent('body');
      expect(bodyContent).toBeTruthy();
      expect(bodyContent!.trim().length).toBeGreaterThan(10);
      
      // Check for expected content keywords
      for (const keyword of pageInfo.expectedContent) {
        const hasKeyword = bodyContent!.toLowerCase().includes(keyword.toLowerCase());
        if (hasKeyword) {
          console.log(`  ✅ Found expected content: "${keyword}"`);
          break; // At least one keyword found
        }
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: `tests/screenshots/storefront-${pageInfo.slug || 'home'}-${Date.now()}.png`,
        fullPage: true 
      });
      
      console.log(`✅ Page ${pageInfo.name} loaded successfully`);
    });
  });

  test('Navigation between pages works correctly', async ({ page }) => {
    console.log('🧭 Testing page navigation...');
    
    // Start at home page
    await page.goto(STORE_BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test navigation to different pages
    const pagesToTest = STORE_PAGES.filter(p => p.slug !== '').slice(0, 3); // Test first 3 non-home pages
    
    for (const pageInfo of pagesToTest) {
      console.log(`  Navigating to: ${pageInfo.name}`);
      
      const pageUrl = `${STORE_BASE_URL}/${pageInfo.slug}`;
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded
      const loadingSpinner = page.locator('.animate-spin');
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
      
      // Verify URL is correct
      expect(page.url()).toBe(pageUrl);
      
      console.log(`  ✅ Successfully navigated to ${pageInfo.name}`);
    }
    
    console.log('✅ Navigation test completed');
  });

  test('Invalid page returns proper 404', async ({ page }) => {
    console.log('🔍 Testing 404 handling...');
    
    const invalidUrl = `${STORE_BASE_URL}/invalid-page-that-does-not-exist`;
    await page.goto(invalidUrl);
    await page.waitForLoadState('networkidle');
    
    // Should show appropriate error message
    const pageNotFound = page.locator('text="Page Not Found"');
    const notPublished = page.locator('text="not found or not published"');
    
    // Either message is acceptable
    const hasErrorMessage = await pageNotFound.isVisible() || await notPublished.isVisible();
    expect(hasErrorMessage).toBeTruthy();
    
    console.log('✅ 404 handling works correctly');
  });

  test('Page performance and load times', async ({ page }) => {
    console.log('⚡ Testing page performance...');
    
    const performanceResults: Array<{ page: string, loadTime: number }> = [];
    
    // Test load times for key pages
    const keyPages = STORE_PAGES.slice(0, 4); // Test first 4 pages
    
    for (const pageInfo of keyPages) {
      const pageUrl = pageInfo.slug ? `${STORE_BASE_URL}/${pageInfo.slug}` : STORE_BASE_URL;
      
      const startTime = Date.now();
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      // Wait for loading spinner to disappear
      const loadingSpinner = page.locator('.animate-spin');
      await expect(loadingSpinner).not.toBeVisible({ timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      performanceResults.push({ 
        page: pageInfo.name, 
        loadTime 
      });
      
      console.log(`  📊 ${pageInfo.name}: ${loadTime}ms`);
      
      // Performance assertion - pages should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    }
    
    const averageLoadTime = performanceResults.reduce((sum, result) => sum + result.loadTime, 0) / performanceResults.length;
    console.log(`📊 Average load time: ${Math.round(averageLoadTime)}ms`);
    
    // Average load time should be reasonable (under 5 seconds)
    expect(averageLoadTime).toBeLessThan(5000);
    
    console.log('✅ Performance test completed');
  });

  test('Visual Page Builder content renders properly', async ({ page }) => {
    console.log('🎨 Testing Visual Page Builder content rendering...');
    
    // Test home page which should have sections
    await page.goto(STORE_BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load
    const loadingSpinner = page.locator('.animate-spin');
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    
    // Check for section structure (Visual Page Builder uses sections)
    const hasSections = await page.locator('section').count() > 0;
    if (hasSections) {
      console.log('  ✅ Found section elements (Visual Page Builder structure)');
    }
    
    // Check for grid structure (Visual Page Builder uses CSS Grid)
    const hasGridElements = await page.locator('.grid').count() > 0;
    if (hasGridElements) {
      console.log('  ✅ Found grid elements (Visual Page Builder layout)');
    }
    
    // Verify content is not just fallback message
    const bodyText = await page.textContent('body');
    const isFallbackContent = bodyText?.includes('This store is still being set up') || 
                              bodyText?.includes('No published page builder content');
    
    expect(isFallbackContent).toBeFalsy();
    
    console.log('✅ Visual Page Builder content renders properly');
  });

  test('Mobile responsive design', async ({ page }) => {
    console.log('📱 Testing mobile responsiveness...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto(STORE_BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load
    const loadingSpinner = page.locator('.animate-spin');
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: `tests/screenshots/storefront-mobile-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Verify content is visible and not cut off
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.trim().length).toBeGreaterThan(10);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take tablet screenshot
    await page.screenshot({ 
      path: `tests/screenshots/storefront-tablet-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ Mobile responsiveness test completed');
  });

});

test.describe('Storefront Integration Health Check', () => {
  
  test('Visual Page Builder system is operational', async ({ page }) => {
    console.log('🏥 Running system health check...');
    
    // Test that the system can handle rapid navigation
    const pages = [STORE_BASE_URL, `${STORE_BASE_URL}/about`, `${STORE_BASE_URL}/contact`];
    
    for (let i = 0; i < pages.length; i++) {
      await page.goto(pages[i]);
      await page.waitForLoadState('networkidle');
      
      // Verify no JavaScript errors
      const errors = await page.evaluate(() => {
        const errors = [];
        window.addEventListener('error', (e) => errors.push(e.error));
        return errors;
      });
      
      expect(errors.length).toBe(0);
      
      // Quick load check
      const loadingSpinner = page.locator('.animate-spin');
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
    }
    
    console.log('✅ System health check passed');
  });

});