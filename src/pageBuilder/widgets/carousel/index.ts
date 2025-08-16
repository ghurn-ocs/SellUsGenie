/**
 * Carousel Widget
 * Modern carousel/slider with advanced features
 */

import { z } from 'zod';
import { widgetRegistry } from '../registry';
import { CarouselEditor } from './CarouselEditor';
import { CarouselView } from './CarouselView';
import type { WidgetConfig } from '../../types';

export interface CarouselSlide {
  id: string;
  type: 'image' | 'video' | 'content';
  media?: {
    src: string;
    alt?: string;
    poster?: string; // for videos
  };
  content?: {
    title?: string;
    subtitle?: string;
    description?: string;
    button?: {
      text: string;
      url: string;
      style: 'primary' | 'secondary' | 'outline';
    };
  };
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
    position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  link?: string;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  autoplay: boolean;
  autoplaySpeed: number;
  infinite: boolean;
  showDots: boolean;
  showArrows: boolean;
  showProgress: boolean;
  pauseOnHover: boolean;
  slidesToShow: { sm: number; md: number; lg: number };
  slidesToScroll: number;
  spacing: number;
  aspectRatio: 'auto' | '16/9' | '4/3' | '3/2' | 'square' | 'custom';
  customAspectRatio?: { width: number; height: number };
  transition: {
    type: 'slide' | 'fade' | 'cube' | 'flip' | 'coverflow';
    duration: number;
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  };
  navigation: {
    arrowStyle: 'default' | 'minimal' | 'rounded' | 'square';
    arrowSize: 'sm' | 'md' | 'lg';
    arrowColor: string;
    arrowPosition: 'inside' | 'outside';
    dotStyle: 'default' | 'line' | 'square' | 'custom';
    dotSize: 'sm' | 'md' | 'lg';
    dotColor: string;
    dotActiveColor: string;
  };
  responsive: {
    breakpoints: Array<{
      breakpoint: number;
      settings: {
        slidesToShow: number;
        slidesToScroll: number;
        showArrows: boolean;
        showDots: boolean;
      };
    }>;
  };
  accessibility: {
    enabled: boolean;
    announceSlides: boolean;
    keyboardNavigation: boolean;
  };
}

const carouselSlideSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video', 'content']),
  media: z.object({
    src: z.string().url(),
    alt: z.string().optional(),
    poster: z.string().url().optional(),
  }).optional(),
  content: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    button: z.object({
      text: z.string(),
      url: z.string().url(),
      style: z.enum(['primary', 'secondary', 'outline']),
    }).optional(),
  }).optional(),
  overlay: z.object({
    enabled: z.boolean(),
    color: z.string(),
    opacity: z.number().min(0).max(1),
    position: z.enum(['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']),
  }).optional(),
  link: z.string().url().optional(),
});

const carouselSchema = z.object({
  slides: z.array(carouselSlideSchema),
  autoplay: z.boolean(),
  autoplaySpeed: z.number().min(1000).max(10000),
  infinite: z.boolean(),
  showDots: z.boolean(),
  showArrows: z.boolean(),
  showProgress: z.boolean(),
  pauseOnHover: z.boolean(),
  slidesToShow: z.object({
    sm: z.number().min(1).max(6),
    md: z.number().min(1).max(8),
    lg: z.number().min(1).max(12),
  }),
  slidesToScroll: z.number().min(1).max(6),
  spacing: z.number().min(0).max(48),
  aspectRatio: z.enum(['auto', '16/9', '4/3', '3/2', 'square', 'custom']),
  customAspectRatio: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  transition: z.object({
    type: z.enum(['slide', 'fade', 'cube', 'flip', 'coverflow']),
    duration: z.number().min(200).max(2000),
    easing: z.enum(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']),
  }),
  navigation: z.object({
    arrowStyle: z.enum(['default', 'minimal', 'rounded', 'square']),
    arrowSize: z.enum(['sm', 'md', 'lg']),
    arrowColor: z.string(),
    arrowPosition: z.enum(['inside', 'outside']),
    dotStyle: z.enum(['default', 'line', 'square', 'custom']),
    dotSize: z.enum(['sm', 'md', 'lg']),
    dotColor: z.string(),
    dotActiveColor: z.string(),
  }),
  responsive: z.object({
    breakpoints: z.array(z.object({
      breakpoint: z.number(),
      settings: z.object({
        slidesToShow: z.number(),
        slidesToScroll: z.number(),
        showArrows: z.boolean(),
        showDots: z.boolean(),
      }),
    })),
  }),
  accessibility: z.object({
    enabled: z.boolean(),
    announceSlides: z.boolean(),
    keyboardNavigation: z.boolean(),
  }),
});

const carouselConfig: WidgetConfig = {
  type: 'carousel',
  name: 'Modern Carousel',
  description: 'Advanced carousel with multiple transition effects and responsive options',
  icon: '🎠',
  category: 'media',
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: carouselSchema,
  defaultProps: {
    slides: [
      {
        id: 'slide1',
        type: 'image',
        media: {
          src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          alt: 'Slide 1',
        },
        content: {
          title: 'Welcome to Our Store',
          subtitle: 'Discover Amazing Products',
          description: 'Find everything you need in our carefully curated collection.',
          button: {
            text: 'Shop Now',
            url: '/shop',
            style: 'primary',
          },
        },
        overlay: {
          enabled: true,
          color: '#000000',
          opacity: 0.4,
          position: 'center',
        },
      },
    ],
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    showDots: true,
    showArrows: true,
    showProgress: false,
    pauseOnHover: true,
    slidesToShow: { sm: 1, md: 1, lg: 1 },
    slidesToScroll: 1,
    spacing: 0,
    aspectRatio: '16/9',
    transition: {
      type: 'slide',
      duration: 500,
      easing: 'ease-in-out',
    },
    navigation: {
      arrowStyle: 'default',
      arrowSize: 'md',
      arrowColor: '#ffffff',
      arrowPosition: 'inside',
      dotStyle: 'default',
      dotSize: 'md',
      dotColor: '#ffffff',
      dotActiveColor: '#3b82f6',
    },
    responsive: {
      breakpoints: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            showArrows: false,
            showDots: true,
          },
        },
      ],
    },
    accessibility: {
      enabled: true,
      announceSlides: true,
      keyboardNavigation: true,
    },
  },
  Editor: CarouselEditor,
  View: CarouselView,
};

// Register the widget
widgetRegistry.register(carouselConfig);

export { carouselConfig };