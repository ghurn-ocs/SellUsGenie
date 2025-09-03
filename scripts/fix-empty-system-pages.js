#!/usr/bin/env node

/**
 * Fix Empty System Pages Script
 * Populates empty header and footer pages with default content
 */

import { supabase } from '../src/lib/supabase.js';

const STORE_ID = '638ef028-7752-4996-9aae-878d896734fc'; // Replace with actual store ID

async function fixEmptySystemPages() {
  console.log('🔧 Fixing empty system pages...');
  
  try {
    // Get store information
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, store_name')
      .eq('id', STORE_ID)
      .single();
    
    if (storeError || !store) {
      throw new Error(`Store not found: ${storeError?.message}`);
    }
    
    console.log(`🏪 Working with store: ${store.store_name}`);
    
    // Get existing header and footer pages
    const { data: systemPages, error: fetchError } = await supabase
      .from('page_documents')
      .select('id, name, slug, sections')
      .eq('store_id', STORE_ID)
      .in('name', ['Site Header', 'Site Footer']);
    
    if (fetchError) {
      throw new Error(`Failed to fetch system pages: ${fetchError.message}`);
    }
    
    console.log(`📄 Found ${systemPages.length} system pages`);
    
    for (const page of systemPages) {
      console.log(`\n🔍 Checking page: ${page.name}`);
      
      // Check if page has empty rows
      const hasEmptyRows = page.sections.some(section => 
        section.rows.some(row => row.widgets.length === 0)
      );
      
      if (hasEmptyRows) {
        console.log(`⚠️  ${page.name} has empty rows - adding content`);
        
        let updatedSections;
        
        if (page.name === 'Site Header') {
          updatedSections = [{
            id: crypto.randomUUID(),
            title: 'Header Section',
            padding: 'py-4 px-4',
            rows: [{
              id: crypto.randomUUID(),
              widgets: [{
                id: crypto.randomUUID(),
                type: 'text',
                version: 1,
                colSpan: { sm: 12, md: 12, lg: 12 },
                props: {
                  content: `<div class="bg-white shadow-sm border-b border-gray-200">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div class="flex justify-between items-center py-4">
                        <div class="flex items-center">
                          <h1 class="text-2xl font-bold text-gray-900">${store.store_name}</h1>
                        </div>
                        <nav class="hidden md:flex space-x-8">
                          <a href="/" class="text-gray-600 hover:text-gray-900 px-3 py-2">Home</a>
                          <a href="/about" class="text-gray-600 hover:text-gray-900 px-3 py-2">About</a>
                          <a href="/contact" class="text-gray-600 hover:text-gray-900 px-3 py-2">Contact</a>
                        </nav>
                        <div class="flex items-center space-x-4">
                          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Shop Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>`
                }
              }]
            }]
          }];
        } else if (page.name === 'Site Footer') {
          updatedSections = [{
            id: crypto.randomUUID(),
            title: 'Footer Section',
            padding: 'py-8 px-4',
            rows: [{
              id: crypto.randomUUID(),
              widgets: [{
                id: crypto.randomUUID(),
                type: 'text',
                version: 1,
                colSpan: { sm: 12, md: 12, lg: 12 },
                props: {
                  content: `<div class="bg-gray-800 text-white">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <h3 class="text-lg font-semibold mb-4">${store.store_name}</h3>
                          <p class="text-gray-300">Quality products and exceptional service.</p>
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
                          <p class="text-gray-300">Customize your contact information here.</p>
                        </div>
                      </div>
                      <div class="border-t border-gray-700 pt-6 mt-6 text-center">
                        <p class="text-gray-300">&copy; ${new Date().getFullYear()} ${store.store_name}. All rights reserved.</p>
                      </div>
                    </div>
                  </div>`
                }
              }]
            }]
          }];
        }
        
        // Update the page with new content
        const { error: updateError } = await supabase
          .from('page_documents')
          .update({
            sections: updatedSections,
            updated_at: new Date().toISOString()
          })
          .eq('id', page.id);
        
        if (updateError) {
          console.error(`❌ Failed to update ${page.name}:`, updateError);
        } else {
          console.log(`✅ Successfully updated ${page.name} with content`);
        }
      } else {
        console.log(`✅ ${page.name} already has content`);
      }
    }
    
    console.log('\n🎉 System pages fix complete!');
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1].includes('fix-empty-system-pages.js')) {
  fixEmptySystemPages();
}