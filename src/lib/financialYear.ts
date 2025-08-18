/**
 * Financial Year Utility Functions
 * 
 * Handles calculations for custom financial year periods defined by users.
 * Financial year start is defined by month and day only (year is calculated dynamically).
 */

export interface FinancialYearSettings {
  startMonth: number // 1-12
  startDay: number   // 1-31
}

export interface FinancialYearPeriod {
  startDate: Date
  endDate: Date
  year: number // The financial year (e.g., 2024 for FY2024)
}

/**
 * Get the current financial year period based on settings
 */
export function getCurrentFinancialYear(
  settings: FinancialYearSettings,
  referenceDate: Date = new Date()
): FinancialYearPeriod {
  const currentYear = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth() + 1 // getMonth() is 0-based
  const currentDay = referenceDate.getDate()
  
  // Create financial year start date for current calendar year
  const startDateThisYear = new Date(currentYear, settings.startMonth - 1, settings.startDay)
  
  let financialYearStart: Date
  let financialYear: number
  
  // If we're past the financial year start date, we're in the current financial year
  if (referenceDate >= startDateThisYear) {
    financialYearStart = startDateThisYear
    financialYear = currentYear
  } else {
    // If we're before the financial year start date, we're still in the previous financial year
    financialYearStart = new Date(currentYear - 1, settings.startMonth - 1, settings.startDay)
    financialYear = currentYear - 1
  }
  
  // Financial year end is one day before next year's start
  const financialYearEnd = new Date(financialYearStart)
  financialYearEnd.setFullYear(financialYearStart.getFullYear() + 1)
  financialYearEnd.setDate(financialYearEnd.getDate() - 1)
  
  return {
    startDate: financialYearStart,
    endDate: financialYearEnd,
    year: financialYear
  }
}

/**
 * Get a specific financial year period
 */
export function getFinancialYear(
  settings: FinancialYearSettings,
  year: number
): FinancialYearPeriod {
  const startDate = new Date(year, settings.startMonth - 1, settings.startDay)
  const endDate = new Date(year + 1, settings.startMonth - 1, settings.startDay - 1)
  
  return {
    startDate,
    endDate,
    year
  }
}

/**
 * Check if a date falls within a financial year period
 */
export function isDateInFinancialYear(
  date: Date,
  financialYearPeriod: FinancialYearPeriod
): boolean {
  return date >= financialYearPeriod.startDate && date <= financialYearPeriod.endDate
}

/**
 * Get financial year progress as percentage (0-100)
 */
export function getFinancialYearProgress(
  settings: FinancialYearSettings,
  referenceDate: Date = new Date()
): number {
  const currentFY = getCurrentFinancialYear(settings, referenceDate)
  const totalDays = Math.ceil((currentFY.endDate.getTime() - currentFY.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysPassed = Math.ceil((referenceDate.getTime() - currentFY.startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return Math.min(100, Math.max(0, (daysPassed / totalDays) * 100))
}

/**
 * Get remaining days in current financial year
 */
export function getRemainingDaysInFinancialYear(
  settings: FinancialYearSettings,
  referenceDate: Date = new Date()
): number {
  const currentFY = getCurrentFinancialYear(settings, referenceDate)
  const remainingMs = currentFY.endDate.getTime() - referenceDate.getTime()
  return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)))
}

/**
 * Format financial year period for display
 */
export function formatFinancialYearPeriod(period: FinancialYearPeriod): string {
  const startStr = period.startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  const endStr = period.endDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  
  return `${startStr} - ${endStr}`
}

/**
 * Get financial year label (e.g., "FY2024")
 */
export function getFinancialYearLabel(period: FinancialYearPeriod): string {
  return `FY${period.year}`
}

/**
 * Default financial year settings (January 1st - December 31st)
 */
export const DEFAULT_FINANCIAL_YEAR: FinancialYearSettings = {
  startMonth: 1,
  startDay: 1
}

/**
 * Common financial year presets
 */
export const FINANCIAL_YEAR_PRESETS = {
  CALENDAR: { startMonth: 1, startDay: 1 },    // Jan 1 - Dec 31
  US_FEDERAL: { startMonth: 10, startDay: 1 },  // Oct 1 - Sep 30
  UK_FINANCIAL: { startMonth: 4, startDay: 6 }, // Apr 6 - Apr 5
  AUSTRALIA: { startMonth: 7, startDay: 1 },    // Jul 1 - Jun 30
  INDIA: { startMonth: 4, startDay: 1 },        // Apr 1 - Mar 31
}