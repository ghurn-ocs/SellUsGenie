/**
 * Featured Products View
 * Displays featured products in a carousel or grid layout
 */
import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, ShoppingCart, Badge } from 'lucide-react';
import { useFeaturedProducts } from '../../../hooks/useFeaturedProducts';
import { useStore } from '../../../contexts/StoreContext';
import type { WidgetViewProps } from '../../types';
import type { FeaturedProductsProps } from './index';
import type { Product } from '../../../types/product';
// Safe cart hook that doesn't throw when CartProvider is not available (e.g., in editor)
const useSafeCart = () => {
  try {
    // Try to import and use the cart hook
    const { useCart } = require('../../../contexts/CartContext');
    return useCart();
  } catch (error) {
    // Cart context not available (e.g., in page builder editor)
    return {
      addToCart: () => {},
      cartItems: [],
      itemCount: 0,
      subtotal: 0,
      isOpen: false,
      setIsOpen: () => {},
      isCheckoutOpen: false,
      setIsCheckoutOpen: () => {}
    };
  }
};
export const FeaturedProductsView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  const { currentStore } = useStore();
  const { addToCart } = useSafeCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  // Provide default values for all props to prevent crashes
  const props: FeaturedProductsProps = {
    title: 'Featured Products',
    subtitle: 'Check out our hand-picked featured products',
    showTitle: true,
    showSubtitle: true,
    maxProducts: 8,
    itemsPerRow: { sm: 1, md: 2, lg: 4 },
    showPrice: true,
    showComparePrice: true,
    showDescription: true,
    showAddToCart: true,
    showRating: false,
    showBadges: true,
    carousel: {
      enabled: true,
      autoplay: false,
      autoplaySpeed: 4000,
      infinite: true,
      showDots: true,
      showArrows: true,
      pauseOnHover: true,
      slidesToScroll: 1,
      spacing: 16,
    },
    styling: {
      backgroundColor: 'bg-white',
      cardBackground: 'bg-white',
      titleColor: 'text-gray-900',
      priceColor: 'text-gray-900',
      buttonStyle: 'primary',
      borderRadius: 'md',
      shadow: 'md',
      aspectRatio: '4/3',
    },
    padding: 'py-16 px-4',
    textAlignment: 'center',
    emptyStateMessage: 'No featured products available at the moment. Check back soon!',
    ...(widget.props as FeaturedProductsProps)
  };
  // Get store ID from current context
  const getStoreId = (): string | null => {
    // First try to get from React context (most reliable)
    if (currentStore?.id) {
      return currentStore.id;
    }
    // Fallback to other methods for storefront/public pages
    if (typeof window !== 'undefined') {
      // Check for global store context
      const storeContext = (window as any).__STORE_CONTEXT__;
      if (storeContext?.id) {
        return storeContext.id;
      }
      // Check URL patterns for store ID
      const urlPath = window.location.pathname;
      // Pattern: /stores/[storeId]/...
      const storeMatch = urlPath.match(/\/stores\/([^\/]+)/);
      if (storeMatch?.[1]) {
        return storeMatch[1];
      }
      // Pattern: admin panel with store parameter
      const adminMatch = urlPath.match(/\/admin/) && new URLSearchParams(window.location.search).get('storeId');
      if (adminMatch) {
        return adminMatch;
      }
    }
    return null;
  };
  const storeId = getStoreId();
  const { data: products = [], isLoading, error } = useFeaturedProducts(storeId || '', props.maxProducts);
  // Filter and limit products
  const displayProducts = products.slice(0, props.maxProducts);
  // Carousel logic
  const totalSlides = props.carousel.enabled 
    ? Math.ceil(displayProducts.length / props.itemsPerRow.lg) 
    : 0;
  // Auto-play functionality
  useEffect(() => {
    if (props.carousel.enabled && props.carousel.autoplay && isPlaying && totalSlides > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => 
          props.carousel.infinite 
            ? (prev + 1) % totalSlides 
            : prev < totalSlides - 1 ? prev + 1 : 0
        );
      }, props.carousel.autoplaySpeed);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [props.carousel.enabled, props.carousel.autoplay, props.carousel.autoplaySpeed, isPlaying, totalSlides, props.carousel.infinite]);
  const nextSlide = () => {
    if (!props.carousel.enabled || totalSlides <= 1) return;
    const newSlide = currentSlide + props.carousel.slidesToScroll;
    if (props.carousel.infinite) {
      setCurrentSlide(newSlide >= totalSlides ? 0 : newSlide);
    } else {
      setCurrentSlide(Math.min(newSlide, totalSlides - 1));
    }
  };
  const prevSlide = () => {
    if (!props.carousel.enabled || totalSlides <= 1) return;
    const newSlide = currentSlide - props.carousel.slidesToScroll;
    if (props.carousel.infinite) {
      setCurrentSlide(newSlide < 0 ? totalSlides - 1 : newSlide);
    } else {
      setCurrentSlide(Math.max(newSlide, 0));
    }
  };
  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };
  // Handle mouse events for autoplay pause
  const handleMouseEnter = () => {
    if (props.carousel.pauseOnHover) {
      setIsPlaying(false);
    }
  };
  const handleMouseLeave = () => {
    if (props.carousel.pauseOnHover) {
      setIsPlaying(true);
    }
  };
  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    if (!storeId) {
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || product.gallery_images?.[0] || '/placeholder-product.jpg',
      storeId: storeId
    });
  };
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  // Get aspect ratio class
  const getAspectRatioClass = () => {
    switch (props.styling.aspectRatio) {
      case 'square': return 'aspect-square';
      case '4/3': return 'aspect-4/3';
      case '16/9': return 'aspect-video';
      case '3/2': return 'aspect-3/2';
      default: return '';
    }
  };
  // Get button classes
  const getButtonClasses = () => {
    const base = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    switch (props.styling.buttonStyle) {
      case 'primary':
        return `${base} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
      case 'secondary':
        return `${base} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500`;
      case 'outline':
        return `${base} border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500`;
      default:
        return `${base} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
    }
  };
  // Build CSS classes
  const containerClasses = [
    props.styling.backgroundColor,
    props.padding
  ].filter(Boolean).join(' ');
  const alignmentClass = props.textAlignment === 'center' ? 'text-center' : props.textAlignment === 'right' ? 'text-right' : 'text-left';
  // Loading state
  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className={`grid gap-6 grid-cols-${props.itemsPerRow.sm} md:grid-cols-${props.itemsPerRow.md} lg:grid-cols-${props.itemsPerRow.lg}`}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Error state
  if (error) {
    return (
      <div className={containerClasses}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Badge className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
            <p className="text-gray-600">Unable to load featured products. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
  // Empty state
  if (!displayProducts.length) {
    return (
      <div className={containerClasses}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Star className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Products</h3>
            <p className="text-gray-600">{props.emptyStateMessage}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={containerClasses}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(props.showTitle || props.showSubtitle) && (
          <div className={`mb-12 ${alignmentClass}`}>
            {props.showTitle && props.title && (
              <h2 className={`text-3xl font-bold mb-4 ${props.styling.titleColor}`}>
                {props.title}
              </h2>
            )}
            {props.showSubtitle && props.subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {props.subtitle}
              </p>
            )}
          </div>
        )}
        {/* Products */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          {props.carousel.enabled ? (
            // Carousel Layout
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                  gap: `${props.carousel.spacing}px`
                }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div
                    key={slideIndex}
                    className={`flex-shrink-0 w-full grid gap-6 grid-cols-${props.itemsPerRow.sm} md:grid-cols-${props.itemsPerRow.md} lg:grid-cols-${props.itemsPerRow.lg}`}
                  >
                    {displayProducts
                      .slice(slideIndex * props.itemsPerRow.lg, (slideIndex + 1) * props.itemsPerRow.lg)
                      .map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          props={props}
                          onAddToCart={handleAddToCart}
                          formatPrice={formatPrice}
                          getAspectRatioClass={getAspectRatioClass}
                          getButtonClasses={getButtonClasses}
                        />
                      ))}
                  </div>
                ))}
              </div>
              {/* Navigation Arrows */}
              {props.carousel.showArrows && totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all"
                    aria-label="Previous products"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-all"
                    aria-label="Next products"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              {/* Dots Indicator */}
              {props.carousel.showDots && totalSlides > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Grid Layout
            <div className={`grid gap-6 grid-cols-${props.itemsPerRow.sm} md:grid-cols-${props.itemsPerRow.md} lg:grid-cols-${props.itemsPerRow.lg}`}>
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  props={props}
                  onAddToCart={handleAddToCart}
                  formatPrice={formatPrice}
                  getAspectRatioClass={getAspectRatioClass}
                  getButtonClasses={getButtonClasses}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Product Card Component
interface ProductCardProps {
  product: Product;
  props: FeaturedProductsProps;
  onAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
  getAspectRatioClass: () => string;
  getButtonClasses: () => string;
}
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  props,
  onAddToCart,
  formatPrice,
  getAspectRatioClass,
  getButtonClasses
}) => {
  const cardClasses = [
    props.styling.cardBackground,
    `rounded-${props.styling.borderRadius}`,
    `shadow-${props.styling.shadow}`,
    'overflow-hidden',
    'group',
    'transition-transform',
    'hover:scale-105'
  ].filter(Boolean).join(' ');
  return (
    <div className={cardClasses}>
      {/* Product Image */}
      <div className={`relative ${getAspectRatioClass()}`}>
        {(product.image_url || (product.gallery_images && product.gallery_images.length > 0)) ? (
          <img
            src={product.image_url || product.gallery_images?.[0]}
            alt={product.image_alt || product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.svg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {/* Featured Badge */}
        {props.showBadges && product.is_featured && (
          <div className="absolute top-2 left-2">
            <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          </div>
        )}
        {/* Sale Badge */}
        {props.showBadges && product.compare_at_price && product.compare_at_price > product.price && (
          <div className="absolute top-2 right-2">
            <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              Sale
            </div>
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        {props.showDescription && product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {product.description}
          </p>
        )}
        {/* Price */}
        {props.showPrice && (
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xl font-bold ${props.styling.priceColor}`}>
              {formatPrice(product.price)}
            </span>
            {props.showComparePrice && product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        )}
        {/* Rating placeholder */}
        {props.showRating && (
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-gray-300" />
            ))}
            <span className="text-sm text-gray-500 ml-2">No reviews yet</span>
          </div>
        )}
        {/* Add to Cart Button */}
        {props.showAddToCart && (
          <button
            onClick={() => onAddToCart(product)}
            className={`w-full ${getButtonClasses()}`}
            disabled={!product.is_active || product.inventory_quantity <= 0}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.inventory_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};