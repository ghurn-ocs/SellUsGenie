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

async function debugLogoContent() {
  console.log('\n=== Debugging Logo Content Configuration ===\n');
  
  const storeId = '638ef028-7752-4996-9aae-878d896734fc'; // Glenn's store
  
  // Get store data first
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();
    
  console.log('Store Logo URL:', store?.store_logo_url || 'Not set');
  console.log();
  
  // Get header page data
  const { data: headerPage, error: headerError } = await supabase
    .from('page_documents')
    .select('*')
    .eq('store_id', storeId)
    .eq('page_type', 'header')
    .eq('status', 'published')
    .single();
    
  if (headerError) {
    console.error('Error fetching header:', headerError);
    return;
  }
  
  console.log('=== Header Theme Logo Controls ===');
  console.log('showLogo:', headerPage.theme_overrides?.showLogo);
  console.log('useStoreLogo:', headerPage.theme_overrides?.useStoreLogo);
  console.log('logoPosition:', headerPage.theme_overrides?.logoPosition);
  console.log();
  
  // Look for all widgets in header sections, including image widgets
  console.log('=== Header Content Analysis ===');
  if (headerPage.sections && Array.isArray(headerPage.sections)) {
    headerPage.sections.forEach((section, sIdx) => {
      console.log(`Section ${sIdx}:`);
      if (section.rows && Array.isArray(section.rows)) {
        section.rows.forEach((row, rIdx) => {
          console.log(`  Row ${rIdx}:`);
          if (row.widgets && Array.isArray(row.widgets)) {
            row.widgets.forEach((widget, wIdx) => {
              console.log(`    Widget [${sIdx}.${rIdx}.${wIdx}]: ${widget.type}`);
              
              if (widget.type === 'image') {
                console.log(`      📷 IMAGE WIDGET:`, {
                  id: widget.id,
                  src: widget.props?.src,
                  alt: widget.props?.alt,
                  colSpan: widget.colSpan,
                  visibility: widget.visibility
                });
              } else if (widget.type === 'text') {
                const content = widget.props?.content || '';
                const hasImg = content.includes('<img');
                console.log(`      📝 TEXT WIDGET: Has <img>: ${hasImg}`);
                if (hasImg) {
                  console.log(`        Content preview:`, content.substring(0, 200));
                }
              }
            });
          }
        });
      }
    });
  }
  
  console.log('\n=== Logo Display Logic ===');
  console.log('Expected behavior:');
  console.log('1. If showLogo = true: Logo should be visible');
  console.log('2. If showLogo = false: Logo should be hidden');
  console.log('3. If useStoreLogo = true: Use store.store_logo_url');
  console.log('4. If useStoreLogo = false: Use custom logo from content');
  console.log('5. logoPosition controls where logo appears (left/center/right)');
  
  console.log('\nCurrent settings suggest:');
  const shouldShowLogo = headerPage.theme_overrides?.showLogo;
  const shouldUseStoreLogo = headerPage.theme_overrides?.useStoreLogo;
  const hasStoreLogo = !!store?.store_logo_url;
  
  console.log(`- Logo should be ${shouldShowLogo ? 'VISIBLE' : 'HIDDEN'}`);
  console.log(`- Should use ${shouldUseStoreLogo ? 'STORE' : 'CUSTOM'} logo`);
  console.log(`- Store has logo: ${hasStoreLogo ? 'YES' : 'NO'}`);
  
  if (shouldShowLogo && shouldUseStoreLogo && hasStoreLogo) {
    console.log('✅ EXPECTED: Store logo should be displayed');
    console.log('   Logo URL:', store.store_logo_url);
  } else if (shouldShowLogo && !shouldUseStoreLogo) {
    console.log('✅ EXPECTED: Custom logo from content should be displayed');
  } else if (!shouldShowLogo) {
    console.log('❌ EXPECTED: No logo should be displayed');
  } else {
    console.log('⚠️  EXPECTED: Fallback to store name text');
  }
}

debugLogoContent().catch(console.error);