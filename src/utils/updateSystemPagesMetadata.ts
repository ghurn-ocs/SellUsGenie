/**
 * Update System Pages Metadata Utility
 * Updates existing pages to have proper system page metadata
 */

import { supabase } from '../lib/supabase';

interface UpdateResult {
  success: boolean;
  message: string;
  updatedPages: number;
  errors: string[];
}

/**
 * Update all existing system pages to have proper metadata
 */
export async function updateAllSystemPagesMetadata(): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: true,
    message: '',
    updatedPages: 0,
    errors: []
  };

  try {
    console.log('🔍 Finding all system pages to update...');

    // Get all pages that should be system pages
    const { data: pages, error: fetchError } = await supabase
      .from('page_documents')
      .select('id, name, store_id, "isSystemPage", "editingRestrictions"')
      .in('name', ['About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Terms of Service', 'Returns']);

    if (fetchError) {
      result.success = false;
      result.message = `Failed to fetch pages: ${fetchError.message}`;
      return result;
    }

    if (!pages || pages.length === 0) {
      result.message = 'No system pages found to update';
      return result;
    }

    console.log(`📄 Found ${pages.length} potential system pages`);

    // Update each page
    for (const page of pages) {
      try {
        // Determine the system page type and restrictions
        let systemPageType: string;
        const readOnly = true;
        let settingsMessage = '';

        switch (page.name) {
          case 'About Us':
            systemPageType = 'about';
            settingsMessage = 'About Us content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          case 'Privacy Policy':
            systemPageType = 'privacy';
            settingsMessage = 'Privacy Policy content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          case 'Terms & Conditions':
          case 'Terms of Service':
            systemPageType = 'terms';
            settingsMessage = 'Terms & Conditions content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          case 'Contact Us':
            systemPageType = 'contact';
            settingsMessage = 'Contact Us content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          case 'Returns':
            systemPageType = 'returns';
            settingsMessage = 'Returns content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          default:
            continue; // Skip if not a recognized system page
        }

        // Skip if already properly configured
        if (page.isSystemPage && page.editingRestrictions?.readOnly) {
          console.log(`✅ Page "${page.name}" already properly configured`);
          continue;
        }

        console.log(`🔧 Updating "${page.name}" (ID: ${page.id})`);

        // Update the page metadata
        const { error: updateError } = await supabase
          .from('page_documents')
          .update({
            "isSystemPage": true,
            "systemPageType": systemPageType,
            "editingRestrictions": {
              readOnly: readOnly,
              settingsMessage: settingsMessage
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', page.id);

        if (updateError) {
          result.errors.push(`Failed to update "${page.name}": ${updateError.message}`);
          console.error(`❌ Failed to update "${page.name}":`, updateError);
        } else {
          result.updatedPages++;
          console.log(`✅ Updated "${page.name}" successfully`);
        }

      } catch (pageError) {
        const error = pageError instanceof Error ? pageError.message : 'Unknown error';
        result.errors.push(`Error processing "${page.name}": ${error}`);
        console.error(`💥 Error processing "${page.name}":`, pageError);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
      result.message = `Updated ${result.updatedPages} pages with ${result.errors.length} errors`;
    } else {
      result.message = `Successfully updated ${result.updatedPages} system pages`;
    }

    console.log(`🎉 Migration complete: ${result.message}`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    result.success = false;
    result.message = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return result;
}

/**
 * Update system pages metadata for a specific store
 */
export async function updateSystemPagesMetadataForStore(storeId: string): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: true,
    message: '',
    updatedPages: 0,
    errors: []
  };

  try {
    console.log(`🔍 Finding system pages for store: ${storeId}`);

    // Get all pages that should be system pages for this store
    const { data: pages, error: fetchError } = await supabase
      .from('page_documents')
      .select('id, name, store_id, "isSystemPage", "editingRestrictions"')
      .eq('store_id', storeId)
      .in('name', ['About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Terms of Service', 'Returns']);

    if (fetchError) {
      result.success = false;
      result.message = `Failed to fetch pages for store ${storeId}: ${fetchError.message}`;
      return result;
    }

    if (!pages || pages.length === 0) {
      result.message = `No system pages found for store ${storeId}`;
      return result;
    }

    console.log(`📄 Found ${pages.length} potential system pages for store ${storeId}`);

    // Update each page (using the same logic as above)
    for (const page of pages) {
      try {
        let systemPageType: string;
        const readOnly = true;
        let settingsMessage = '';

        switch (page.name) {
          case 'About Us':
            systemPageType = 'about';
            settingsMessage = 'About Us content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          case 'Privacy Policy':
            systemPageType = 'privacy';
            settingsMessage = 'Privacy Policy content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          case 'Terms & Conditions':
          case 'Terms of Service':
            systemPageType = 'terms';
            settingsMessage = 'Terms & Conditions content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          case 'Contact Us':
            systemPageType = 'contact';
            settingsMessage = 'Contact Us content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          case 'Returns':
            systemPageType = 'returns';
            settingsMessage = 'Returns content is managed in Settings → Policies. Changes made there will automatically appear on this page.';
            break;
          default:
            continue;
        }

        // Skip if already properly configured
        if (page.isSystemPage && page.editingRestrictions?.readOnly) {
          console.log(`✅ Page "${page.name}" already properly configured`);
          continue;
        }

        console.log(`🔧 Updating "${page.name}" (ID: ${page.id})`);

        const { error: updateError } = await supabase
          .from('page_documents')
          .update({
            "isSystemPage": true,
            "systemPageType": systemPageType,
            "editingRestrictions": {
              readOnly: readOnly,
              settingsMessage: settingsMessage
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', page.id);

        if (updateError) {
          result.errors.push(`Failed to update "${page.name}": ${updateError.message}`);
          console.error(`❌ Failed to update "${page.name}":`, updateError);
        } else {
          result.updatedPages++;
          console.log(`✅ Updated "${page.name}" successfully`);
        }

      } catch (pageError) {
        const error = pageError instanceof Error ? pageError.message : 'Unknown error';
        result.errors.push(`Error processing "${page.name}": ${error}`);
        console.error(`💥 Error processing "${page.name}":`, pageError);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
      result.message = `Updated ${result.updatedPages} pages with ${result.errors.length} errors`;
    } else {
      result.message = `Successfully updated ${result.updatedPages} system pages for store`;
    }

    console.log(`🎉 Store migration complete: ${result.message}`);

  } catch (error) {
    console.error('💥 Store migration failed:', error);
    result.success = false;
    result.message = `Store migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return result;
}