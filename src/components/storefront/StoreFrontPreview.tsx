import React from 'react'
import { ShoppingBag, Star, Heart, Share } from 'lucide-react'
import type { StoreFrontLayout, ColorScheme } from '../../types/storefront'
import { DeliveryAreaDisplay } from '../DeliveryAreaDisplay'

interface StoreFrontPreviewProps {
  layout: StoreFrontLayout
  colorScheme: ColorScheme
  storeId: string
  storeName: string
  customizations: any
}

export const StoreFrontPreview: React.FC<StoreFrontPreviewProps> = ({
  layout,
  colorScheme,
  storeId,
  storeName,
  customizations
}) => {
  // Comprehensive debug logging
  console.log('=== StoreFrontPreview RENDER START ===')
  console.log('Layout:', layout)
  console.log('ColorScheme:', colorScheme)
  console.log('StoreId:', storeId)
  console.log('StoreName:', storeName)
  console.log('Customizations:', customizations)
  console.log('Props received:', { layout, colorScheme, storeId, storeName, customizations })
  
  const heroTitle = customizations?.hero?.title || `Welcome to ${storeName}`
  const heroSubtitle = customizations?.hero?.subtitle || 'Discover amazing products with fast, secure checkout'
  const ctaText = customizations?.hero?.ctaText || 'Shop Now'
  const storeTagline = customizations?.branding?.tagline || 'Quality products, delivered fast'

  // Early return if no layout or colorScheme
  if (!layout || !colorScheme) {
    console.log('=== EARLY RETURN: Missing layout or colorScheme ===', { 
      layout: layout, 
      colorScheme: colorScheme,
      hasLayout: !!layout,
      hasColorScheme: !!colorScheme,
      layoutType: typeof layout,
      colorSchemeType: typeof colorScheme
    })
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>Loading preview...</p>
      </div>
    )
  }

  // Sample products for preview
  const sampleProducts = [
    { id: '1', name: 'Premium Product 1', price: 29.99, image: null },
    { id: '2', name: 'Best Seller Item', price: 49.99, image: null },
    { id: '3', name: 'Popular Choice', price: 19.99, image: null },
    { id: '4', name: 'Customer Favorite', price: 39.99, image: null }
  ]

  const getHeroHeight = () => {
    switch (layout.config.hero.height) {
      case 'small': return 'h-32'
      case 'medium': return 'h-48'
      case 'large': return 'h-64'
      case 'full': return 'h-96'
      default: return 'h-48'
    }
  }

  const getGridColumns = () => {
    switch (layout.config.productGrid.columns) {
      case 2: return 'grid-cols-2'
      case 3: return 'grid-cols-3'
      case 4: return 'grid-cols-4'
      case 5: return 'grid-cols-5'
      case 6: return 'grid-cols-6'
      default: return 'grid-cols-4'
    }
  }

  // Get colors with fallbacks and detailed logging
  console.log('=== COLOR SCHEME PROCESSING ===')
  console.log('ColorScheme structure:', JSON.stringify(colorScheme, null, 2))
  console.log('ColorScheme.colors:', colorScheme?.colors)
  console.log('ColorScheme.colors.primary:', colorScheme?.colors?.primary)
  
  const colors = {
    primary: colorScheme?.colors?.primary || '#9B51E0',
    secondary: colorScheme?.colors?.secondary || '#A0A0A0',
    accent: colorScheme?.colors?.accent || '#ED8936',
    background: colorScheme?.colors?.background || '#FFFFFF',
    surface: colorScheme?.colors?.surface || '#F7FAFC',
    textPrimary: colorScheme?.colors?.text?.primary || '#1A202C',
    textSecondary: colorScheme?.colors?.text?.secondary || '#4A5568',
    textLight: colorScheme?.colors?.text?.light || '#A0AEC0',
    border: colorScheme?.colors?.border || '#E2E8F0',
  }
  
  console.log('=== FINAL COLORS OBJECT ===')
  console.log('Final colors:', colors)
  console.log('Colors JSON:', JSON.stringify(colors, null, 2))

  console.log('=== ABOUT TO RENDER PREVIEW ===')
  console.log('Rendering with colors:', colors)
  console.log('Background color:', colors.background)
  
  // Emergency fallback for debugging
  if (!colors.background || colors.background === 'undefined') {
    console.error('=== INVALID BACKGROUND COLOR ===', colors.background)
    return (
      <div className="w-full min-h-screen bg-red-100 border-4 border-red-500 p-4">
        <h1 className="text-red-900 text-2xl font-bold">DEBUG: Invalid Background Color</h1>
        <p className="text-red-800">Background: {String(colors.background)}</p>
        <p className="text-red-800">ColorScheme: {JSON.stringify(colorScheme, null, 2)}</p>
      </div>
    )
  }
  
  try {
    return (
      <div className="w-full min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Navigation */}
      <header 
        className={`border-b ${layout.config.navigation.position === 'sticky' ? 'sticky top-0 z-50' : ''}`}
        style={{ 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-xl font-bold" 
              style={{ color: colors.primary }}
            >
              {customizations?.branding?.storeName || storeName}
            </h1>
            {layout.config.navigation.showCategories && (
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-sm" style={{ color: colors.textSecondary }}>Products</a>
                <a href="#" className="text-sm" style={{ color: colors.textSecondary }}>Categories</a>
                <a href="#" className="text-sm" style={{ color: colors.textSecondary }}>About</a>
                <a href="#" className="text-sm" style={{ color: colors.textSecondary }}>Contact</a>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {layout.config.navigation.showSearch && (
              <input
                type="search"
                placeholder="Search products..."
                className="px-3 py-1 text-sm rounded-lg border"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              />
            )}
            <ShoppingBag className="w-5 h-5" style={{ color: colors.textSecondary }} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {layout.sections.includes('hero') && (
        <section 
          className={`${getHeroHeight()} flex items-center justify-center text-center px-4`}
          style={{ backgroundColor: colors.primary }}
        >
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {heroTitle}
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
            {layout.config.hero.showCTA && (
              <button
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: colors.accent,
                  color: 'white'
                }}
              >
                {ctaText}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Delivery Areas Section */}
      {storeId && (
        <section className="py-12" style={{ backgroundColor: colors.background }}>
          <div className="max-w-7xl mx-auto px-4">
            <DeliveryAreaDisplay storeId={storeId} showMap={false} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      {layout.sections.includes('featured-products') && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: colors.textPrimary }}
              >
                Featured Products
              </h2>
              <p style={{ color: colors.textSecondary }}>
                Check out our most popular items
              </p>
            </div>

            <div className={`grid ${getGridColumns()} gap-6`}>
              {sampleProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}
                >
                  <div 
                    className="aspect-square flex items-center justify-center text-4xl font-bold"
                    style={{ 
                      backgroundColor: colors.background,
                      color: colors.textLight
                    }}
                  >
                    {product.name.charAt(0)}
                  </div>
                  <div className="p-4">
                    <h3 
                      className="font-medium mb-2"
                      style={{ color: colors.textPrimary }}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-lg font-bold"
                        style={{ color: colors.primary }}
                      >
                        ${product.price}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors"
                        style={{ backgroundColor: colors.primary }}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="p-2 rounded-lg border transition-colors"
                        style={{ 
                          borderColor: colors.border,
                          color: colors.textSecondary
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer 
        className="py-8 border-t"
        style={{ 
          backgroundColor: colors.surface,
          borderColor: colors.border
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid ${layout.config.footer.columns === 4 ? 'grid-cols-4' : layout.config.footer.columns === 3 ? 'grid-cols-3' : layout.config.footer.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{ color: colors.primary }}
              >
                {customizations?.branding?.storeName || storeName}
              </h3>
              <p 
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                {storeTagline}
              </p>
            </div>
            
            {layout.config.footer.columns > 1 && (
              <div>
                <h4 
                  className="font-medium mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  Quick Links
                </h4>
                <ul className="text-sm space-y-1">
                  <li><a href="#" style={{ color: colors.textSecondary }}>About Us</a></li>
                  <li><a href="#" style={{ color: colors.textSecondary }}>Contact</a></li>
                  <li><a href="#" style={{ color: colors.textSecondary }}>Privacy Policy</a></li>
                </ul>
              </div>
            )}

            {layout.config.footer.columns > 2 && (
              <div>
                <h4 
                  className="font-medium mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  Support
                </h4>
                <ul className="text-sm space-y-1">
                  <li><a href="#" style={{ color: colors.textSecondary }}>Help Center</a></li>
                  <li><a href="#" style={{ color: colors.textSecondary }}>Shipping</a></li>
                  <li><a href="#" style={{ color: colors.textSecondary }}>Returns</a></li>
                </ul>
              </div>
            )}

            {layout.config.footer.columns > 3 && (
              <div>
                <h4 
                  className="font-medium mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  Connect
                </h4>
                <div className="flex space-x-3">
                  <Share className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  <Share className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  <Share className="w-4 h-4" style={{ color: colors.textSecondary }} />
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
            <p 
              className="text-sm"
              style={{ color: colors.textLight }}
            >
              © 2024 {customizations?.branding?.storeName || storeName}. All rights reserved. Powered by SellUsGenie
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
  } catch (error) {
    console.error('=== ERROR RENDERING PREVIEW ===', error)
    console.error('Error details:', { error, layout, colorScheme, colors })
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        <p>Error rendering preview: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
}