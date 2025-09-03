/**
 * Provision Current Store Utility
 * Can be called from within the authenticated app to provision the current store
 */

import { provisionNewStore } from '../services/storeProvisioning';
import { cleanupDuplicateHomePagesForStore } from './cleanupDuplicateHomePages';

/**
 * Provision the current store with default pages and policies
 * This function should be called from within the authenticated dashboard
 */
export async function provisionCurrentStore(data: {
  storeId: string; 
  storeName: string; 
  storeSlug: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🚀 Provisioning store: ${data.storeName}`);
    
    await provisionNewStore(data);
    
    // Clean up any duplicate home pages that might exist
    console.log(`🧹 Cleaning up duplicate home pages for ${data.storeName}...`);
    const cleanupResult = await cleanupDuplicateHomePagesForStore(data.storeId);
    
    if (cleanupResult.removedPages > 0) {
      console.log(`✅ Removed ${cleanupResult.removedPages} duplicate home pages`);
    }
    if (cleanupResult.errors.length > 0) {
      console.warn('⚠️ Cleanup warnings:', cleanupResult.errors);
    }
    
    console.log(`✅ Successfully provisioned ${data.storeName}`);
    return {
      success: true,
      message: `Successfully provisioned ${data.storeName} with default pages and policies!`
    };
  } catch (error) {
    console.error('❌ Failed to provision store:', error);
    return {
      success: false,
      message: `Failed to provision store: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if a store needs provisioning
 */
export async function checkProvisioningStatus(storeId: string): Promise<{
  needsPages: boolean;
  needsPolicies: boolean;
  pageCount: number;
}> {
  const { supabase } = await import('../lib/supabase');
  
  try {
    // Check pages
    const { data: pages, error: pagesError } = await supabase
      .from('page_documents')
      .select('id')
      .eq('store_id', storeId);
    
    if (pagesError) throw pagesError;
    
    // Check policies
    const { data: policies, error: policiesError } = await supabase
      .from('store_policies')
      .select('id')
      .eq('store_id', storeId);
    
    if (policiesError && policiesError.code !== 'PGRST116') {
      throw policiesError;
    }
    
    return {
      needsPages: !pages || pages.length === 0,
      needsPolicies: !policies || policies.length === 0,
      pageCount: pages?.length || 0
    };
  } catch (error) {
    console.error('Error checking provisioning status:', error);
    return {
      needsPages: true,
      needsPolicies: true,
      pageCount: 0
    };
  }
}