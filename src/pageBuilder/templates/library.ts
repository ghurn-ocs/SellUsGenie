/**
 * Template Library
 * Collection of pre-built page templates
 */

import type { PageTemplate } from '../types';

export interface ExtendedPageTemplate extends PageTemplate {
  category: string;
  tags?: string[];
  rating?: number;
  downloads?: number;
  author?: string;
  isPro?: boolean;
  features?: string[];
  createdAt?: string;
}

export const templateLibrary: ExtendedPageTemplate[] = [
  {
    id: 'modern-hero-landing',
    name: 'Modern Hero Landing',
    description: 'A clean, modern landing page with a powerful hero section, features showcase, and call-to-action.',
    category: 'landing',
    tags: ['hero', 'modern', 'business', 'startup'],
    rating: 4.8,
    downloads: 1247,
    author: 'StreamSell Team',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    features: [
      'Responsive hero section with video background support',
      'Feature cards with icons and descriptions',
      'Testimonials carousel',
      'Newsletter signup form',
      'Footer with social links'
    ],
    createdAt: '2025-01-15',
    document: {
      name: 'Modern Hero Landing',
      version: 1,
      sections: [
        {
          id: 'hero-section',
          title: 'Hero Section',
          background: {
            colorToken: 'primary-gradient',
            imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
          },
          padding: 'py-20',
          rows: [
            {
              id: 'hero-content',
              widgets: [
                {
                  id: 'hero-text',
                  type: 'text',
                  version: 1,
                  colSpan: { sm: 12, md: 8, lg: 6 },
                  props: {
                    content: '<h1 class="text-5xl font-bold text-white mb-6">Build Your Dream Business</h1><p class="text-xl text-white/90 mb-8">Create stunning online experiences with our powerful page builder. No coding required.</p>',
                    alignment: 'center',
                  },
                },
                {
                  id: 'hero-cta',
                  type: 'button',
                  version: 1,
                  colSpan: { sm: 12, md: 6, lg: 4 },
                  props: {
                    text: 'Get Started Free',
                    url: '/signup',
                    style: 'primary',
                    size: 'lg',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'features-section',
          title: 'Features',
          padding: 'py-16',
          rows: [
            {
              id: 'features-title',
              widgets: [
                {
                  id: 'features-heading',
                  type: 'text',
                  version: 1,
                  colSpan: { sm: 12, md: 12, lg: 12 },
                  props: {
                    content: '<h2 class="text-3xl font-bold text-center mb-12">Powerful Features</h2>',
                    alignment: 'center',
                  },
                },
              ],
            },
            {
              id: 'features-grid',
              widgets: [
                {
                  id: 'feature-1',
                  type: 'feature',
                  version: 1,
                  colSpan: { sm: 12, md: 6, lg: 4 },
                  props: {
                    icon: '🚀',
                    title: 'Lightning Fast',
                    description: 'Optimized for speed and performance',
                  },
                },
                {
                  id: 'feature-2',
                  type: 'feature',
                  version: 1,
                  colSpan: { sm: 12, md: 6, lg: 4 },
                  props: {
                    icon: '🎨',
                    title: 'Beautiful Design',
                    description: 'Professional templates and designs',
                  },
                },
                {
                  id: 'feature-3',
                  type: 'feature',
                  version: 1,
                  colSpan: { sm: 12, md: 6, lg: 4 },
                  props: {
                    icon: '📱',
                    title: 'Mobile Responsive',
                    description: 'Looks great on all devices',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'ecommerce-product-showcase',
    name: 'E-commerce Product Showcase',
    description: 'Perfect for showcasing products with hero banners, featured products, and category grids.',
    category: 'ecommerce',
    tags: ['products', 'shopping', 'showcase', 'retail'],
    rating: 4.7,
    downloads: 892,
    author: 'Commerce Pro',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop',
    features: [
      'Product hero carousel',
      'Featured products grid',
      'Category showcase',
      'Newsletter signup',
      'Customer testimonials'
    ],
    createdAt: '2025-01-10',
    document: {
      name: 'E-commerce Product Showcase',
      version: 1,
      sections: [
        {
          id: 'product-hero',
          title: 'Product Hero',
          rows: [
            {
              id: 'hero-carousel',
              widgets: [
                {
                  id: 'main-carousel',
                  type: 'carousel',
                  version: 1,
                  colSpan: { sm: 12, md: 12, lg: 12 },
                  props: {
                    slides: [
                      {
                        id: 'slide1',
                        type: 'image',
                        media: { src: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800', alt: 'Featured Product' },
                        content: { title: 'Summer Collection', subtitle: '50% Off', button: { text: 'Shop Now', url: '/shop', style: 'primary' } },
                      },
                    ],
                    autoplay: true,
                    showDots: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'minimal-portfolio',
    name: 'Minimal Portfolio',
    description: 'Clean and minimal portfolio layout perfect for designers, developers, and creatives.',
    category: 'portfolio',
    tags: ['minimal', 'creative', 'designer', 'developer'],
    rating: 4.9,
    downloads: 634,
    author: 'Design Studio',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    features: [
      'Clean hero section with photo',
      'Project gallery with filters',
      'About section with bio',
      'Contact form',
      'Skills showcase'
    ],
    createdAt: '2025-01-08',
    document: {
      name: 'Minimal Portfolio',
      version: 1,
      sections: [
        {
          id: 'portfolio-hero',
          title: 'Portfolio Hero',
          padding: 'py-20',
          rows: [
            {
              id: 'intro',
              widgets: [
                {
                  id: 'profile-image',
                  type: 'image',
                  version: 1,
                  colSpan: { sm: 12, md: 4, lg: 3 },
                  props: {
                    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
                    alt: 'Profile Photo',
                    borderRadius: '50%',
                  },
                },
                {
                  id: 'intro-text',
                  type: 'text',
                  version: 1,
                  colSpan: { sm: 12, md: 8, lg: 9 },
                  props: {
                    content: '<h1 class="text-4xl font-bold mb-4">John Designer</h1><p class="text-xl text-gray-600 mb-6">I create beautiful digital experiences through thoughtful design and clean code.</p>',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'business-corporate',
    name: 'Corporate Business',
    description: 'Professional corporate website with services, team showcase, and contact information.',
    category: 'business',
    tags: ['corporate', 'professional', 'services', 'team'],
    rating: 4.6,
    downloads: 1156,
    author: 'Business Pro',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    features: [
      'Professional hero section',
      'Services overview cards',
      'Team member profiles',
      'Client testimonials',
      'Contact form and info'
    ],
    createdAt: '2025-01-12',
    document: {
      name: 'Corporate Business',
      version: 1,
      sections: [],
    },
  },
  {
    id: 'event-conference',
    name: 'Event & Conference',
    description: 'Perfect for promoting events, conferences, and webinars with schedules and speaker info.',
    category: 'event',
    tags: ['event', 'conference', 'schedule', 'speakers'],
    rating: 4.5,
    downloads: 423,
    author: 'Event Pro',
    isPro: true,
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    features: [
      'Event countdown timer',
      'Speaker profiles gallery',
      'Schedule timeline',
      'Ticket booking form',
      'Venue information map'
    ],
    createdAt: '2025-01-05',
    document: {
      name: 'Event & Conference',
      version: 1,
      sections: [],
    },
  },
  {
    id: 'blog-magazine',
    name: 'Blog & Magazine',
    description: 'Content-focused layout with featured articles, category sections, and newsletter signup.',
    category: 'blog',
    tags: ['blog', 'content', 'articles', 'magazine'],
    rating: 4.4,
    downloads: 789,
    author: 'Content Creator',
    thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop',
    features: [
      'Featured article hero',
      'Latest posts grid',
      'Category navigation',
      'Author bio section',
      'Newsletter subscription'
    ],
    createdAt: '2025-01-03',
    document: {
      name: 'Blog & Magazine',
      version: 1,
      sections: [],
    },
  },
  {
    id: 'restaurant-menu',
    name: 'Restaurant & Menu',
    description: 'Appetizing layout for restaurants with menu showcase, gallery, and reservation form.',
    category: 'business',
    tags: ['restaurant', 'food', 'menu', 'booking'],
    rating: 4.7,
    downloads: 567,
    author: 'Food Pro',
    thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    features: [
      'Hero with restaurant ambiance',
      'Interactive menu sections',
      'Photo gallery of dishes',
      'Reservation booking form',
      'Location and hours info'
    ],
    createdAt: '2025-01-01',
    document: {
      name: 'Restaurant & Menu',
      version: 1,
      sections: [],
    },
  },
  {
    id: 'saas-product',
    name: 'SaaS Product',
    description: 'Modern SaaS product page with feature highlights, pricing tiers, and demo sections.',
    category: 'landing',
    tags: ['saas', 'software', 'pricing', 'features'],
    rating: 4.8,
    downloads: 1034,
    author: 'SaaS Studio',
    isPro: true,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    features: [
      'Product demo video section',
      'Feature comparison table',
      'Pricing tiers with toggles',
      'Customer testimonials',
      'Free trial signup form'
    ],
    createdAt: '2025-01-20',
    document: {
      name: 'SaaS Product',
      version: 1,
      sections: [],
    },
  },
];

export const getTemplateById = (id: string): ExtendedPageTemplate | null => {
  return templateLibrary.find(template => template.id === id) || null;
};

export const getTemplatesByCategory = (category: string): ExtendedPageTemplate[] => {
  if (category === 'all') return templateLibrary;
  return templateLibrary.filter(template => template.category === category);
};

export const getTemplatesByTag = (tag: string): ExtendedPageTemplate[] => {
  return templateLibrary.filter(template => template.tags?.includes(tag));
};

export const getFeaturedTemplates = (): ExtendedPageTemplate[] => {
  return templateLibrary
    .filter(template => (template.rating || 0) >= 4.7)
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 6);
};

export const getRecentTemplates = (): ExtendedPageTemplate[] => {
  return templateLibrary
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 6);
};