/**
 * Update Header with Dynamic Navigation
 * Replaces static HTML navigation in header pages with dynamic navigation widget
 */

import { supabase } from '../lib/supabase';
import { SupabasePageRepository } from '../pageBuilder/data/SupabasePageRepository';

interface UpdateResult {
  success: boolean;
  message: string;
  errors: string[];
}

/**
 * Update header page to use dynamic navigation widget instead of static HTML
 */
export async function updateHeaderWithDynamicNavigation(storeId: string): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: true,
    message: '',
    errors: []
  };

  try {
    console.log(`🔧 Updating header with dynamic navigation for store: ${storeId}`);

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

    // Get existing header page
    const repository = new SupabasePageRepository(storeId);
    const headerPage = await repository.getSystemPage('header').catch(() => null);

    if (!headerPage) {
      result.success = false;
      result.message = 'Header page not found';
      return result;
    }

    console.log(`📄 Found header page: ${headerPage.name}`);

    // Create new header sections with dynamic navigation
    const updatedSections = [{
      id: crypto.randomUUID(),
      title: 'Header Section',
      padding: 'py-0 px-0',
      rows: [
        {
          id: crypto.randomUUID(),
          widgets: [
            // Store name/logo widget
            {
              id: crypto.randomUUID(),
              type: 'text',
              version: 1,
              colSpan: { sm: 6, md: 4, lg: 3 },
              props: {
                content: `<div class="flex items-center">
                  <h1 class="text-2xl font-bold text-gray-900">${store.store_name}</h1>
                </div>`,
                allowHtml: true
              }
            },
            // Dynamic navigation widget
            {
              id: crypto.randomUUID(),
              type: 'navigation',
              version: 1,
              colSpan: { sm: 6, md: 6, lg: 7 },
              props: {
                links: [
                  { name: 'Home', href: '/home' },
                  { name: 'Products & Services', href: '/products-services' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Contact Us', href: '/contact' }
                ],
                className: 'hidden md:flex space-x-8 justify-center items-center',
                linkClassName: 'text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors',
                activeLinkClassName: 'text-blue-600 font-semibold'
              }
            },
            // Action button widget
            {
              id: crypto.randomUUID(),
              type: 'text',
              version: 1,
              colSpan: { sm: 12, md: 2, lg: 2 },
              props: {
                content: `<div class="flex items-center justify-end space-x-4">
                  <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Shop Now
                  </button>
                </div>`,
                allowHtml: true
              }
            }
          ]
        }
      ]
    }];

    // Update the header page
    const { error: updateError } = await supabase
      .from('page_documents')
      .update({
        sections: updatedSections,
        updated_at: new Date().toISOString()
      })
      .eq('id', headerPage.id);

    if (updateError) {
      result.success = false;
      result.message = `Failed to update header: ${updateError.message}`;
      result.errors.push(updateError.message);
    } else {
      result.message = `Successfully updated header with dynamic navigation`;
      console.log(`✅ Header updated with dynamic navigation widget`);
    }

  } catch (error) {
    console.error('💥 Header navigation update failed:', error);
    result.success = false;
    result.message = `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return result;
}