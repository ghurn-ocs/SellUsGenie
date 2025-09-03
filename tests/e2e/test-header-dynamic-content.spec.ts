import { test, expect } from '@playwright/test';

test.describe('Header Dynamic Content Rendering', () => {
  test('should display store name dynamically from database', async ({ page }) => {
    // Navigate to Glenn's store (testingmy)
    await page.goto('http://localhost:5173/store/testingmy');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that the header is rendered (either via PageBuilder or fallback)
    const header = await page.locator('header.storefront-header').first();
    await expect(header).toBeVisible();
    
    // Check for store name in the header - should be "Testingmy" not hardcoded
    const headerContent = await header.textContent();
    console.log('Header content:', headerContent);
    
    // The header should contain the store name
    expect(headerContent).toContain('Testingmy');
    
    // Check that the header doesn't contain raw HTML tags
    expect(headerContent).not.toContain('<div');
    expect(headerContent).not.toContain('<h1');
    
    // Check for navigation links
    const navLinks = await page.locator('header nav a').count();
    console.log('Number of navigation links found:', navLinks);
    
    // Should have at least some navigation links
    expect(navLinks).toBeGreaterThan(0);
    
    // Check for proper theme styling application
    const headerElement = await page.locator('header.storefront-header').first();
    const backgroundColor = await headerElement.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    console.log('Header background color:', backgroundColor);
    
    // Check horizontal spacing is applied
    const headerInner = await page.locator('.storefront-header-content, .page-builder-content').first();
    if (await headerInner.count() > 0) {
      const padding = await headerInner.evaluate(el => 
        window.getComputedStyle(el).padding
      );
      console.log('Header padding (horizontal spacing):', padding);
    }
  });

  test('should replace placeholder text with actual store data', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    
    // Check that there are no placeholder texts like {{store_name}}
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('{{store_name}}');
    expect(bodyText).not.toContain('{{storeName}}');
    
    // Check footer rendering as well
    const footer = await page.locator('footer.storefront-footer').first();
    if (await footer.count() > 0) {
      const footerContent = await footer.textContent();
      console.log('Footer content preview:', footerContent?.substring(0, 200));
      
      // Footer should also have dynamic content
      expect(footerContent).toContain('Testingmy');
      expect(footerContent).not.toContain('<div');
    }
  });

  test('should apply theme overrides from database', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    
    // Check if theme CSS variables are applied
    const headerStyles = await page.locator('header').first().evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor
      };
    });
    
    console.log('Header computed styles:', headerStyles);
    
    // Check that styles are not using default gray colors (indicates theme is applied)
    expect(headerStyles.backgroundColor).not.toBe('rgb(255, 255, 255)'); // Not plain white
  });
});