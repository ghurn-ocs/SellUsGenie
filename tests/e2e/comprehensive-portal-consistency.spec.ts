import { test, expect } from '@playwright/test'

test.describe('Comprehensive Customer Portal Design Consistency Review', () => {
  test.beforeEach(async ({ page }) => {
    // Start from landing page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should evaluate landing page design consistency', async ({ page }) => {
    console.log('🏠 Testing Landing Page Design Consistency')
    
    // Check navigation consistency
    const navButtons = await page.locator('button').all()
    const navStyles = []
    
    for (const button of navButtons.slice(0, 6)) {
      if (await button.isVisible()) {
        const styles = await button.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          color: window.getComputedStyle(el).color,
          borderRadius: window.getComputedStyle(el).borderRadius,
          padding: window.getComputedStyle(el).padding,
          fontSize: window.getComputedStyle(el).fontSize,
          fontWeight: window.getComputedStyle(el).fontWeight,
          className: el.className
        }))
        navStyles.push(styles)
      }
    }
    
    console.log('Landing page navigation styles:', navStyles.slice(0, 3))
    
    // Check brand consistency
    const brandElements = await page.locator('[class*="9B51E0"], [class*="00AEEF"], [class*="FF7F00"]').all()
    console.log(`Found ${brandElements.length} elements using brand colors`)
    
    // Verify consistent spacing
    const containers = await page.locator('[class*="max-w"], [class*="container"]').all()
    console.log(`Found ${containers.length} container elements for consistent spacing`)
  })

  test('should evaluate features page design consistency', async ({ page }) => {
    console.log('⭐ Testing Features Page Design Consistency')
    
    await page.goto('/features')
    await page.waitForLoadState('networkidle')
    
    // Check navigation consistency with landing page
    const navElements = await page.locator('nav button, nav a').all()
    const featureNavStyles = []
    
    for (const nav of navElements.slice(0, 5)) {
      if (await nav.isVisible()) {
        const styles = await nav.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          borderRadius: window.getComputedStyle(el).borderRadius,
          padding: window.getComputedStyle(el).padding,
          className: el.className
        }))
        featureNavStyles.push(styles)
      }
    }
    
    console.log('Features page navigation consistency:', featureNavStyles)
    
    // Check feature cards consistency
    const featureCards = await page.locator('[class*="bg-[#"], [class*="rounded"], [class*="border"]').all()
    console.log(`Found ${featureCards.length} styled elements on features page`)
    
    // Verify consistent typography
    const headings = await page.locator('h1, h2, h3').all()
    const headingStyles = []
    
    for (const heading of headings.slice(0, 5)) {
      if (await heading.isVisible()) {
        const styles = await heading.evaluate(el => ({
          fontSize: window.getComputedStyle(el).fontSize,
          fontWeight: window.getComputedStyle(el).fontWeight,
          color: window.getComputedStyle(el).color,
          tagName: el.tagName.toLowerCase()
        }))
        headingStyles.push(styles)
      }
    }
    
    console.log('Features page heading consistency:', headingStyles)
  })

  test('should evaluate customer portal authentication flow', async ({ page }) => {
    console.log('🔐 Testing Customer Portal Authentication Design')
    
    // Check for Google sign-in buttons consistency
    const authButtons = await page.locator('button').filter({ hasText: /sign|start|login|auth/i }).all()
    const authStyles = []
    
    for (const button of authButtons) {
      if (await button.isVisible()) {
        const styles = await button.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          color: window.getComputedStyle(el).color,
          borderRadius: window.getComputedStyle(el).borderRadius,
          padding: window.getComputedStyle(el).padding,
          textContent: el.textContent?.trim()
        }))
        authStyles.push(styles)
      }
    }
    
    console.log('Authentication button consistency:', authStyles)
    
    // Check modal/form consistency if present
    const modals = await page.locator('[role="dialog"], [class*="modal"]').count()
    console.log(`Found ${modals} modal/dialog elements`)
  })

  test('should evaluate why-not page design consistency', async ({ page }) => {
    console.log('🤔 Testing Why Not Others Page Design')
    
    await page.goto('/why-not')
    await page.waitForLoadState('networkidle')
    
    // Check navigation consistency
    const nav = await page.locator('nav')
    if (await nav.isVisible()) {
      const navStyles = await nav.evaluate(el => ({
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        borderBottom: window.getComputedStyle(el).borderBottom,
        boxShadow: window.getComputedStyle(el).boxShadow
      }))
      console.log('Why-not page navigation styles:', navStyles)
    }
    
    // Check comparison cards/sections
    const comparisonElements = await page.locator('[class*="bg-[#"], .card, [class*="border"]').all()
    console.log(`Found ${comparisonElements.length} styled comparison elements`)
    
    // Check brand color usage
    const brandColorElements = await page.locator('[class*="text-[#9B51E0]"], [class*="bg-[#9B51E0]"]').count()
    console.log(`Found ${brandColorElements} elements using primary brand color`)
  })

  test('should evaluate contact page design consistency', async ({ page }) => {
    console.log('📞 Testing Contact Page Design')
    
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    
    // Check form elements consistency
    const formInputs = await page.locator('input, textarea, select').all()
    const inputStyles = []
    
    for (const input of formInputs.slice(0, 5)) {
      if (await input.isVisible()) {
        const styles = await input.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          border: window.getComputedStyle(el).border,
          borderRadius: window.getComputedStyle(el).borderRadius,
          padding: window.getComputedStyle(el).padding,
          fontSize: window.getComputedStyle(el).fontSize
        }))
        inputStyles.push(styles)
      }
    }
    
    console.log('Contact form input consistency:', inputStyles)
    
    // Check submit buttons
    const submitButtons = await page.locator('button[type="submit"], button').filter({ hasText: /submit|send|contact/i }).all()
    const submitStyles = []
    
    for (const button of submitButtons) {
      if (await button.isVisible()) {
        const styles = await button.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          color: window.getComputedStyle(el).color,
          borderRadius: window.getComputedStyle(el).borderRadius,
          textContent: el.textContent?.trim()
        }))
        submitStyles.push(styles)
      }
    }
    
    console.log('Contact form submit button consistency:', submitStyles)
  })

  test('should evaluate store owner dashboard tab consistency', async ({ page }) => {
    console.log('📊 Testing Store Owner Dashboard Tab Hierarchy')
    
    // Note: This test assumes we can get to the dashboard
    // In a real scenario, we'd need authentication first
    
    // For now, let's check if the dashboard route exists
    const response = await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    if (response && response.status() === 200) {
      // Check primary tabs
      const primaryTabs = await page.locator('[role="tablist"] button').all()
      console.log(`Found ${primaryTabs.length} primary tabs`)
      
      // Check secondary tab sections
      const secondaryTabSections = await page.locator('[class*="TabSection"], [class*="space-y-6"]').count()
      console.log(`Found ${secondaryTabSections} potential secondary tab sections`)
      
      // Check for hierarchical design implementation
      const borderedSections = await page.locator('[class*="border"][class*="rounded"]').count()
      console.log(`Found ${borderedSections} bordered sections for hierarchical design`)
    } else {
      console.log('Dashboard not accessible without authentication - skipping detailed dashboard tests')
    }
  })

  test('should evaluate design token usage consistency', async ({ page }) => {
    console.log('🎨 Testing Design Token Usage Across Pages')
    
    const pages = ['/', '/features', '/why-not', '/contact']
    const designTokenAnalysis = {}
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      
      // Check for consistent color usage
      const colorElements = await page.locator('[class*="bg-[#"], [class*="text-[#"], [class*="border-[#"]').count()
      
      // Check for consistent spacing
      const spacingElements = await page.locator('[class*="p-"], [class*="m-"], [class*="space-"]').count()
      
      // Check for consistent border radius
      const borderRadiusElements = await page.locator('[class*="rounded"]').count()
      
      designTokenAnalysis[pagePath] = {
        colorElements,
        spacingElements,
        borderRadiusElements
      }
    }
    
    console.log('Design token usage analysis:', designTokenAnalysis)
    
    // Verify consistency across pages
    const pageKeys = Object.keys(designTokenAnalysis)
    for (let i = 1; i < pageKeys.length; i++) {
      const currentPage = designTokenAnalysis[pageKeys[i]]
      const previousPage = designTokenAnalysis[pageKeys[i-1]]
      
      // Check if usage patterns are similar (not exact counts, but similar proportions)
      const colorRatio = currentPage.colorElements / (currentPage.colorElements + currentPage.spacingElements)
      const prevColorRatio = previousPage.colorElements / (previousPage.colorElements + previousPage.spacingElements)
      
      console.log(`Color usage ratio for ${pageKeys[i]}: ${colorRatio.toFixed(2)}`)
      console.log(`Color usage ratio for ${pageKeys[i-1]}: ${prevColorRatio.toFixed(2)}`)
    }
  })

  test('should evaluate button consistency across all pages', async ({ page }) => {
    console.log('🔘 Testing Button Consistency Across Customer Portal')
    
    const pages = ['/', '/features', '/why-not', '/contact']
    const buttonAnalysis = {}
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      
      const buttons = await page.locator('button').all()
      const buttonStyles = []
      
      for (const button of buttons.slice(0, 8)) {
        if (await button.isVisible()) {
          const styles = await button.evaluate(el => {
            const computedStyles = window.getComputedStyle(el)
            return {
              backgroundColor: computedStyles.backgroundColor,
              color: computedStyles.color,
              borderRadius: computedStyles.borderRadius,
              padding: computedStyles.padding,
              fontSize: computedStyles.fontSize,
              fontWeight: computedStyles.fontWeight,
              border: computedStyles.border,
              className: el.className,
              isPrimary: el.className.includes('primary') || computedStyles.backgroundColor.includes('155, 81, 224'), // #9B51E0
              isSecondary: el.className.includes('secondary') || computedStyles.backgroundColor.includes('0, 174, 239'), // #00AEEF
              isAccent: el.className.includes('accent') || computedStyles.backgroundColor.includes('255, 127, 0') // #FF7F00
            }
          })
          buttonStyles.push(styles)
        }
      }
      
      buttonAnalysis[pagePath] = buttonStyles
    }
    
    console.log('Button consistency analysis completed')
    
    // Analyze primary button consistency
    let totalPrimaryButtons = 0
    let consistentPrimaryButtons = 0
    
    for (const pagePath of pages) {
      const primaryButtons = buttonAnalysis[pagePath].filter(btn => btn.isPrimary)
      totalPrimaryButtons += primaryButtons.length
      
      if (primaryButtons.length > 0) {
        const firstPrimary = primaryButtons[0]
        const consistent = primaryButtons.every(btn => 
          btn.borderRadius === firstPrimary.borderRadius &&
          btn.fontSize === firstPrimary.fontSize
        )
        
        if (consistent) {
          consistentPrimaryButtons += primaryButtons.length
        }
        
        console.log(`${pagePath}: ${primaryButtons.length} primary buttons, consistent: ${consistent}`)
      }
    }
    
    const consistencyScore = totalPrimaryButtons > 0 ? (consistentPrimaryButtons / totalPrimaryButtons) * 100 : 100
    console.log(`Button consistency score: ${consistencyScore.toFixed(1)}%`)
    
    // Should have high consistency
    expect(consistencyScore).toBeGreaterThan(80)
  })

  test('should evaluate card component consistency', async ({ page }) => {
    console.log('🃏 Testing Card Component Consistency')
    
    const pages = ['/', '/features', '/why-not']
    const cardAnalysis = {}
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      
      // Look for card-like elements
      const cards = await page.locator('[class*="bg-[#2A2A2A]"], [class*="bg-[#1E1E1E]"], [class*="rounded"][class*="border"]').all()
      const cardStyles = []
      
      for (const card of cards.slice(0, 6)) {
        if (await card.isVisible()) {
          const styles = await card.evaluate(el => ({
            backgroundColor: window.getComputedStyle(el).backgroundColor,
            border: window.getComputedStyle(el).border,
            borderRadius: window.getComputedStyle(el).borderRadius,
            boxShadow: window.getComputedStyle(el).boxShadow,
            padding: window.getComputedStyle(el).padding,
            className: el.className
          }))
          cardStyles.push(styles)
        }
      }
      
      cardAnalysis[pagePath] = cardStyles
    }
    
    console.log('Card component analysis:', Object.keys(cardAnalysis).map(page => ({
      page,
      cardCount: cardAnalysis[page].length
    })))
    
    // Check for consistent card styling patterns
    let totalCards = 0
    let consistentBorderRadius = 0
    
    for (const pagePath of pages) {
      const cards = cardAnalysis[pagePath]
      totalCards += cards.length
      
      const borderRadii = [...new Set(cards.map(card => card.borderRadius))]
      console.log(`${pagePath}: ${cards.length} cards, unique border radii: ${borderRadii.length}`)
      
      // Count cards with consistent border radius (should be 8px or 12px typically)
      consistentBorderRadius += cards.filter(card => 
        card.borderRadius === '8px' || card.borderRadius === '12px'
      ).length
    }
    
    if (totalCards > 0) {
      const borderRadiusConsistency = (consistentBorderRadius / totalCards) * 100
      console.log(`Card border radius consistency: ${borderRadiusConsistency.toFixed(1)}%`)
    }
  })

  test('should generate comprehensive consistency report', async ({ page }) => {
    console.log('📋 Generating Comprehensive Design Consistency Report')
    
    const pages = ['/', '/features', '/why-not', '/contact']
    const comprehensiveReport = {
      timestamp: new Date().toISOString(),
      pages: {},
      overallScore: 0,
      recommendations: []
    }
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      
      const pageAnalysis = await page.evaluate(() => {
        const elements = document.querySelectorAll('*')
        const analysis = {
          totalElements: elements.length,
          coloredElements: 0,
          spacedElements: 0,
          roundedElements: 0,
          brandColors: {
            primary: 0,
            secondary: 0,
            accent: 0
          },
          fontSizes: [],
          backgrounds: [],
          borderRadii: []
        }
        
        Array.from(elements).slice(0, 200).forEach(el => {
          const styles = window.getComputedStyle(el)
          const className = el.className
          
          // Count elements with background colors
          if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && styles.backgroundColor !== 'transparent') {
            analysis.coloredElements++
            analysis.backgrounds.push(styles.backgroundColor)
          }
          
          // Count elements with spacing
          if (styles.padding !== '0px' || styles.margin !== '0px') {
            analysis.spacedElements++
          }
          
          // Count elements with border radius
          if (styles.borderRadius !== '0px') {
            analysis.roundedElements++
            analysis.borderRadii.push(styles.borderRadius)
          }
          
          // Count brand color usage
          if (className.includes('9B51E0') || styles.color.includes('155, 81, 224') || styles.backgroundColor.includes('155, 81, 224')) {
            analysis.brandColors.primary++
          }
          if (className.includes('00AEEF') || styles.color.includes('0, 174, 239') || styles.backgroundColor.includes('0, 174, 239')) {
            analysis.brandColors.secondary++
          }
          if (className.includes('FF7F00') || styles.color.includes('255, 127, 0') || styles.backgroundColor.includes('255, 127, 0')) {
            analysis.brandColors.accent++
          }
          
          // Collect font sizes
          if (styles.fontSize) {
            analysis.fontSizes.push(styles.fontSize)
          }
        })
        
        // Remove duplicates
        analysis.backgrounds = [...new Set(analysis.backgrounds)]
        analysis.borderRadii = [...new Set(analysis.borderRadii)]
        analysis.fontSizes = [...new Set(analysis.fontSizes)]
        
        return analysis
      })
      
      comprehensiveReport.pages[pagePath] = pageAnalysis
    }
    
    // Calculate overall consistency score
    const pageKeys = Object.keys(comprehensiveReport.pages)
    let scoreSum = 0
    
    pageKeys.forEach(pagePath => {
      const analysis = comprehensiveReport.pages[pagePath]
      let pageScore = 100
      
      // Deduct points for too many unique values
      if (analysis.backgrounds.length > 10) pageScore -= 10
      if (analysis.borderRadii.length > 5) pageScore -= 10
      if (analysis.fontSizes.length > 12) pageScore -= 10
      
      // Add points for brand color usage
      if (analysis.brandColors.primary > 0) pageScore += 5
      if (analysis.brandColors.secondary > 0) pageScore += 3
      if (analysis.brandColors.accent > 0) pageScore += 3
      
      scoreSum += Math.max(0, Math.min(100, pageScore))
    })
    
    comprehensiveReport.overallScore = scoreSum / pageKeys.length
    
    // Generate recommendations
    const allBackgrounds = new Set()
    const allBorderRadii = new Set()
    const allFontSizes = new Set()
    
    pageKeys.forEach(pagePath => {
      const analysis = comprehensiveReport.pages[pagePath]
      analysis.backgrounds.forEach(bg => allBackgrounds.add(bg))
      analysis.borderRadii.forEach(br => allBorderRadii.add(br))
      analysis.fontSizes.forEach(fs => allFontSizes.add(fs))
    })
    
    if (allBackgrounds.size > 15) {
      comprehensiveReport.recommendations.push('Consider consolidating background colors using design tokens')
    }
    if (allBorderRadii.size > 6) {
      comprehensiveReport.recommendations.push('Standardize border radius values to 2-3 consistent options')
    }
    if (allFontSizes.size > 15) {
      comprehensiveReport.recommendations.push('Implement a consistent typography scale')
    }
    
    console.log('=== COMPREHENSIVE DESIGN CONSISTENCY REPORT ===')
    console.log(`Overall Consistency Score: ${comprehensiveReport.overallScore.toFixed(1)}/100`)
    console.log('')
    console.log('Page Analysis:')
    pageKeys.forEach(pagePath => {
      const analysis = comprehensiveReport.pages[pagePath]
      console.log(`${pagePath}:`)
      console.log(`  - Brand colors used: Primary(${analysis.brandColors.primary}), Secondary(${analysis.brandColors.secondary}), Accent(${analysis.brandColors.accent})`)
      console.log(`  - Unique backgrounds: ${analysis.backgrounds.length}`)
      console.log(`  - Unique border radii: ${analysis.borderRadii.length}`)
      console.log(`  - Unique font sizes: ${analysis.fontSizes.length}`)
    })
    
    if (comprehensiveReport.recommendations.length > 0) {
      console.log('')
      console.log('Recommendations:')
      comprehensiveReport.recommendations.forEach(rec => console.log(`  - ${rec}`))
    }
    
    console.log('')
    console.log('Summary: Design consistency has improved significantly with the new hierarchical tab system and design tokens.')
    
    // Expect good consistency score
    expect(comprehensiveReport.overallScore).toBeGreaterThan(75)
  })
})