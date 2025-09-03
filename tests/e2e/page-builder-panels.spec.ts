/**
 * Page Builder Panels Functionality Test
 * Tests the newly implemented panel buttons: Properties, Layers, Responsive, SEO, Settings
 */

import { test, expect } from '@playwright/test'

test.describe('Visual Page Builder - Panel Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Visual Page Builder
    await page.goto('/page-builder')
    await page.waitForLoadState('networkidle')
    
    // Handle cookie consent dialog if present
    try {
      await page.click('button:has-text("Accept All")', { timeout: 3000 })
      await page.waitForTimeout(500)
    } catch {
      // Cookie dialog might not be present, continue
    }
    
    // Enter edit mode - simplified selector
    await page.click('button:has-text("Edit")')
    await page.waitForTimeout(2000) // Wait for enhanced page builder to load
  })

  test('should display all panel buttons and switch between them', async ({ page }) => {
    // Check that all panel buttons are visible
    const panelButtons = [
      'button:has-text("Widgets")',
      'button:has-text("Properties")', 
      'button:has-text("Layers")',
      'button:has-text("Responsive")',
      'button:has-text("SEO")',
      'button:has-text("Settings")'
    ]

    for (const buttonSelector of panelButtons) {
      await expect(page.locator(buttonSelector).first()).toBeVisible()
    }
  })

  test('should load Properties panel when clicked', async ({ page }) => {
    // Click Properties button
    await page.click('button:has-text("Properties")')
    await page.waitForTimeout(500)

    // Should show Properties panel content
    // Note: Properties panel might show different content based on selection
    // For now, just verify the panel switched
    const propertiesButton = page.locator('button:has-text("Properties")').first()
    await expect(propertiesButton).toHaveClass(/bg-primary-600/)
  })

  test('should load Layers panel when clicked', async ({ page }) => {
    // Click Layers button
    await page.click('button:has-text("Layers")')
    await page.waitForTimeout(500)

    // Should show Layers panel
    await expect(page.locator('h2:has-text("Layers")')).toBeVisible()
    
    // Should show layer navigation info
    await expect(page.locator('text=Navigate and manage page structure')).toBeVisible()
    
    // Button should be active
    const layersButton = page.locator('button:has-text("Layers")').first()
    await expect(layersButton).toHaveClass(/bg-primary-600/)
  })

  test('should load Responsive panel when clicked', async ({ page }) => {
    // Click Responsive button
    await page.click('button:has-text("Responsive")')
    await page.waitForTimeout(500)

    // Button should be active  
    const responsiveButton = page.locator('button:has-text("Responsive")').first()
    await expect(responsiveButton).toHaveClass(/bg-primary-600/)
  })

  test('should load SEO panel when clicked', async ({ page }) => {
    // Click SEO button
    await page.click('button:has-text("SEO")')
    await page.waitForTimeout(500)

    // Should show SEO panel content
    await expect(page.locator('h2:has-text("SEO")')).toBeVisible()
    
    // Button should be active
    const seoButton = page.locator('button:has-text("SEO")').first()
    await expect(seoButton).toHaveClass(/bg-primary-600/)
  })

  test('should load Settings panel when clicked', async ({ page }) => {
    // Click Settings button (use nth(1) to get the panel button, not the top nav button)
    await page.locator('button:has-text("Settings")').nth(1).click()
    await page.waitForTimeout(500)

    // Should show Settings panel
    await expect(page.locator('h2:has-text("Page Settings")')).toBeVisible()
    
    // Should show page configuration text
    await expect(page.locator('text=Configure page-level settings')).toBeVisible()
    
    // Button should be active (check the panel settings button, not the top nav)
    const settingsButton = page.locator('button:has-text("Settings")').nth(1)
    await expect(settingsButton).toHaveClass(/bg-primary-600/)
  })

  test('should switch between different panels', async ({ page }) => {
    // Start with Widgets (default)
    const widgetsButton = page.locator('button:has-text("Widgets")').first()
    await expect(widgetsButton).toHaveClass(/bg-primary-600/)

    // Switch to Layers
    await page.click('button:has-text("Layers")')
    await page.waitForTimeout(300)
    
    const layersButton = page.locator('button:has-text("Layers")').first()
    await expect(layersButton).toHaveClass(/bg-primary-600/)
    await expect(widgetsButton).not.toHaveClass(/bg-primary-600/)

    // Switch to Settings (use nth(1) for panel button)
    await page.locator('button:has-text("Settings")').nth(1).click()
    await page.waitForTimeout(300)
    
    const settingsButton = page.locator('button:has-text("Settings")').nth(1)
    await expect(settingsButton).toHaveClass(/bg-primary-600/)
    await expect(layersButton).not.toHaveClass(/bg-primary-600/)

    // Switch back to Widgets
    await page.click('button:has-text("Widgets")')
    await page.waitForTimeout(300)
    
    await expect(widgetsButton).toHaveClass(/bg-primary-600/)
    await expect(settingsButton).not.toHaveClass(/bg-primary-600/)
  })

  test('should show appropriate content in Settings panel', async ({ page }) => {
    // Go to Settings panel (use nth(1) to get the panel button)
    await page.locator('button:has-text("Settings")').nth(1).click()
    await page.waitForTimeout(500)

    // Should show settings sections
    await expect(page.locator('text=General')).toBeVisible()
    await expect(page.locator('text=SEO & Meta')).toBeVisible()
    await expect(page.locator('text=Analytics & Tracking')).toBeVisible()
    await expect(page.locator('text=Performance')).toBeVisible()
    await expect(page.locator('text=Accessibility')).toBeVisible()

    // Should show page name input
    await expect(page.locator('label:has-text("Page Name")')).toBeVisible()
    
    // Should show status dropdown
    await expect(page.locator('label:has-text("Status")')).toBeVisible()
  })

  test('should show layer structure in Layers panel', async ({ page }) => {
    // Go to Layers panel
    await page.click('button:has-text("Layers")')
    await page.waitForTimeout(500)

    // Should show layers header
    await expect(page.locator('h2:has-text("Layers")')).toBeVisible()
    
    // Should show expand/collapse controls
    await expect(page.locator('button[title="Expand All"]')).toBeVisible()
    await expect(page.locator('button[title="Collapse All"]')).toBeVisible()

    // Should show section count at bottom
    // Note: The exact text will depend on the page structure
    await expect(page.locator('text=sections')).toBeVisible()
  })

  test('should maintain panel state during interaction', async ({ page }) => {
    // Switch to Settings panel (use nth(1) for panel button)
    await page.locator('button:has-text("Settings")').nth(1).click()
    await page.waitForTimeout(500)

    // Verify Settings panel is active
    await expect(page.locator('h2:has-text("Page Settings")')).toBeVisible()

    // Try to interact with a different area (like clicking on canvas) 
    // Panel should remain active
    await page.click('.canvas', { force: true })
    await page.waitForTimeout(300)

    // Settings button should still be active
    const settingsButton = page.locator('button:has-text("Settings")').nth(1)
    await expect(settingsButton).toHaveClass(/bg-primary-600/)
  })

  test('should handle rapid panel switching', async ({ page }) => {
    const panels = ['Properties', 'Layers', 'SEO', 'Widgets']
    
    // Rapidly switch between panels
    for (let i = 0; i < 3; i++) {
      for (const panel of panels) {
        await page.click(`button:has-text("${panel}")`)
        await page.waitForTimeout(100)
        
        // Verify the button becomes active
        const panelButton = page.locator(`button:has-text("${panel}")`).first()
        await expect(panelButton).toHaveClass(/bg-primary-600/)
      }
      
      // Handle Settings separately since it's nth(1)
      await page.locator('button:has-text("Settings")').nth(1).click()
      await page.waitForTimeout(100)
      const settingsButton = page.locator('button:has-text("Settings")').nth(1)
      await expect(settingsButton).toHaveClass(/bg-primary-600/)
    }
  })
})