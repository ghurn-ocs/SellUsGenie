import { test, expect } from '@playwright/test'

test.describe('SellUsGenie Landing Page', () => {
  test('should load the landing page successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check if the main heading is visible
    await expect(page.locator('h1')).toContainText('Launch Your E-commerce Empire')
    
    // Verify the genie mascot is present
    await expect(page.locator('[data-testid="genie-mascot"]')).toBeVisible()
    
    // Check navigation elements
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible()
  })

  test('should have proper accessibility labels', async ({ page }) => {
    await page.goto('/')
    
    // Check that buttons have proper aria-labels
    const getStartedButton = page.getByRole('button', { name: /get started/i }).first()
    await expect(getStartedButton).toBeVisible()
    
    // Check navigation accessibility
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone size
    await page.goto('/')
    
    // Check if content is still visible on mobile
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible()
  })

  test('should navigate to features page', async ({ page }) => {
    await page.goto('/')
    
    // Click on features navigation if it exists
    const featuresLink = page.getByRole('link', { name: /features/i })
    if (await featuresLink.isVisible()) {
      await featuresLink.click()
      await expect(page).toHaveURL(/features/)
    }
  })

  test('should handle sign up flow', async ({ page }) => {
    await page.goto('/')
    
    // Click get started button
    const getStartedButton = page.getByRole('button', { name: /get started/i }).first()
    await getStartedButton.click()
    
    // Should trigger OAuth flow (we won't complete it in tests)
    // Just verify the click doesn't cause errors
    await page.waitForTimeout(1000)
  })

  test('should display pricing section', async ({ page }) => {
    await page.goto('/')
    
    // Scroll to pricing section if it exists
    const pricingSection = page.locator('#pricing, [data-testid="pricing"]')
    if (await pricingSection.isVisible()) {
      await pricingSection.scrollIntoViewIfNeeded()
      
      // Check for pricing plans
      await expect(page.locator('[data-testid="pricing-plan"]')).toHaveCount(3)
    }
  })
})