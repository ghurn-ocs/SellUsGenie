/**
 * Navigation Manager
 * Handles automatic navigation generation and organization for page builder pages
 * Implements global best practices for website navigation hierarchy
 */
export interface NavigationItem {
  id: string;
  name: string;
  slug: string;
  order: number;
  location: 'header' | 'footer' | 'both';
  isActive: boolean;
  category: NavigationCategory;
  footerColumn?: 1 | 2 | 3 | 4;
  children?: NavigationItem[];
}
export type NavigationCategory = 
  | 'primary'      // Main navigation: Home, About, Products, Services
  | 'legal'        // Legal pages: Privacy Policy, Terms, Returns Policy
  | 'support'      // Support pages: Contact, FAQ, Help
  | 'company'      // Company info: About Us, Team, Careers
  | 'custom'       // Custom pages created by user
export interface NavigationConfig {
  header: {
    maxItems: number;
    showDropdowns: boolean;
    mobileCollapse: boolean;
  };
  footer: {
    columns: number;
    showSocialLinks: boolean;
    showCopyright: boolean;
  };
}
/**
 * Global navigation order based on website best practices
 * Lower numbers appear first in navigation
 */
const NAVIGATION_ORDER: Record<string, number> = {
  // Header Navigation (Primary)
  'home': 1,
  'about': 2,
  'about-us': 2,
  'products': 3,
  'products-services': 3,
  'services': 4,
  'case-studies': 5,
  'portfolio': 6,
  'blog': 7,
  'testimonials': 8,
  'contact': 9,
  'contact-us': 9,
  // Footer Navigation (Secondary/Legal)
  'privacy': 50,
  'privacy-policy': 50,
  'terms': 51,
  'terms-of-service': 51,
  'returns': 52,
  'returns-policy': 52,
  'shipping': 53,
  'faq': 54,
  'help': 55,
  'support': 55,
  'careers': 56,
  'press': 57,
  'sitemap': 58,
  // Team/Company pages
  'team': 20,
  'our-team': 20,
  'leadership': 21,
  'history': 22,
  'mission': 23,
  // Custom pages default to middle range
  'custom': 100
};
/**
 * Determines navigation category based on page name/slug
 */
