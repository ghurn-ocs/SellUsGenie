/**
 * System Pages Recreation Utility  
 * Checks what system pages exist and recreates missing ones
 */

import { supabase } from '../lib/supabase';
import { SupabasePageRepository } from '../pageBuilder/data/SupabasePageRepository';
import type { PageDocument } from '../pageBuilder/types';

interface UpdateResult {
  success: boolean;
  message: string;
  updatedPages: number;
  errors: string[];
}

/**
 * Check and recreate missing system pages for a specific store
 */
export async function recreateMissingSystemPages(storeId: string): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: true,
    message: '',
    updatedPages: 0,
    errors: []
  };

  try {
    console.log(`🔍 Checking system pages for store: ${storeId}`);

    // Get store information first
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

    // Get existing pages for this store (include status for core pages)
    const { data: existingPages, error: fetchError } = await supabase
      .from('page_documents')
      .select('id, name, store_id, status')
      .eq('store_id', storeId);

    if (fetchError) {
      result.success = false;
      result.message = `Failed to fetch existing pages: ${fetchError.message}`;
      return result;
    }

    const existingPageNames = new Set(existingPages?.map(p => p.name) || []);
    const existingPagesMap = new Map(existingPages?.map(p => [p.name, p]) || []);
    console.log(`📄 Found ${existingPages?.length || 0} existing pages:`, Array.from(existingPageNames));

    // Define required system pages with alternative names
    const requiredSystemPages = [
      // Core essential pages (always PUBLISHED)
      { name: 'Site Header', slug: null, type: 'header', isCore: true, alternativeNames: ['Header'] },
      { name: 'Home Page', slug: '/', type: 'home', isCore: true, alternativeNames: ['Home'] },
      // REMOVED: Footer - Users should create footers using Visual Page Builder widgets instead
      // { name: 'Footer', slug: null, type: 'footer', isCore: true, alternativeNames: ['Site Footer'] },
      // Additional system pages
      { name: 'About Us', slug: '/about', type: 'about', isCore: false, alternativeNames: ['About'] },
      { name: 'Privacy Policy', slug: '/privacy', type: 'privacy', isCore: false, alternativeNames: ['Privacy'] },
      { name: 'Terms & Conditions', slug: '/terms', type: 'terms', isCore: false, alternativeNames: ['Terms', 'Terms of Service'] },
      { name: 'Contact Us', slug: '/contact', type: 'contact', isCore: false, alternativeNames: ['Contact'] },
      { name: 'Returns', slug: '/returns', type: 'returns', isCore: false, alternativeNames: ['Return Policy', 'Returns Policy'] }
    ];

    // Helper function to check if a page type exists with any valid name
    const pageTypeExists = (pageType: { name: string; alternativeNames: string[] }) => {
      return existingPageNames.has(pageType.name) || 
             pageType.alternativeNames.some(altName => existingPageNames.has(altName));
    };

    // Find missing pages (check both primary name and alternative names)
    const missingPages = requiredSystemPages.filter(page => !pageTypeExists(page));
    console.log(`❌ Missing pages:`, missingPages.map(p => p.name));

    // Find existing core pages that are draft and need to be published
    const corePagesToPush = requiredSystemPages
      .filter(page => page.isCore && pageTypeExists(page))
      .map(page => {
        // Find the actual existing page name (could be primary or alternative name)
        const actualPageName = existingPageNames.has(page.name) 
          ? page.name 
          : page.alternativeNames.find(altName => existingPageNames.has(altName));
        
        return { 
          ...page, 
          existingPage: existingPagesMap.get(actualPageName!)!,
          actualPageName: actualPageName! 
        };
      })
      .filter(page => page.existingPage.status !== 'published');
    
    console.log(`📝 Core pages to publish:`, corePagesToPush.map(p => `${p.actualPageName} (${p.type})`));

    if (missingPages.length === 0 && corePagesToPush.length === 0) {
      result.message = 'All system pages already exist and core pages are published';
      return result;
    }

    // Initialize page repository
    const repository = new SupabasePageRepository(storeId);

    // First, publish existing core pages that are in draft status and update their page_type
    for (const corePageToPush of corePagesToPush) {
      try {
        console.log(`🔧 Publishing existing core page "${corePageToPush.actualPageName}" (${corePageToPush.type})`);
        
        // Also update the page_type in the database to ensure proper system page detection
        const pageTypeValue = corePageToPush.type; // 'header' or 'footer'
        await supabase
          .from('page_documents')
          .update({ 
            page_type: pageTypeValue,
            isSystemPage: true,
            systemPageType: pageTypeValue,
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', corePageToPush.existingPage.id)
          .eq('store_id', storeId);
        
        result.updatedPages++;
        console.log(`✅ Published "${corePageToPush.actualPageName}" and set page_type to "${pageTypeValue}"`);

      } catch (pageError) {
        const error = pageError instanceof Error ? pageError.message : 'Unknown error';
        result.errors.push(`Failed to publish "${corePageToPush.actualPageName}": ${error}`);
        console.error(`❌ Failed to publish "${corePageToPush.actualPageName}":`, pageError);
      }
    }

    // Recreate missing pages
    for (const missingPage of missingPages) {
      try {
        console.log(`🔧 Creating "${missingPage.name}"`);

        const pageContent = await createSystemPageContent(missingPage, store.store_name);
        
        // Save and publish the page
        await repository.saveDraft(pageContent);
        await repository.publish(pageContent.id);

        result.updatedPages++;
        console.log(`✅ Created "${missingPage.name}" successfully`);

      } catch (pageError) {
        const error = pageError instanceof Error ? pageError.message : 'Unknown error';
        result.errors.push(`Failed to create "${missingPage.name}": ${error}`);
        console.error(`❌ Failed to create "${missingPage.name}":`, pageError);
      }
    }

    // const totalOperations = missingPages.length + corePagesToPush.length;
    if (result.errors.length > 0) {
      result.success = false;
      result.message = `Updated ${result.updatedPages} pages with ${result.errors.length} errors`;
    } else {
      const operations = [];
      if (missingPages.length > 0) operations.push(`created ${missingPages.length} missing pages`);
      if (corePagesToPush.length > 0) operations.push(`published ${corePagesToPush.length} core pages`);
      result.message = `Successfully ${operations.join(' and ')}`;
    }

    console.log(`🎉 Page recreation complete: ${result.message}`);

  } catch (error) {
    console.error('💥 Page recreation failed:', error);
    result.success = false;
    result.message = `Page recreation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return result;
}

/**
 * Create system page content based on page type
 */
async function createSystemPageContent(pageInfo: { name: string; slug: string | null; type: string }, storeName: string): Promise<PageDocument> {
  const baseContent: Omit<PageDocument, 'sections' | 'seo'> = {
    id: crypto.randomUUID(),
    name: pageInfo.name,
    slug: pageInfo.slug,
    version: 1,
    pageType: pageInfo.type as string, // Set the pageType so it maps to page_type in database
    isSystemPage: true,
    systemPageType: pageInfo.type as string,
    status: 'published',
    themeOverrides: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
  };

  let sections: PageDocument['sections'];
  let seo: PageDocument['seo'];

  switch (pageInfo.type) {
    case 'header':
      sections = [{
        id: crypto.randomUUID(),
        title: 'Header Section',
        padding: 'py-4 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 12, lg: 12 },
            props: {
              content: `<header class="bg-white shadow-sm border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                    <div class="flex items-center">
                      <h1 class="text-2xl font-bold text-gray-900">${storeName}</h1>
                    </div>
                    <nav class="hidden md:flex space-x-8">
                      <span class="text-gray-600 hover:text-gray-900 px-3 py-2 cursor-pointer" data-nav="/">Home</span>
                      <span class="text-gray-600 hover:text-gray-900 px-3 py-2 cursor-pointer" data-nav="/about">About</span>
                      <span class="text-gray-600 hover:text-gray-900 px-3 py-2 cursor-pointer" data-nav="/contact">Contact</span>
                    </nav>
                  </div>
                </div>
              </header>`,
              allowHtml: true
            }
          }]
        }]
      }];
      seo = {
        metaTitle: `${storeName} - Header`,
        metaDescription: `Site header for ${storeName}`
      };
      break;

    case 'home':
      sections = [{
        id: crypto.randomUUID(),
        title: 'Hero Section',
        padding: 'py-20 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 12, lg: 12 },
            props: {
              content: `<div class="text-center max-w-4xl mx-auto">
                <h1 class="text-5xl font-bold text-gray-900 mb-6">Welcome to ${storeName}</h1>
                <p class="text-xl text-gray-700 mb-8">Discover quality products and exceptional service.</p>
                <p class="text-gray-600">This page is fully customizable. Add your own content, images, and design elements to make it unique.</p>
              </div>`,
              allowHtml: true
            }
          }]
        }]
      }];
      seo = {
        metaTitle: `${storeName} - Home`,
        metaDescription: `Welcome to ${storeName}. Discover our quality products and exceptional service.`
      };
      break;

    case 'about':
      sections = [{
        id: crypto.randomUUID(),
        title: 'About Section',
        padding: 'py-16 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 10, lg: 8 },
            props: {
              content: `<div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">About ${storeName}</h1>
                <div class="prose prose-lg text-gray-700 space-y-6">
                  <p>Welcome to ${storeName}, where quality meets exceptional service. We are committed to providing our customers with the finest products and an outstanding shopping experience.</p>
                  <p class="text-center mt-8 text-gray-600"><em>This content can be customized in Settings → Policies → About Us</em></p>
                </div>
              </div>`,
              allowHtml: true
            }
          }]
        }]
      }];
      seo = {
        metaTitle: `About Us - ${storeName}`,
        metaDescription: `Learn more about ${storeName} and our commitment to quality products and service.`
      };
      break;

    case 'privacy':
      sections = [{
        id: crypto.randomUUID(),
        title: 'Privacy Policy Section',
        padding: 'py-16 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 10, lg: 8 },
            props: {
              content: `<div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Privacy Policy</h1>
                <div class="prose prose-lg text-gray-700">
                  <p>This privacy policy explains how ${storeName} collects, uses, and protects your personal information.</p>
                  <p class="text-center mt-8 text-gray-600"><em>This content can be customized in Settings → Policies → Privacy Policy</em></p>
                </div>
              </div>`,
              allowHtml: true
            }
          }]
        }]
      }];
      seo = {
        metaTitle: `Privacy Policy - ${storeName}`,
        metaDescription: `Privacy policy for ${storeName}. Learn how we protect your personal information.`
      };
      break;

    case 'terms':
      sections = [{
        id: crypto.randomUUID(),
        title: 'Terms Section',
        padding: 'py-16 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 10, lg: 8 },
            props: {
              content: `<div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Terms & Conditions</h1>
                <div class="prose prose-lg text-gray-700">
                  <p>These terms and conditions govern your use of ${storeName} and our services.</p>
                  <p class="text-center mt-8 text-gray-600"><em>This content can be customized in Settings → Policies → Terms & Conditions</em></p>
                </div>
              </div>`,
              allowHtml: true
            }
          }]
        }]
      }];
      seo = {
        metaTitle: `Terms & Conditions - ${storeName}`,
        metaDescription: `Terms and conditions for ${storeName}. Review our service terms.`
      };
      break;

    case 'contact':
      sections = [{
        id: crypto.randomUUID(),
        title: 'Contact Section',
        padding: 'py-16 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 10, lg: 8 },
            props: {
              content: `<div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>
                <div class="prose prose-lg text-gray-700">
                  <p>Get in touch with ${storeName}. We're here to help with any questions or concerns.</p>
                  <p class="text-center mt-8 text-gray-600"><em>This content can be customized in Settings → Policies → Contact Information</em></p>
                </div>
              </div>`,
              allowHtml: true
            }
          }]
        }]
      }];
      seo = {
        metaTitle: `Contact Us - ${storeName}`,
        metaDescription: `Contact ${storeName}. Get in touch with our team for support and inquiries.`
      };
      break;

    case 'returns':
      sections = [{
        id: crypto.randomUUID(),
        title: 'Returns Section',
        padding: 'py-16 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 10, lg: 8 },
            props: {
              content: `<div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Returns Policy</h1>
                <div class="prose prose-lg text-gray-700">
                  <p>Learn about ${storeName}'s return policy. We want you to be completely satisfied with your purchase.</p>
                  <p class="text-center mt-8 text-gray-600"><em>This content can be customized in Settings → Policies → Returns Policy</em></p>
                </div>
              </div>`,
              allowHtml: true
            }
          }]
        }]
      }];
      seo = {
        metaTitle: `Returns Policy - ${storeName}`,
        metaDescription: `Returns policy for ${storeName}. Learn about our simple return process and policies.`
      };
      break;

    // REMOVED: 'footer' case - Users should create footers using Visual Page Builder widgets instead
    // This prevents conflicts between system-generated footers and Visual Page Builder footers

    default:
      throw new Error(`Unknown page type: ${pageInfo.type}`);
  }

  return {
    ...baseContent,
    sections,
    seo
  };
}

/**
 * Fix empty system pages by adding content to existing pages that have empty rows
 */
export async function fixEmptySystemPages(storeId: string): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: true,
    message: '',
    updatedPages: 0,
    errors: []
  };

  try {
    console.log(`🔧 Fixing empty system pages for store: ${storeId}`);

    // Get store information first
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

    // Get existing header pages only (footer pages handled by Visual Page Builder)
    const { data: systemPages, error: fetchError } = await supabase
      .from('page_documents')
      .select('id, name, slug, sections')
      .eq('store_id', storeId)
      .in('name', ['Site Header']); // Removed 'Site Footer' - handled by Visual Page Builder

    if (fetchError) {
      result.success = false;
      result.message = `Failed to fetch system pages: ${fetchError.message}`;
      return result;
    }

    console.log(`📄 Found ${systemPages?.length || 0} system pages`);

    if (!systemPages || systemPages.length === 0) {
      result.message = 'No system pages found to fix';
      return result;
    }

    // Check each page for empty rows
    for (const page of systemPages) {
      console.log(`🔍 Checking page: ${page.name}`);
      
      // Check if page has empty rows
      const hasEmptyRows = page.sections.some(section => 
        section.rows.some(row => row.widgets.length === 0)
      );
      
      if (hasEmptyRows) {
        console.log(`⚠️ ${page.name} has empty rows - adding content`);
        
        let updatedSections;
        
        if (page.name === 'Site Header') {
          updatedSections = [{
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
                  content: `<div class="bg-white shadow-sm border-b border-gray-200">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div class="flex justify-between items-center py-4">
                        <div class="flex items-center">
                          <h1 class="text-2xl font-bold text-gray-900">${store.store_name}</h1>
                        </div>
                        <nav class="hidden md:flex space-x-8">
                          <span class="text-gray-600 hover:text-gray-900 px-3 py-2 cursor-pointer" data-nav="/home">Home</span>
                          <span class="text-gray-600 hover:text-gray-900 px-3 py-2 cursor-pointer" data-nav="/about">About</span>
                          <span class="text-gray-600 hover:text-gray-900 px-3 py-2 cursor-pointer" data-nav="/contact">Contact</span>
                        </nav>
                        <div class="flex items-center space-x-4">
                          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Shop Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>`,
                  allowHtml: true
                }
              }]
            }]
          }];
        }
        // REMOVED: Site Footer handling - footers should be created using Visual Page Builder widgets
        
        if (updatedSections) {
          // Update the page with new content
          const { error: updateError } = await supabase
            .from('page_documents')
            .update({
              sections: updatedSections,
              updated_at: new Date().toISOString()
            })
            .eq('id', page.id);
          
          if (updateError) {
            result.errors.push(`Failed to update ${page.name}: ${updateError.message}`);
            console.error(`❌ Failed to update ${page.name}:`, updateError);
          } else {
            result.updatedPages++;
            console.log(`✅ Successfully updated ${page.name} with content`);
          }
        }
      } else {
        console.log(`✅ ${page.name} already has content`);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
      result.message = `Updated ${result.updatedPages} pages with ${result.errors.length} errors`;
    } else if (result.updatedPages > 0) {
      result.message = `Successfully added content to ${result.updatedPages} empty system pages`;
    } else {
      result.message = 'All system pages already have content';
    }

    console.log(`🎉 Empty system pages fix complete: ${result.message}`);

  } catch (error) {
    console.error('💥 Empty system pages fix failed:', error);
    result.success = false;
    result.message = `Fix failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return result;
}

/**
 * Fix existing core system pages to be published
 */
export async function publishCoreSystemPages(storeId: string): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: true,
    message: '',
    updatedPages: 0,
    errors: []
  };

  try {
    console.log(`🔍 Publishing core system pages for store: ${storeId}`);

    // Get existing pages that match core system page names
    const { data: existingPages, error: fetchError } = await supabase
      .from('page_documents')
      .select('id, name, store_id, status')
      .eq('store_id', storeId)
      .in('name', ['Site Header', 'Home Page']); // Removed 'Footer' - handled by Visual Page Builder

    if (fetchError) {
      result.success = false;
      result.message = `Failed to fetch existing pages: ${fetchError.message}`;
      return result;
    }

    // Find core pages that are not published
    const corePageNames = ['Site Header', 'Home Page']; // Removed 'Footer' - handled by Visual Page Builder
    const pagesToPublish = existingPages?.filter(page => 
      corePageNames.includes(page.name) && page.status !== 'published'
    ) || [];

    console.log(`📝 Core pages to publish:`, pagesToPublish.map(p => p.name));

    if (pagesToPublish.length === 0) {
      result.message = 'All core system pages are already published';
      return result;
    }

    // Initialize page repository
    // const repository = new SupabasePageRepository(storeId);

    // Publish each core page and set correct page_type
    for (const page of pagesToPublish) {
      try {
        console.log(`🔧 Publishing "${page.name}"`);
        
        // Determine the page type based on the name
        const pageTypeValue = page.name === 'Site Header' ? 'header' : 
                              page.name === 'Footer' || page.name === 'Site Footer' ? 'footer' : 
                              page.name === 'Home Page' ? 'home' : 'page';
        
        // Update the page_type and publish status in the database
        await supabase
          .from('page_documents')
          .update({ 
            page_type: pageTypeValue,
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', page.id)
          .eq('store_id', storeId);
        
        result.updatedPages++;
        console.log(`✅ Published "${page.name}" and set page_type to "${pageTypeValue}"`);
      } catch (pageError) {
        const error = pageError instanceof Error ? pageError.message : 'Unknown error';
        result.errors.push(`Failed to publish "${page.name}": ${error}`);
        console.error(`❌ Failed to publish "${page.name}":`, pageError);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
      result.message = `Published ${result.updatedPages} pages with ${result.errors.length} errors`;
    } else {
      result.message = `Successfully published ${result.updatedPages} core system pages`;
    }

    console.log(`🎉 Core page publishing complete: ${result.message}`);

  } catch (error) {
    console.error('💥 Core page publishing failed:', error);
    result.success = false;
    result.message = `Core page publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return result;
}

/**
 * Check if system page columns exist in the database
 */
export async function checkSystemPageColumns(): Promise<{ exists: boolean; missingColumns: string[] }> {
  try {
    // Try to query with system page columns to see if they exist
    const { error } = await supabase
      .from('page_documents')
      .select('"isSystemPage", "systemPageType", "editingRestrictions"')
      .limit(1);

    if (error) {
      const missingColumns = [];
      if (error.message.includes('isSystemPage')) missingColumns.push('isSystemPage');
      if (error.message.includes('systemPageType')) missingColumns.push('systemPageType');
      if (error.message.includes('editingRestrictions')) missingColumns.push('editingRestrictions');
      
      return { exists: false, missingColumns };
    }

    return { exists: true, missingColumns: [] };
  } catch (error) {
    console.error('Error checking system page columns:', error);
    return { exists: false, missingColumns: ['isSystemPage', 'systemPageType', 'editingRestrictions'] };
  }
}