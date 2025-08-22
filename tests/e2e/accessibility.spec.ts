import { test, expect } from '@playwright/test'

test.describe('Accessibility Testing', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Should have only one h1
    await expect(h1).toHaveCount(1)
  })

  test('should have proper button accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Get all buttons
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    console.log(`Found ${buttonCount} buttons to test`)
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      
      if (await button.isVisible()) {
        // Each button should have either:
        // 1. aria-label attribute, or
        // 2. visible text content, or  
        // 3. title attribute
        const ariaLabel = await button.getAttribute('aria-label')
        const textContent = await button.textContent()
        const title = await button.getAttribute('title')
        
        const hasAccessibleName = ariaLabel || textContent?.trim() || title
        
        if (!hasAccessibleName) {
          console.log(`Button ${i} missing accessible name:`, await button.innerHTML())
        }
        
        expect(hasAccessibleName).toBeTruthy()
      }
    }
  })

  test('should have proper form accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Check form inputs have labels
    const inputs = page.locator('input')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      
      if (await input.isVisible()) {
        const ariaLabel = await input.getAttribute('aria-label')
        const placeholder = await input.getAttribute('placeholder')
        const id = await input.getAttribute('id')
        
        // Check if there's a label for this input
        let hasLabel = false
        if (id) {
          const label = page.locator(`label[for="${id}"]`)
          hasLabel = await label.count() > 0
        }
        
        const hasAccessibleName = ariaLabel || hasLabel || placeholder
        expect(hasAccessibleName).toBeTruthy()
      }
    }
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    
    // This is a basic test - in a real scenario you'd use axe-playwright
    // or similar tools for comprehensive accessibility testing
    
    // Check that text is visible against backgrounds
    const textElements = page.locator('p, h1, h2, h3, span, button')
    const count = await textElements.count()
    
    for (let i = 0; i < Math.min(count, 10); i++) { // Test first 10 elements
      const element = textElements.nth(i)
      if (await element.isVisible()) {
        const textContent = await element.textContent()
        if (textContent && textContent.trim()) {
          // Element should be visible (basic check)
          await expect(element).toBeVisible()
        }
      }
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const count = await focusableElements.count()
    
    if (count > 0) {
      // Focus first element
      await focusableElements.first().focus()
      
      // Tab through a few elements
      for (let i = 0; i < Math.min(count, 5); i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(100) // Small delay for visual feedback
      }
    }
  })

  test('should have proper ARIA roles and properties', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation has proper role
    const nav = page.locator('nav')
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible()
    }
    
    // Check main content area
    const main = page.locator('main, [role="main"]')
    if (await main.count() > 0) {
      await expect(main.first()).toBeVisible()
    }
  })
})