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

async function debugLogoSettings() {
  console.log('\n=== Debugging Logo Display Settings ===\n');
  
  const storeId = '638ef028-7752-4996-9aae-878d896734fc'; // Glenn's store
  
  // Get store data
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();
    
  if (storeError) {
    console.error('Error fetching store:', storeError);
    return;
  }
  
  console.log('=== Store Logo Data ===');
  console.log('Store Name:', store.store_name);
  console.log('Logo URL (legacy):', store.logo_url || 'Not set');
  console.log('Store Logo URL:', store.store_logo_url || 'Not set');
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
  
  console.log('=== Header Theme Logo Settings ===');
  console.log('showLogo:', headerPage.theme_overrides?.showLogo || 'Not set');
  console.log('useStoreLogo:', headerPage.theme_overrides?.useStoreLogo || 'Not set');
  console.log('logoPosition:', headerPage.theme_overrides?.logoPosition || 'Not set');
  console.log();
  
  console.log('=== Full Theme Overrides ===');
  console.log(JSON.stringify(headerPage.theme_overrides, null, 2));
  console.log();
  
  // Check if there are any image widgets in header
  let hasImageWidgets = false;
  let hasLogoImages = false;
  
  if (headerPage.sections && Array.isArray(headerPage.sections)) {
    headerPage.sections.forEach((section, sIdx) => {
      if (section.rows && Array.isArray(section.rows)) {
        section.rows.forEach((row, rIdx) => {
          if (row.widgets && Array.isArray(row.widgets)) {
            row.widgets.forEach((widget, wIdx) => {
              if (widget.type === 'image') {
                hasImageWidgets = true;
                console.log(`=== Image Widget Found [${sIdx}.${rIdx}.${wIdx}] ===`);
                console.log('Widget ID:', widget.id);
                console.log('Image src:', widget.props?.src || 'Not set');
                console.log('Image alt:', widget.props?.alt || 'Not set');
                console.log('Props:', JSON.stringify(widget.props, null, 2));
                
                if (widget.props?.alt && widget.props.alt.toLowerCase().includes('logo')) {
                  hasLogoImages = true;
                }
              }
            });
          }
        });
      }
    });
  }
  
  console.log('=== Summary ===');
  console.log('Store has logo URL:', !!(store.logo_url || store.store_logo_url));
  console.log('Header showLogo enabled:', headerPage.theme_overrides?.showLogo === true);
  console.log('Header useStoreLogo enabled:', headerPage.theme_overrides?.useStoreLogo === true);
  console.log('Header has image widgets:', hasImageWidgets);
  console.log('Header has logo images:', hasLogoImages);
  
  console.log('\n=== Expected Logo Display Logic ===');
  console.log('1. If useStoreLogo = true AND store has logo_url/store_logo_url: Display store logo');
  console.log('2. If showLogo = true but no store logo: Display store name as text');
  console.log('3. If logo image widgets exist: Display those images');
}

debugLogoSettings().catch(console.error);