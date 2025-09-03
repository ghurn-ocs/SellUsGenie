/**
 * Create Standard Pages
 * Creates standard Visual Page Builder pages with proper widget-based content
 * Follows the correct architecture:
 * - Each page has individual widgets, styling, and themes
 * - Header/Footer are specialized system pages
 * - Regular pages use widget-based content
 * - Navigation placement settings control visibility
 */

import { supabase } from '../lib/supabase';
import { SupabasePageRepository } from '../pageBuilder/data/SupabasePageRepository';
import type { PageDocument } from '../pageBuilder/types';

interface CreateResult {
  success: boolean;
  message: string;
  errors: string[];
  pagesCreated: string[];
}

/**
 * Create Header system page with specialized content
 */
function createHeaderPage(storeName: string): Omit<PageDocument, 'sections' | 'seo'> & {
  sections: PageDocument['sections'];
  seo: PageDocument['seo'];
} {
  return {
    id: crypto.randomUUID(),
    name: 'Site Header',
    slug: null,
    version: 1,
    pageType: 'header',
    status: 'published',
    navigationPlacement: 'header', // Show in header navigation
    themeOverrides: {
      '--color-bg-primary': '#ffffff',
      '--color-text-primary': '#111827',
      '--color-primary': '#2563eb'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    sections: [{
      id: crypto.randomUUID(),
      title: 'Header Section',
      padding: 'py-0 px-0',
      backgroundColor: '',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'navigation',
          version: 1,
          colSpan: { sm: 12, md: 12, lg: 12 },
          props: {
            storeName: storeName,
            links: [
              { name: 'Home', href: '/home' },
              { name: 'Products & Services', href: '/products-services' },
              { name: 'About Us', href: '/about' },
              { name: 'Contact Us', href: '/contact' }
            ],
            showLogo: true,
            showCallToAction: true,
            ctaText: 'Shop Now',
            ctaHref: '/products-services',
            className: 'bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50'
          }
        }]
      }]
    }],
    seo: {
      metaTitle: `${storeName} - Header`,
      metaDescription: `Site header for ${storeName}`
    }
  };
}

/**
 * Create Footer system page with specialized content
 */
function createFooterPage(storeName: string): Omit<PageDocument, 'sections' | 'seo'> & {
  sections: PageDocument['sections'];
  seo: PageDocument['seo'];
} {
  return {
    id: crypto.randomUUID(),
    name: 'Site Footer',
    slug: null,
    version: 1,
    pageType: 'footer',
    status: 'published',
    navigationPlacement: 'footer', // Show in footer navigation
    themeOverrides: {
      '--color-bg-primary': '#1f2937',
      '--color-text-primary': '#ffffff',
      '--color-text-secondary': '#d1d5db'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    sections: [{
      id: crypto.randomUUID(),
      title: 'Footer Section',
      padding: 'py-0 px-0',
      backgroundColor: 'bg-gray-900',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 12, lg: 12 },
          props: {
            content: `<footer class="bg-gray-900 text-white py-12">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <!-- Store Info -->
                  <div class="col-span-2">
                    <h3 class="text-xl font-bold mb-4">${storeName}</h3>
                    <p class="text-gray-300 mb-4">Quality products and exceptional service for all your needs.</p>
                  </div>
                  
                  <!-- Quick Links -->
                  <div>
                    <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul class="space-y-2">
                      <li><span class="text-gray-300 hover:text-white cursor-pointer" data-nav="/home">Home</span></li>
                      <li><span class="text-gray-300 hover:text-white cursor-pointer" data-nav="/products-services">Products & Services</span></li>
                      <li><span class="text-gray-300 hover:text-white cursor-pointer" data-nav="/about">About Us</span></li>
                      <li><span class="text-gray-300 hover:text-white cursor-pointer" data-nav="/contact">Contact Us</span></li>
                    </ul>
                  </div>
                  
                  <!-- Policies -->
                  <div>
                    <h4 class="text-lg font-semibold mb-4">Legal</h4>
                    <ul class="space-y-2">
                      <li><span class="text-gray-300 hover:text-white cursor-pointer" data-nav="/privacy">Privacy Policy</span></li>
                      <li><span class="text-gray-300 hover:text-white cursor-pointer" data-nav="/terms">Terms & Conditions</span></li>
                      <li><span class="text-gray-300 hover:text-white cursor-pointer" data-nav="/returns">Returns Policy</span></li>
                    </ul>
                  </div>
                </div>
                
                <!-- Copyright -->
                <div class="border-t border-gray-800 mt-8 pt-8 text-center">
                  <p class="text-gray-400">© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
                </div>
              </div>
            </footer>`,
            allowHtml: true,
            className: 'footer-content'
          }
        }]
      }]
    }],
    seo: {
      metaTitle: `${storeName} - Footer`,
      metaDescription: `Site footer for ${storeName}`
    }
  };
}

/**
 * Create Home page with widget-based content
 */
function createHomePage(storeName: string): Omit<PageDocument, 'sections' | 'seo'> & {
  sections: PageDocument['sections'];
  seo: PageDocument['seo'];
} {
  return {
    id: crypto.randomUUID(),
    name: 'Home',
    slug: '/home',
    version: 1,
    pageType: 'page',
    status: 'published',
    navigationPlacement: 'both', // Show in both header and footer navigation
    themeOverrides: {
      '--color-primary': '#2563eb',
      '--color-bg-primary': '#ffffff',
      '--color-bg-secondary': '#f8fafc'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    sections: [{
      id: crypto.randomUUID(),
      title: 'Hero Section',
      padding: 'py-20 px-4',
      backgroundColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'hero',
          version: 1,
          colSpan: { sm: 12, md: 12, lg: 12 },
          props: {
            title: `Welcome to ${storeName}`,
            subtitle: 'Discover quality products and exceptional service tailored just for you.',
            ctaText: 'Shop Now',
            ctaHref: '/products-services',
            backgroundType: 'gradient',
            textAlign: 'center'
          }
        }]
      }]
    }],
    seo: {
      metaTitle: `${storeName} - Welcome`,
      metaDescription: `Welcome to ${storeName}. Discover quality products and exceptional service.`
    }
  };
}

