#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Debug Header/Footer Pages');
console.log('============================');

async function debugPages() {
  // Get all pages to see the actual structure
  const { data: allPages, error } = await supabase
    .from('page_documents')
    .select('*')
    .order('name');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('\n📄 All pages in database:');
  allPages.forEach((page, index) => {
    console.log(`${index + 1}. Name: "${page.name}"`);
    console.log(`   Store ID: ${page.store_id}`);
    console.log(`   Page Type: ${page.page_type || 'null'}`);
    console.log(`   System Page Type: ${page.systemPageType || 'null'}`);
    console.log(`   Is System Page: ${page.isSystemPage || false}`);
    console.log(`   Status: ${page.status}`);
    console.log(`   Slug: ${page.slug || 'null'}`);
    
    // Check widget types
    const sections = page.sections || [];
    const widgets = sections.flatMap(s => s.rows?.flatMap(r => r.widgets) || []);
    const widgetTypes = widgets.map(w => w.type).join(', ');
    console.log(`   Widgets: [${widgetTypes}]`);
    console.log('');
  });

  // Specifically look for potential header/footer pages
  console.log('\n🔍 Potential header/footer pages:');
  const headerFooterPages = allPages.filter(page => 
    page.name && (
      page.name.toLowerCase().includes('header') ||
      page.name.toLowerCase().includes('footer') ||
      page.page_type === 'header' ||
      page.page_type === 'footer' ||
      page.systemPageType === 'header' ||
      page.systemPageType === 'footer'
    )
  );

  headerFooterPages.forEach((page, index) => {
    console.log(`${index + 1}. "${page.name}" - ${page.page_type}/${page.systemPageType}`);
    
    // Show sections structure
    if (page.sections && page.sections.length > 0) {
      page.sections.forEach((section, sIndex) => {
        console.log(`   Section ${sIndex + 1}: ${section.id}`);
        if (section.rows) {
          section.rows.forEach((row, rIndex) => {
            console.log(`     Row ${rIndex + 1}: ${row.id}`);
            if (row.widgets) {
              row.widgets.forEach((widget, wIndex) => {
                console.log(`       Widget ${wIndex + 1}: ${widget.type} (${widget.id})`);
              });
            }
          });
        }
      });
    }
    console.log('');
  });
}

debugPages().catch(console.error);