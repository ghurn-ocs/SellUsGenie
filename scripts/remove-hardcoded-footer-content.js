/**
 * Remove All Hardcoded Footer Content
 * Makes footer content dynamic and removes all hardcoded text
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

async function removeHardcodedFooterContent(storeId) {
  try {
    console.log(`🔧 Removing hardcoded footer content for store: ${storeId}`);
    
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
    
    console.log('📄 Original footer content preview:', 
      footerPage.sections[0].rows[0].widgets[0].props.content.substring(0, 200) + '...'
    );
    
    // Create new dynamic footer content without hardcoded text
    const dynamicFooterContent = `<div class="bg-gray-800 text-white">
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
    
    // Update the footer sections
    const updatedSections = footerPage.sections.map(section => ({
      ...section,
      rows: section.rows.map(row => ({
        ...row,
        widgets: row.widgets.map(widget => ({
          ...widget,
          props: {
            ...widget.props,
            content: dynamicFooterContent
          }
        }))
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
    
    console.log('✅ Hardcoded footer content removed successfully!');
    console.log('📄 New footer uses dynamic placeholders:', {
      store_description: '{{store_description}}',
      contact_info: '{{contact_info}}', 
      current_year: '{{current_year}}'
    });
    
  } catch (error) {
    console.error('Error removing hardcoded footer content:', error);
  }
}

// Run for the specific store
const storeId = '638ef028-7752-4996-9aae-878d896734fc';
removeHardcodedFooterContent(storeId);