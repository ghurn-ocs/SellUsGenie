/**
 * Utility to fix pages with null slugs in the database
 * This fixes legacy pages that were created before slug validation was implemented
 */

import { supabase } from '../lib/supabase';

export interface PageWithoutSlug {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  store_id: string;
}

/**
 * Generate a slug from page name
 */
function generateSlugFromName(name: string): string {
  const baseName = name || 'page';
  if (baseName.toLowerCase() === 'home page' || baseName.toLowerCase() === 'home') {
    return '/';
  } else {
    return `/${baseName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '')}`;
  }
}

/**
 * Fix all pages with null slugs for a specific store
 */
export async function fixNullSlugsForStore(storeId: string): Promise<{
  success: boolean;
  fixed: number;
  errors: string[];
}> {
  console.log('🔧 FIXING NULL SLUGS for store:', storeId);
  
  const results = {
    success: true,
    fixed: 0,
    errors: [] as string[]
  };

  try {
    // Find all pages with null slugs
    const { data: pagesWithoutSlugs, error: fetchError } = await supabase
      .from('page_documents')
      .select('id, name, slug, status, store_id')
      .eq('store_id', storeId)
      .is('slug', null);

    if (fetchError) {
      results.errors.push(`Failed to fetch pages: ${fetchError.message}`);
      results.success = false;
      return results;
    }

    if (!pagesWithoutSlugs || pagesWithoutSlugs.length === 0) {
      console.log('✅ No pages with null slugs found');
      return results;
    }

    console.log(`🔍 Found ${pagesWithoutSlugs.length} pages with null slugs:`, 
      pagesWithoutSlugs.map(p => ({ name: p.name, id: p.id }))
    );

    // Fix each page
    for (const page of pagesWithoutSlugs) {
      try {
        const generatedSlug = generateSlugFromName(page.name);
        console.log(`🔧 Fixing page "${page.name}" with slug: ${generatedSlug}`);

        const { error: updateError } = await supabase
          .from('page_documents')
          .update({ 
            slug: generatedSlug,
            updated_at: new Date().toISOString()
          })
          .eq('id', page.id)
          .eq('store_id', storeId);

        if (updateError) {
          results.errors.push(`Failed to update page "${page.name}": ${updateError.message}`);
          results.success = false;
        } else {
          results.fixed++;
          console.log(`✅ Fixed page "${page.name}" with slug: ${generatedSlug}`);
        }
      } catch (error) {
        results.errors.push(`Error processing page "${page.name}": ${error}`);
        results.success = false;
      }
    }

    console.log(`🎉 SLUG FIX COMPLETE: Fixed ${results.fixed} pages, ${results.errors.length} errors`);
    
  } catch (error) {
    results.errors.push(`Unexpected error: ${error}`);
    results.success = false;
  }

  return results;
}

/**
 * Check if store has pages with null slugs
 */
export async function checkForNullSlugs(storeId: string): Promise<{
  hasNullSlugs: boolean;
  count: number;
  pages: Array<{ id: string; name: string; status: string }>;
}> {
  try {
    const { data: pagesWithoutSlugs, error } = await supabase
      .from('page_documents')
      .select('id, name, status')
      .eq('store_id', storeId)
      .is('slug', null);

    if (error) {
      console.error('Error checking for null slugs:', error);
      return { hasNullSlugs: false, count: 0, pages: [] };
    }

    return {
      hasNullSlugs: (pagesWithoutSlugs?.length || 0) > 0,
      count: pagesWithoutSlugs?.length || 0,
      pages: pagesWithoutSlugs || []
    };
  } catch (error) {
    console.error('Error checking for null slugs:', error);
    return { hasNullSlugs: false, count: 0, pages: [] };
  }
}