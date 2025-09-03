import { test, expect } from '@playwright/test'

test.describe('Customer Portal Design Consistency Evaluation', () => {
  test.beforeEach(async ({ page }) => {
    // Start from landing page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should evaluate landing page vs portal design consistency', async ({ page }) => {
    // Capture landing page styles
    const landingStyles = await page.evaluate(() => {
      const getElementStyles = (selector: string) => {
        const el = document.querySelector(selector)
        if (!el) return null
        const styles = window.getComputedStyle(el)
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          padding: styles.padding,
          margin: styles.margin
        }
      }

      return {
        body: getElementStyles('body'),
        nav: getElementStyles('nav'),
        primaryButton: getElementStyles('button[class*="bg-[#9B51E0]"], button[class*="bg-purple"]'),
        heading: getElementStyles('h1'),
        paragraph: getElementStyles('p')
      }
    })

    console.log('Landing page styles:', landingStyles)

    // Test color palette consistency
    const colorElements = await page.locator('[class*="bg-[#"], [class*="text-[#"]').all()
    const colorsUsed = []

    for (const element of colorElements.slice(0, 30)) {
      if (await element.isVisible()) {
        const bgColor = await element.evaluate(el => window.getComputedStyle(el).backgroundColor)
        const textColor = await element.evaluate(el => window.getComputedStyle(el).color)
        const className = await element.getAttribute('class')
        
        colorsUsed.push({
          backgroundColor: bgColor,
          color: textColor,
          classes: className?.match(/(?:bg-|text-)\[#[0-9A-Fa-f]{6}\]/g) || []
        })
      }
    }

    console.log('Color palette analysis:', colorsUsed)

    // Check for consistent use of brand colors
    const brandColors = colorsUsed.filter(c => 
      c.classes.some(cls => cls.includes('#9B51E0') || cls.includes('#00AEEF') || cls.includes('#FF7F00'))
    )
    
    expect(brandColors.length).toBeGreaterThan(0) // Should use brand colors
  })

  test('should analyze font consistency across components', async ({ page }) => {
    // Get all text elements and their font properties
    const textElements = await page.locator('h1, h2, h3, h4, h5, h6, p, span, button, label, input').all()
    const fontAnalysis = []

    for (const element of textElements.slice(0, 50)) { // Sample 50 elements
      if (await element.isVisible()) {
        const textContent = await element.textContent()
        if (textContent && textContent.trim()) {
          const styles = await element.evaluate(el => ({
            tagName: el.tagName.toLowerCase(),
            fontFamily: window.getComputedStyle(el).fontFamily,
            fontSize: window.getComputedStyle(el).fontSize,
            fontWeight: window.getComputedStyle(el).fontWeight,
            lineHeight: window.getComputedStyle(el).lineHeight,
            letterSpacing: window.getComputedStyle(el).letterSpacing,
            textContent: el.textContent?.trim().substring(0, 30) || ''
          }))
          
          fontAnalysis.push(styles)
        }
      }
    }

    console.log('Font analysis (first 10):', fontAnalysis.slice(0, 10))

    // Analyze font family consistency
    const fontFamilies = [...new Set(fontAnalysis.map(f => f.fontFamily))]
    console.log('Font families used:', fontFamilies)

    // Check heading hierarchy consistency
    const headings = fontAnalysis.filter(f => f.tagName.startsWith('h'))
    const headingsByTag = {}
    
    headings.forEach(h => {
      if (!headingsByTag[h.tagName]) {
        headingsByTag[h.tagName] = []
      }
      headingsByTag[h.tagName].push(h)
    })

    console.log('Heading consistency by tag:', headingsByTag)

    // Verify consistent font stack
    expect(fontFamilies.length).toBeLessThanOrEqual(3) // Should use 1-3 font families max

    // Check h1 consistency
    if (headingsByTag.h1 && headingsByTag.h1.length > 1) {
      const firstH1 = headingsByTag.h1[0]
      headingsByTag.h1.forEach(h1 => {
        expect(h1.fontFamily).toBe(firstH1.fontFamily)
      })
    }
  })

  test('should evaluate icon consistency and usage', async ({ page }) => {
    // Analyze SVG icons (Lucide icons)
    const svgIcons = await page.locator('svg').all()
    const iconAnalysis = []

    for (const icon of svgIcons.slice(0, 25)) {
      if (await icon.isVisible()) {
        const iconData = await icon.evaluate(el => {
          const rect = el.getBoundingClientRect()
          return {
            width: el.getAttribute('width') || rect.width.toString(),
            height: el.getAttribute('height') || rect.height.toString(),
            viewBox: el.getAttribute('viewBox'),
            strokeWidth: el.getAttribute('stroke-width'),
            fill: el.getAttribute('fill'),
            stroke: el.getAttribute('stroke'),
            className: el.getAttribute('class'),
            parentClassName: el.parentElement?.className || '',
            actualWidth: rect.width,
            actualHeight: rect.height
          }
        })
        iconAnalysis.push(iconData)
      }
    }

    console.log('Icon analysis (first 10):', iconAnalysis.slice(0, 10))

    // Check for consistent icon sizing
    const iconSizes = iconAnalysis.map(i => `${i.actualWidth}x${i.actualHeight}`)
    const uniqueSizes = [...new Set(iconSizes)]
    console.log('Icon sizes found:', uniqueSizes)

    // Analyze Lucide icon consistency
    const lucideIcons = iconAnalysis.filter(i => 
      i.className && (i.className.includes('lucide') || i.parentClassName.includes('lucide'))
    )
    
    if (lucideIcons.length > 0) {
      const strokeWidths = [...new Set(lucideIcons.map(i => i.strokeWidth).filter(Boolean))]
      console.log('Lucide stroke widths:', strokeWidths)
      
      // Should have consistent stroke widths
      expect(strokeWidths.length).toBeLessThanOrEqual(3)
    }

    // Should have reasonable number of different icon sizes (not too many)
    expect(uniqueSizes.length).toBeLessThanOrEqual(8)
  })

  test('should verify component spacing consistency', async ({ page }) => {
    // Analyze spacing patterns using Tailwind classes
    const spacingElements = await page.locator('[class*="p-"], [class*="m-"], [class*="space-"], [class*="gap-"]').all()
    const spacingAnalysis = []

    for (const element of spacingElements.slice(0, 40)) {
      if (await element.isVisible()) {
        const className = await element.getAttribute('class')
        const computedStyles = await element.evaluate(el => ({
          padding: window.getComputedStyle(el).padding,
          margin: window.getComputedStyle(el).margin,
          gap: window.getComputedStyle(el).gap
        }))

        // Extract spacing classes
        const spacingClasses = className?.match(/(p|m|space|gap)-\w+/g) || []
        
        spacingAnalysis.push({
          classes: spacingClasses,
          computed: computedStyles,
          tagName: await element.evaluate(el => el.tagName.toLowerCase())
        })
      }
    }

    console.log('Spacing analysis (first 10):', spacingAnalysis.slice(0, 10))

    // Analyze spacing scale consistency
    const allSpacingClasses = spacingAnalysis.flatMap(s => s.classes)
    const uniqueSpacing = [...new Set(allSpacingClasses)]
    console.log('Spacing classes used:', uniqueSpacing)

    // Check for consistent spacing scale (Tailwind should provide this)
    const spacingValues = uniqueSpacing.filter(cls => /^(p|m)-\d+$/.test(cls))
    console.log('Numeric spacing values:', spacingValues)

    // Should use consistent spacing scale
    expect(spacingValues.length).toBeLessThanOrEqual(12) // Reasonable number of spacing values
  })

  test('should evaluate button and interaction consistency', async ({ page }) => {
    // Analyze all interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea').all()
    const interactionAnalysis = []

    for (const element of interactiveElements.slice(0, 30)) {
      if (await element.isVisible()) {
        const elementData = await element.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            tagName: el.tagName.toLowerCase(),
            type: el.getAttribute('type'),
            className: el.className,
            backgroundColor: styles.backgroundColor,
            border: styles.border,
            borderRadius: styles.borderRadius,
            padding: styles.padding,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            cursor: styles.cursor,
            textContent: el.textContent?.trim().substring(0, 20) || '',
            disabled: el.hasAttribute('disabled')
          }
        })
        
        interactionAnalysis.push(elementData)
      }
    }

    console.log('Interactive elements analysis (first 10):', interactionAnalysis.slice(0, 10))

    // Analyze button variants
    const buttons = interactionAnalysis.filter(e => e.tagName === 'button')
    const primaryButtons = buttons.filter(b => 
      b.className.includes('bg-[#9B51E0]') || b.backgroundColor.includes('155, 81, 224')
    )
    const secondaryButtons = buttons.filter(b => 
      b.className.includes('border-[#9B51E0]') && !b.className.includes('bg-[#9B51E0]')
    )

    console.log('Primary buttons:', primaryButtons.length)
    console.log('Secondary buttons:', secondaryButtons.length)

    // Check primary button consistency
    if (primaryButtons.length > 1) {
      const firstPrimary = primaryButtons[0]
      primaryButtons.forEach(button => {
        expect(button.borderRadius).toBe(firstPrimary.borderRadius)
        expect(button.fontWeight).toBe(firstPrimary.fontWeight)
      })
    }

    // Check interactive elements have proper cursor
    const clickableElements = interactionAnalysis.filter(e => 
      (e.tagName === 'button' || e.tagName === 'a') && !e.disabled
    )
    clickableElements.forEach(element => {
      expect(element.cursor).toBe('pointer')
    })
  })

  test('should verify dark theme consistency', async ({ page }) => {
    // Analyze dark theme implementation
    const darkElements = await page.locator('[class*="bg-[#1E1E1E]"], [class*="bg-[#2A2A2A]"], [class*="bg-[#3A3A3A]"], [class*="text-white"], [class*="text-[#A0A0A0]"]').all()
    const darkThemeAnalysis = []

    for (const element of darkElements.slice(0, 30)) {
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          color: window.getComputedStyle(el).color,
          className: el.className,
          tagName: el.tagName.toLowerCase()
        }))
        
        darkThemeAnalysis.push(styles)
      }
    }

    console.log('Dark theme analysis (first 10):', darkThemeAnalysis.slice(0, 10))

    // Check for consistent dark background colors
    const backgroundColors = [...new Set(darkThemeAnalysis.map(d => d.backgroundColor))]
    const textColors = [...new Set(darkThemeAnalysis.map(d => d.color))]
    
    console.log('Dark theme background colors:', backgroundColors)
    console.log('Dark theme text colors:', textColors)

    // Should use consistent dark theme palette
    expect(backgroundColors.length).toBeLessThanOrEqual(8) // Reasonable number of bg colors
    expect(textColors.length).toBeLessThanOrEqual(6) // Reasonable number of text colors
  })

  test('should evaluate overall design system cohesion', async ({ page }) => {
    // Comprehensive design system evaluation
    const designPatterns = await page.evaluate(() => {
      // Get all elements and analyze design patterns
      const allElements = document.querySelectorAll('*')
      const designPatterns = {
        borderRadius: [],
        fontSize: [],
        fontWeight: [],
        lineHeight: [],
        padding: [],
        margin: []
      }

      // Sample analysis of first 200 visible elements
      Array.from(allElements).slice(0, 200).forEach(el => {
        if (el.offsetParent !== null) { // Element is visible
          const styles = window.getComputedStyle(el)
          
          if (styles.borderRadius !== '0px') designPatterns.borderRadius.push(styles.borderRadius)
          if (styles.fontSize) designPatterns.fontSize.push(styles.fontSize)
          if (styles.fontWeight !== '400') designPatterns.fontWeight.push(styles.fontWeight)
          if (styles.lineHeight !== 'normal') designPatterns.lineHeight.push(styles.lineHeight)
          if (styles.padding !== '0px') designPatterns.padding.push(styles.padding)
          if (styles.margin !== '0px') designPatterns.margin.push(styles.margin)
        }
      })

      // Get unique values
      Object.keys(designPatterns).forEach(key => {
        designPatterns[key] = [...new Set(designPatterns[key])]
      })

      return designPatterns
    })

    console.log('Design system patterns:', designPatterns)

    // Evaluate design system consistency
    expect(designPatterns.borderRadius.length).toBeLessThanOrEqual(6) // Should have consistent border radius scale
    expect(designPatterns.fontSize.length).toBeLessThanOrEqual(12) // Should have consistent type scale
    expect(designPatterns.fontWeight.length).toBeLessThanOrEqual(5) // Should have consistent font weights

    // Log design system health score
    const totalVariations = Object.values(designPatterns).reduce((sum, arr) => sum + arr.length, 0)
    const averageVariations = totalVariations / Object.keys(designPatterns).length
    console.log(`Design System Health Score: ${Math.max(0, 100 - averageVariations * 5).toFixed(1)}/100`)
  })
})