function categorizePageType(name: string, slug: string): NavigationCategory {
  const normalizedName = name?.toLowerCase() || '';
  const normalizedSlug = slug?.toLowerCase()?.replace(/^\//, '') || '';
  // Primary navigation pages (excluding "about us" which comes from policies)
  if (['home', 'products', 'services', 'case studies', 'testimonials', 'team', 'our team', 'portfolio', 'blog'].some(term => 
    normalizedName.includes(term) || normalizedSlug.includes(term))) {
    return 'primary';
  }
  // Legal pages
  if (['privacy', 'terms', 'returns', 'legal', 'policy'].some(term => 
    normalizedName.includes(term) || normalizedSlug.includes(term))) {
    return 'legal';
  }
  // Support pages
  if (['contact', 'support', 'help', 'faq', 'feedback'].some(term => 
    normalizedName.includes(term) || normalizedSlug.includes(term))) {
    return 'support';
  }
  // Company pages
  if (['about', 'about us', 'team', 'staff', 'leadership', 'careers', 'jobs', 'history', 'mission'].some(term => 
    normalizedName.includes(term) || normalizedSlug.includes(term))) {
    return 'company';
  }
  return 'custom';
}
/**
 * Determines where a page should appear in navigation
 */
function determineNavigationLocation(category: NavigationCategory, name: string): 'header' | 'footer' | 'both' {
  const normalizedName = name.toLowerCase();
  // Always in header
  if (category === 'primary') {
    return 'header';
  }
  // Legal pages typically in footer only
  if (category === 'legal') {
    return 'footer';
  }
  // Contact usually in both header and footer
  if (normalizedName.includes('contact')) {
    return 'both';
  }
  // Support pages can be in both
  if (category === 'support') {
    return 'both';
  }
  // Company pages should appear in both for better accessibility
  if (category === 'company') {
    return 'both';
  }
  // Custom pages default to header
  return 'header';
}
/**
 * Gets navigation order for a page
 */
function getNavigationOrder(name: string, slug: string, category: NavigationCategory): number {
  const normalizedSlug = slug?.toLowerCase()?.replace(/^\//, '')?.replace(/-/g, '-') || '';
  const normalizedName = name?.toLowerCase()?.replace(/\s+/g, '-') || '';
  // Check exact matches first
  if (NAVIGATION_ORDER[normalizedSlug]) {
    return NAVIGATION_ORDER[normalizedSlug];
  }
  if (NAVIGATION_ORDER[normalizedName]) {
    return NAVIGATION_ORDER[normalizedName];
  }
  // Check partial matches
  for (const [key, order] of Object.entries(NAVIGATION_ORDER)) {
    if (normalizedSlug.includes(key) || normalizedName.includes(key)) {
      return order;
    }
  }
  // Default ordering based on category
  switch (category) {
    case 'primary': return 10;
    case 'support': return 30;
    case 'company': return 40;
    case 'legal': return 50;
    case 'custom': return 100;
    default: return 999;
  }
}
export class NavigationManager {
  private config: NavigationConfig;
  constructor(config: NavigationConfig = {
    header: { maxItems: 7, showDropdowns: true, mobileCollapse: true },
    footer: { columns: 4, showSocialLinks: true, showCopyright: true }
  }) {
    this.config = config;
  }
  /**
   * Convert pages into organized navigation structure
   */
  generateNavigation(
    pages: Array<{id: string, name: string, slug: string, status: string, navigationPlacement?: string, footerColumn?: number}>, 
    policies?: {
      privacy_policy?: string;
      terms_of_service?: string; 
      returns_policy?: string;
      about_us?: string;
    }
  ): {
    header: NavigationItem[];
    footer: NavigationItem[];
    footerColumns: {
      1: NavigationItem[];
      2: NavigationItem[];
      3: NavigationItem[];
      4: NavigationItem[];
    };
  } {
    // Filter only published pages and exclude pages with missing slugs
    const publishedPages = pages.filter(page => {
      if (page.status !== 'published') {
        return false;
      }
      if (!page.slug) {
        return false;
      }
      return true;
    });
    // Convert pages to navigation items
    const navigationItems: NavigationItem[] = publishedPages.map(page => {
      const category = categorizePageType(page.name, page.slug);
      // Use page's navigationPlacement setting, fallback to automatic determination
      const location = page.navigationPlacement ? 
        (page.navigationPlacement === 'none' ? 'header' : page.navigationPlacement) as 'header' | 'footer' | 'both' :
        determineNavigationLocation(category, page.name);
      const order = getNavigationOrder(page.name, page.slug, category);
      // Skip pages marked as 'none' for navigation
      if (page.navigationPlacement === 'none') {
        return null;
      }
      // Final slug validation (should never happen due to filtering above)
      const finalSlug = page.slug || `/${page.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().replace(/^-|-$/g, '')}`;
      return {
        id: page.id,
        name: page.name,
        slug: finalSlug,
        order,
        location,
        isActive: true,
        category,
        footerColumn: page.footerColumn as 1 | 2 | 3 | 4 || undefined
      };
    }).filter(Boolean) as NavigationItem[];
    // Add policy pages from settings if they exist (only if no Visual Page Builder page exists)
    if (policies) {
      // For About Us, only add policy version if no Visual Page Builder About Us page exists
      const hasVisualPageBuilderAboutUs = navigationItems.some(item => {
        const isAboutUs = item.name.toLowerCase() === 'about us' || 
                         item.name.toLowerCase() === 'about' ||
                         item.slug.toLowerCase() === '/about';
        return isAboutUs && !item.id.startsWith('policy-');
      });
      if (policies.about_us && !hasVisualPageBuilderAboutUs) {
        navigationItems.push({
          id: 'policy-about-us',
          name: 'About Us',
          slug: '/about',
          order: NAVIGATION_ORDER['about-us'] || 2,
          location: 'both',
          isActive: true,
          category: 'primary',
          footerColumn: 2
        });
      }
      if (policies.privacy_policy && !navigationItems.some(item => item.name.toLowerCase().includes('privacy'))) {
        navigationItems.push({
          id: 'policy-privacy',
          name: 'Privacy Policy',
          slug: '/privacy',
          order: NAVIGATION_ORDER['privacy'] || 50,
          location: 'footer',
          isActive: true,
          category: 'legal',
          footerColumn: 4
        });
      }
      if (policies.terms_of_service && !navigationItems.some(item => item.name.toLowerCase().includes('terms'))) {
        navigationItems.push({
          id: 'policy-terms',
          name: 'Terms & Conditions',
          slug: '/terms',
          order: NAVIGATION_ORDER['terms'] || 51,
          location: 'footer',
          isActive: true,
          category: 'legal',
          footerColumn: 4
        });
      }
      // For Returns Policy, only add policy version if no Visual Page Builder Returns page exists
      const hasVisualPageBuilderReturns = navigationItems.some(item => {
        const isReturns = item.name.toLowerCase() === 'returns' || 
                         item.name.toLowerCase() === 'returns policy' ||
                         item.slug.toLowerCase() === '/returns';
        return isReturns && !item.id.startsWith('policy-');
      });
      if (policies.returns_policy && !hasVisualPageBuilderReturns) {
        navigationItems.push({
          id: 'policy-returns',
          name: 'Returns Policy',
          slug: '/returns',
          order: NAVIGATION_ORDER['returns'] || 52,
          location: 'footer',
          isActive: true,
          category: 'legal',
          footerColumn: 4
        });
      }
    }
    // Sort by order
    navigationItems.sort((a, b) => a.order - b.order);
    // Split into header and footer
    const headerItems = navigationItems
      .filter(item => item.location === 'header' || item.location === 'both')
      .slice(0, this.config.header.maxItems);
    
    const footerItems = navigationItems
      .filter(item => item.location === 'footer' || item.location === 'both');
    
    // Organize footer items by numbered columns using the new footerColumn field
    const footerColumns = {
      1: footerItems.filter(item => item.footerColumn === 1),
      2: footerItems.filter(item => item.footerColumn === 2),
      3: footerItems.filter(item => item.footerColumn === 3),
      4: footerItems.filter(item => item.footerColumn === 4)
    };
    
    // Fallback: items without footerColumn assignment go to column 2 (General)
    const unassignedItems = footerItems.filter(item => !item.footerColumn);
    footerColumns[2].push(...unassignedItems);
    
    const finalNavigation = {
      header: headerItems,
      footer: this.organizeFooterNavigation(footerItems), // Keep backward compatibility
      footerColumns
    };
    
    return finalNavigation;
  }
  /**
   * Organize footer navigation into logical groups
   */
  private organizeFooterNavigation(items: NavigationItem[]): NavigationItem[] {
    // Group by category
    const grouped: Record<NavigationCategory, NavigationItem[]> = {
      primary: [],
      legal: [],
      support: [],
      company: [],
      custom: []
    };
    items.forEach(item => {
      grouped[item.category].push(item);
    });
    // Create ordered footer navigation
    const footerNav: NavigationItem[] = [];
    // Add primary items first (if any in footer)
    footerNav.push(...grouped.primary);
    // Add support items
    footerNav.push(...grouped.support);
    // Add company items
    footerNav.push(...grouped.company);
    // Add custom items
    footerNav.push(...grouped.custom);
    // Add legal items last
    footerNav.push(...grouped.legal);
    return footerNav;
  }
  /**
   * Get navigation item by slug
   */
  findNavigationItem(slug: string, navigation: NavigationItem[]): NavigationItem | null {
    return navigation.find(item => item.slug === slug) || null;
  }
  /**
   * Update navigation configuration
   */
  updateConfig(newConfig: Partial<NavigationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  /**
   * Get breadcrumb navigation for a page
   */
  getBreadcrumbs(currentSlug: string, navigation: NavigationItem[]): NavigationItem[] {
    const breadcrumbs: NavigationItem[] = [];
    // Always start with home
    const home = navigation.find(item => 
      item.slug === '/' || item.name.toLowerCase() === 'home'
    );
    if (home && currentSlug !== '/') {
      breadcrumbs.push(home);
    }
    // Add current page if not home
    if (currentSlug !== '/') {
      const currentPage = navigation.find(item => item.slug === currentSlug);
      if (currentPage) {
        breadcrumbs.push(currentPage);
      }
    }
    return breadcrumbs;
  }
  /**
   * Validate navigation structure
   */
  validateNavigation(navigation: NavigationItem[]): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    // Check for home page
    const hasHome = navigation.some(item => 
      item.slug === '/' || item.name.toLowerCase() === 'home'
    );
    if (!hasHome) {
      errors.push('No home page found in navigation');
    }
    // Check for duplicate slugs
    const slugs = navigation.map(item => item.slug);
    const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicateSlugs.length > 0) {
      errors.push(`Duplicate page slugs found: ${duplicateSlugs.join(', ')}`);
    }
    // Check for missing essential pages
    const essentialPages = ['contact', 'about', 'privacy'];
    essentialPages.forEach(essential => {
      const hasEssential = navigation.some(item => 
        item.name.toLowerCase().includes(essential) || 
        item.slug.toLowerCase().includes(essential)
      );
      if (!hasEssential) {
        warnings.push(`Consider adding a ${essential} page for better user experience`);
      }
    });
    // Check navigation size
    const headerItems = navigation.filter(item => 
      item.location === 'header' || item.location === 'both'
    );
    if (headerItems.length > 8) {
      warnings.push('Header navigation has many items - consider using dropdowns or reducing items');
    }
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}