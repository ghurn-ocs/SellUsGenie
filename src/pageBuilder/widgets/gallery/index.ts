/**
 * Gallery Widget
 * Advanced image gallery with multiple layout options
 */

import { z } from 'zod';
import { widgetRegistry } from '../registry';
import { GalleryEditor } from './GalleryEditor';
import { GalleryView } from './GalleryView';
import type { WidgetConfig } from '../../types';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  link?: string;
  thumbnail?: string;
}

export interface GalleryProps {
  images: GalleryImage[];
  layout: 'grid' | 'masonry' | 'carousel' | 'slider' | 'lightbox';
  columns: { sm: number; md: number; lg: number };
  spacing: number;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2' | 'auto';
  showCaptions: boolean;
  enableLightbox: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  showDots: boolean;
  showArrows: boolean;
  infinite: boolean;
  lazyLoad: boolean;
  filterTags?: string[];
  enableFilter: boolean;
  sortOrder: 'manual' | 'date' | 'alphabetical';
  animation: 'none' | 'fade' | 'slide' | 'zoom' | 'flip';
}

const gallerySchema = z.object({
  images: z.array(z.object({
    id: z.string(),
    src: z.string().url(),
    alt: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    link: z.string().url().optional(),
    thumbnail: z.string().url().optional(),
  })),
  layout: z.enum(['grid', 'masonry', 'carousel', 'slider', 'lightbox']),
  columns: z.object({
    sm: z.number().min(1).max(6),
    md: z.number().min(1).max(8),
    lg: z.number().min(1).max(12),
  }),
  spacing: z.number().min(0).max(48),
  aspectRatio: z.enum(['square', '16/9', '4/3', '3/2', 'auto']).optional(),
  showCaptions: z.boolean(),
  enableLightbox: z.boolean(),
  autoplay: z.boolean().optional(),
  autoplaySpeed: z.number().min(1000).max(10000).optional(),
  showDots: z.boolean(),
  showArrows: z.boolean(),
  infinite: z.boolean(),
  lazyLoad: z.boolean(),
  filterTags: z.array(z.string()).optional(),
  enableFilter: z.boolean(),
  sortOrder: z.enum(['manual', 'date', 'alphabetical']),
  animation: z.enum(['none', 'fade', 'slide', 'zoom', 'flip']),
});

const galleryConfig: WidgetConfig = {
  type: 'gallery',
  name: 'Image Gallery',
  description: 'Advanced image gallery with multiple layouts and lightbox',
  icon: '🖼️',
  category: 'media',
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: gallerySchema,
  defaultProps: {
    images: [],
    layout: 'grid',
    columns: { sm: 1, md: 2, lg: 3 },
    spacing: 16,
    aspectRatio: 'auto',
    showCaptions: true,
    enableLightbox: true,
    autoplay: false,
    autoplaySpeed: 3000,
    showDots: true,
    showArrows: true,
    infinite: true,
    lazyLoad: true,
    filterTags: [],
    enableFilter: false,
    sortOrder: 'manual',
    animation: 'fade',
  },
  Editor: GalleryEditor,
  View: GalleryView,
};

// Register the widget
widgetRegistry.register(galleryConfig);

export { galleryConfig };