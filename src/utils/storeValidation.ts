/**
 * Store Name Validation Utilities
 * Handles offensive language detection and duplicate name checking
 */

import { supabase } from '../lib/supabase'

// Common offensive words list (keep this minimal and focused)
const OFFENSIVE_WORDS = [
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 
  'piss', 'crap', 'suck', 'stupid', 'idiot', 'hate',
  'kill', 'die', 'death', 'murder', 'nazi', 'hitler',
  'sex', 'porn', 'nude', 'naked', 'adult', 'xxx',
  'scam', 'fraud', 'fake', 'illegal', 'drug', 'weed',
  'casino', 'gambling', 'bet', 'loan', 'debt'
]

// Additional patterns to check
const OFFENSIVE_PATTERNS = [
  /\b(f+u+c+k+)\b/i,
  /\b(s+h+i+t+)\b/i,
  /\b(b+i+t+c+h+)\b/i,
  /\b(a+s+s+h+o+l+e+)\b/i,
  /\b(d+a+m+n+)\b/i
]

export interface ValidationResult {
  isValid: boolean
  error?: string
  suggestion?: string
}

/**
 * Check if a store name contains offensive language
 */
export const validateOffensiveContent = (storeName: string): ValidationResult => {
  if (!storeName || storeName.trim().length === 0) {
    return { isValid: false, error: 'Store name is required' }
  }

  const cleanName = storeName.toLowerCase().trim()
  
  // Check against offensive words list
  for (const word of OFFENSIVE_WORDS) {
    if (cleanName.includes(word)) {
      return {
        isValid: false,
        error: 'Store name contains inappropriate language',
        suggestion: 'Please choose a professional business name'
      }
    }
  }

  // Check against offensive patterns
  for (const pattern of OFFENSIVE_PATTERNS) {
    if (pattern.test(cleanName)) {
      return {
        isValid: false,
        error: 'Store name contains inappropriate language',
        suggestion: 'Please choose a professional business name'
      }
    }
  }

  // Check for excessive repetitive characters (often used to bypass filters)
  if (/(.)\1{4,}/.test(cleanName)) {
    return {
      isValid: false,
      error: 'Store name contains unusual character patterns',
      suggestion: 'Please use normal spelling for your business name'
    }
  }

  // Check minimum length
  if (cleanName.length < 2) {
    return {
      isValid: false,
      error: 'Store name must be at least 2 characters long'
    }
  }

  // Check maximum length
  if (cleanName.length > 100) {
    return {
      isValid: false,
      error: 'Store name must be less than 100 characters'
    }
  }

  return { isValid: true }
}

/**
 * Check if a store name already exists (excluding current store)
 */
export const validateDuplicateName = async (
  storeName: string, 
  currentStoreId?: string
): Promise<ValidationResult> => {
  if (!storeName || storeName.trim().length === 0) {
    return { isValid: false, error: 'Store name is required' }
  }

  try {
    let query = supabase
      .from('stores')
      .select('id, store_name')
      .eq('store_name', storeName.trim())

    // Exclude current store if updating existing store
    if (currentStoreId) {
      query = query.neq('id', currentStoreId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error checking duplicate store name:', error)
      return {
        isValid: false,
        error: 'Unable to validate store name. Please try again.'
      }
    }

    if (data && data.length > 0) {
      return {
        isValid: false,
        error: 'A store with this name already exists',
        suggestion: 'Please choose a unique name for your store'
      }
    }

    return { isValid: true }
  } catch (error) {
    console.error('Error in duplicate name validation:', error)
    return {
      isValid: false,
      error: 'Unable to validate store name. Please try again.'
    }
  }
}

/**
 * Comprehensive store name validation (combines both checks)
 */
export const validateStoreName = async (
  storeName: string,
  currentStoreId?: string
): Promise<ValidationResult> => {
  // First check for offensive content (fast, client-side)
  const offensiveCheck = validateOffensiveContent(storeName)
  if (!offensiveCheck.isValid) {
    return offensiveCheck
  }

  // Then check for duplicates (requires database query)
  const duplicateCheck = await validateDuplicateName(storeName, currentStoreId)
  if (!duplicateCheck.isValid) {
    return duplicateCheck
  }

  return { isValid: true }
}

/**
 * Generate a store slug from store name
 */
export const generateStoreSlug = (storeName: string): string => {
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Check if a store slug is available
 */
export const validateStoreSlug = async (
  slug: string,
  currentStoreId?: string
): Promise<ValidationResult> => {
  if (!slug || slug.trim().length === 0) {
    return { isValid: false, error: 'Store URL is required' }
  }

  try {
    let query = supabase
      .from('stores')
      .select('id, store_slug')
      .eq('store_slug', slug.trim())

    // Exclude current store if updating existing store
    if (currentStoreId) {
      query = query.neq('id', currentStoreId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error checking duplicate store slug:', error)
      return {
        isValid: false,
        error: 'Unable to validate store URL. Please try again.'
      }
    }

    if (data && data.length > 0) {
      return {
        isValid: false,
        error: 'This store URL is already taken',
        suggestion: 'Please choose a different URL for your store'
      }
    }

    return { isValid: true }
  } catch (error) {
    console.error('Error in slug validation:', error)
    return {
      isValid: false,
      error: 'Unable to validate store URL. Please try again.'
    }
  }
}