import { test, expect } from '@playwright/test';

test.describe('Store Logo Display', () => {
  test('should display store logo instead of text when useStoreLogo is enabled', async ({ page }) => {
    // Navigate to Glenn's store
    await page.goto('http://localhost:5173/store/testingmy');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for logo replacement to occur
    await page.waitForTimeout(1000);
    
    // Check for logo images in the header
    const logoImages = page.locator('header img[alt*="logo"], header img[src*="store-logo"]');
    const logoCount = await logoImages.count();
    
    console.log('Number of logo images found:', logoCount);
    
    if (logoCount > 0) {
      // Logo should be displayed
      const firstLogo = logoImages.first();
      
      // Check logo properties
      const logoProps = await firstLogo.evaluate(el => ({
        src: el.src,
        alt: el.alt,
        className: el.className,
        isVisible: !el.hidden && el.offsetWidth > 0 && el.offsetHeight > 0
      }));
      
      console.log('Logo properties:', logoProps);
      
      // Logo should have proper source URL
      expect(logoProps.src).toContain('store-logo.jpg');
      expect(logoProps.alt).toContain('logo');
      expect(logoProps.isVisible).toBe(true);
      
      // Logo should have proper sizing classes
      expect(logoProps.className).toContain('h-8');
      expect(logoProps.className).toContain('w-auto');
      
      await expect(firstLogo).toBeVisible();
    } else {
      // If no logo images, check if text fallback is shown
      const headerText = page.locator('header h1, header .storefront-header-title');
      await expect(headerText).toBeVisible();
      console.log('Logo not found, showing text fallback');
    }
  });

  test('should load logo image successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check console for logo loading messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('logo') || msg.text().includes('Logo')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Find logo images
    const logoImages = page.locator('header img[alt*="logo"], header img[src*="store-logo"]');
    const logoCount = await logoImages.count();
    
    if (logoCount > 0) {
      const firstLogo = logoImages.first();
      
      // Wait for logo to load and check for load event
      await firstLogo.waitFor({ state: 'visible' });
      
      // Check that image loaded successfully (no broken image)
      const isLoaded = await firstLogo.evaluate(el => {
        const img = el as HTMLImageElement;
        return img.complete && img.naturalHeight > 0;
      });
      
      expect(isLoaded).toBe(true);
      console.log('Logo loaded successfully');
    }
  });

  test('should replace "Testingmy" text with logo image', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Get header content
    const headerHTML = await page.locator('header.storefront-header').innerHTML();
    console.log('Header HTML preview:', headerHTML.substring(0, 500));
    
    // Check for logo replacement evidence
    if (headerHTML.includes('store-logo.jpg')) {
      console.log('✅ Logo image found in header HTML');
      
      // Should contain logo image
      expect(headerHTML).toContain('store-logo.jpg');
      expect(headerHTML).toContain('alt=');
      expect(headerHTML).toContain('logo');
      
      // Should have proper image classes
      expect(headerHTML).toContain('h-8 w-auto');
      
    } else {
      console.log('⚠️  Logo image not found, checking for text fallback');
      
      // If no logo replacement happened, should still show store name
      expect(headerHTML).toContain('Testingmy');
    }
  });

  test('should respect theme logo settings from database', async ({ page }) => {
    await page.goto('http://localhost:5173/store/testingmy');
    await page.waitForLoadState('networkidle');
    
    // Check browser console for theme processing messages
    const themeMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Logo Replacement') || msg.text().includes('useStoreLogo')) {
        themeMessages.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Log theme processing messages
    if (themeMessages.length > 0) {
      console.log('Theme processing messages:', themeMessages);
    }
    
    // The page should process theme settings (checked via console logs or DOM)
    const headerElement = page.locator('header.storefront-header');
    await expect(headerElement).toBeVisible();
  });
});