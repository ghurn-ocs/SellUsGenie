/**
 * Image Widget
 * Displays images with configurable properties
 */

import { z } from 'zod';
import { widgetRegistry } from '../registry';
import type { WidgetConfig } from '../../types';
import { ImageEditor } from './ImageEditor';
import { ImageView } from './ImageView';

// Schema for image widget properties
export const imageSchema = z.object({
  src: z.string().url('Please enter a valid image URL'),
  alt: z.string().min(1, 'Alt text is required for accessibility'),
  width: z.number().min(1).max(1200).optional(),
  height: z.number().min(1).max(1200).optional(),
  objectFit: z.enum(['cover', 'contain', 'fill', 'none', 'scale-down']).default('cover'),
  borderRadius: z.number().min(0).max(50).default(0),
  shadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('none'),
  caption: z.string().optional(),
  link: z.string().url().optional(),
});

export type ImageProps = z.infer<typeof imageSchema>;

// Default properties for new image widgets
export const defaultImageProps: ImageProps = {
  src: '/placeholder-product.svg',
  alt: 'Image placeholder',
  objectFit: 'cover',
  borderRadius: 0,
  shadow: 'none',
};

// Widget configuration
export const imageWidgetConfig: WidgetConfig = {
  type: 'image',
  name: 'Image',
  category: 'media',
  description: 'Add images with configurable styling',
  icon: 'Image',
  defaultProps: defaultImageProps,
  defaultColSpan: { sm: 12, md: 6, lg: 4 },
  schema: imageSchema,
  Editor: ImageEditor,
  View: ImageView,
  migrate: (widget: any, version: number) => {
    // Migration logic for future versions
    return widget;
  }
};

// Register the widget
widgetRegistry.register(imageWidgetConfig);

