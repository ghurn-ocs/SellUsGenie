/**
 * Recreate Clean Footer
 * Delete existing footer and create a new one with no hardcoded content or colors
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import crypto from 'crypto';

// Load environment variables
try {
  const envFile = readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
} catch (error) {}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function recreateCleanFooter(storeId) {
  try {
    console.log(`🔧 Recreating clean footer for store: ${storeId}`);
    
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
    
    // Delete existing footer
    console.log('🗑️ Deleting old footer...');
    const { error: deleteError } = await supabase
      .from('page_documents')
      .delete()
      .eq('store_id', storeId)
      .eq('name', 'Site Footer');
    
    if (deleteError) {
      console.error('Failed to delete old footer:', deleteError.message);
      return;
    }
    
    console.log('✅ Old footer deleted');
    
    // Create completely new, clean footer with NO hardcoded colors or content
    const cleanFooterContent = `<div class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-lg font-semibold mb-4">${store.store_name}</h3>
        <p class="opacity-75">{{store_description}}</p>
      </div>
      <div>
        <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2">
          <li><a href="/about" class="opacity-75 hover:opacity-100">About Us</a></li>
          <li><a href="/contact" class="opacity-75 hover:opacity-100">Contact</a></li>
          <li><a href="/privacy" class="opacity-75 hover:opacity-100">Privacy Policy</a></li>
          <li><a href="/terms" class="opacity-75 hover:opacity-100">Terms & Conditions</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-lg font-semibold mb-4">Contact Info</h4>
        <p class="opacity-75">{{contact_info}}</p>
      </div>
    </div>
    <div class="border-t pt-6 mt-6 text-center border-opacity-25">
      <p class="opacity-75">© {{current_year}} All rights reserved.</p>
    </div>
  </div>
</div>`;

    // Create new footer page with clean structure
    const newFooter = {
      id: crypto.randomUUID(),
      store_id: storeId,
      name: 'Site Footer',
      slug: 'site-footer',
      status: 'published',
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
              content: cleanFooterContent,
              allowHtml: true,
              textAlign: 'left',
              fontSize: 'base',
              fontWeight: 'normal',
              lineHeight: 'normal',
              maxWidth: ''
            }
          }]
        }]
      }],
      theme_overrides: {
        // Use theme colors instead of hardcoded ones
        backgroundColor: null, // Let theme control this
        textColor: null,       // Let theme control this
        borderColor: null,     // Let theme control this
        useStoreLogo: true,    // Enable logo replacement
        showLogo: true
      },
      seo: {
        title: 'Site Footer',
        description: 'Footer for ' + store.store_name,
        keywords: ''
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert new clean footer
    const { error: insertError } = await supabase
      .from('page_documents')
      .insert(newFooter);
    
    if (insertError) {
      console.error('Failed to create new footer:', insertError.message);
      return;
    }
    
    console.log('✅ Clean footer created successfully!');
    console.log('📄 New footer features:');
    console.log('- No hardcoded background colors (uses theme)');
    console.log('- No hardcoded text colors (uses opacity)');
    console.log('- Single store name instance (logo replacement enabled)');
    console.log('- Dynamic placeholders for all content');
    console.log('- Clean, semantic HTML structure');
    console.log('- Proper theme integration');
    
  } catch (error) {
    console.error('Error recreating footer:', error);
  }
}

// Run for the specific store
const storeId = '638ef028-7752-4996-9aae-878d896734fc';
recreateCleanFooter(storeId);