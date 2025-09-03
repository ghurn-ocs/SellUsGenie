import { test, expect } from '@playwright/test';

test.describe('Visual Page Builder - Focused UX/UI Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/page-builder');
    await page.waitForLoadState('networkidle');
  });

  test('should display main interface and core functionality', async ({ page }) => {
    // Check main title and branding
    await expect(page.locator('h1')).toContainText('Visual Page Builder');
    
    // Check navigation tabs are functional
    const pagesTab = page.locator('button:has-text("Pages")');
    const settingsTab = page.locator('button:has-text("Settings")');
    
    await expect(pagesTab).toBeVisible();
    await expect(settingsTab).toBeVisible();
    
    // Test tab navigation
    await settingsTab.click();
    await expect(page.locator('h2:has-text("Site Settings")')).toBeVisible();
    
    await pagesTab.click();
    await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
  });

  test('should display and manage pages correctly', async ({ page }) => {
    // Check default home page exists
    await expect(page.locator('text=Home Page').first()).toBeVisible();
    await expect(page.locator('text=draft').first()).toBeVisible();
    
    // Check page count indicator
    await expect(page.locator('text=1 of 10 pages used')).toBeVisible();
    
    // Test Edit button functionality
    const editButton = page.locator('button:has-text("Edit")').first();
    await expect(editButton).toBeVisible();
    
    await editButton.click();
    
    // Should navigate to editor view
    await expect(page.locator('h2').filter({ hasText: 'Home Page' })).toBeVisible();
    await expect(page.locator('button:has-text("Preview")')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
  });

  test('should create new pages from templates', async ({ page }) => {
    // Click New Page button
    await page.locator('button:has-text("New Page")').click();
    
    // Should show template selector
    await expect(page.locator('h2:has-text("Choose Template")')).toBeVisible();
    
    // Check templates are available
    await expect(page.locator('h3:has-text("About Us")').first()).toBeVisible();
    await expect(page.locator('h3:has-text("Contact Us")').first()).toBeVisible();
    await expect(page.locator('h3:has-text("Blank Page")').first()).toBeVisible();
    
    // Select a template
    await page.locator('div').filter({ hasText: /^About UsCompany informationBasic$/ }).click();
    
    // Should create page and navigate to editor
    await expect(page.locator('h2').filter({ hasText: 'About Us' })).toBeVisible();
  });

  test('should handle page duplication', async ({ page }) => {
    // Click duplicate button on home page
    const duplicateButton = page.locator('[data-lucide="copy"]').first();
    await expect(duplicateButton).toBeVisible();
    
    await duplicateButton.click();
    
    // Should create duplicated page
    await expect(page.locator('text=Home Page (Copy)')).toBeVisible();
    
    // Page count should increase
    await expect(page.locator('text=2 of 10 pages used')).toBeVisible();
  });

  test('should display settings correctly', async ({ page }) => {
    // Navigate to settings
    await page.locator('button:has-text("Settings")').click();
    
    // Check main settings sections
    await expect(page.locator('h3:has-text("Navigation Links")')).toBeVisible();
    await expect(page.locator('h3:has-text("Site Information")')).toBeVisible();
    
    // Check form inputs work
    const titleInput = page.locator('input[placeholder="My Store"]');
    await expect(titleInput).toBeVisible();
    
    await titleInput.fill('Test Store Name');
    await expect(titleInput).toHaveValue('Test Store Name');
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1:has-text("Visual Page Builder")')).toBeVisible();
    await expect(page.locator('button:has-text("Pages")')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1:has-text("Visual Page Builder")')).toBeVisible();
    await expect(page.locator('button:has-text("New Page")')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('h1:has-text("Visual Page Builder")')).toBeVisible();
    await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
  });

  test('should handle navigation flow correctly', async ({ page }) => {
    // Start at pages view
    await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
    
    // Go to template selector
    await page.locator('button:has-text("New Page")').click();
    await expect(page.locator('h2:has-text("Choose Template")')).toBeVisible();
    
    // Navigate back using arrow
    await page.locator('[data-lucide="arrow-left"]').last().click();
    await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
    
    // Go to settings
    await page.locator('button:has-text("Settings")').click();
    await expect(page.locator('h2:has-text("Site Settings")')).toBeVisible();
    
    // Return to pages
    await page.locator('button:has-text("Pages")').click();
    await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
  });

  test('should maintain visual consistency', async ({ page }) => {
    // Check primary button styling
    const newPageButton = page.locator('button:has-text("New Page")');
    await expect(newPageButton).toBeVisible();
    
    // Check edit button styling
    const editButton = page.locator('button:has-text("Edit")').first();
    await expect(editButton).toBeVisible();
    
    // Check progress bar is visible
    const progressBar = page.locator('.bg-\\[\\#9B51E0\\]').first();
    await expect(progressBar).toBeVisible();
    
    // Test hover states
    await newPageButton.hover();
    await expect(newPageButton).toBeVisible();
  });

  test('should load within performance thresholds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/page-builder');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    
    // Check that main elements are rendered
    await expect(page.locator('h1:has-text("Visual Page Builder")')).toBeVisible();
    await expect(page.locator('button:has-text("New Page")')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test rapid interactions
    for (let i = 0; i < 3; i++) {
      await page.locator('button:has-text("Settings")').click();
      await page.locator('button:has-text("Pages")').click();
    }
    
    // Should still function correctly
    await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
    
    // Test form validation
    await page.locator('button:has-text("Settings")').click();
    const titleInput = page.locator('input[placeholder="My Store"]');
    
    // Clear and fill input
    await titleInput.clear();
    await titleInput.fill('');
    await titleInput.fill('Valid Store Name');
    await expect(titleInput).toHaveValue('Valid Store Name');
  });
});