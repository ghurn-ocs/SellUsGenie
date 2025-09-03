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

async function debugNavigationWidget() {
  console.log('\n=== Debugging Navigation Widget Data ===\n');
  
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
  
  console.log('Header Page Found:', {
    id: headerPage.id,
    name: headerPage.name,
    hasThemeOverrides: !!headerPage.theme_overrides
  });
  
  console.log('\nTheme Overrides:');
  console.log(JSON.stringify(headerPage.theme_overrides, null, 2));
  
  // Find navigation widget in sections
  if (headerPage.sections && Array.isArray(headerPage.sections)) {
    headerPage.sections.forEach((section, sIdx) => {
      if (section.rows && Array.isArray(section.rows)) {
        section.rows.forEach((row, rIdx) => {
          if (row.widgets && Array.isArray(row.widgets)) {
            row.widgets.forEach((widget, wIdx) => {
              if (widget.type === 'navigation') {
                console.log(`\n=== Navigation Widget Found [${sIdx}.${rIdx}.${wIdx}] ===`);
                console.log('Widget ID:', widget.id);
                console.log('Widget Props:', JSON.stringify(widget.props, null, 2));
                
                // Check if widget has hardcoded styles
                if (widget.props?.className) {
                  console.log('\n⚠️  WARNING: Navigation widget has className:', widget.props.className);
                }
                if (widget.props?.linkClassName) {
                  console.log('⚠️  WARNING: Navigation widget has linkClassName:', widget.props.linkClassName);
                }
                if (widget.props?.activeLinkClassName) {
                  console.log('⚠️  WARNING: Navigation widget has activeLinkClassName:', widget.props.activeLinkClassName);
                }
              }
            });
          }
        });
      }
    });
  }
  
  console.log('\n=== Expected Styling ===');
  console.log('navLinkStyle:', headerPage.theme_overrides?.navLinkStyle || 'Not set');
  console.log('linkColor:', headerPage.theme_overrides?.linkColor || 'Not set');
  console.log('linkHoverColor:', headerPage.theme_overrides?.linkHoverColor || 'Not set');
  console.log('buttonStyle:', headerPage.theme_overrides?.buttonStyle || 'Not set');
}

debugNavigationWidget().catch(console.error);