#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugHeaderTextWidgets() {
  console.log('\n=== Debugging Header Text Widgets ===\n');
  
  const storeId = '638ef028-7752-4996-9aae-878d896734fc'; // Glenn's store
  
  // Get header page data
  const { data: headerPage, error } = await supabase
    .from('page_documents')
    .select('*')
    .eq('store_id', storeId)
    .eq('page_type', 'header')
    .eq('status', 'published')
    .single();
    
  if (error) {
    console.error('Error fetching header:', error);
    return;
  }
  
  console.log('Header Theme textColor:', headerPage.theme_overrides?.textColor || 'Not set');
  console.log('Header Theme backgroundColor:', headerPage.theme_overrides?.backgroundColor || 'Not set');
  console.log();
  
  // Find all widgets in sections
  if (headerPage.sections && Array.isArray(headerPage.sections)) {
    headerPage.sections.forEach((section, sIdx) => {
      console.log(`=== Section ${sIdx} ===`);
      if (section.rows && Array.isArray(section.rows)) {
        section.rows.forEach((row, rIdx) => {
          if (row.widgets && Array.isArray(row.widgets)) {
            row.widgets.forEach((widget, wIdx) => {
              console.log(`\nWidget [${sIdx}.${rIdx}.${wIdx}]:`);
              console.log('  Type:', widget.type);
              console.log('  ID:', widget.id);
              
              if (widget.type === 'text') {
                console.log('  📝 TEXT WIDGET FOUND:');
                console.log('    Content preview:', 
                  (widget.props?.content || '').substring(0, 100).replace(/\n/g, ' ') + '...'
                );
                
                // Check for hardcoded colors in props
                if (widget.props?.color) {
                  console.log('    🎨 Color prop:', widget.props.color);
                }
                if (widget.props?.className) {
                  console.log('    📦 ClassName prop:', widget.props.className);
                }
                
                // Check for hardcoded colors in content (HTML)
                const content = widget.props?.content || '';
                const colorMatches = content.match(/(text-\w+(-\d+)?|color:\s*[^;]+)/g);
                if (colorMatches) {
                  console.log('    ⚠️  HARDCODED COLORS in content:', colorMatches);
                }
                
                // Check if color includes gray classes
                if (widget.props?.color && widget.props.color.includes('gray')) {
                  console.log('    🚨 HARDCODED GRAY COLOR found:', widget.props.color);
                }
              } else {
                console.log('  Props keys:', Object.keys(widget.props || {}));
              }
            });
          }
        });
      }
    });
  }
}

debugHeaderTextWidgets().catch(console.error);