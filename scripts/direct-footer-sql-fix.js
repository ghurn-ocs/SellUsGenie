/**
 * Direct SQL Footer Fix 
 * Use raw SQL to ensure the update takes effect
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

const cleanFooterContent = `<div class="bg-gray-800 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-lg font-semibold mb-4">Testingmy</h3>
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

// Use raw SQL to update
const { error } = await supabase.rpc('exec', {
  sql: `
    UPDATE page_documents 
    SET sections = jsonb_set(
      sections, 
      '{0,rows,0,widgets,0,props,content}', 
      '"${cleanFooterContent.replace(/"/g, '\\"')}"'
    ),
    updated_at = NOW()
    WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc' 
    AND name = 'Site Footer';
  `
});

if (error) {
  console.error('SQL update failed:', error);
  
  // Fallback: direct JSON update
  console.log('Trying direct JSON update...');
  
  const newSections = [
    {
      "id": "19d1b26a-6454-44df-a811-1a0b0e49e62c",
      "rows": [
        {
          "id": "3fada28b-2f88-4757-82c6-2ba929e09224", 
          "widgets": [
            {
              "id": "e9276049-2797-4a39-b29b-be99533f02d5",
              "type": "text",
              "props": {
                "content": cleanFooterContent,
                "allowHtml": true
              },
              "colSpan": { "lg": 12, "md": 12, "sm": 12 },
              "version": 1
            }
          ]
        }
      ],
      "title": "Footer Section",
      "padding": "py-0 px-0"
    }
  ];

  const { error: fallbackError } = await supabase
    .from('page_documents')
    .update({
      sections: newSections,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'a5f0d4bf-2bf7-4bca-a346-63025ec8812b');

  if (fallbackError) {
    console.error('Fallback update also failed:', fallbackError);
  } else {
    console.log('✅ Fallback update succeeded!');
  }
} else {
  console.log('✅ SQL update succeeded!');
}