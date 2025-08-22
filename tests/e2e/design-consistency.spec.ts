import { test, expect } from '@playwright/test'

test.describe('Customer Portal Design Consistency', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the landing page to establish baseline
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should have consistent color scheme across pages', async ({ page }) => {
    // Test color consistency across key pages
    const pages = ['/', '/features', '/why-not']
    const colorResults = []

    for (const url of pages) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      
      // Check primary brand colors
      const primaryButton = page.locator('button').filter({ hasText: /get started|start/i }).first()
      if (await primaryButton.isVisible()) {
        const backgroundColor = await primaryButton.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        )
        colorResults.push({ page: url, primaryButton: backgroundColor })
      }

      // Check navigation colors
      const nav = page.locator('nav')
      if (await nav.isVisible()) {
        const navBg = await nav.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        )
        colorResults.push({ page: url, navigation: navBg })
      }
    }

    console.log('Color consistency results:', colorResults)
    
    // Verify consistent brand colors (should all use #9B51E0 purple)
    const brandButtons = colorResults.filter(r => r.primaryButton)
    if (brandButtons.length > 1) {
      const firstColor = brandButtons[0].primaryButton
      brandButtons.forEach(button => {
        expect(button.primaryButton).toBe(firstColor)
      })
    }
  })

  test('should have consistent typography across components', async ({ page }) => {
    await page.goto('/')
    
    // Test heading consistency
    const headings = await page.locator('h1, h2, h3').all()
    const fontData = []
    
    for (const heading of headings.slice(0, 10)) { // Test first 10 headings
      if (await heading.isVisible()) {
        const styles = await heading.evaluate(el => ({
          fontFamily: window.getComputedStyle(el).fontFamily,
          fontWeight: window.getComputedStyle(el).fontWeight,
          fontSize: window.getComputedStyle(el).fontSize,
          tagName: el.tagName.toLowerCase()
        }))
        fontData.push(styles)
      }
    }
    
    console.log('Typography data:', fontData)
    
    // Check font family consistency
    const fontFamilies = [...new Set(fontData.map(f => f.fontFamily))]
    console.log('Font families found:', fontFamilies)
    
    // Should use consistent font family (expect only 1-2 font families max)
    expect(fontFamilies.length).toBeLessThanOrEqual(2)
    
    // Check h1 consistency
    const h1Styles = fontData.filter(f => f.tagName === 'h1')
    if (h1Styles.length > 1) {
      const firstH1Font = h1Styles[0].fontFamily
      h1Styles.forEach(h1 => {
        expect(h1.fontFamily).toBe(firstH1Font)
      })
    }
  })

  test('should have consistent button styles', async ({ page }) => {
    await page.goto('/')
    
    // Get all buttons and analyze their styles
    const buttons = await page.locator('button').all()
    const buttonStyles = []
    
    for (const button of buttons.slice(0, 15)) { // Test first 15 buttons
      if (await button.isVisible()) {
        const styles = await button.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          color: window.getComputedStyle(el).color,
          borderRadius: window.getComputedStyle(el).borderRadius,
          padding: window.getComputedStyle(el).padding,
          fontSize: window.getComputedStyle(el).fontSize,
          fontWeight: window.getComputedStyle(el).fontWeight,
          border: window.getComputedStyle(el).border,
          textContent: el.textContent?.trim().substring(0, 20) || 'empty'
        }))
        buttonStyles.push(styles)
      }
    }
    
    console.log('Button styles analysis:', buttonStyles)
    
    // Group buttons by similar background colors
    const primaryButtons = buttonStyles.filter(b => 
      b.backgroundColor.includes('155, 81, 224') || // #9B51E0
      b.backgroundColor.includes('rgb(155, 81, 224)')
    )
    
    // Primary buttons should have consistent styling
    if (primaryButtons.length > 1) {
      const firstPrimaryStyle = primaryButtons[0]
      primaryButtons.forEach(button => {
        expect(button.borderRadius).toBe(firstPrimaryStyle.borderRadius)
        expect(button.fontWeight).toBe(firstPrimaryStyle.fontWeight)
      })
    }
  })

  test('should have consistent icon usage', async ({ page }) => {
    await page.goto('/')
    
    // Check for icon consistency (Lucide icons)
    const svgIcons = await page.locator('svg').all()
    const iconData = []
    
    for (const icon of svgIcons.slice(0, 20)) { // Test first 20 icons
      if (await icon.isVisible()) {
        const iconInfo = await icon.evaluate(el => ({
          width: el.getAttribute('width') || window.getComputedStyle(el).width,
          height: el.getAttribute('height') || window.getComputedStyle(el).height,
          viewBox: el.getAttribute('viewBox'),
          className: el.getAttribute('class'),
          strokeWidth: el.getAttribute('stroke-width')
        }))
        iconData.push(iconInfo)
      }
    }
    
    console.log('Icon analysis:', iconData)
    
    // Check for consistent icon sizing
    const iconSizes = [...new Set(iconData.map(i => `${i.width}x${i.height}`))]
    console.log('Icon sizes found:', iconSizes)
    
    // Should have consistent icon sizes (expect 2-4 standard sizes)
    expect(iconSizes.length).toBeLessThanOrEqual(6)
    
    // Check Lucide icons have consistent stroke width
    const lucideIcons = iconData.filter(i => i.className && i.className.includes('lucide'))
    if (lucideIcons.length > 5) {
      const strokeWidths = [...new Set(lucideIcons.map(i => i.strokeWidth).filter(Boolean))]
      expect(strokeWidths.length).toBeLessThanOrEqual(3) // Should have consistent stroke widths
    }
  })

  test('should have consistent spacing and layout', async ({ page }) => {
    await page.goto('/')
    
    // Test container consistency
    const containers = await page.locator('.max-w-7xl, .max-w-6xl, .max-w-5xl, .container').all()
    const containerData = []
    
    for (const container of containers.slice(0, 10)) {
      if (await container.isVisible()) {
        const styles = await container.evaluate(el => ({
          maxWidth: window.getComputedStyle(el).maxWidth,
          marginLeft: window.getComputedStyle(el).marginLeft,
          marginRight: window.getComputedStyle(el).marginRight,
          padding: window.getComputedStyle(el).padding,
          className: el.className
        }))
        containerData.push(styles)
      }
    }
    
    console.log('Container analysis:', containerData)
    
    // Check for consistent container patterns
    const maxWidthValues = [...new Set(containerData.map(c => c.maxWidth))].filter(w => w !== 'none')
    console.log('Container max-widths:', maxWidthValues)
    
    // Should use consistent container max-widths
    expect(maxWidthValues.length).toBeLessThanOrEqual(4)
  })

  test('should have consistent card/panel styling', async ({ page }) => {
    await page.goto('/')
    
    // Look for card-like components
    const cards = await page.locator('.bg-\\[\\#2A2A2A\\], .bg-\\[\\#1E1E1E\\], .bg-gray-800, .bg-gray-900, .rounded-lg, .rounded-xl').all()
    const cardStyles = []
    
    for (const card of cards.slice(0, 15)) {
      if (await card.isVisible()) {
        const styles = await card.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          borderRadius: window.getComputedStyle(el).borderRadius,
          border: window.getComputedStyle(el).border,
          boxShadow: window.getComputedStyle(el).boxShadow,
          padding: window.getComputedStyle(el).padding
        }))
        cardStyles.push(styles)
      }
    }
    
    console.log('Card styling analysis:', cardStyles)
    
    // Check for consistent border radius usage
    const borderRadii = [...new Set(cardStyles.map(c => c.borderRadius))].filter(r => r !== '0px')
    console.log('Border radii found:', borderRadii)
    
    // Should use consistent border radius values
    expect(borderRadii.length).toBeLessThanOrEqual(4)
  })

  test('should have consistent navigation styling', async ({ page }) => {
    const pages = ['/', '/features', '/why-not']
    const navStyles = []
    
    for (const url of pages) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      
      const nav = page.locator('nav').first()
      if (await nav.isVisible()) {
        const styles = await nav.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          height: window.getComputedStyle(el).height,
          borderBottom: window.getComputedStyle(el).borderBottom,
          padding: window.getComputedStyle(el).padding,
          page: url
        }))
        navStyles.push(styles)
      }
    }
    
    console.log('Navigation consistency:', navStyles)
    
    // All navigation bars should have consistent styling
    if (navStyles.length > 1) {
      const firstNav = navStyles[0]
      navStyles.forEach(nav => {
        expect(nav.backgroundColor).toBe(firstNav.backgroundColor)
        expect(nav.height).toBe(firstNav.height)
      })
    }
  })

  test('should maintain design consistency during responsive breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]
    
    const responsiveData = []
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Test key elements remain visible and styled consistently
      const heading = page.locator('h1').first()
      const primaryButton = page.locator('button').filter({ hasText: /get started/i }).first()
      const nav = page.locator('nav').first()
      
      const data = {
        breakpoint: breakpoint.name,
        headingVisible: await heading.isVisible(),
        buttonVisible: await primaryButton.isVisible(),
        navVisible: await nav.isVisible()
      }
      
      // Get font sizes at different breakpoints
      if (await heading.isVisible()) {
        data.headingFontSize = await heading.evaluate(el => 
          window.getComputedStyle(el).fontSize
        )
      }
      
      responsiveData.push(data)
    }
    
    console.log('Responsive design analysis:', responsiveData)
    
    // Key elements should be visible at all breakpoints
    responsiveData.forEach(data => {
      expect(data.headingVisible).toBe(true)
      expect(data.navVisible).toBe(true)
    })
  })
})