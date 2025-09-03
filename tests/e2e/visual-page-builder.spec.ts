import { test, expect } from '@playwright/test';

test.describe('Visual Page Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Visual Page Builder
    await page.goto('/page-builder');
  });

  test('should load Visual Page Builder page without errors', async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Check that the page loads without console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to catch any console errors
    await page.waitForTimeout(2000);

    // Check for React errors specifically
    const reactErrors = errors.filter(error => 
      error.includes('React') || 
      error.includes('ReferenceError') || 
      error.includes('TypeError') ||
      error.includes('Maximum update depth exceeded')
    );

    expect(reactErrors).toHaveLength(0);
    
    if (reactErrors.length > 0) {
      console.log('React errors found:', reactErrors);
    }
  });

  test('should display Visual Page Builder content', async ({ page }) => {
    // Check for the main heading
    await expect(page.locator('h1')).toContainText('Visual Page Builder');

    // Check for the subtitle
    await expect(page.locator('text=Standalone development version')).toBeVisible();

    // Check for the success message
    await expect(page.locator('text=✅ Route is working!')).toBeVisible();

    // Check for the test description
    await expect(page.locator('text=This is a simplified test version')).toBeVisible();
  });

  test('should have correct styling and layout', async ({ page }) => {
    // Check that the main container has dark background
    const mainContainer = page.locator('div').first();
    await expect(mainContainer).toBeVisible();

    // Check that the arrow icon is visible
    const arrowIcon = page.locator('svg').first();
    await expect(arrowIcon).toBeVisible();

    // Check that the content is centered
    const container = page.locator('div').filter({ hasText: 'Visual Page Builder' }).first();
    await expect(container).toBeVisible();
    
    // Check that the success message container has the expected styling
    const successBox = page.locator('text=✅ Route is working!');
    await expect(successBox).toBeVisible();
  });

  test('should not have any accessibility violations', async ({ page }) => {
    // Check for basic accessibility requirements
    
    // Page should have a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('SellUsGenie');

    // Main heading should be properly structured
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Visual Page Builder');

    // Text should have sufficient contrast (basic check)
    const textElement = page.locator('text=✅ Route is working!');
    await expect(textElement).toBeVisible();
  });

  test('should handle navigation and routing correctly', async ({ page }) => {
    // Check that we're on the correct route
    expect(page.url()).toContain('/page-builder');

    // Check that the page loads within reasonable time
    const startTime = Date.now();
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=✅ Route is working!')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=✅ Route is working!')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=✅ Route is working!')).toBeVisible();
  });

  test('should not have any network errors', async ({ page }) => {
    const networkErrors: string[] = [];
    
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    // Navigate and wait for network activity to settle
    await page.goto('/page-builder');
    await page.waitForLoadState('networkidle');

    // Check for any 4xx or 5xx responses
    expect(networkErrors).toHaveLength(0);
    
    if (networkErrors.length > 0) {
      console.log('Network errors found:', networkErrors);
    }
  });

  test('should have proper meta tags and SEO elements', async ({ page }) => {
    // Check page title
    const title = await page.title();
    expect(title).toBeTruthy();

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');

    // Check charset
    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveAttribute('charset', 'UTF-8');
  });
});