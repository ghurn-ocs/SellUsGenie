import { test, expect } from '@playwright/test';

test('Debug Page Errors', async ({ page }) => {
  console.log('🚨 Checking for page errors...');
  
  // Capture console messages and errors
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (msg.type() === 'error') {
      errors.push(text);
      console.log('🚨 ERROR:', text);
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.log('🚨 PAGE ERROR:', error.message);
    console.log('🚨 STACK:', error.stack);
  });
  
  try {
    // Navigate to storefront
    await page.goto('http://localhost:5173/store/testingmy', { timeout: 30000 });
    
    // Wait a bit for any async errors
    await page.waitForTimeout(5000);
    
    // Check if page loaded
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check for basic elements
    const bodyContent = await page.locator('body').textContent();
    console.log('📄 Body has content:', !!bodyContent && bodyContent.length > 10);
    
    // Check for error messages in DOM
    const errorElements = await page.locator('text=/error|Error|ERROR|fail|Fail|FAIL/').count();
    console.log('📄 Error elements found:', errorElements);
    
  } catch (error) {
    console.log('🚨 Test navigation error:', error);
  }
  
  console.log('📊 Summary:');
  console.log(`- Console errors: ${errors.length}`);
  console.log(`- Total console messages: ${consoleLogs.length}`);
  
  if (errors.length > 0) {
    console.log('🚨 All Errors:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}: ${error}`);
    });
  }
  
  expect(true).toBe(true);
});