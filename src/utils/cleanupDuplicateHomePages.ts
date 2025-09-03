/**
 * Cleanup Duplicate Home Pages Utility
 * Removes duplicate "Home" pages, keeping only "Home Page"
 */

import { supabase } from '../lib/supabase';

interface HomePageCleanupResult {
  removedPages: number;
  keptPages: number;
  errors: string[];
}

/**
 * Clean up duplicate home pages for a specific store
 */
export async function cleanupDuplicateHomePagesForStore(storeId: string): Promise<HomePageCleanupResult> {
  const result: HomePageCleanupResult = {
    removedPages: 0,
    keptPages: 0,
    errors: []
  };

  try {
    // Get all pages that could be home pages
    const { data: pages, error: fetchError } = await supabase
      .from('page_documents')
      .select('id, name, slug')
      .eq('store_id', storeId)
      .or('name.eq.Home,name.eq.Home Page,slug.eq./');

    if (fetchError) {
      result.errors.push(`Failed to fetch pages: ${fetchError.message}`);
      return result;
    }

    if (!pages || pages.length === 0) {
      return result;
    }

    // Separate home pages by type
    const homePages = pages.filter(page => page.name === 'Home');
    const homePagePages = pages.filter(page => page.name === 'Home Page');
    const slashPages = pages.filter(page => page.slug === '/' && page.name !== 'Home' && page.name !== 'Home Page');

    console.log(`Found ${homePages.length} "Home" pages, ${homePagePages.length} "Home Page" pages, ${slashPages.length} other "/" pages`);

    // If we have both "Home" and "Home Page", remove "Home" pages
    if (homePages.length > 0 && homePagePages.length > 0) {
      for (const homePage of homePages) {
        try {
          const { error: deleteError } = await supabase
            .from('page_documents')
            .delete()
            .eq('id', homePage.id)
            .eq('store_id', storeId);

          if (deleteError) {
            result.errors.push(`Failed to delete page "${homePage.name}" (${homePage.id}): ${deleteError.message}`);
          } else {
            result.removedPages++;
            console.log(`Removed duplicate "Home" page: ${homePage.id}`);
          }
        } catch (error) {
          result.errors.push(`Error deleting page ${homePage.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      result.keptPages = homePagePages.length;
    }
    // If we only have "Home" pages, rename them to "Home Page"
    else if (homePages.length > 0 && homePagePages.length === 0) {
      // Keep the first one and rename it to "Home Page"
      const pageToKeep = homePages[0];
      
      try {
        const { error: updateError } = await supabase
          .from('page_documents')
          .update({ name: 'Home Page' })
          .eq('id', pageToKeep.id)
          .eq('store_id', storeId);

        if (updateError) {
          result.errors.push(`Failed to rename page "${pageToKeep.name}" to "Home Page": ${updateError.message}`);
        } else {
          console.log(`Renamed "Home" page to "Home Page": ${pageToKeep.id}`);
          result.keptPages = 1;
        }
      } catch (error) {
        result.errors.push(`Error renaming page ${pageToKeep.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Remove the rest
      for (let i = 1; i < homePages.length; i++) {
        const duplicatePage = homePages[i];
        try {
          const { error: deleteError } = await supabase
            .from('page_documents')
            .delete()
            .eq('id', duplicatePage.id)
            .eq('store_id', storeId);

          if (deleteError) {
            result.errors.push(`Failed to delete duplicate page "${duplicatePage.name}" (${duplicatePage.id}): ${deleteError.message}`);
          } else {
            result.removedPages++;
            console.log(`Removed duplicate "Home" page: ${duplicatePage.id}`);
          }
        } catch (error) {
          result.errors.push(`Error deleting duplicate page ${duplicatePage.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    // If we have multiple "Home Page" pages, keep only one
    else if (homePagePages.length > 1) {
      for (let i = 1; i < homePagePages.length; i++) {
        const duplicatePage = homePagePages[i];
        try {
          const { error: deleteError } = await supabase
            .from('page_documents')
            .delete()
            .eq('id', duplicatePage.id)
            .eq('store_id', storeId);

          if (deleteError) {
            result.errors.push(`Failed to delete duplicate "Home Page" (${duplicatePage.id}): ${deleteError.message}`);
          } else {
            result.removedPages++;
            console.log(`Removed duplicate "Home Page": ${duplicatePage.id}`);
          }
        } catch (error) {
          result.errors.push(`Error deleting duplicate "Home Page" ${duplicatePage.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      result.keptPages = 1;
    } else {
      result.keptPages = homePagePages.length;
    }

  } catch (error) {
    result.errors.push(`Unexpected error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Clean up duplicate home pages for all stores (admin utility)
 */
export async function cleanupAllDuplicateHomePages(): Promise<{ [storeId: string]: HomePageCleanupResult }> {
  const results: { [storeId: string]: HomePageCleanupResult } = {};

  try {
    // Get all store IDs that have potential duplicate home pages
    const { data: stores, error: storeError } = await supabase
      .from('page_documents')
      .select('store_id')
      .or('name.eq.Home,name.eq.Home Page,slug.eq./')
      .group('store_id');

    if (storeError) {
      console.error('Failed to get stores for cleanup:', storeError);
      return results;
    }

    if (!stores || stores.length === 0) {
      console.log('No stores found with potential duplicate home pages');
      return results;
    }

    // Get unique store IDs
    const uniqueStoreIds = [...new Set(stores.map(s => s.store_id))];
    
    console.log(`Cleaning up duplicate home pages for ${uniqueStoreIds.length} stores...`);

    // Clean up each store
    for (const storeId of uniqueStoreIds) {
      if (storeId) {
        results[storeId] = await cleanupDuplicateHomePagesForStore(storeId);
      }
    }

  } catch (error) {
    console.error('Error during bulk cleanup:', error);
  }

  return results;
}