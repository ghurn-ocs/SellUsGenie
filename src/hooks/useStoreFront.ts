import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { StoreFrontTemplate, StoreFrontLayout, ColorScheme } from '../types/storefront'
import { LAYOUT_TEMPLATES, COLOR_SCHEMES } from '../types/storefront'

export const useStoreFront = (storeId: string) => {
  const queryClient = useQueryClient()

  // Fetch current storefront template for a store
  const {
    data: currentTemplate,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['storefront', storeId],
    queryFn: async () => {
      if (!storeId) return null

      const { data, error } = await supabase
        .from('store_templates')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching storefront template:', error)
        throw error
      }

      if (!data) return null

      // Map database fields to TypeScript interface
      return {
        id: data.id,
        layoutId: data.layout_id,
        colorSchemeId: data.color_scheme_id,
        customizations: data.customizations || {},
        isActive: data.is_active,
        previewMode: data.preview_mode,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as StoreFrontTemplate
    },
    enabled: !!storeId
  })

  // Get available layouts and color schemes
  const layouts = LAYOUT_TEMPLATES
  const colorSchemes = COLOR_SCHEMES

  // Get layouts by industry
  const getLayoutsByIndustry = (industry: string) => {
    return layouts.filter(layout => layout.industry === industry)
  }

  // Get color schemes by category
  const getColorSchemesByCategory = (category: string) => {
    return colorSchemes.filter(scheme => scheme.category === category)
  }

  // Create or update storefront template
  const saveTemplate = useMutation({
    mutationFn: async (templateData: Partial<StoreFrontTemplate>) => {
      if (!storeId) throw new Error('Store ID is required')

      console.log('saveTemplate called with:', templateData)
      console.log('currentTemplate:', currentTemplate)

      const payload = {
        store_id: storeId,
        layout_id: templateData.layoutId,
        color_scheme_id: templateData.colorSchemeId,
        customizations: templateData.customizations || {},
        is_active: templateData.isActive !== undefined ? templateData.isActive : true,
        preview_mode: templateData.previewMode || false,
        updated_at: new Date().toISOString()
      }

      console.log('Database payload:', payload)

      // Strategy: Always ensure one template per store by using DELETE + INSERT
      console.log('Implementing one-template-per-store strategy')
      
      // Step 1: Delete ALL existing templates for this store
      console.log('Deleting all existing templates for store:', storeId)
      const { error: deleteError } = await supabase
        .from('store_templates')
        .delete()
        .eq('store_id', storeId)

      if (deleteError) {
        console.error('Error deleting existing templates:', deleteError)
        // Don't throw here - we can continue if delete fails
      }

      // Step 2: Create the new template (guaranteed to be the only one)
      console.log('Creating new template for store:', storeId)
      const { data, error } = await supabase
        .from('store_templates')
        .insert([{
          ...payload,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating storefront template:', error)
        throw error
      }

      return {
        id: data.id,
        layoutId: data.layout_id,
        colorSchemeId: data.color_scheme_id,
        customizations: data.customizations || {},
        isActive: data.is_active,
        previewMode: data.preview_mode,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as StoreFrontTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', storeId] })
    }
  })

  // Toggle preview mode
  const togglePreview = useMutation({
    mutationFn: async (previewMode: boolean) => {
      if (!currentTemplate) throw new Error('No template found')

      const { data, error } = await supabase
        .from('store_templates')
        .update({ preview_mode: previewMode })
        .eq('id', currentTemplate.id)
        .eq('store_id', storeId)
        .select()
        .single()

      if (error) {
        console.error('Error toggling preview mode:', error)
        throw error
      }

      return {
        id: data.id,
        layoutId: data.layout_id,
        colorSchemeId: data.color_scheme_id,
        customizations: data.customizations || {},
        isActive: data.is_active,
        previewMode: data.preview_mode,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as StoreFrontTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', storeId] })
    }
  })

  // Activate template (make it live)
  const activateTemplate = useMutation({
    mutationFn: async () => {
      if (!currentTemplate) throw new Error('No template found')

      const { data, error } = await supabase
        .from('store_templates')
        .update({ 
          is_active: true,
          preview_mode: false 
        })
        .eq('id', currentTemplate.id)
        .eq('store_id', storeId)
        .select()
        .single()

      if (error) {
        console.error('Error activating template:', error)
        throw error
      }

      return {
        id: data.id,
        layoutId: data.layout_id,
        colorSchemeId: data.color_scheme_id,
        customizations: data.customizations || {},
        isActive: data.is_active,
        previewMode: data.preview_mode,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as StoreFrontTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', storeId] })
    }
  })

  // Get current layout details
  const getCurrentLayout = (): StoreFrontLayout | null => {
    if (!currentTemplate) return null
    return layouts.find(layout => layout.id === currentTemplate.layoutId) || null
  }

  // Get current color scheme details
  const getCurrentColorScheme = (): ColorScheme | null => {
    if (!currentTemplate) return null
    return colorSchemes.find(scheme => scheme.id === currentTemplate.colorSchemeId) || null
  }

  // Generate CSS variables for current color scheme
  const generateCSSVariables = () => {
    const colorScheme = getCurrentColorScheme()
    if (!colorScheme) return {}
    
    return {
      ...colorScheme.cssVariables,
      '--color-background': colorScheme.colors.background,
      '--color-surface': colorScheme.colors.surface,
      '--color-text-primary': colorScheme.colors.text.primary,
      '--color-text-secondary': colorScheme.colors.text.secondary,
      '--color-text-light': colorScheme.colors.text.light,
      '--color-border': colorScheme.colors.border,
      '--color-success': colorScheme.colors.success,
      '--color-warning': colorScheme.colors.warning,
      '--color-error': colorScheme.colors.error
    }
  }

  return {
    // Data
    currentTemplate,
    layouts,
    colorSchemes,
    isLoading,
    error,

    // Computed values
    currentLayout: getCurrentLayout(),
    currentColorScheme: getCurrentColorScheme(),
    cssVariables: generateCSSVariables(),

    // Helper functions
    getLayoutsByIndustry,
    getColorSchemesByCategory,

    // Mutations
    saveTemplate,
    togglePreview,
    activateTemplate,

    // Utilities
    refetch
  }
}

// Utility function to apply CSS variables to document
export const applyColorScheme = (colorScheme: ColorScheme) => {
  const root = document.documentElement
  
  Object.entries(colorScheme.cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
  
  // Apply additional color variables
  root.style.setProperty('--color-background', colorScheme.colors.background)
  root.style.setProperty('--color-surface', colorScheme.colors.surface)
  root.style.setProperty('--color-text-primary', colorScheme.colors.text.primary)
  root.style.setProperty('--color-text-secondary', colorScheme.colors.text.secondary)
  root.style.setProperty('--color-text-light', colorScheme.colors.text.light)
  root.style.setProperty('--color-border', colorScheme.colors.border)
  root.style.setProperty('--color-success', colorScheme.colors.success)
  root.style.setProperty('--color-warning', colorScheme.colors.warning)
  root.style.setProperty('--color-error', colorScheme.colors.error)
}