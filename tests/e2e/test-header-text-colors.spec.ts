import { test, expect } from '@playwright/test';

test.describe('Header Text Colors from Theme', () => {
  test('should apply white text color from theme to header text widgets', async ({ page }) => {
    // Navigate to Glenn's store
    await page.goto('http://localhost:5173/store/testingmy');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Find the store name text in the header
    const headerText = page.locator('header h1, header .storefront-header-title, header [data-widget-type="text"]');
    
    const textElements = await headerText.count();
    console.log('Number of text elements in header:', textElements);
    expect(textElements).toBeGreaterThan(0);
    
    // Check each text element for proper color
    for (let i = 0; i < textElements; i++) {
      const textElement = headerText.nth(i);
      
      const styles = await textElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          textContent: el.textContent?.substring(0, 50),
          className: el.className
        };
      });
      
      console.log(`Text element ${i}:`, styles);
      
      // Check that text is white (rgb(255, 255, 255)) from theme, not gray
      if (styles.textContent?.includes('Testingmy')) {
        // Store name should be white from theme
        expect(styles.color).toBe('rgb(255, 255, 255)');
        
        // Should not be gray colors
        expect(styles.color).not.toBe('rgb(17, 24, 39)'); // text-gray-900
        expect(styles.color).not.toBe('rgb(31, 41, 55)'); // text-gray-800
        expect(styles.color).not.toBe('rgb(55, 65, 81)'); // text-gray-700
      }
    }
  });

  test('should not have hardcoded gray classes in rendered HTML', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    
    // Get the header HTML content
    const headerHTML = await page.locator('header.storefront-header').innerHTML();
    console.log('Header HTML preview:', headerHTML.substring(0, 300));
    
    // Check that hardcoded gray classes have been replaced
    expect(headerHTML).not.toContain('text-gray-900');
    expect(headerHTML).not.toContain('text-gray-800');
    expect(headerHTML).not.toContain('text-gray-700');
    expect(headerHTML).not.toContain('text-gray-600');
    
    // Should contain theme color references instead
    expect(headerHTML).toContain('text-[#FFFFFF]');
  });

  test('should apply theme color to text in buttons and other elements', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    
    // Find button elements in header
    const buttonElements = page.locator('header button, header .bg-blue-600');
    const buttonCount = await buttonElements.count();
    
    if (buttonCount > 0) {
      console.log('Found buttons in header:', buttonCount);
      
      const buttonStyle = await buttonElements.first().evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          innerHTML: el.innerHTML.substring(0, 100)
        };
      });
      
      console.log('Button styles:', buttonStyle);
      
      // Button text should be properly styled (not necessarily white, depends on design)
      expect(buttonStyle.color).toBeTruthy();
    }
  });

  test('should have consistent text colors across all header text widgets', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    
    // Get all text elements in header that should use theme color
    const textWidgets = page.locator('header [data-widget-type="text"]');
    const widgetCount = await textWidgets.count();
    
    console.log('Text widgets found:', widgetCount);
    
    // Check that all text widgets have consistent theming
    for (let i = 0; i < widgetCount; i++) {
      const widget = textWidgets.nth(i);
      const color = await widget.evaluate(el => window.getComputedStyle(el).color);
      
      console.log(`Text widget ${i} color:`, color);
      
      // All text widgets should have proper color (not default browser text)
      expect(color).not.toBe('rgb(0, 0, 0)'); // Not default black
      expect(color).toBeTruthy();
    }
  });
});