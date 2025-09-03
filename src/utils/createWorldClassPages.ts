/**
 * Create World Class Pages
 * Generate professional, properly structured HTML content for headers and footers
 * with minimal CSS classes and proper semantic structure
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
 * Generate world-class header content
 */
function generateWorldClassHeader(storeName: string): string {
  return `<header class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Store Logo/Name -->
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">${storeName}</h1>
        </div>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-8">
        <span class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer" data-nav="/home">Home</span>
        <span class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer" data-nav="/products-services">Products & Services</span>
        <span class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer" data-nav="/about">About Us</span>
        <span class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer" data-nav="/contact">Contact</span>
      </nav>
      
      <!-- Call to Action -->
      <div class="hidden md:flex items-center space-x-4">
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
          Shop Now
        </button>
      </div>
      
      <!-- Mobile Menu Button -->
      <div class="md:hidden">
        <button type="button" class="text-gray-700 hover:text-gray-900 p-2">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>`;
}

/**
 * Generate world-class footer content
 */
function generateWorldClassFooter(storeName: string): string {
  const currentYear = new Date().getFullYear();
  
  return `<footer class="bg-gray-900 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- Store Info -->
      <div class="col-span-1 md:col-span-2">
        <h3 class="text-xl font-bold mb-4">${storeName}</h3>
        <p class="text-gray-300 mb-4 leading-relaxed">
          Quality products and exceptional service. We're committed to providing our customers with the best shopping experience.
        </p>
        <div class="flex space-x-4">
          <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
          </a>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2">
          <li><span class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" data-nav="/home">Home</span></li>
          <li><span class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" data-nav="/products-services">Products & Services</span></li>
          <li><span class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" data-nav="/about">About Us</span></li>
          <li><span class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" data-nav="/contact">Contact</span></li>
        </ul>
      </div>
      
      <!-- Policies -->
      <div>
        <h4 class="text-lg font-semibold mb-4">Policies</h4>
        <ul class="space-y-2">
          <li><span class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" data-nav="/privacy">Privacy Policy</span></li>
          <li><span class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" data-nav="/terms">Terms & Conditions</span></li>
          <li><span class="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer" data-nav="/returns">Returns Policy</span></li>
        </ul>
      </div>
    </div>
    
    <!-- Copyright -->
    <div class="border-t border-gray-800 mt-8 pt-8 text-center">
      <p class="text-gray-400">© ${currentYear} ${storeName}. All rights reserved.</p>
    </div>
  </div>
</footer>`;
}

/**
 * Create world-class system pages
 */
export async function createWorldClassPages(storeId: string): Promise<CreateResult> {
  const result: CreateResult = {
    success: true,
    message: '',
    errors: [],
    pagesCreated: []
  };

  try {
    console.log(`🌟 Creating world-class pages for store: ${storeId}`);

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

    // Create world-class header
    const headerPage: Omit<PageDocument, 'sections' | 'seo'> & {
      sections: PageDocument['sections'];
      seo: PageDocument['seo'];
    } = {
      id: crypto.randomUUID(),
      name: 'Site Header',
      slug: null,
      version: 1,
      pageType: 'header',
      status: 'published',
      themeOverrides: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      sections: [{
        id: crypto.randomUUID(),
        title: 'Header Section',
        padding: 'py-0 px-0',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 12, lg: 12 },
            props: {
              content: generateWorldClassHeader(store.store_name),
              allowHtml: true,
              className: 'world-class-header'
            }
          }]
        }]
      }],
      seo: {
        metaTitle: `${store.store_name} - Header`,
        metaDescription: `Professional header for ${store.store_name}`
      }
    };

    // Create world-class footer
    const footerPage: Omit<PageDocument, 'sections' | 'seo'> & {
      sections: PageDocument['sections'];
      seo: PageDocument['seo'];
    } = {
      id: crypto.randomUUID(),
      name: 'Site Footer',
      slug: null,
      version: 1,
      pageType: 'footer',
      status: 'published',
      themeOverrides: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      sections: [{
        id: crypto.randomUUID(),
        title: 'Footer Section',
        padding: 'py-0 px-0',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 12, lg: 12 },
            props: {
              content: generateWorldClassFooter(store.store_name),
              allowHtml: true,
              className: 'world-class-footer'
            }
          }]
        }]
      }],
      seo: {
        metaTitle: `${store.store_name} - Footer`,
        metaDescription: `Professional footer for ${store.store_name}`
      }
    };

    // Delete existing system pages first
    const { error: deleteError } = await supabase
      .from('page_documents')
      .delete()
      .eq('store_id', storeId)
      .in('page_type', ['header', 'footer']);

    if (deleteError) {
      console.warn('⚠️ Could not delete existing system pages:', deleteError);
    }

    // Save new header
    await repository.saveDraft(headerPage);
    await repository.publish(headerPage.id);
    result.pagesCreated.push('Site Header');

    // Save new footer
    await repository.saveDraft(footerPage);
    await repository.publish(footerPage.id);
    result.pagesCreated.push('Site Footer');

    result.message = `Successfully created ${result.pagesCreated.length} world-class pages`;
    console.log(`✅ Created world-class pages: ${result.pagesCreated.join(', ')}`);

  } catch (error) {
    console.error('💥 World-class pages creation failed:', error);
    result.success = false;
    result.message = `Creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return result;
}