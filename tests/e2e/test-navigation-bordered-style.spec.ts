import { test, expect } from '@playwright/test';

test.describe('Navigation Bordered Style', () => {
  test('should apply bordered style to navigation links from theme', async ({ page }) => {
    // Navigate to Glenn's store
    await page.goto('http://localhost:5173/store/testingmy/about');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that navigation links exist
    const navLinks = page.locator('header nav a');
    await expect(navLinks.first()).toBeVisible();
    
    const linkCount = await navLinks.count();
    console.log('Number of navigation links:', linkCount);
    expect(linkCount).toBeGreaterThan(0);
    
    // Check the first navigation link for bordered style
    const firstLink = navLinks.first();
    
    // Get computed styles
    const linkStyles = await firstLink.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        borderWidth: styles.borderWidth,
        borderColor: styles.borderColor,
        borderStyle: styles.borderStyle,
        borderRadius: styles.borderRadius,
        backgroundColor: styles.backgroundColor,
        className: el.className
      };
    });
    
    console.log('Navigation link styles:', linkStyles);
    
    // Check for border (should be present for bordered style)
    expect(linkStyles.borderWidth).not.toBe('0px');
    expect(linkStyles.borderStyle).not.toBe('none');
    
    // Check for golden color (#eeb044 = rgb(238, 176, 68))
    expect(linkStyles.color).toBe('rgb(238, 176, 68)');
    expect(linkStyles.borderColor).toContain('238'); // Should contain golden color values
    
    // Check for rounded borders (buttonStyle: "round")
    expect(linkStyles.borderRadius).not.toBe('0px');
    expect(linkStyles.className).toContain('rounded-full');
    
    // Test hover effect
    await firstLink.hover();
    await page.waitForTimeout(100); // Wait for transition
    
    const hoverStyles = await firstLink.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    console.log('Navigation link hover styles:', hoverStyles);
    
    // On hover, background should be filled with link color
    expect(hoverStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(hoverStyles.backgroundColor).not.toBe('transparent');
  });

  test('should have dark header background from theme', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    
    // Check header background color
    const header = page.locator('header.storefront-header section').first();
    const headerStyles = await header.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    console.log('Header section styles:', headerStyles);
    
    // Header should have dark background (#1E1E1E = rgb(30, 30, 30))
    expect(headerStyles.backgroundColor).toBe('rgb(30, 30, 30)');
    
    // Text should be white (#FFFFFF)
    expect(headerStyles.color).toBe('rgb(255, 255, 255)');
  });

  test('should not have gray text in navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    
    // Check that no navigation links have gray color
    const navLinks = page.locator('header nav a');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const color = await link.evaluate(el => window.getComputedStyle(el).color);
      
      // Should not be gray (rgb(107, 114, 128) or rgb(75, 85, 99))
      expect(color).not.toBe('rgb(107, 114, 128)');
      expect(color).not.toBe('rgb(75, 85, 99)');
      expect(color).not.toBe('rgb(156, 163, 175)');
      
      // Should be golden color
      expect(color).toBe('rgb(238, 176, 68)');
    }
  });
});