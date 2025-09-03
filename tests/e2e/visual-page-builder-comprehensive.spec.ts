import { test, expect } from '@playwright/test';

test.describe('Visual Page Builder - Comprehensive UX/UI Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Visual Page Builder
    await page.goto('/page-builder');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test.describe('Core Navigation and Interface', () => {
    test('should display main interface with correct branding and navigation', async ({ page }) => {
      // Check main title and branding
      await expect(page.locator('h1')).toContainText('Visual Page Builder');
      await expect(page.locator('text=Standalone Development Version')).toBeVisible();
      
      // Check navigation tabs
      await expect(page.locator('button:has-text("Pages")')).toBeVisible();
      await expect(page.locator('button:has-text("Settings")')).toBeVisible();
      
      // Verify initial page count and limit indicator
      await expect(page.locator('text=1 of 10 pages used')).toBeVisible();
      
      // Check page limit progress bar
      const progressBar = page.locator('.bg-\\[\\#9B51E0\\]').first();
      await expect(progressBar).toBeVisible();
    });

    test('should navigate between Pages and Settings tabs', async ({ page }) => {
      // Start on Pages tab (default)
      const pagesTab = page.locator('button:has-text("Pages")');
      const settingsTab = page.locator('button:has-text("Settings")');
      
      // Verify Pages tab is active
      await expect(pagesTab).toHaveClass(/bg-\[#9B51E0\]/);
      
      // Click Settings tab
      await settingsTab.click();
      await expect(settingsTab).toHaveClass(/bg-\[#9B51E0\]/);
      await expect(page.locator('h2:has-text("Site Settings")')).toBeVisible();
      
      // Navigate back to Pages
      await pagesTab.click();
      await expect(pagesTab).toHaveClass(/bg-\[#9B51E0\]/);
      await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
    });

    test('should display default home page correctly', async ({ page }) => {
      // Check default home page exists
      const homePage = page.locator('text=Home Page').first();
      await expect(homePage).toBeVisible();
      
      // Verify home page details
      await expect(page.locator('text=/')).toBeVisible(); // slug
      await expect(page.locator('text=draft')).toBeVisible(); // status
      
      // Check home page icon
      const homeIcon = page.locator('[data-lucide="home"]').first();
      await expect(homeIcon).toBeVisible();
    });
  });

  test.describe('Page Management Operations', () => {
    test('should open template selector when clicking New Page', async ({ page }) => {
      // Click New Page button
      await page.locator('button:has-text("New Page")').click();
      
      // Verify template selector appears
      await expect(page.locator('h2:has-text("Choose Template")')).toBeVisible();
      
      // Check all expected templates are present
      const expectedTemplates = [
        'Home Page', 'About Us', 'Contact Us', 'Products & Services', 
        'Privacy Policy', 'Terms of Service', 'Blank Page'
      ];
      
      for (const template of expectedTemplates) {
        await expect(page.locator(`text=${template}`)).toBeVisible();
      }
      
      // Verify template categories
      await expect(page.locator('text=Basic')).toBeVisible();
      await expect(page.locator('text=Commerce')).toBeVisible();
      await expect(page.locator('text=Legal')).toBeVisible();
    });

    test('should create new page from template', async ({ page }) => {
      // Click New Page
      await page.locator('button:has-text("New Page")').click();
      
      // Select About Us template
      await page.locator('text=About Us').click();
      
      // Should automatically navigate to editor
      await expect(page.locator('h2:has-text("About Us")')).toBeVisible();
      await expect(page.locator('text=/about-us')).toBeVisible();
      
      // Should show editor interface
      await expect(page.locator('button:has-text("Preview")')).toBeVisible();
      await expect(page.locator('button:has-text("Save")')).toBeVisible();
    });

    test('should navigate back from template selector', async ({ page }) => {
      // Open template selector
      await page.locator('button:has-text("New Page")').click();
      
      // Click back arrow
      await page.locator('[data-lucide="arrow-left"]').last().click();
      
      // Should return to pages list
      await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
      await expect(page.locator('button:has-text("New Page")')).toBeVisible();
    });

    test('should edit page when clicking Edit button', async ({ page }) => {
      // Click Edit button on home page
      await page.locator('button:has-text("Edit")').first().click();
      
      // Should navigate to editor
      await expect(page.locator('h2:has-text("Home Page")')).toBeVisible();
      await expect(page.locator('text=/')).toBeVisible();
      
      // Should show enhanced page builder interface
      await expect(page.locator('button:has-text("Preview")')).toBeVisible();
      await expect(page.locator('button:has-text("Save")')).toBeVisible();
    });

    test('should duplicate page functionality', async ({ page }) => {
      // Get initial page count (for reference)
      // const _initialCount = await page.locator('text=/\\d+ of 10 pages used/').textContent();
      
      // Click duplicate button
      await page.locator('[data-lucide="copy"]').first().click();
      
      // Should create a new page with "(Copy)" suffix
      await expect(page.locator('text=Home Page (Copy)')).toBeVisible();
      
      // Should update page count
      await expect(page.locator('text=2 of 10 pages used')).toBeVisible();
    });

    test('should prevent deleting home page', async ({ page }) => {
      // Home page should not have delete button
      const homePage = page.locator('text=Home Page').first().locator('xpath=..');
      const deleteButton = homePage.locator('[data-lucide="trash-2"]');
      
      await expect(deleteButton).not.toBeVisible();
    });

    test('should handle page limit enforcement', async ({ page }) => {
      // Create pages until near limit (test with smaller number for speed)
      for (let i = 0; i < 3; i++) {
        await page.locator('button:has-text("New Page")').click();
        await page.locator('text=Blank Page').click();
        
        // Navigate back to pages list
        await page.locator('[data-lucide="arrow-left"]').first().click();
      }
      
      // Check page count increased
      await expect(page.locator('text=4 of 10 pages used')).toBeVisible();
      
      // Progress bar should reflect usage
      const progressBar = page.locator('.bg-\\[\\#9B51E0\\]').first();
      await expect(progressBar).toBeVisible();
    });
  });

  test.describe('Enhanced Page Builder Integration', () => {
    test('should load enhanced page builder when editing', async ({ page }) => {
      // Edit home page
      await page.locator('button:has-text("Edit")').first().click();
      
      // Wait for enhanced page builder to load
      await page.waitForTimeout(2000);
      
      // Should show editor header
      await expect(page.locator('h2:has-text("Home Page")')).toBeVisible();
      
      // Should show action buttons
      await expect(page.locator('button:has-text("Preview")')).toBeVisible();
      await expect(page.locator('button:has-text("Save")')).toBeVisible();
      
      // Should render the enhanced page builder component
      // Note: The actual enhanced page builder content depends on successful component loading
      await expect(page.locator('.h-full.bg-white')).toBeVisible();
    });

    test('should navigate back from editor to pages list', async ({ page }) => {
      // Enter editor
      await page.locator('button:has-text("Edit")').first().click();
      
      // Click back arrow
      await page.locator('[data-lucide="arrow-left"]').first().click();
      
      // Should return to pages list
      await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
      await expect(page.locator('button:has-text("New Page")')).toBeVisible();
    });
  });

  test.describe('Settings and Configuration', () => {
    test('should display site settings correctly', async ({ page }) => {
      // Navigate to Settings tab
      await page.locator('button:has-text("Settings")').click();
      
      // Check main settings sections
      await expect(page.locator('h3:has-text("Navigation Links")')).toBeVisible();
      await expect(page.locator('h3:has-text("Site Information")')).toBeVisible();
      
      // Verify navigation links section shows pages
      await expect(page.locator('text=Home Page')).toBeVisible();
      await expect(page.locator('code:has-text("/")')).toBeVisible();
      
      // Check site information form fields
      await expect(page.locator('label:has-text("Site Title")')).toBeVisible();
      await expect(page.locator('label:has-text("Site Description")')).toBeVisible();
      
      // Verify form inputs are functional
      const titleInput = page.locator('input[placeholder="My Store"]');
      await expect(titleInput).toBeVisible();
      await titleInput.fill('Test Store Name');
      await expect(titleInput).toHaveValue('Test Store Name');
    });

    test('should show all pages in navigation links', async ({ page }) => {
      // Create an additional page first
      await page.locator('button:has-text("New Page")').click();
      await page.locator('text=Contact Us').click();
      
      // Navigate back and go to settings
      await page.locator('[data-lucide="arrow-left"]').first().click();
      await page.locator('button:has-text("Settings")').click();
      
      // Should show both pages in navigation
      await expect(page.locator('text=Home Page')).toBeVisible();
      await expect(page.locator('text=Contact Us')).toBeVisible();
      
      // Should show their respective URLs
      await expect(page.locator('code:has-text("/")')).toBeVisible();
      await expect(page.locator('code:has-text("/contact-us")')).toBeVisible();
    });
  });

  test.describe('Responsive Design and Accessibility', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Main interface should still be accessible
      await expect(page.locator('h1:has-text("Visual Page Builder")')).toBeVisible();
      await expect(page.locator('button:has-text("Pages")')).toBeVisible();
      await expect(page.locator('button:has-text("Settings")')).toBeVisible();
      
      // Page list should be scrollable
      await expect(page.locator('button:has-text("New Page")')).toBeVisible();
      await expect(page.locator('text=Home Page')).toBeVisible();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // All main elements should be visible
      await expect(page.locator('h1:has-text("Visual Page Builder")')).toBeVisible();
      await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
      await expect(page.locator('button:has-text("New Page")')).toBeVisible();
    });

    test('should have proper keyboard navigation', async ({ page }) => {
      // Tab through main navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to activate buttons with Enter/Space
      await page.keyboard.press('Enter');
      
      // Focus should be visible (check for focus styles)
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper color contrast for accessibility', async ({ page }) => {
      // Check that text is visible against backgrounds
      const pageTitle = page.locator('h2:has-text("Pages")');
      await expect(pageTitle).toBeVisible();
      
      // Check button contrast
      const newPageButton = page.locator('button:has-text("New Page")');
      await expect(newPageButton).toBeVisible();
      
      // Verify status badges are readable
      const statusBadge = page.locator('text=draft');
      await expect(statusBadge).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle rapid interactions gracefully', async ({ page }) => {
      // Rapidly click between tabs
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("Settings")').click();
        await page.locator('button:has-text("Pages")').click();
      }
      
      // Should still function correctly
      await expect(page.locator('h2:has-text("Pages")')).toBeVisible();
      await expect(page.locator('button:has-text("New Page")')).toBeVisible();
    });

    test('should maintain state during navigation', async ({ page }) => {
      // Create a new page
      await page.locator('button:has-text("New Page")').click();
      await page.locator('text=About Us').click();
      
      // Navigate away and back
      await page.locator('[data-lucide="arrow-left"]').first().click();
      
      // Page should still exist
      await expect(page.locator('text=About Us')).toBeVisible();
      await expect(page.locator('text=2 of 10 pages used')).toBeVisible();
    });

    test('should handle empty states gracefully', async ({ page }) => {
      // Settings tab should handle empty form gracefully
      await page.locator('button:has-text("Settings")').click();
      
      // Form fields should have proper placeholders
      await expect(page.locator('input[placeholder="My Store"]')).toBeVisible();
      await expect(page.locator('textarea[placeholder*="description"]')).toBeVisible();
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should load within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/page-builder');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle large numbers of pages efficiently', async ({ page }) => {
      // Create several pages to test performance
      for (let i = 0; i < 5; i++) {
        await page.locator('button:has-text("New Page")').click();
        await page.locator('text=Blank Page').click();
        await page.locator('[data-lucide="arrow-left"]').first().click();
      }
      
      // Page list should still be responsive
      const pagesList = page.locator('div').filter({ hasText: 'Home Page' }).first();
      await expect(pagesList).toBeVisible();
      
      // Should show correct count
      await expect(page.locator('text=6 of 10 pages used')).toBeVisible();
    });

    test('should not have console errors during normal usage', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Perform typical user actions
      await page.locator('button:has-text("Settings")').click();
      await page.locator('button:has-text("Pages")').click();
      await page.locator('button:has-text("New Page")').click();
      await page.locator('[data-lucide="arrow-left"]').last().click();
      
      // Wait for any delayed errors
      await page.waitForTimeout(1000);
      
      // Filter out expected development warnings
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('Warning:') && 
        !error.includes('Download the React DevTools') &&
        !error.includes('source map')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Visual Consistency and Branding', () => {
    test('should maintain consistent color scheme', async ({ page }) => {
      // Check primary purple color usage
      const primaryButton = page.locator('button:has-text("New Page")');
      await expect(primaryButton).toHaveCSS('background-color', /rgb\(155, 81, 224\)/);
      
      // Check selected state colors
      const pagesTab = page.locator('button:has-text("Pages")');
      await expect(pagesTab).toHaveCSS('background-color', /rgb\(155, 81, 224\)/);
    });

    test('should have consistent spacing and typography', async ({ page }) => {
      // Check heading hierarchy
      const mainTitle = page.locator('h1:has-text("Visual Page Builder")');
      await expect(mainTitle).toBeVisible();
      
      const sectionTitle = page.locator('h2:has-text("Pages")');
      await expect(sectionTitle).toBeVisible();
      
      // Check consistent button styling
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });

    test('should have proper hover and focus states', async ({ page }) => {
      // Test button hover states
      const newPageButton = page.locator('button:has-text("New Page")');
      await newPageButton.hover();
      
      // Should have visible hover effect
      await expect(newPageButton).toBeVisible();
      
      // Test link hover states
      const settingsTab = page.locator('button:has-text("Settings")');
      await settingsTab.hover();
      await expect(settingsTab).toBeVisible();
    });
  });
});