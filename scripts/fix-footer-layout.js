/**
 * Fix Footer Layout - Remove Duplicate Logo
 * Updates the footer to remove the secondary logo in the copyright section
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env.local
try {
  const envFile = readFileSync('.env.local', 'utf8');
  const envLines = envFile.split('\n');
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.warn('Could not load .env.local file');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  url: supabaseUrl?.substring(0, 20) + '...' || 'undefined'
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFooterLayout(storeId) {
  try {
    console.log(`🔧 Fixing footer layout for store: ${storeId}`);
    
    // Get store info
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('store_name')
      .eq('id', storeId)
      .single();
    
    if (storeError || !store) {
      console.error('Store not found:', storeError?.message);
      return;
    }
    
    // Get the footer page
    const { data: footerPage, error: fetchError } = await supabase
      .from('page_documents')
      .select('*')
      .eq('store_id', storeId)
      .eq('name', 'Site Footer')
      .single();
    
    if (fetchError || !footerPage) {
      console.error('Footer page not found:', fetchError?.message);
      return;
    }
    
    console.log('📄 Current footer structure:', JSON.stringify(footerPage.sections, null, 2));
    
    // Update the footer content to remove duplicate logo
    const updatedSections = footerPage.sections.map(section => ({
      ...section,
      rows: section.rows.map(row => ({
        ...row,
        widgets: row.widgets.map(widget => {
          if (widget.type === 'text' && widget.props.content) {
            // Remove store name from copyright section, keep only in header section
            const updatedContent = widget.props.content
              .replace(new RegExp(`© \\d{4} ${store.store_name}\\. All rights reserved\\.`, 'gi'), '© 2025 All rights reserved.')
              .replace(new RegExp(`&copy; \\d{4} ${store.store_name}\\. All rights reserved\\.`, 'gi'), '&copy; 2025 All rights reserved.');
            
            return {
              ...widget,
              props: {
                ...widget.props,
                content: updatedContent
              }
            };
          }
          return widget;
        })
      }))
    }));
    
    // Update the footer page
    const { error: updateError } = await supabase
      .from('page_documents')
      .update({ 
        sections: updatedSections,
        updated_at: new Date().toISOString()
      })
      .eq('id', footerPage.id);
    
    if (updateError) {
      console.error('Failed to update footer:', updateError.message);
      return;
    }
    
    console.log('✅ Footer layout fixed successfully!');
    console.log('📄 Updated footer structure:', JSON.stringify(updatedSections, null, 2));
    
  } catch (error) {
    console.error('Error fixing footer layout:', error);
  }
}

// Run for the specific store
const storeId = '638ef028-7752-4996-9aae-878d896734fc'; // Testingmy store
fixFooterLayout(storeId);