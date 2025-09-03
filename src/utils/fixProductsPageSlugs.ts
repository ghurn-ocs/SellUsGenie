/**
 * Fix Products & Services pages that have incorrect slug "/"
 * This utility updates existing pages to use the proper "/products" slug
 */

import { supabase } from '../lib/supabase';

interface FixResult {
  success: boolean;
  message: string;
  updatedPages: number;
  errors: string[];
}

export const fixProductsPageSlugs = async (storeId?: string): Promise<FixResult> => {
  try {
    console.log('🔧 Starting Products page slug fix...', { storeId });

    // Build query to find Products & Services pages with incorrect slug
    let query = supabase
      .from('page_documents')
      .select('id, name, slug, store_id')
      .eq('slug', '/')
      .or('name.eq.Products & Services,name.ilike.%Products%Services%,name.ilike.%Product%Service%')
      .neq('name', 'Home Page')
      .neq('name', 'Home');

    // If storeId provided, filter by store
    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data: pagesToFix, error: selectError } = await query;

    if (selectError) {
      throw new Error(`Failed to find pages to fix: ${selectError.message}`);
    }

    if (!pagesToFix || pagesToFix.length === 0) {
      return {
        success: true,
        message: 'No Products & Services pages found with incorrect slug.',
        updatedPages: 0,
        errors: []
      };
    }

    console.log('📄 Found pages to fix:', pagesToFix.map(p => ({ name: p.name, slug: p.slug, store_id: p.store_id })));

    // Update the pages
    const { data: updatedPages, error: updateError } = await supabase
      .from('page_documents')
      .update({ slug: '/products' })
      .in('id', pagesToFix.map(p => p.id))
      .select('id, name, slug, store_id');

    if (updateError) {
      throw new Error(`Failed to update page slugs: ${updateError.message}`);
    }

    const updatedCount = updatedPages?.length || 0;
    console.log('✅ Successfully updated page slugs:', updatedPages);

    return {
      success: true,
      message: `Successfully updated ${updatedCount} Products & Services page${updatedCount === 1 ? '' : 's'} to use "/products" slug.`,
      updatedPages: updatedCount,
      errors: []
    };

  } catch (error) {
    console.error('❌ Error fixing Products page slugs:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      updatedPages: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};