/**
 * Simple Footer Recreate
 * Create minimal clean footer structure
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

async function createSimpleFooter(storeId) {
  try {
    console.log(`🔧 Creating simple clean footer for store: ${storeId}`);
    
    // Clean footer content with NO hardcoded colors
    const cleanFooterContent = `<div class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-lg font-semibold mb-4">Testingmy</h3>
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

    // Create minimal footer structure that matches existing schema
    const newFooter = {
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
              allowHtml: true
            }
          }]
        }]
      }],
      theme_overrides: {
        useStoreLogo: true,
        showLogo: true
      }
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
    console.log('📄 Features:');
    console.log('- No hardcoded background colors');
    console.log('- Uses opacity for text variations');
    console.log('- Single logo instance');
    console.log('- Dynamic placeholders');
    
  } catch (error) {
    console.error('Error creating footer:', error);
  }
}

// Run for the specific store
const storeId = '638ef028-7752-4996-9aae-878d896734fc';
createSimpleFooter(storeId);