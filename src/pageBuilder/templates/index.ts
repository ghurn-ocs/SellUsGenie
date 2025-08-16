/**
 * Page Templates
 * Pre-built templates for the page builder
 */

import { PageTemplate } from '../types';
import { widgetRegistry } from '../widgets/registry';

// Hero + Product Grid Template
export const heroProductGridTemplate: PageTemplate = {
  id: 'hero-product-grid',
  name: 'Hero + Product Grid',
  description: 'A hero section with a product grid below',
  thumbnail: '/templates/hero-product-grid.jpg',
  document: {
    name: 'Hero + Product Grid',
    version: 1,
    sections: [
      {
        id: 'hero-section',
        title: 'Hero Section',
        rows: [
          {
            id: 'hero-row',
            widgets: [
              {
                id: 'hero-widget',
                type: 'hero',
                version: 1,
                colSpan: { sm: 12, md: 12, lg: 12 },
                props: {
                  title: 'Welcome to Our Store',
                  subtitle: 'Discover amazing products for your lifestyle',
                  backgroundImage: '/images/hero-bg.jpg',
                  ctaText: 'Shop Now',
                  ctaLink: '/products',
                },
                visibility: { sm: true, md: true, lg: true }
              }
            ]
          }
        ],
        background: { colorToken: 'bg-gray-50' },
        padding: 'py-16'
      },
      {
        id: 'products-section',
        title: 'Featured Products',
        rows: [
          {
            id: 'products-row',
            widgets: [
              {
                id: 'product-grid-widget',
                type: 'productGrid',
                version: 1,
                colSpan: { sm: 12, md: 12, lg: 12 },
                props: {
                  collectionId: 'featured',
                  columns: { sm: 2, md: 3, lg: 4 },
                  showPagination: false,
                  showLoadMore: true,
                  title: 'Featured Products'
                },
                visibility: { sm: true, md: true, lg: true }
              }
            ]
          }
        ],
        padding: 'py-12'
      }
    ],
    seo: {
      metaTitle: 'Welcome to Our Store - Featured Products',
      metaDescription: 'Discover amazing products for your lifestyle. Shop our featured collection today.',
    }
  }
};

// Editorial Template
export const editorialTemplate: PageTemplate = {
  id: 'editorial',
  name: 'Editorial (Text/Image)',
  description: 'A content-focused layout with text and images',
  thumbnail: '/templates/editorial.jpg',
  document: {
    name: 'Editorial Page',
    version: 1,
    sections: [
      {
        id: 'header-section',
        title: 'Header',
        rows: [
          {
            id: 'header-row',
            widgets: [
              {
                id: 'header-text',
                type: 'text',
                version: 1,
                colSpan: { sm: 12, md: 8, lg: 8 },
                props: {
                  content: 'Our Story',
                  textAlign: 'left',
                  fontSize: '4xl',
                  fontWeight: 'bold',
                  color: 'text-gray-900',
                  lineHeight: 'tight',
                },
                visibility: { sm: true, md: true, lg: true }
              },
              {
                id: 'header-image',
                type: 'image',
                version: 1,
                colSpan: { sm: 12, md: 4, lg: 4 },
                props: {
                  src: '/images/story-image.jpg',
                  alt: 'Our story',
                  objectFit: 'cover',
                  aspectRatio: 'square',
                },
                visibility: { sm: true, md: true, lg: true }
              }
            ]
          }
        ],
        padding: 'py-12'
      },
      {
        id: 'content-section',
        title: 'Content',
        rows: [
          {
            id: 'content-row',
            widgets: [
              {
                id: 'content-text',
                type: 'text',
                version: 1,
                colSpan: { sm: 12, md: 12, lg: 12 },
                props: {
                  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                  textAlign: 'left',
                  fontSize: 'base',
                  fontWeight: 'normal',
                  color: 'text-gray-700',
                  lineHeight: 'relaxed',
                },
                visibility: { sm: true, md: true, lg: true }
              }
            ]
          }
        ],
        background: { colorToken: 'bg-gray-50' },
        padding: 'py-12'
      }
    ],
    seo: {
      metaTitle: 'Our Story - Editorial Page',
      metaDescription: 'Learn about our story and mission. Discover what drives us to create amazing products.',
    }
  }
};

// Promotional Template
export const promotionalTemplate: PageTemplate = {
  id: 'promotional',
  name: 'Promotional (Hero + Buttons)',
  description: 'A promotional page with hero section and call-to-action buttons',
  thumbnail: '/templates/promotional.jpg',
  document: {
    name: 'Promotional Page',
    version: 1,
    sections: [
      {
        id: 'hero-section',
        title: 'Hero',
        rows: [
          {
            id: 'hero-row',
            widgets: [
              {
                id: 'hero-widget',
                type: 'hero',
                version: 1,
                colSpan: { sm: 12, md: 12, lg: 12 },
                props: {
                  title: 'Special Offer!',
                  subtitle: 'Get 50% off on all products this week only',
                  backgroundImage: '/images/promo-bg.jpg',
                  ctaText: 'Shop Now',
                  ctaLink: '/sale',
                },
                visibility: { sm: true, md: true, lg: true }
              }
            ]
          }
        ],
        background: { colorToken: 'bg-primary-50' },
        padding: 'py-16'
      },
      {
        id: 'cta-section',
        title: 'Call to Action',
        rows: [
          {
            id: 'cta-row',
            widgets: [
              {
                id: 'cta-button-1',
                type: 'button',
                version: 1,
                colSpan: { sm: 12, md: 6, lg: 4 },
                props: {
                  label: 'Shop Men',
                  href: '/men',
                  variant: 'primary',
                  size: 'lg',
                  fullWidth: true,
                },
                visibility: { sm: true, md: true, lg: true }
              },
              {
                id: 'cta-button-2',
                type: 'button',
                version: 1,
                colSpan: { sm: 12, md: 6, lg: 4 },
                props: {
                  label: 'Shop Women',
                  href: '/women',
                  variant: 'primary',
                  size: 'lg',
                  fullWidth: true,
                },
                visibility: { sm: true, md: true, lg: true }
              },
              {
                id: 'cta-button-3',
                type: 'button',
                version: 1,
                colSpan: { sm: 12, md: 12, lg: 4 },
                props: {
                  label: 'Shop Kids',
                  href: '/kids',
                  variant: 'outline',
                  size: 'lg',
                  fullWidth: true,
                },
                visibility: { sm: true, md: true, lg: true }
              }
            ]
          }
        ],
        padding: 'py-12'
      }
    ],
    seo: {
      metaTitle: 'Special Offer - 50% Off All Products',
      metaDescription: 'Don\'t miss our special offer! Get 50% off on all products this week only. Shop now!',
    }
  }
};

// Export all templates
export const pageTemplates: PageTemplate[] = [
  heroProductGridTemplate,
  editorialTemplate,
  promotionalTemplate,
];

// Template registry
export const templateRegistry = {
  get: (id: string) => pageTemplates.find(template => template.id === id),
  getAll: () => pageTemplates,
  getByCategory: (category: string) => pageTemplates.filter(template => 
    template.name.toLowerCase().includes(category.toLowerCase())
  ),
};