/**
 * Create About Us page with widget-based content
 */
function createAboutPage(storeName: string): Omit<PageDocument, 'sections' | 'seo'> & {
  sections: PageDocument['sections'];
  seo: PageDocument['seo'];
} {
  return {
    id: crypto.randomUUID(),
    name: 'About Us',
    slug: '/about',
    version: 1,
    pageType: 'page',
    status: 'published',
    navigationPlacement: 'both',
    themeOverrides: {
      '--color-primary': '#059669',
      '--color-bg-primary': '#ffffff'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    sections: [{
      id: crypto.randomUUID(),
      title: 'About Section',
      padding: 'py-16 px-4',
      backgroundColor: '',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 10, lg: 8 },
          props: {
            content: `## About ${storeName}

We are dedicated to providing exceptional products and service to our valued customers. Our commitment to quality and customer satisfaction drives everything we do.

### Our Mission
To deliver outstanding value through quality products, exceptional service, and genuine care for our customers' needs.

### Why Choose Us?
- **Quality Products**: Carefully curated selection of high-quality items
- **Exceptional Service**: Dedicated customer support team
- **Fast Delivery**: Quick and reliable shipping
- **Satisfaction Guaranteed**: Your happiness is our priority`,
            textAlign: 'left',
            fontSize: 'base',
            allowHtml: false,
            className: 'prose prose-lg max-w-none'
          }
        }]
      }]
    }],
    seo: {
      metaTitle: `About Us - ${storeName}`,
      metaDescription: `Learn more about ${storeName} and our commitment to quality products and service.`
    }
  };
}

/**
 * Create Contact Us page with widget-based content
 */
function createContactPage(storeName: string): Omit<PageDocument, 'sections' | 'seo'> & {
  sections: PageDocument['sections'];
  seo: PageDocument['seo'];
} {
  return {
    id: crypto.randomUUID(),
    name: 'Contact Us',
    slug: '/contact',
    version: 1,
    pageType: 'page',
    status: 'published',
    navigationPlacement: 'both',
    themeOverrides: {
      '--color-primary': '#7c3aed',
      '--color-bg-primary': '#ffffff'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    sections: [{
      id: crypto.randomUUID(),
      title: 'Contact Section',
      padding: 'py-16 px-4',
      backgroundColor: '',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 8, lg: 6 },
          props: {
            content: `## Get in Touch with ${storeName}

We'd love to hear from you! Get in touch with our team for any questions, support, or feedback.

### Contact Information
- **Email**: info@${storeName.toLowerCase().replace(/\s+/g, '')}.com
- **Phone**: (555) 123-4567
- **Hours**: Monday - Friday, 9 AM - 6 PM

### Customer Support
Our dedicated support team is here to help with any questions or concerns you may have about our products or services.

*This contact information can be customized in your store settings.*`,
            textAlign: 'left',
            fontSize: 'base',
            allowHtml: false,
            className: 'prose prose-lg'
          }
        }]
      }]
    }],
    seo: {
      metaTitle: `Contact Us - ${storeName}`,
      metaDescription: `Get in touch with ${storeName}. Contact us for support, questions, or feedback.`
    }
  };
}

/**
 * Create all standard pages for a store
 */
export async function createStandardPages(storeId: string): Promise<CreateResult> {
  const result: CreateResult = {
    success: true,
    message: '',
    errors: [],
    pagesCreated: []
  };

  try {
    console.log(`🎨 Creating standard Visual Page Builder pages for store: ${storeId}`);

    // Get store information
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, store_name')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      result.success = false;
      result.message = `Store not found: ${storeError?.message || 'Unknown error'}`;
      return result;
    }

    const repository = new SupabasePageRepository(storeId);

    // Delete existing system pages to ensure clean start
    const { error: deleteError } = await supabase
      .from('page_documents')
      .delete()
      .eq('store_id', storeId)
      .in('page_type', ['header', 'footer']);

    if (deleteError) {
      console.warn('⚠️ Could not delete existing system pages:', deleteError);
    }

    // Create pages with proper Visual Page Builder structure
    const pagesToCreate = [
      { page: createHeaderPage(store.store_name), type: 'Header' },
      { page: createFooterPage(store.store_name), type: 'Footer' },
      { page: createHomePage(store.store_name), type: 'Home' },
      { page: createAboutPage(store.store_name), type: 'About Us' },
      { page: createContactPage(store.store_name), type: 'Contact Us' }
    ];

    // Create each page
    for (const { page, type } of pagesToCreate) {
      try {
        await repository.saveDraft(page);
        await repository.publish(page.id);
        result.pagesCreated.push(type);
        console.log(`✅ Created ${type} page with Visual Page Builder structure`);
      } catch (pageError) {
        const error = pageError instanceof Error ? pageError.message : 'Unknown error';
        result.errors.push(`Failed to create ${type}: ${error}`);
        console.error(`❌ Failed to create ${type}:`, pageError);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
      result.message = `Created ${result.pagesCreated.length} pages with ${result.errors.length} errors`;
    } else {
      result.message = `Successfully created ${result.pagesCreated.length} standard Visual Page Builder pages`;
    }

    console.log(`✅ Standard pages creation complete: ${result.pagesCreated.join(', ')}`);

  } catch (error) {
    console.error('💥 Standard pages creation failed:', error);
    result.success = false;
    result.message = `Creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return result;
}