/**
 * Product Listing Widget View
 * Displays products with search, filtering, cart and favorites functionality
 */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Heart, 
  ShoppingCart, 
  Star,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase, type Product } from '../../../lib/supabase';
import { STORAGE_BUCKETS, checkBucketExists } from '../../../lib/storage';
// Import hooks with error boundary fallback
import { useAuth } from '../../../contexts/AuthContext';
import { useStore } from '../../../contexts/StoreContext';
import { useCart } from '../../../contexts/CartContext';
import { useProducts } from '../../../hooks/useProducts';
import type { WidgetViewProps } from '../types';
import type { ProductListingProps } from './index';
// Safe hook wrappers that don't throw errors when contexts are unavailable
const useSafeAuth = () => {
  try {
    return useAuth();
  } catch (error) {
    return { user: null };
  }
};
const useSafeStore = () => {
  try {
    return useStore();
  } catch (error) {
    return { currentStore: null };
  }
};
const useSafeCart = () => {
  try {
    return useCart();
  } catch (error) {
    return { addToCart: null, isLoading: false };
  }
};
const useSafeProducts = (storeId: string) => {
  try {
    return useProducts(storeId);
  } catch (error) {
    return { products: [], isLoading: false, error: null };
  }
};
// Extended Product interface for widget use (adding fields not in DB)
interface ExtendedProduct extends Product {
  short_description?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  tags?: string[];
}
// Filter state interface
interface FilterState {
  searchTerm: string;
  selectedCategories: string[];
  priceRange: { min: number; max: number };
  inStock: boolean;
  sortBy: string;
}
// Helper function to get proper image URL with comprehensive error handling
const getProductImageUrl = (product: Product): string | null => {
  if (!product.image_url) {
    return null;
  }
  let imageUrl: string;
  // Handle JSON array format: ["url"] -> "url"
  if (Array.isArray(product.image_url)) {
    if (product.image_url.length === 0) return null;
    imageUrl = product.image_url[0];
  } 
  // Handle string format
  else if (typeof product.image_url === 'string') {
    imageUrl = product.image_url;
  }
  // Handle other formats (maybe stringified JSON)
  else {
    try {
      const parsed = JSON.parse(product.image_url as string);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageUrl = parsed[0];
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  // If it's a relative path, construct the full Supabase storage URL
  try {
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
      .getPublicUrl(imageUrl);
    return data.publicUrl;
  } catch (error) {
    // Try direct URL construction as fallback
    const fallbackUrl = `${supabase.supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKETS.PRODUCT_IMAGES}/${imageUrl}`;
    return fallbackUrl;
  }
};
// Function to check storage setup (runs once per session)
let storageChecked = false;
const checkStorageSetup = async () => {
  if (storageChecked) return;
  storageChecked = true;
  const bucketExists = await checkBucketExists(STORAGE_BUCKETS.PRODUCT_IMAGES);
  if (!bucketExists) {
  }
};
export const ProductListingView: React.FC<WidgetViewProps<ProductListingProps>> = ({ 
  widget 
}) => {
  const { props } = widget;
  // Use safe hooks to work in both page builder and live storefront
  const { user } = useSafeAuth();
  const { currentStore } = useSafeStore();
  const { addToCart, isLoading: cartLoading } = useSafeCart();
  // State management
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    selectedCategories: [],
    priceRange: { min: 0, max: 10000 },
    inStock: props.stockFilter,
    sortBy: props.defaultSort,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>(props.displayMode);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState<Set<string>>(new Set());
  // Check storage setup on component mount
  React.useEffect(() => {
    checkStorageSetup();
  }, []);
  // Fetch products using the standard useProducts hook with fallback
  const storeId = currentStore?.id || '';
  const { products: realProducts, isLoading: realLoading, error: realError } = useSafeProducts(storeId);
  // Use mock data if no store ID (page builder preview) or if no real products
  const products = React.useMemo(() => {
    if (!currentStore?.id) {
      return [
        {
          id: 'mock-1',
          store_id: 'mock-store',
          name: 'Sample Product 1',
          description: 'This is a sample product for preview',
          price: 29.99,
          inventory_quantity: 10,
          is_active: true,
          image_url: '/placeholder-product.svg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          store_id: 'mock-store',
          name: 'Sample Product 2',
          description: 'Another sample product for preview',
          price: 49.99,
          compare_at_price: 59.99,
          inventory_quantity: 5,
          is_active: true,
          image_url: '/placeholder-product.svg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-3',
          store_id: 'mock-store',
          name: 'Sample Product 3',
          description: 'Third sample product for preview',
          price: 19.99,
          inventory_quantity: 0,
          is_active: true,
          image_url: '/placeholder-product.svg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as Product[];
    }
    // Products loaded from database
    return realProducts || [];
  }, [currentStore?.id, realProducts?.length, realError?.message]);
  const isLoading = realLoading;
  const error = realError;
  // Fetch product categories (with fallback for page builder)
  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories', currentStore?.id || 'none'],
    queryFn: async () => {
      if (!currentStore?.id) {
        // Return mock categories for page builder
        return ['Electronics', 'Clothing', 'Books'];
      }
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('store_id', currentStore.id)
        .eq('is_active', true);
      if (error) {
        return [];
      }
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
      return uniqueCategories;
    },
    enabled: true,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
  // Fetch user favorites (with stable query key)
  const { data: userFavorites = [] } = useQuery({
    queryKey: ['user-favorites', user?.id || 'none', currentStore?.id || 'none'],
    queryFn: async () => {
      if (!user?.id || !currentStore?.id) return [];
      const { data, error } = await supabase
        .from('customer_favorites')
        .select('product_id')
        .eq('customer_id', user.id)
        .eq('store_id', currentStore.id);
      if (error) {
        return [];
      }
      return data.map(f => f.product_id);
    },
    enabled: !!user?.id && !!currentStore?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  // Update favorites state when data loads (with stable check to prevent loops)
  React.useEffect(() => {
    if (userFavorites && userFavorites.length >= 0) {
      setFavorites(new Set(userFavorites));
    }
  }, [userFavorites?.length]);
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    // Search filter
    if (filterState.searchTerm) {
      const searchLower = filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    // Category filter
    if (filterState.selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        filterState.selectedCategories.includes(product.category)
      );
    }
    // Specific categories filter from widget props
    if (props.categoryFilter === 'specific' && props.specificCategories.length > 0) {
      filtered = filtered.filter(product => 
        props.specificCategories.includes(product.category)
      );
    }
    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.price;
      return price >= filterState.priceRange.min && price <= filterState.priceRange.max;
    });
    // Stock filter
    if (filterState.inStock) {
      filtered = filtered.filter(product => product.inventory_quantity > 0);
    }
    // Sort products
    switch (filterState.sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return filtered;
  }, [products, filterState, props.categoryFilter, props.specificCategories]);
  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / props.productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * props.productsPerPage,
    currentPage * props.productsPerPage
  );
  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    if (!addToCart) {
      return;
    }
    if (!currentStore?.id) return;
    try {
      await addToCart(product.id, 1);
    } catch (error) {
    }
  };
  // Handle toggle favorite
  const handleToggleFavorite = async (productId: string) => {
    if (!user?.id || !currentStore?.id) {
      // Preview mode: just toggle locally
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(productId)) {
          newFavorites.delete(productId);
        } else {
          newFavorites.add(productId);
        }
        return newFavorites;
      });
      return;
    }
    setLoadingFavorites(prev => new Set(prev).add(productId));
    try {
      const isFavorite = favorites.has(productId);
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('customer_favorites')
          .delete()
          .eq('customer_id', user.id)
          .eq('product_id', productId)
          .eq('store_id', currentStore.id);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        // Add to favorites
        await supabase
          .from('customer_favorites')
          .insert({
            customer_id: user.id,
            product_id: productId,
            store_id: currentStore.id,
          });
        setFavorites(prev => new Set(prev).add(productId));
      }
    } catch (error) {
    } finally {
      setLoadingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };
  // Product Card Component
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(false);
    const isFavorite = favorites.has(product.id);
    const isLoadingFav = loadingFavorites.has(product.id);
    const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
    const displayPrice = product.price;
    const isOutOfStock = product.inventory_quantity <= 0;
    // Get proper image URL (memoized to prevent recalculation on every render)
    const imageUrl = React.useMemo(() => getProductImageUrl(product), [product.id, product.image_url]);
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {imageUrl && !imageError ? (
            <>
              <img
                src={imageUrl}
                alt={product.image_alt || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
                onLoad={() => setImageLoading(false)}
                onLoadStart={() => setImageLoading(true)}
                loading="lazy"
              />
              {/* Loading overlay (only show while image is loading) */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400">Loading...</div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <div className="text-gray-400 text-4xl mb-2">
                {imageError ? '❌' : '📦'}
              </div>
              <div className="text-gray-500 text-xs text-center px-2">
                {imageError ? 'Image failed to load' : 'No image available'}
              </div>
              {imageError && (
                <div className="text-gray-400 text-xs mt-1 px-2 text-center">
                  URL: {imageUrl?.substring(0, 50)}...
                </div>
              )}
            </div>
          )}
          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              Sale
            </div>
          )}
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Favorite Button */}
            {props.showFavorites && user && (
              <button
                onClick={() => handleToggleFavorite(product.id)}
                disabled={isLoadingFav}
                className={`p-2 rounded-full shadow-md transition-colors ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} 
                />
              </button>
            )}
            {/* Quick View Button */}
            {props.showQuickView && (
              <button className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:text-blue-500 transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
          {/* Short Description */}
          {product.short_description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.short_description}
            </p>
          )}
          {/* Category */}
          <p className="text-xs text-gray-500 mb-2">{product.category}</p>
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < product.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">
                ({product.review_count || 0})
              </span>
            </div>
          )}
          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-sm text-gray-500 line-through">
                ${product.compare_at_price!.toFixed(2)}
              </span>
            )}
          </div>
          {/* Add to Cart Button */}
          {props.showAddToCart && (
            <button
              onClick={() => handleAddToCart(product)}
              disabled={isOutOfStock || cartLoading}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    );
  };
  // Product Row Component (for list view)
  const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(false);
    const isFavorite = favorites.has(product.id);
    const isLoadingFav = loadingFavorites.has(product.id);
    const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
    const displayPrice = product.price;
    const isOutOfStock = product.inventory_quantity <= 0;
    // Get proper image URL (memoized to prevent recalculation on every render)
    const imageUrl = React.useMemo(() => getProductImageUrl(product), [product.id, product.image_url]);
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center p-4 gap-4">
          {/* Small Product Image */}
          <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-50 rounded-md">
            {imageUrl && !imageError ? (
              <>
                <img
                  src={imageUrl}
                  alt={product.image_alt || product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageLoading(false)}
                  onLoadStart={() => setImageLoading(true)}
                  loading="lazy"
                />
                {/* Loading overlay (only show while image is loading) */}
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-xs">...</div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-sm">
                  {imageError ? '❌' : '📦'}
                </div>
              </div>
            )}
            {/* Sale Badge */}
            {isOnSale && (
              <div className="absolute -top-1 -left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-medium">
                Sale
              </div>
            )}
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-xs font-medium">Out</span>
              </div>
            )}
          </div>
          {/* Product Info - Flexible Layout */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                {/* Name and Category */}
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                {product.category && (
                  <p className="text-sm text-gray-500">{product.category}</p>
                )}
                {/* Description (truncated) */}
                {product.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < product.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      ({product.review_count || 0})
                    </span>
                  </div>
                )}
              </div>
              {/* Price and Actions Column */}
              <div className="flex flex-col items-end gap-2">
                {/* Price */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ${displayPrice.toFixed(2)}
                  </div>
                  {isOnSale && (
                    <div className="text-sm text-gray-500 line-through">
                      ${product.compare_at_price!.toFixed(2)}
                    </div>
                  )}
                </div>
                {/* Stock Status */}
                <div className="text-sm">
                  {isOutOfStock ? (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  ) : (
                    <span className="text-green-600">{product.inventory_quantity} in stock</span>
                  )}
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Favorite Button */}
                  {props.showFavorites && user && (
                    <button
                      onClick={() => handleToggleFavorite(product.id)}
                      disabled={isLoadingFav}
                      className={`p-1.5 rounded transition-colors ${
                        isFavorite 
                          ? 'text-red-500' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} 
                      />
                    </button>
                  )}
                  {/* Quick View Button */}
                  {props.showQuickView && (
                    <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {/* Add to Cart Button */}
                  {props.showAddToCart && (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || cartLoading}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                        isOutOfStock
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (isLoading) {
    return (
      <div className="py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">Error loading products. Please try again.</p>
      </div>
    );
  }
  return (
    <div className="py-8">
      {/* Custom CSS */}
      {props.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: props.customCSS }} />
      )}
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{props.title}</h2>
        {props.subtitle && (
          <p className="text-lg text-gray-600">{props.subtitle}</p>
        )}
      </div>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Bar */}
          {props.showSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={filterState.searchTerm}
                onChange={(e) => setFilterState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Category Filter */}
            {props.showCategoryFilter && categories.length > 0 && (
              <select
                value={filterState.selectedCategories[0] || ''}
                onChange={(e) => setFilterState(prev => ({ 
                  ...prev, 
                  selectedCategories: e.target.value ? [e.target.value] : [] 
                }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
            {/* Sort Dropdown */}
            <select
              value={filterState.sortBy}
              onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {props.sortOptions.includes('name') && <option value="name">Name A-Z</option>}
              {props.sortOptions.includes('price-low-high') && <option value="price-low-high">Price: Low to High</option>}
              {props.sortOptions.includes('price-high-low') && <option value="price-high-low">Price: High to Low</option>}
              {props.sortOptions.includes('newest') && <option value="newest">Newest First</option>}
              {props.sortOptions.includes('popular') && <option value="popular">Most Popular</option>}
            </select>
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            {/* Display Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-2 ${displayMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-2 ${displayMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              {props.priceFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterState.priceRange.min}
                      onChange={(e) => setFilterState(prev => ({ 
                        ...prev, 
                        priceRange: { ...prev.priceRange, min: Number(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterState.priceRange.max}
                      onChange={(e) => setFilterState(prev => ({ 
                        ...prev, 
                        priceRange: { ...prev.priceRange, max: Number(e.target.value) || 10000 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
              {/* Stock Filter */}
              {props.stockFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterState.inStock}
                      onChange={(e) => setFilterState(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Results Info */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {paginatedProducts.length} of {filteredProducts.length} products
          </span>
        </div>
      </div>
      {/* Products Display */}
      {paginatedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
        </div>
      ) : displayMode === 'grid' ? (
        <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${props.productsPerRow}`}>
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedProducts.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      )}
      {/* Pagination */}
      {props.showPagination && totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            const isActive = page === currentPage;
            if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
              return null;
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border rounded-md ${
                  isActive 
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};