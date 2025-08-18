export interface StoreFrontLayout {
  id: string
  name: string
  industry: string
  description: string
  preview: string // URL to preview image
  config: {
    hero: {
      style: 'banner' | 'carousel' | 'video' | 'split' | 'minimal'
      height: 'small' | 'medium' | 'large' | 'full'
      showCTA: boolean
      showSearch: boolean
    }
    navigation: {
      style: 'horizontal' | 'vertical' | 'mega' | 'sidebar'
      position: 'top' | 'sticky' | 'fixed'
      showCategories: boolean
      showSearch: boolean
    }
    productGrid: {
      columns: 2 | 3 | 4 | 5 | 6
      cardStyle: 'modern' | 'classic' | 'minimal' | 'detailed'
      showFilters: boolean
      showSorting: boolean
    }
    footer: {
      style: 'simple' | 'detailed' | 'minimal' | 'newsletter'
      columns: 1 | 2 | 3 | 4
      showSocial: boolean
      showNewsletter: boolean
    }
  }
  sections: string[] // Array of section IDs to include
}

export interface ColorScheme {
  id: string
  name: string
  category: 'neutral' | 'warm' | 'cool' | 'bold' | 'pastel'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      light: string
    }
    border: string
    success: string
    warning: string
    error: string
  }
  cssVariables: Record<string, string>
}

export interface StoreFrontTemplate {
  id: string
  layoutId: string
  colorSchemeId: string
  customizations: {
    hero: {
      title?: string
      subtitle?: string
      backgroundImage?: string
      ctaText?: string
      ctaUrl?: string
    }
    branding: {
      logo?: string
      favicon?: string
      storeName?: string
      tagline?: string
    }
    contact: {
      phone?: string
      email?: string
      address?: string
      socialLinks?: Record<string, string>
    }
    seo: {
      title?: string
      description?: string
      keywords?: string[]
    }
  }
  isActive: boolean
  previewMode: boolean
  createdAt: string
  updatedAt: string
}

export const INDUSTRIES = [
  'Fashion & Apparel',
  'Electronics & Tech',
  'Home & Garden',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Sports & Fitness',
  'Books & Media',
  'Health & Wellness',
  'Automotive',
  'Jewelry & Accessories',
  'Art & Crafts',
  'Baby & Kids',
  'Pet Supplies',
  'Office & Business',
  'Tools & Hardware',
  'Travel & Luggage',
  'Music & Instruments',
  'Photography',
  'Furniture',
  'Toys & Games'
] as const

export type Industry = typeof INDUSTRIES[number]

