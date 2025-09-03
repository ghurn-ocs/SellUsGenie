import { test } from '@playwright/test';

test.describe('Storefront HTML Rendering Verification', () => {
  test('should render HTML content in text widgets properly', async ({ page }) => {
    // Navigate to a store storefront page
    await page.goto('http://localhost:5173/store/testingmy');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if raw HTML is being displayed instead of rendered content
    const rawHtmlElements = await page.locator('text=/\\<div|\\<h1|\\<header|\\<nav/').count();
    
    console.log(`Found ${rawHtmlElements} elements with raw HTML tags visible`);
    
    // Screenshot for UI/UX team review
    await page.screenshot({ 
      path: 'test-results/storefront-html-rendering.png',
      fullPage: true 
    });
    
    // Check if header navigation is properly rendered
    const navigation = await page.locator('nav').first();
    if (await navigation.count() > 0) {
      const navContent = await navigation.textContent();
      console.log('Navigation content:', navContent);
      
      // Check if we see raw HTML in navigation
      if (navContent && (navContent.includes('<div') || navContent.includes('<h1'))) {
        console.error('❌ Raw HTML found in navigation');
      } else {
        console.log('✅ Navigation appears to be properly rendered');
      }
    }
    
    // Check for text widgets with allowHtml issues
    const textWidgets = await page.locator('[data-widget-type="text"]').count();
    console.log(`Found ${textWidgets} text widgets`);
    
    // Log any visible HTML tags that shouldn't be there
    const visibleHtmlTags = await page.locator('text=/&lt;|&gt;|<div|<h1|<header/').count();
    console.log(`Visible HTML tags/entities: ${visibleHtmlTags}`);
    
    // Extract page source for analysis
    const pageContent = await page.content();
    const hasRawHtml = pageContent.includes('&lt;div') || pageContent.includes('&quot;');
    
    console.log('HTML rendering analysis:');
    console.log('- Raw HTML elements visible:', rawHtmlElements);
    console.log('- Text widgets found:', textWidgets);
    console.log('- HTML entities found:', hasRawHtml);
    
    // Create summary for UI/UX team
    const analysis = {
      timestamp: new Date().toISOString(),
      rawHtmlVisible: rawHtmlElements > 0,
      textWidgetsCount: textWidgets,
      navigationWorking: navigation.count() > 0,
      recommendations: [
        rawHtmlElements > 0 ? 'Fix allowHtml setting in text widgets' : 'HTML rendering appears correct',
        textWidgets === 0 ? 'No text widgets detected - check widget registration' : 'Text widgets detected',
        'Check allowHtml props in system page creation'
      ]
    };
    
    console.log('UI/UX Analysis:', JSON.stringify(analysis, null, 2));
  });
  
  test('should verify widget registry functionality', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Check console for widget registry logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('widget') || msg.text().includes('Widget')) {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for widget registration
    await page.waitForTimeout(2000);
    
    console.log('Widget-related console logs:');
    consoleLogs.forEach(log => console.log('  -', log));
    
    // Check for widget errors
    const hasWidgetErrors = consoleLogs.some(log => 
      log.includes('not found') || log.includes('Error rendering')
    );
    
    console.log('Widget registry status:', hasWidgetErrors ? '❌ Errors detected' : '✅ Working');
  });
});