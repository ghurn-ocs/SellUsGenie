import React, { useState, useEffect } from 'react'
import { Palette, Layout, Settings, Save, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { useStoreFront, applyColorScheme } from '../../hooks/useStoreFront'
import { INDUSTRIES, type Industry, type StoreFrontLayout, type ColorScheme } from '../../types/storefront'
import { LayoutSelector } from './LayoutSelector'
import { ColorSchemeSelector } from './ColorSchemeSelector'
import { CustomizationPanel } from './CustomizationPanel'
import { StoreFrontPreview } from './StoreFrontPreview'
import { ConfirmationModal } from '../ui/ConfirmationModal'
import { NotificationModal } from '../ui/NotificationModal'
import { supabase } from '../../lib/supabase'

interface StoreFrontCustomizerProps {
  storeId: string
  storeName: string
  storeSlug?: string
}

export const StoreFrontCustomizer: React.FC<StoreFrontCustomizerProps> = ({ storeId, storeName, storeSlug }) => {
  const [activeTab, setActiveTab] = useState('layout')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [selectedLayout, setSelectedLayout] = useState<StoreFrontLayout | null>(null)
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme | null>(null)
  const [customizations, setCustomizations] = useState<any>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationData, setNotificationData] = useState({
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  })
  const [confirmModalData, setConfirmModalData] = useState({
    title: '',
    message: '',
    type: 'warning' as 'warning' | 'info',
    onConfirm: () => {}
  })

  const {
    currentTemplate,
    layouts,
    colorSchemes,
    currentLayout,
    currentColorScheme,
    isLoading,
    saveTemplate,
    getLayoutsByIndustry,
    getColorSchemesByCategory
  } = useStoreFront(storeId)

  // Initialize selected values when data loads
  useEffect(() => {
    console.log('Initializing state...', {
      currentLayout,
      currentColorScheme,
      currentTemplate,
      selectedLayout,
      selectedColorScheme,
      customizations,
      layoutsLength: layouts.length,
      colorSchemesLength: colorSchemes.length
    })
    
    // If we have existing template data, use it
    if (currentLayout && !selectedLayout) {
      console.log('Setting selected layout from current:', currentLayout)
      setSelectedLayout(currentLayout)
    }
    if (currentColorScheme && !selectedColorScheme) {
      console.log('Setting selected color scheme from current:', currentColorScheme)
      setSelectedColorScheme(currentColorScheme)
    }
    if (currentTemplate?.customizations && !customizations) {
      console.log('Setting customizations from current:', currentTemplate.customizations)
      setCustomizations(currentTemplate.customizations)
    }
    
    // If no template exists, initialize with defaults
    if (!currentTemplate && !selectedLayout && layouts.length > 0) {
      console.log('No template found, setting default layout:', layouts[0])
      setSelectedLayout(layouts[0])
    }
    if (!currentTemplate && !selectedColorScheme && colorSchemes.length > 0) {
      console.log('No template found, setting default color scheme:', colorSchemes[0])
      setSelectedColorScheme(colorSchemes[0])
    }
    if (!currentTemplate && !customizations) {
      console.log('No template found, setting default customizations')
      setCustomizations({
        hero: {
          title: `Welcome to ${storeName}`,
          subtitle: 'Discover amazing products with fast, secure checkout'
        },
        branding: {
          storeName: storeName
        }
      })
    }
  }, [currentLayout, currentColorScheme, currentTemplate, selectedLayout, selectedColorScheme, customizations, layouts, colorSchemes, storeName])

  // Apply color scheme when it changes
  useEffect(() => {
    if (selectedColorScheme) {
      applyColorScheme(selectedColorScheme)
    }
  }, [selectedColorScheme])

  // Track unsaved changes
  useEffect(() => {
    const hasLayoutChange = selectedLayout && currentLayout && selectedLayout.id !== currentLayout.id
    const hasColorChange = selectedColorScheme && currentColorScheme && selectedColorScheme.id !== currentColorScheme.id
    const hasCustomizationChange = customizations && currentTemplate?.customizations && 
      JSON.stringify(customizations) !== JSON.stringify(currentTemplate.customizations)
    
    // Allow saving if we have selections but no current template (first time setup)
    const canSaveNew = !currentTemplate && selectedLayout && selectedColorScheme
    
    const hasChanges = hasLayoutChange || hasColorChange || hasCustomizationChange || canSaveNew
    
    console.log('Change tracking:', {
      hasLayoutChange,
      hasColorChange, 
      hasCustomizationChange,
      canSaveNew,
      hasChanges,
      selectedLayout: selectedLayout?.id,
      currentLayout: currentLayout?.id,
      selectedColorScheme: selectedColorScheme?.id,
      currentColorScheme: currentColorScheme?.id,
      hasCurrentTemplate: !!currentTemplate
    })
    
    setHasUnsavedChanges(hasChanges)
  }, [selectedLayout, selectedColorScheme, customizations, currentLayout, currentColorScheme, currentTemplate])

  const handleSaveTemplate = async () => {
    if (!selectedLayout || !selectedColorScheme) {
      console.error('Cannot save: missing layout or color scheme')
      setNotificationData({
        type: 'error',
        title: 'Cannot Save Design',
        message: 'Please select both a layout and color scheme before saving.'
      })
      setShowNotificationModal(true)
      return
    }

    // Check if template already exists and warn user
    if (!currentTemplate) {
      // Check if any template exists for this store
      try {
        const { data: existingTemplates } = await supabase
          .from('store_templates')
          .select('id')
          .eq('store_id', storeId)

        if (existingTemplates && existingTemplates.length > 0) {
          setConfirmModalData({
            title: 'Replace Existing Design',
            message: 'This store already has a saved design.\n\nSaving this new design will completely replace your existing storefront layout and customizations.\n\nAre you sure you want to continue?',
            type: 'warning',
            onConfirm: () => performSave()
          })
          setShowConfirmModal(true)
          return
        }
      } catch (error) {
        console.error('Error checking existing templates:', error)
      }
    } else {
      // Updating existing template - show update warning
      setConfirmModalData({
        title: 'Update Storefront Design',
        message: 'This will update your current storefront design with the new layout, colors, and customizations.\n\nContinue with save?',
        type: 'info',
        onConfirm: () => performSave()
      })
      setShowConfirmModal(true)
      return
    }

    // If no existing template found, save directly
    await performSave()
  }

  const performSave = async () => {
    if (!selectedLayout || !selectedColorScheme) return

    try {
      // Use current customizations or create default ones
      const customizationsToSave = customizations || {
        hero: {
          title: `Welcome to ${storeName}`,
          subtitle: 'Discover amazing products with fast, secure checkout'
        },
        branding: {
          storeName: storeName
        }
      }

      console.log('Saving template with data:', {
        layoutId: selectedLayout.id,
        colorSchemeId: selectedColorScheme.id,
        customizations: customizationsToSave,
        storeId
      })

      const result = await saveTemplate.mutateAsync({
        layoutId: selectedLayout.id,
        colorSchemeId: selectedColorScheme.id,
        customizations: customizationsToSave,
        isActive: true, // Make it active immediately
        previewMode: false
      })
      
      setHasUnsavedChanges(false)
      console.log('Template saved successfully!', result)
      
      setNotificationData({
        type: 'success',
        title: 'Design Saved Successfully',
        message: 'Your storefront design has been saved and is now live on your store.'
      })
      setShowNotificationModal(true)
    } catch (error) {
      console.error('Error saving template:', error)
      setNotificationData({
        type: 'error',
        title: 'Error Saving Design',
        message: `Failed to save template: ${(error as any)?.message || 'Unknown error'}`
      })
      setShowNotificationModal(true)
    }
  }


  const getDevicePreviewClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      default:
        return 'w-full'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B51E0]"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#3A3A3A]">
        <div>
          <h1 className="text-xl font-semibold text-white">Store Front Designer</h1>
          <p className="text-sm text-[#A0A0A0]">Customize your store's appearance and layout</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Device Preview Toggle */}
          <div className="flex items-center space-x-1 bg-[#2A2A2A] rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'desktop' 
                  ? 'bg-[#9B51E0] text-white' 
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'tablet' 
                  ? 'bg-[#9B51E0] text-white' 
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'mobile' 
                  ? 'bg-[#9B51E0] text-white' 
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleSaveTemplate}
            disabled={!hasUnsavedChanges || saveTemplate.isPending}
            className="px-4 py-2 bg-[#4A5568] text-white rounded-lg hover:bg-[#5A6578] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            title={`Save enabled: ${hasUnsavedChanges}, Layout: ${selectedLayout?.name || 'None'}, Color: ${selectedColorScheme?.name || 'None'}`}
          >
            <Save className="w-4 h-4" />
            <span>{saveTemplate.isPending ? 'Saving...' : 'Save Design'}</span>
          </button>

          {storeSlug && (
            <button
              onClick={() => window.open(`/store/${storeSlug}`, '_blank')}
              className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#8B5CF6] transition-colors flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Live Store</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Customization Panel */}
        <div className="w-80 bg-[#1A1A1A] border-r border-[#3A3A3A] flex flex-col h-full">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <Tabs.List className="flex bg-[#2A2A2A] border-b border-[#3A3A3A] flex-shrink-0">
              <Tabs.Trigger 
                value="layout" 
                className="flex-1 px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white data-[state=active]:text-white data-[state=active]:bg-[#3A3A3A] transition-colors flex items-center justify-center space-x-2"
              >
                <Layout className="w-4 h-4" />
                <span>Layout</span>
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="colors" 
                className="flex-1 px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white data-[state=active]:text-white data-[state=active]:bg-[#3A3A3A] transition-colors flex items-center justify-center space-x-2"
              >
                <Palette className="w-4 h-4" />
                <span>Colors</span>
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="customize" 
                className="flex-1 px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white data-[state=active]:text-white data-[state=active]:bg-[#3A3A3A] transition-colors flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Content</span>
              </Tabs.Trigger>
            </Tabs.List>

            <div className="flex-1 overflow-hidden">
              <Tabs.Content value="layout" className="h-full overflow-y-auto p-4 outline-none">
                <LayoutSelector
                  layouts={layouts}
                  selectedLayout={selectedLayout}
                  onLayoutSelect={setSelectedLayout}
                  getLayoutsByIndustry={getLayoutsByIndustry}
                />
              </Tabs.Content>

              <Tabs.Content value="colors" className="h-full overflow-y-auto p-4 outline-none">
                <ColorSchemeSelector
                  colorSchemes={colorSchemes}
                  selectedColorScheme={selectedColorScheme}
                  onColorSchemeSelect={setSelectedColorScheme}
                  getColorSchemesByCategory={getColorSchemesByCategory}
                />
              </Tabs.Content>

              <Tabs.Content value="customize" className="h-full overflow-y-auto p-4 outline-none">
                <CustomizationPanel
                  currentTemplate={currentTemplate || null}
                  selectedLayout={selectedLayout}
                  storeName={storeName}
                  customizations={customizations}
                  onCustomizationsChange={setCustomizations}
                />
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-[#0A0A0A] p-4 overflow-auto">
          <div className={`${getDevicePreviewClass()} transition-all duration-300`}>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden min-h-[600px]">
              {selectedLayout && selectedColorScheme ? (
                <StoreFrontPreview
                  layout={selectedLayout}
                  colorScheme={selectedColorScheme}
                  storeId={storeId}
                  storeName={storeName}
                  customizations={customizations || currentTemplate?.customizations || {}}
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  Select a layout and color scheme to see preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmModalData.onConfirm}
        title={confirmModalData.title}
        message={confirmModalData.message}
        type={confirmModalData.type}
        confirmText="Continue"
        cancelText="Cancel"
        confirmButtonClass={
          confirmModalData.type === 'warning' 
            ? 'px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium'
            : 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium'
        }
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title={notificationData.title}
        message={notificationData.message}
        type={notificationData.type}
        actionText="OK"
      />
    </div>
  )
}