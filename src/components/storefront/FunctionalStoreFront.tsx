import React from 'react'
import { ShoppingBag, Star, Heart, Search } from 'lucide-react'
import { useProductsNew } from '../../hooks/useProductsNew'
import { CartProvider, useCart } from '../../contexts/CartContext'
import { CheckoutProvider } from '../../contexts/CheckoutContext'
import { CartIcon } from '../cart/CartIcon'
import { CartSidebar } from '../cart/CartSidebar'
import { AddToCartButton } from '../cart/AddToCartButton'
import { CheckoutModal } from '../checkout/CheckoutModal'
import { DeliveryAreaDisplay } from '../DeliveryAreaDisplay'
import type { StoreFrontLayout, ColorScheme } from '../../types/storefront'

interface FunctionalStoreFrontProps {
  layout: StoreFrontLayout
  colorScheme: ColorScheme
  storeId: string
  storeName: string
  customizations: any
}

const StoreFrontContent: React.FC<FunctionalStoreFrontProps> = ({
  layout,
  colorScheme,
  storeId,
  storeName,
  customizations
}) => {
  const { products, isLoading } = useProductsNew(storeId, { is_active: true })
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart()

  const heroTitle = customizations?.hero?.title || `Welcome to ${storeName}`
  const heroSubtitle = customizations?.hero?.subtitle || 'Discover amazing products with fast, secure checkout'
  const ctaText = customizations?.hero?.ctaText || 'Shop Now'
  const storeTagline = customizations?.branding?.tagline || 'Quality products, delivered fast'

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
      case 2: return 'grid-cols-1 sm:grid-cols-2'
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      case 5: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
      case 6: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }
  }

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

  return (
    <>
      <div className="w-full min-h-screen" style={{ backgroundColor: colors.background }}>
        {/* Navigation */}
        <header 
          className={`border-b ${layout.config.navigation.position === 'sticky' ? 'sticky top-0 z-40' : ''}`}
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.border 
          }}
        >
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {customizations?.branding?.logo && (
                <img 
                  src={customizations.branding.logo} 
                  alt={`${customizations?.branding?.storeName || storeName} logo`}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              )}
              <h1 
                className="text-xl font-bold" 
                style={{ color: colors.primary }}
              >
                {customizations?.branding?.storeName || storeName}
              </h1>
              {layout.config.navigation.showCategories && (
                <nav className="hidden md:flex space-x-6">
                  <a href="#products" className="text-sm hover:opacity-75" style={{ color: colors.textSecondary }}>Products</a>
                  <a href="#delivery" className="text-sm hover:opacity-75" style={{ color: colors.textSecondary }}>Delivery</a>
                  <a href="#about" className="text-sm hover:opacity-75" style={{ color: colors.textSecondary }}>About</a>
                  <a href="#contact" className="text-sm hover:opacity-75" style={{ color: colors.textSecondary }}>Contact</a>
                </nav>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {layout.config.navigation.showSearch && (
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search products..."
                    className="px-3 py-1 pl-8 text-sm rounded-lg border w-48"
                    style={{ 
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textLight }} />
                </div>
              )}
              <CartIcon />
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
              {customizations?.branding?.logo && (
                <div className="mb-6">
                  <img 
                    src={customizations.branding.logo} 
                    alt={`${customizations?.branding?.storeName || storeName} logo`}
                    className="h-16 w-auto object-contain mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {heroTitle}
              </h1>
              <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                {heroSubtitle}
              </p>
              {layout.config.hero.showCTA && (
                <button
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
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
        <section id="delivery" className="py-12" style={{ backgroundColor: colors.background }}>
          <div className="max-w-7xl mx-auto px-4">
            <DeliveryAreaDisplay storeId={storeId} showMap={false} />
          </div>
        </section>

        {/* Products Section */}
        {layout.sections.includes('featured-products') && (
          <section id="products" className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  Our Products
                </h2>
                <p style={{ color: colors.textSecondary }}>
                  {products.length > 0 ? `Discover our ${products.length} amazing products` : 'Products coming soon'}
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className={`grid ${getGridColumns()} gap-6`}>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      style={{ 
                        backgroundColor: colors.surface,
                        borderColor: colors.border
                      }}
                    >
                      <div 
                        className="aspect-square flex items-center justify-center"
                        style={{ backgroundColor: colors.background }}
                      >
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="text-4xl font-bold"
                            style={{ color: colors.textLight }}
                          >
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 
                          className="font-medium mb-2 line-clamp-2"
                          style={{ color: colors.textPrimary }}
                        >
                          {product.name}
                        </h3>
                        {product.description && (
                          <p 
                            className="text-sm mb-2 line-clamp-2"
                            style={{ color: colors.textSecondary }}
                          >
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span 
                            className="text-lg font-bold"
                            style={{ color: colors.primary }}
                          >
                            ${product.price.toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <AddToCartButton 
                            productId={product.id}
                            className="flex-1"
                            style={{ backgroundColor: colors.primary }}
                          />
                          <button
                            className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
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
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag 
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: colors.textLight }}
                  />
                  <h3 
                    className="text-lg font-medium mb-2"
                    style={{ color: colors.textPrimary }}
                  >
                    No Products Available
                  </h3>
                  <p style={{ color: colors.textSecondary }}>
                    This store doesn't have any products yet. Check back soon!
                  </p>
                </div>
              )}
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
            <div className={`grid ${layout.config.footer.columns === 4 ? 'grid-cols-1 md:grid-cols-4' : layout.config.footer.columns === 3 ? 'grid-cols-1 md:grid-cols-3' : layout.config.footer.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {customizations?.branding?.logo && (
                    <img 
                      src={customizations.branding.logo} 
                      alt={`${customizations?.branding?.storeName || storeName} logo`}
                      className="h-6 w-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  )}
                  <h3 
                    className="font-semibold"
                    style={{ color: colors.primary }}
                  >
                    {customizations?.branding?.storeName || storeName}
                  </h3>
                </div>
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
                    <li><a href="#products" className="hover:opacity-75" style={{ color: colors.textSecondary }}>Products</a></li>
                    <li><a href="#delivery" className="hover:opacity-75" style={{ color: colors.textSecondary }}>Delivery</a></li>
                    <li><a href="#about" className="hover:opacity-75" style={{ color: colors.textSecondary }}>About Us</a></li>
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
                    <li><a href="#contact" className="hover:opacity-75" style={{ color: colors.textSecondary }}>Contact Us</a></li>
                    <li><a href="#shipping" className="hover:opacity-75" style={{ color: colors.textSecondary }}>Shipping Info</a></li>
                    <li><a href="#returns" className="hover:opacity-75" style={{ color: colors.textSecondary }}>Returns</a></li>
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
                  <p 
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Follow us for updates and special offers
                  </p>
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

      {/* Cart Sidebar */}
      <CartSidebar />
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        storeId={storeId}
      />
    </>
  )
}

export const FunctionalStoreFront: React.FC<FunctionalStoreFrontProps> = (props) => {
  return (
    <CartProvider storeId={props.storeId}>
      <CheckoutProvider storeId={props.storeId}>
        <StoreFrontContent {...props} />
      </CheckoutProvider>
    </CartProvider>
  )
}