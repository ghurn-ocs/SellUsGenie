/**
 * Final Footer Fix - Direct Database Update
 * Completely replaces footer content with clean, no-hardcode version
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
try {
  const envFile = readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
} catch (error) {}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixFooterFinal(storeId) {
  try {
    console.log(`🔧 Final footer fix for store: ${storeId}`);
    
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
    
    // NEW: Clean footer content with only ONE instance of store name (for logo) and no hardcoded content
    const cleanFooterContent = `<div class="bg-gray-800 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-lg font-semibold mb-4">${store.store_name}</h3>
        <p class="text-gray-300">{{store_description}}</p>
      </div>
      <div>
        <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2">
          <li><a href="/about" class="text-gray-300 hover:text-white">About Us</a></li>
          <li><a href="/contact" class="text-gray-300 hover:text-white">Contact</a></li>
          <li><a href="/privacy" class="text-gray-300 hover:text-white">Privacy Policy</a></li>
          <li><a href="/terms" class="text-gray-300 hover:text-white">Terms & Conditions</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-lg font-semibold mb-4">Contact Info</h4>
        <p class="text-gray-300">{{contact_info}}</p>
      </div>
    </div>
    <div class="border-t border-gray-700 pt-6 mt-6 text-center">
      <p class="text-gray-300">© {{current_year}} All rights reserved.</p>
    </div>
  </div>
</div>`;
    
    // Direct update using the exact structure we know exists
    const { error: updateError } = await supabase
      .from('page_documents')
      .update({ 
        sections: [{
          id: '19d1b26a-6454-44df-a811-1a0b0e49e62c',
          rows: [{
            id: '3fada28b-2f88-4757-82c6-2ba929e09224',
            widgets: [{
              id: 'e9276049-2797-4a39-b29b-be99533f02d5',
              type: 'text',
              props: {
                content: cleanFooterContent,
                allowHtml: true
              },
              colSpan: {
                lg: 12,
                md: 12,
                sm: 12
              },
              version: 1
            }]
          }],
          title: 'Footer Section',
          padding: 'py-0 px-0'
        }],
        updated_at: new Date().toISOString()
      })
      .eq('store_id', storeId)
      .eq('name', 'Site Footer');
    
    if (updateError) {
      console.error('Failed to update footer:', updateError.message);
      return;
    }
    
    console.log('✅ Footer fixed with clean content!');
    console.log('📄 Key changes:');
    console.log('- Store name appears only ONCE (for logo replacement)');
    console.log('- Copyright has no store name (no duplicate logo)'); 
    console.log('- Uses dynamic placeholders for description and contact info');
    console.log('- Uses {{current_year}} for automatic year updates');
    
  } catch (error) {
    console.error('Error fixing footer:', error);
  }
}

// Run for the specific store
const storeId = '638ef028-7752-4996-9aae-878d896734fc';
fixFooterFinal(storeId);