import React, { useState } from 'react'
import { Type, Image, Phone, Mail, Globe, Upload, X, Check, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { StoreFrontTemplate, StoreFrontLayout } from '../../types/storefront'

interface CustomizationPanelProps {
  currentTemplate: StoreFrontTemplate | null
  selectedLayout: StoreFrontLayout | null
  storeName: string
  customizations: any
  onCustomizationsChange: (customizations: any) => void
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  currentTemplate,
  selectedLayout,
  storeName,
  customizations: propCustomizations,
  onCustomizationsChange
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // Initialize customizations from props or default values
  const customizations = propCustomizations || {
    hero: {
      title: `Welcome to ${storeName}`,
      subtitle: 'Discover amazing products with fast, secure checkout',
      backgroundImage: '',
      ctaText: 'Shop Now',
      ctaUrl: '/products'
    },
    branding: {
      logo: '',
      favicon: '',
      storeName: storeName,
      tagline: 'Quality products, delivered fast'
    },
    contact: {
      phone: '',
      email: '',
      address: '',
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        tiktok: ''
      }
    },
    seo: {
      title: `${storeName} - Quality Products Online`,
      description: `Shop the best products at ${storeName}. Fast shipping, secure checkout, and excellent customer service.`,
      keywords: ['online store', 'quality products', 'fast shipping']
    }
  }

  const updateCustomization = (section: string, field: string, value: any) => {
    const updated = {
      ...customizations,
      [section]: {
        ...customizations[section],
        [field]: value
      }
    }
    onCustomizationsChange(updated)
  }

  const updateSocialLink = (platform: string, value: string) => {
    const updated = {
      ...customizations,
      contact: {
        ...customizations.contact,
        socialLinks: {
          ...customizations.contact.socialLinks,
          [platform]: value
        }
      }
    }
    onCustomizationsChange(updated)
  }

  const addKeyword = () => {
    const newKeyword = prompt('Enter a new keyword:')
    if (newKeyword && !customizations.seo.keywords?.includes(newKeyword.toLowerCase())) {
      const updated = {
        ...customizations,
        seo: {
          ...customizations.seo,
          keywords: [...(customizations.seo.keywords || []), newKeyword.toLowerCase()]
        }
      }
      onCustomizationsChange(updated)
    }
  }

  const removeKeyword = (keyword: string) => {
    const updated = {
      ...customizations,
      seo: {
        ...customizations.seo,
        keywords: customizations.seo.keywords?.filter(k => k !== keyword) || []
      }
    }
    onCustomizationsChange(updated)
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploadSuccess(null)
    setIsUploading(true)

    try {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PNG, JPG, SVG, or WebP image file')
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('Image file must be smaller than 5MB')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('store-images')
        .upload(`logos/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('store-images')
        .getPublicUrl(data.path)

      // Update customization
      updateCustomization('branding', 'logo', publicUrl)
      setUploadSuccess('Logo uploaded successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(null), 3000)

    } catch (error: any) {
      console.error('Logo upload error:', error)
      setUploadError(error.message || 'Failed to upload logo')
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Customize Your Content</h3>
        <p className="text-sm text-[#A0A0A0]">
          Personalize your store with your own content, branding, and contact information
        </p>
      </div>

      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-[#9B51E0]" />
          <h4 className="font-semibold text-white">Hero Section</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Main Headline
            </label>
            <input
              type="text"
              value={customizations.hero?.title || ''}
              onChange={(e) => updateCustomization('hero', 'title', e.target.value)}
              placeholder="Welcome to your store"
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Subtitle
            </label>
            <textarea
              value={customizations.hero?.subtitle || ''}
              onChange={(e) => updateCustomization('hero', 'subtitle', e.target.value)}
              placeholder="Describe what makes your store special"
              rows={3}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Call-to-Action Button Text
            </label>
            <input
              type="text"
              value={customizations.hero?.ctaText || ''}
              onChange={(e) => updateCustomization('hero', 'ctaText', e.target.value)}
              placeholder="Shop Now"
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Branding Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Image className="w-5 h-5 text-[#9B51E0]" />
          <h4 className="font-semibold text-white">Branding</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={customizations.branding?.storeName || ''}
              onChange={(e) => updateCustomization('branding', 'storeName', e.target.value)}
              placeholder="Your Store Name"
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={customizations.branding?.tagline || ''}
              onChange={(e) => updateCustomization('branding', 'tagline', e.target.value)}
              placeholder="Your brand's tagline or slogan"
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Logo URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={customizations.branding?.logo || ''}
                onChange={(e) => updateCustomization('branding', 'logo', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <button 
                  type="button"
                  disabled={isUploading}
                  className="px-3 py-2 bg-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:bg-[#4A4A4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-[#A0A0A0] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {uploadError && (
              <div className="flex items-center space-x-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <p className="text-xs text-red-400">{uploadError}</p>
              </div>
            )}
            {uploadSuccess && (
              <div className="flex items-center space-x-1 mt-1">
                <Check className="w-3 h-3 text-green-400" />
                <p className="text-xs text-green-400">{uploadSuccess}</p>
              </div>
            )}
            <p className="text-xs text-[#A0A0A0] mt-1">
              Recommended size: 200x60px, PNG, JPG, SVG, or WebP format (max 5MB)
            </p>
            {customizations.branding?.logo && (
              <div className="mt-2">
                <p className="text-xs text-[#A0A0A0] mb-1">Preview:</p>
                <div className="p-2 bg-white rounded border">
                  <img 
                    src={customizations.branding.logo} 
                    alt="Logo preview"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Phone className="w-5 h-5 text-[#9B51E0]" />
          <h4 className="font-semibold text-white">Contact Information</h4>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={customizations.contact?.phone || ''}
                onChange={(e) => updateCustomization('contact', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={customizations.contact?.email || ''}
                onChange={(e) => updateCustomization('contact', 'email', e.target.value)}
                placeholder="hello@yourstore.com"
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Business Address
            </label>
            <textarea
              value={customizations.contact?.address || ''}
              onChange={(e) => updateCustomization('contact', 'address', e.target.value)}
              placeholder="123 Main Street, City, State 12345"
              rows={3}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>

          {/* Social Media Links */}
          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-3">
              Social Media Links
            </label>
            <div className="space-y-3">
              {Object.entries(customizations.contact?.socialLinks || {}).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-xs font-medium text-[#A0A0A0] mb-1 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateSocialLink(platform, e.target.value)}
                    placeholder={`https://www.${platform}.com/yourstore`}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-[#9B51E0]" />
          <h4 className="font-semibold text-white">SEO Settings</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Page Title
            </label>
            <input
              type="text"
              value={customizations.seo?.title || ''}
              onChange={(e) => updateCustomization('seo', 'title', e.target.value)}
              placeholder="Your Store - Quality Products Online"
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
            <p className="text-xs text-[#A0A0A0] mt-1">
              Appears in browser tab and search results (recommended: 50-60 characters)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Meta Description
            </label>
            <textarea
              value={customizations.seo?.description || ''}
              onChange={(e) => updateCustomization('seo', 'description', e.target.value)}
              placeholder="Brief description of your store and products for search engines"
              rows={3}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
            <p className="text-xs text-[#A0A0A0] mt-1">
              Appears in search results (recommended: 120-160 characters)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Keywords
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {customizations.seo?.keywords?.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-[#3A3A3A] rounded-full text-xs text-white cursor-pointer hover:bg-[#4A4A4A]"
                    onClick={() => removeKeyword(keyword)}
                  >
                    {keyword} ×
                  </span>
                ))}
              </div>
              <button
                onClick={addKeyword}
                className="px-3 py-1 bg-[#9B51E0] text-white rounded-lg text-xs hover:bg-[#A051E0] transition-colors"
              >
                Add Keyword
              </button>
            </div>
            <p className="text-xs text-[#A0A0A0] mt-1">
              Click on keywords to remove them
            </p>
          </div>
        </div>
      </div>

      {/* Save Reminder */}
      <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">💾 Remember to Save</h4>
        <p className="text-sm text-[#A0A0A0]">
          Your customizations are ready to be saved. Click "Save Draft" to store your changes, 
          then "Preview" to see how they look, and "Publish Live" when you're ready to go live.
        </p>
      </div>
    </div>
  )
}