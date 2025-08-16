/**
 * Hero Widget
 * Displays hero banners with background images/videos and content
 */

import { z } from 'zod';
import { widgetRegistry } from '../registry';
import type { WidgetConfig } from '../../types';

// Schema for hero widget properties
export const heroSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  backgroundType: z.enum(['image', 'video', 'color']).default('image'),
  backgroundImage: z.string().url().optional(),
  backgroundVideo: z.string().url().optional(),
  backgroundColor: z.string().default('#f3f4f6'),
  textColor: z.string().default('#000000'),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  height: z.enum(['small', 'medium', 'large', 'full']).default('medium'),
  overlay: z.boolean().default(false),
  overlayOpacity: z.number().min(0).max(1).default(0.3),
  ctaText: z.string().optional(),
  ctaLink: z.string().url().optional(),
  ctaVariant: z.enum(['primary', 'secondary', 'outline']).default('primary'),
});

export type HeroProps = z.infer<typeof heroSchema>;

// Default properties for new hero widgets
export const defaultHeroProps: HeroProps = {
  title: 'Welcome to Our Store',
  subtitle: 'Discover amazing products and great deals',
  backgroundType: 'image',
  backgroundImage: 'https://via.placeholder.com/1200x600',
  backgroundColor: '#f3f4f6',
  textColor: '#000000',
  alignment: 'center',
  height: 'medium',
  overlay: false,
  overlayOpacity: 0.3,
  ctaText: 'Shop Now',
  ctaLink: '#',
  ctaVariant: 'primary',
};

// Widget configuration
export const heroWidgetConfig: WidgetConfig = {
  type: 'hero',
  name: 'Hero Banner',
  category: 'content',
  description: 'Create eye-catching hero sections with background media',
  icon: 'Image',
  defaultProps: defaultHeroProps,
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: heroSchema,
  migrate: (widget: any, version: number) => {
    // Migration logic for future versions
    return widget;
  }
};

// Register the widget
widgetRegistry.register(heroWidgetConfig);