// Pre-defined layouts for each industry (5 layouts per industry)
export const LAYOUT_TEMPLATES: StoreFrontLayout[] = [
  // Fashion & Apparel Layouts (5)
  {
    id: 'fashion-modern',
    name: 'Modern Fashion',
    industry: 'Fashion & Apparel',
    description: 'Clean, modern layout perfect for fashion brands',
    preview: '/layouts/fashion-modern.jpg',
    config: {
      hero: { style: 'carousel', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'featured-products', 'categories', 'newsletter', 'social-proof']
  },
  {
    id: 'fashion-boutique',
    name: 'Boutique Style',
    industry: 'Fashion & Apparel',
    description: 'Elegant boutique layout with refined aesthetics',
    preview: '/layouts/fashion-boutique.jpg',
    config: {
      hero: { style: 'banner', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 3, showSocial: true, showNewsletter: false }
    },
    sections: ['hero', 'about', 'featured-products', 'testimonials']
  },
  {
    id: 'fashion-streetwear',
    name: 'Streetwear Hub',
    industry: 'Fashion & Apparel',
    description: 'Bold, urban design for streetwear brands',
    preview: '/layouts/fashion-streetwear.jpg',
    config: {
      hero: { style: 'video', height: 'full', showCTA: true, showSearch: false },
      navigation: { style: 'mega', position: 'fixed', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'minimal', columns: 2, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'trending', 'brands', 'lifestyle']
  },
  {
    id: 'fashion-luxury',
    name: 'Luxury Fashion',
    industry: 'Fashion & Apparel',
    description: 'High-end luxury design for premium brands',
    preview: '/layouts/fashion-luxury.jpg',
    config: {
      hero: { style: 'split', height: 'large', showCTA: false, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: false, showSearch: true },
      productGrid: { columns: 2, cardStyle: 'detailed', showFilters: false, showSorting: false },
      footer: { style: 'minimal', columns: 2, showSocial: false, showNewsletter: true }
    },
    sections: ['hero', 'featured-products', 'heritage', 'craftsmanship']
  },
  {
    id: 'fashion-vintage',
    name: 'Vintage Collection',
    industry: 'Fashion & Apparel',
    description: 'Retro-inspired layout for vintage fashion',
    preview: '/layouts/fashion-vintage.jpg',
    config: {
      hero: { style: 'banner', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'classic', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'eras', 'featured-products', 'stories', 'community']
  },

  // Electronics & Tech Layouts (5)
  {
    id: 'tech-modern',
    name: 'Tech Store',
    industry: 'Electronics & Tech',
    description: 'Professional layout for electronics and gadgets',
    preview: '/layouts/tech-modern.jpg',
    config: {
      hero: { style: 'split', height: 'medium', showCTA: true, showSearch: true },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: false, showNewsletter: true }
    },
    sections: ['hero', 'categories', 'featured-products', 'deals', 'support']
  },
  {
    id: 'tech-minimal',
    name: 'Minimal Tech',
    industry: 'Electronics & Tech',
    description: 'Clean, minimal design focusing on products',
    preview: '/layouts/tech-minimal.jpg',
    config: {
      hero: { style: 'minimal', height: 'small', showCTA: false, showSearch: true },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'minimal', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 2, showSocial: false, showNewsletter: false }
    },
    sections: ['hero', 'featured-products', 'specs', 'reviews']
  },
  {
    id: 'tech-gaming',
    name: 'Gaming Central',
    industry: 'Electronics & Tech',
    description: 'Dynamic layout for gaming equipment and accessories',
    preview: '/layouts/tech-gaming.jpg',
    config: {
      hero: { style: 'video', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'mega', position: 'fixed', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 3, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'gaming-categories', 'esports', 'new-releases', 'community']
  },
  {
    id: 'tech-mobile',
    name: 'Mobile Hub',
    industry: 'Electronics & Tech',
    description: 'Specialized layout for mobile devices and accessories',
    preview: '/layouts/tech-mobile.jpg',
    config: {
      hero: { style: 'carousel', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 5, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 3, showSocial: true, showNewsletter: false }
    },
    sections: ['hero', 'brands', 'accessories', 'repairs', 'trade-in']
  },
  {
    id: 'tech-professional',
    name: 'Pro Equipment',
    industry: 'Electronics & Tech',
    description: 'Business-focused layout for professional equipment',
    preview: '/layouts/tech-professional.jpg',
    config: {
      hero: { style: 'split', height: 'medium', showCTA: true, showSearch: true },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: false, showNewsletter: true }
    },
    sections: ['hero', 'solutions', 'enterprise', 'support', 'partnerships']
  },

  // Home & Garden Layouts (5)
  {
    id: 'home-cozy',
    name: 'Cozy Home',
    industry: 'Home & Garden',
    description: 'Warm, inviting layout for home goods',
    preview: '/layouts/home-cozy.jpg',
    config: {
      hero: { style: 'banner', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 3, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'room-inspiration', 'featured-products', 'tips', 'newsletter']
  },
  {
    id: 'garden-fresh',
    name: 'Garden Fresh',
    industry: 'Home & Garden',
    description: 'Nature-inspired design for garden supplies',
    preview: '/layouts/garden-fresh.jpg',
    config: {
      hero: { style: 'carousel', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'newsletter', columns: 2, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'seasonal', 'plant-care', 'featured-products']
  },
  {
    id: 'home-modern',
    name: 'Modern Living',
    industry: 'Home & Garden',
    description: 'Contemporary design for modern home decor',
    preview: '/layouts/home-modern.jpg',
    config: {
      hero: { style: 'split', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'minimal', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 3, showSocial: true, showNewsletter: false }
    },
    sections: ['hero', 'collections', 'design-trends', 'room-planner']
  },
  {
    id: 'home-rustic',
    name: 'Rustic Charm',
    industry: 'Home & Garden',
    description: 'Country-style layout for rustic home goods',
    preview: '/layouts/home-rustic.jpg',
    config: {
      hero: { style: 'banner', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'classic', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'farmhouse', 'handcrafted', 'seasonal-decor']
  },
  {
    id: 'home-diy',
    name: 'DIY Workshop',
    industry: 'Home & Garden',
    description: 'Project-focused layout for DIY enthusiasts',
    preview: '/layouts/home-diy.jpg',
    config: {
      hero: { style: 'carousel', height: 'large', showCTA: true, showSearch: true },
      navigation: { style: 'mega', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'projects', 'tutorials', 'tools', 'community']
  },

  // Beauty & Cosmetics Layouts (5)
  {
    id: 'beauty-elegant',
    name: 'Elegant Beauty',
    industry: 'Beauty & Cosmetics',
    description: 'Sophisticated layout for premium beauty products',
    preview: '/layouts/beauty-elegant.jpg',
    config: {
      hero: { style: 'split', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 3, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'skin-analysis', 'featured-products', 'beauty-tips', 'reviews']
  },
  {
    id: 'beauty-trendy',
    name: 'Trendy Cosmetics',
    industry: 'Beauty & Cosmetics',
    description: 'Vibrant layout for trendy makeup and beauty',
    preview: '/layouts/beauty-trendy.jpg',
    config: {
      hero: { style: 'carousel', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 2, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'trending', 'tutorials', 'influencers', 'new-arrivals']
  },
  {
    id: 'beauty-natural',
    name: 'Natural Beauty',
    industry: 'Beauty & Cosmetics',
    description: 'Organic-focused layout for natural beauty products',
    preview: '/layouts/beauty-natural.jpg',
    config: {
      hero: { style: 'banner', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'newsletter', columns: 3, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'ingredients', 'sustainability', 'certifications', 'wellness']
  },
  {
    id: 'beauty-professional',
    name: 'Pro Beauty',
    industry: 'Beauty & Cosmetics',
    description: 'Professional layout for makeup artists and salons',
    preview: '/layouts/beauty-professional.jpg',
    config: {
      hero: { style: 'minimal', height: 'medium', showCTA: true, showSearch: true },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: false, showNewsletter: true }
    },
    sections: ['hero', 'pro-tools', 'education', 'bulk-orders', 'certification']
  },
  {
    id: 'beauty-skincare',
    name: 'Skincare Focus',
    industry: 'Beauty & Cosmetics',
    description: 'Specialized layout for skincare products and routines',
    preview: '/layouts/beauty-skincare.jpg',
    config: {
      hero: { style: 'split', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 3, showSocial: true, showNewsletter: false }
    },
    sections: ['hero', 'skin-types', 'routines', 'concerns', 'expert-advice']
  },

  // Food & Beverage Layouts (5)
  {
    id: 'food-gourmet',
    name: 'Gourmet Kitchen',
    industry: 'Food & Beverage',
    description: 'Upscale layout for gourmet food products',
    preview: '/layouts/food-gourmet.jpg',
    config: {
      hero: { style: 'carousel', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 3, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'chef-picks', 'recipes', 'origins', 'pairings']
  },
  {
    id: 'food-organic',
    name: 'Organic Market',
    industry: 'Food & Beverage',
    description: 'Natural layout for organic and healthy foods',
    preview: '/layouts/food-organic.jpg',
    config: {
      hero: { style: 'banner', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'newsletter', columns: 2, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'farm-fresh', 'certifications', 'health-benefits', 'sustainability']
  },
  {
    id: 'food-restaurant',
    name: 'Restaurant Supply',
    industry: 'Food & Beverage',
    description: 'Professional layout for restaurant and catering supplies',
    preview: '/layouts/food-restaurant.jpg',
    config: {
      hero: { style: 'split', height: 'medium', showCTA: true, showSearch: true },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'minimal', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: false, showNewsletter: true }
    },
    sections: ['hero', 'bulk-ordering', 'equipment', 'supplies', 'business-support']
  },
  {
    id: 'food-artisan',
    name: 'Artisan Delights',
    industry: 'Food & Beverage',
    description: 'Craft-focused layout for artisanal foods and beverages',
    preview: '/layouts/food-artisan.jpg',
    config: {
      hero: { style: 'banner', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 3, showSocial: true, showNewsletter: false }
    },
    sections: ['hero', 'maker-stories', 'small-batch', 'local-sourcing', 'taste-profiles']
  },
  {
    id: 'food-beverage',
    name: 'Beverage Bar',
    industry: 'Food & Beverage',
    description: 'Specialized layout for drinks and beverages',
    preview: '/layouts/food-beverage.jpg',
    config: {
      hero: { style: 'video', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'mega', position: 'fixed', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'minimal', columns: 2, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'drink-categories', 'mixology', 'seasonal-flavors', 'reviews']
  },

  // Sports & Fitness Layouts (5)
  {
    id: 'sports-athletic',
    name: 'Athletic Gear',
    industry: 'Sports & Fitness',
    description: 'Dynamic layout for athletic equipment and apparel',
    preview: '/layouts/sports-athletic.jpg',
    config: {
      hero: { style: 'video', height: 'full', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 3, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'sports-categories', 'performance', 'athlete-endorsed', 'training-tips']
  },
  {
    id: 'sports-fitness',
    name: 'Fitness Hub',
    industry: 'Sports & Fitness',
    description: 'Motivational layout for fitness equipment and supplements',
    preview: '/layouts/sports-fitness.jpg',
    config: {
      hero: { style: 'split', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'newsletter', columns: 3, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'workout-plans', 'equipment', 'nutrition', 'progress-tracking']
  },
  {
    id: 'sports-outdoor',
    name: 'Outdoor Adventure',
    industry: 'Sports & Fitness',
    description: 'Adventure-themed layout for outdoor sports gear',
    preview: '/layouts/sports-outdoor.jpg',
    config: {
      hero: { style: 'carousel', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'adventure-gear', 'trail-guides', 'weather-resistant', 'community']
  },
  {
    id: 'sports-team',
    name: 'Team Sports',
    industry: 'Sports & Fitness',
    description: 'Professional layout for team sports equipment',
    preview: '/layouts/sports-team.jpg',
    config: {
      hero: { style: 'banner', height: 'medium', showCTA: true, showSearch: true },
      navigation: { style: 'mega', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 5, cardStyle: 'minimal', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 2, showSocial: false, showNewsletter: false }
    },
    sections: ['hero', 'team-uniforms', 'bulk-orders', 'customization', 'leagues']
  },
  {
    id: 'sports-wellness',
    name: 'Wellness Center',
    industry: 'Sports & Fitness',
    description: 'Holistic layout for wellness and recovery products',
    preview: '/layouts/sports-wellness.jpg',
    config: {
      hero: { style: 'minimal', height: 'medium', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 3, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'recovery-tools', 'mindfulness', 'nutrition', 'expert-guidance']
  },

  // Books & Media Layouts (5)
  {
    id: 'books-literary',
    name: 'Literary Collection',
    industry: 'Books & Media',
    description: 'Classic layout for books and literature',
    preview: '/layouts/books-literary.jpg',
    config: {
      hero: { style: 'banner', height: 'medium', showCTA: true, showSearch: true },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 4, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'genres', 'bestsellers', 'author-spotlight', 'reading-club']
  },
  {
    id: 'books-academic',
    name: 'Academic Resources',
    industry: 'Books & Media',
    description: 'Educational layout for textbooks and academic materials',
    preview: '/layouts/books-academic.jpg',
    config: {
      hero: { style: 'split', height: 'medium', showCTA: true, showSearch: true },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 3, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 3, showSocial: false, showNewsletter: true }
    },
    sections: ['hero', 'subjects', 'grade-levels', 'digital-resources', 'instructor-tools']
  },
  {
    id: 'books-children',
    name: 'Children\'s Books',
    industry: 'Books & Media',
    description: 'Colorful layout designed for children\'s books',
    preview: '/layouts/books-children.jpg',
    config: {
      hero: { style: 'carousel', height: 'large', showCTA: true, showSearch: false },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 4, cardStyle: 'modern', showFilters: true, showSorting: true },
      footer: { style: 'simple', columns: 2, showSocial: true, showNewsletter: true }
    },
    sections: ['hero', 'age-groups', 'popular-series', 'educational', 'parent-guides']
  },
  {
    id: 'books-digital',
    name: 'Digital Media',
    industry: 'Books & Media',
    description: 'Modern layout for digital books and media',
    preview: '/layouts/books-digital.jpg',
    config: {
      hero: { style: 'video', height: 'medium', showCTA: true, showSearch: true },
      navigation: { style: 'horizontal', position: 'sticky', showCategories: true, showSearch: true },
      productGrid: { columns: 5, cardStyle: 'minimal', showFilters: true, showSorting: true },
      footer: { style: 'minimal', columns: 2, showSocial: true, showNewsletter: false }
    },
    sections: ['hero', 'ebooks', 'audiobooks', 'subscriptions', 'device-support']
  },
  {
    id: 'books-rare',
    name: 'Rare & Collectible',
    industry: 'Books & Media',
    description: 'Sophisticated layout for rare and collectible books',
    preview: '/layouts/books-rare.jpg',
    config: {
      hero: { style: 'minimal', height: 'medium', showCTA: false, showSearch: true },
      navigation: { style: 'horizontal', position: 'top', showCategories: true, showSearch: true },
      productGrid: { columns: 2, cardStyle: 'detailed', showFilters: true, showSorting: true },
      footer: { style: 'detailed', columns: 3, showSocial: false, showNewsletter: true }
    },
    sections: ['hero', 'collections', 'authentication', 'appraisals', 'heritage']
  }
]

export const COLOR_SCHEMES: ColorScheme[] = [
  // Neutral Schemes
  {
    id: 'neutral-modern',
    name: 'Modern Neutral',
    category: 'neutral',
    colors: {
      primary: '#2D3748',
      secondary: '#4A5568',
      accent: '#ED8936',
      background: '#FFFFFF',
      surface: '#F7FAFC',
      text: {
        primary: '#1A202C',
        secondary: '#4A5568',
        light: '#A0AEC0'
      },
      border: '#E2E8F0',
      success: '#38A169',
      warning: '#D69E2E',
      error: '#E53E3E'
    },
    cssVariables: {
      '--color-primary': '#2D3748',
      '--color-secondary': '#4A5568',
      '--color-accent': '#ED8936'
    }
  },
  {
    id: 'neutral-elegant',
    name: 'Elegant Gray',
    category: 'neutral',
    colors: {
      primary: '#1A1A1A',
      secondary: '#4F4F4F',
      accent: '#B8860B',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: {
        primary: '#000000',
        secondary: '#4F4F4F',
        light: '#9E9E9E'
      },
      border: '#E0E0E0',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336'
    },
    cssVariables: {
      '--color-primary': '#1A1A1A',
      '--color-secondary': '#4F4F4F',
      '--color-accent': '#B8860B'
    }
  },

  // Warm Schemes
  {
    id: 'warm-sunset',
    name: 'Sunset Warmth',
    category: 'warm',
    colors: {
      primary: '#C53030',
      secondary: '#DD6B20',
      accent: '#F56500',
      background: '#FFFBF7',
      surface: '#FFF5F0',
      text: {
        primary: '#742A2A',
        secondary: '#9C4221',
        light: '#C05621'
      },
      border: '#FBD38D',
      success: '#38A169',
      warning: '#D69E2E',
      error: '#E53E3E'
    },
    cssVariables: {
      '--color-primary': '#C53030',
      '--color-secondary': '#DD6B20',
      '--color-accent': '#F56500'
    }
  },
  {
    id: 'warm-earth',
    name: 'Earth Tones',
    category: 'warm',
    colors: {
      primary: '#8B4513',
      secondary: '#CD853F',
      accent: '#DEB887',
      background: '#FFF8DC',
      surface: '#F5F5DC',
      text: {
        primary: '#654321',
        secondary: '#8B7355',
        light: '#A0956B'
      },
      border: '#D2B48C',
      success: '#228B22',
      warning: '#DAA520',
      error: '#B22222'
    },
    cssVariables: {
      '--color-primary': '#8B4513',
      '--color-secondary': '#CD853F',
      '--color-accent': '#DEB887'
    }
  },

  // Cool Schemes
  {
    id: 'cool-ocean',
    name: 'Ocean Blue',
    category: 'cool',
    colors: {
      primary: '#2B6CB0',
      secondary: '#3182CE',
      accent: '#4299E1',
      background: '#F7FAFC',
      surface: '#EDF2F7',
      text: {
        primary: '#1A365D',
        secondary: '#2C5282',
        light: '#4A5568'
      },
      border: '#CBD5E0',
      success: '#38A169',
      warning: '#D69E2E',
      error: '#E53E3E'
    },
    cssVariables: {
      '--color-primary': '#2B6CB0',
      '--color-secondary': '#3182CE',
      '--color-accent': '#4299E1'
    }
  },
  {
    id: 'cool-mint',
    name: 'Fresh Mint',
    category: 'cool',
    colors: {
      primary: '#319795',
      secondary: '#4FD1C7',
      accent: '#81E6D9',
      background: '#F0FDFA',
      surface: '#E6FFFA',
      text: {
        primary: '#234E52',
        secondary: '#285E61',
        light: '#4A5568'
      },
      border: '#B2F5EA',
      success: '#38A169',
      warning: '#D69E2E',
      error: '#E53E3E'
    },
    cssVariables: {
      '--color-primary': '#319795',
      '--color-secondary': '#4FD1C7',
      '--color-accent': '#81E6D9'
    }
  },

  // Bold Schemes
  {
    id: 'bold-electric',
    name: 'Electric Purple',
    category: 'bold',
    colors: {
      primary: '#7C3AED',
      secondary: '#8B5CF6',
      accent: '#A78BFA',
      background: '#FFFFFF',
      surface: '#FAF5FF',
      text: {
        primary: '#44337A',
        secondary: '#553C9A',
        light: '#6B46C1'
      },
      border: '#C4B5FD',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    cssVariables: {
      '--color-primary': '#7C3AED',
      '--color-secondary': '#8B5CF6',
      '--color-accent': '#A78BFA'
    }
  },
  {
    id: 'bold-neon',
    name: 'Neon Green',
    category: 'bold',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      text: {
        primary: '#064E3B',
        secondary: '#065F46',
        light: '#047857'
      },
      border: '#A7F3D0',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    cssVariables: {
      '--color-primary': '#10B981',
      '--color-secondary': '#34D399',
      '--color-accent': '#6EE7B7'
    }
  },

  // Pastel Schemes
  {
    id: 'pastel-spring',
    name: 'Spring Pastels',
    category: 'pastel',
    colors: {
      primary: '#F687B3',
      secondary: '#FBB6CE',
      accent: '#FED7E2',
      background: '#FFFBFE',
      surface: '#FFF5F7',
      text: {
        primary: '#702459',
        secondary: '#97266D',
        light: '#B83280'
      },
      border: '#F3E8FF',
      success: '#68D391',
      warning: '#F6E05E',
      error: '#FC8181'
    },
    cssVariables: {
      '--color-primary': '#F687B3',
      '--color-secondary': '#FBB6CE',
      '--color-accent': '#FED7E2'
    }
  },
  {
    id: 'pastel-lavender',
    name: 'Lavender Dream',
    category: 'pastel',
    colors: {
      primary: '#B794F6',
      secondary: '#D6BCFA',
      accent: '#E9D8FD',
      background: '#FEFCFF',
      surface: '#FAF5FF',
      text: {
        primary: '#553C9A',
        secondary: '#6B46C1',
        light: '#7C3AED'
      },
      border: '#E9D8FD',
      success: '#68D391',
      warning: '#F6E05E',
      error: '#FC8181'
    },
    cssVariables: {
      '--color-primary': '#B794F6',
      '--color-secondary': '#D6BCFA',
      '--color-accent': '#E9D8FD'
    }
  }
]