/**
 * Product Listing Widget
 * Displays products with search, filtering, cart and favorites functionality
 */

import { z } from 'zod';
import { ShoppingBag } from 'lucide-react';
import { WidgetConfig } from '../../types';
import { ProductListingEditor } from './ProductListingEditor';
import { ProductListingView } from './ProductListingView';

// Product listing widget props schema
export const ProductListingPropsSchema = z.object({
  title: z.string().default('Our Products'),
  subtitle: z.string().default('Discover our amazing product collection'),
  showSearch: z.boolean().default(true),
  showCategoryFilter: z.boolean().default(true),
  showFavorites: z.boolean().default(true),
  showAddToCart: z.boolean().default(true),
  productsPerRow: z.number().min(1).max(6).default(3),
  showPagination: z.boolean().default(true),
  productsPerPage: z.number().min(6).max(50).default(12),
  displayMode: z.enum(['grid', 'list']).default('grid'),
  sortOptions: z.array(z.string()).default(['name', 'price-low-high', 'price-high-low', 'newest', 'popular']),
  defaultSort: z.string().default('name'),
  showQuickView: z.boolean().default(true),
  enableImageZoom: z.boolean().default(true),
  categoryFilter: z.enum(['all', 'specific']).default('all'),
  specificCategories: z.array(z.string()).default([]),
  priceFilter: z.boolean().default(true),
  stockFilter: z.boolean().default(true),
  customCSS: z.string().default(''),
});

export type ProductListingProps = z.infer<typeof ProductListingPropsSchema>;

// Widget configuration
export const productListingWidget: WidgetConfig = {
  type: 'product-listing',
  name: 'Product Listing',
  description: 'Display products with search, filtering, and shopping features',
  category: 'commerce',
  icon: ShoppingBag,
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: ProductListingPropsSchema,
  defaultProps: {
    title: 'Our Products',
    subtitle: 'Discover our amazing product collection',
    showSearch: true,
    showCategoryFilter: true,
    showFavorites: true,
    showAddToCart: true,
    productsPerRow: 3,
    showPagination: true,
    productsPerPage: 12,
    displayMode: 'grid',
    sortOptions: ['name', 'price-low-high', 'price-high-low', 'newest', 'popular'],
    defaultSort: 'name',
    showQuickView: true,
    enableImageZoom: true,
    categoryFilter: 'all',
    specificCategories: [],
    priceFilter: true,
    stockFilter: true,
    customCSS: '',
  },
  Editor: ProductListingEditor,
  View: ProductListingView,
};

// Register the widget
import { widgetRegistry } from '../registry';
widgetRegistry.register(productListingWidget);