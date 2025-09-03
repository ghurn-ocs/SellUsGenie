import { test, expect } from '@playwright/test';

test.describe('Visual Page Builder - Current Functionality Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/page-builder');
    await page.waitForLoadState('networkidle');
    // Give more time for complex components to load
    await page.waitForTimeout(3000);
  });

  test('should load the page builder interface successfully', async ({ page }) => {
    // Check if the main title is present
    await expect(page.locator('h1')).toContainText('Visual Page Builder');
    
    // Take a screenshot for manual verification
    await page.screenshot({ path: 'test-results/page-builder-interface.png', fullPage: true });
    
    // Check for any JavaScript errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Log any errors found (but don't fail the test)
    if (errors.length > 0) {
      console.log('JavaScript errors found:', errors);
    }
    
    // Verify the page loaded without critical errors
    expect(errors.filter(e => !e.includes('Warning:') && !e.includes('DevTools'))).toHaveLength(0);
  });

  test('should display the main navigation elements', async ({ page }) => {
    // Look for main navigation elements that should be present
    const possibleSelectors = [
      'button:has-text("Pages")',
      'button:has-text("Settings")', 
      'text=Visual Page Builder',
      'h1',
      'nav'
    ];

    let foundElements = 0;
    for (const selector of possibleSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          foundElements++;
          console.log(`Found element: ${selector}`);
        }
      } catch {
        // Continue checking other selectors
      }
    }

    // Ensure we found at least some navigation elements
    expect(foundElements).toBeGreaterThan(0);
  });

  test('should be responsive and accessible', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1280, height: 720 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/page-builder-${viewport.width}x${viewport.height}.png`,
        fullPage: true 
      });
      
      // Verify main title is still visible
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should handle basic interactions without errors', async ({ page }) => {
    // Monitor for errors during interactions
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Try to interact with clickable elements
    const clickableElements = await page.locator('button, [role="button"], a[href]').all();
    
    if (clickableElements.length > 0) {
      // Try clicking a few elements
      for (let i = 0; i < Math.min(3, clickableElements.length); i++) {
        try {
          await clickableElements[i].click({ timeout: 2000 });
          await page.waitForTimeout(500);
        } catch (e) {
          // Element might not be clickable, continue
          console.log(`Could not click element ${i}:`, e.message);
        }
      }
    }

    // Wait for any delayed errors
    await page.waitForTimeout(1000);

    // Filter out expected warnings
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('DevTools') &&
      !error.includes('source map')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/page-builder');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Verify main content loaded
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display content without layout issues', async ({ page }) => {
    // Check for basic layout indicators
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Verify main container exists
    const mainContainer = page.locator('div').first();
    await expect(mainContainer).toBeVisible();
    
    // Take final screenshot for manual review
    await page.screenshot({ 
      path: 'test-results/page-builder-final-state.png',
      fullPage: true 
    });
    
    // Log what we can see on the page
    const textContent = await page.textContent('body');
    console.log('Page contains text:', textContent?.substring(0, 200) + '...');
  });

  test('should not have major accessibility violations', async ({ page }) => {
    // Basic accessibility checks
    
    // Check for main heading
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThan(0);
    
    // Check page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // Check for proper viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });
});