/**
 * Featured Products Widget
 * Displays featured products in a carousel format
 */

import { z } from 'zod';
import { Star } from 'lucide-react';
import { widgetRegistry } from '../registry';
import { FeaturedProductsEditor } from './FeaturedProductsEditor';
import { FeaturedProductsView } from './FeaturedProductsView';
import type { WidgetConfig } from '../../types';

export interface FeaturedProductsProps {
  title: string;
  subtitle: string;
  showTitle: boolean;
  showSubtitle: boolean;
  maxProducts: number;
  itemsPerRow: { sm: number; md: number; lg: number };
  showPrice: boolean;
  showComparePrice: boolean;
  showDescription: boolean;
  showAddToCart: boolean;
  showRating: boolean;
  showBadges: boolean;
  carousel: {
    enabled: boolean;
    autoplay: boolean;
    autoplaySpeed: number;
    infinite: boolean;
    showDots: boolean;
    showArrows: boolean;
    pauseOnHover: boolean;
    slidesToScroll: number;
    spacing: number;
  };
  styling: {
    backgroundColor: string;
    cardBackground: string;
    titleColor: string;
    priceColor: string;
    buttonStyle: 'primary' | 'secondary' | 'outline';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    aspectRatio: 'auto' | 'square' | '4/3' | '16/9' | '3/2';
  };
  padding: string;
  textAlignment: 'left' | 'center' | 'right';
  emptyStateMessage: string;
}

export const FeaturedProductsPropsSchema = z.object({
  title: z.string().default('Featured Products'),
  subtitle: z.string().default('Check out our hand-picked featured products'),
  showTitle: z.boolean().default(true),
  showSubtitle: z.boolean().default(true),
  maxProducts: z.number().min(1).max(50).default(8),
  itemsPerRow: z.object({
    sm: z.number().min(1).max(6).default(1),
    md: z.number().min(1).max(6).default(2),
    lg: z.number().min(1).max(6).default(4),
  }).default({ sm: 1, md: 2, lg: 4 }),
  showPrice: z.boolean().default(true),
  showComparePrice: z.boolean().default(true),
  showDescription: z.boolean().default(true),
  showAddToCart: z.boolean().default(true),
  showRating: z.boolean().default(false),
  showBadges: z.boolean().default(true),
  carousel: z.object({
    enabled: z.boolean().default(true),
    autoplay: z.boolean().default(false),
    autoplaySpeed: z.number().min(2000).max(10000).default(4000),
    infinite: z.boolean().default(true),
    showDots: z.boolean().default(true),
    showArrows: z.boolean().default(true),
    pauseOnHover: z.boolean().default(true),
    slidesToScroll: z.number().min(1).max(4).default(1),
    spacing: z.number().min(0).max(48).default(16),
  }).default({
    enabled: true,
    autoplay: false,
    autoplaySpeed: 4000,
    infinite: true,
    showDots: true,
    showArrows: true,
    pauseOnHover: true,
    slidesToScroll: 1,
    spacing: 16,
  }),
  styling: z.object({
    backgroundColor: z.string().default('bg-white'),
    cardBackground: z.string().default('bg-white'),
    titleColor: z.string().default('text-gray-900'),
    priceColor: z.string().default('text-gray-900'),
    buttonStyle: z.enum(['primary', 'secondary', 'outline']).default('primary'),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
    shadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('md'),
    aspectRatio: z.enum(['auto', 'square', '4/3', '16/9', '3/2']).default('4/3'),
  }).default({
    backgroundColor: 'bg-white',
    cardBackground: 'bg-white',
    titleColor: 'text-gray-900',
    priceColor: 'text-gray-900',
    buttonStyle: 'primary',
    borderRadius: 'md',
    shadow: 'md',
    aspectRatio: '4/3',
  }),
  padding: z.string().default('py-16 px-4'),
  textAlignment: z.enum(['left', 'center', 'right']).default('center'),
  emptyStateMessage: z.string().default('No featured products available at the moment. Check back soon!'),
});

export type FeaturedProductsProps = z.infer<typeof FeaturedProductsPropsSchema>;

const featuredProductsConfig: WidgetConfig = {
  type: 'featured-products',
  name: 'Featured Products',
  description: 'Display featured products in an attractive carousel or grid layout',
  icon: Star,
  category: 'commerce',
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: FeaturedProductsPropsSchema,
  defaultProps: {
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
  },
  Editor: FeaturedProductsEditor,
  View: FeaturedProductsView,
};

// Register the widget
widgetRegistry.register(featuredProductsConfig);

export { featuredProductsConfig };