#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGlennStore() {
  console.log('\n=== Checking Glenn\'s Store Data ===\n');
  
  // Glenn's user ID from the query results
  const glennUserId = 'ae055adf-e25e-4fe3-a76e-3ddac1d82875';
  
  // 1. Get Glenn's store data
  console.log('1. Fetching store for glenn@omnicybersolutions.com...');
  const { data: stores, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_owner_id', glennUserId);
    
  if (storeError) {
    console.error('Error fetching stores:', storeError);
    return;
  }
  
  if (!stores || stores.length === 0) {
    console.log('No stores found for Glenn');
    return;
  }
  
  console.log(`Found ${stores.length} store(s):`);
  stores.forEach(store => {
    console.log(`  - ${store.store_name} (${store.store_slug})`);
    console.log(`    ID: ${store.id}`);
    console.log(`    Active: ${store.is_active}`);
    console.log(`    Status: ${store.subscription_status}`);
  });
  
  // 2. For each store, check page documents
  for (const store of stores) {
    console.log(`\n2. Checking page documents for store: ${store.store_name}`);
    
    const { data: pages, error: pageError } = await supabase
      .from('page_documents')
      .select('id, name, slug, page_type, systemPageType, isSystemPage, status')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });
      
    if (pageError) {
      console.error('Error fetching pages:', pageError);
      continue;
    }
    
    if (!pages || pages.length === 0) {
      console.log('  No pages found');
      continue;
    }
    
    console.log(`  Found ${pages.length} page(s):`);
    pages.forEach(page => {
      console.log(`    - ${page.name}`);
      console.log(`      Type: ${page.page_type}, System: ${page.isSystemPage}, SystemType: ${page.systemPageType}`);
      console.log(`      Status: ${page.status}, Slug: ${page.slug || 'N/A'}`);
    });
    
    // 3. Specifically search for headers/footers
    console.log(`\n3. Searching for headers/footers in ${store.store_name}...`);
    
    const { data: headerFooter, error: hfError } = await supabase
      .from('page_documents')
      .select('*')
      .eq('store_id', store.id)
      .or('page_type.eq.header,page_type.eq.footer,systemPageType.eq.header,systemPageType.eq.footer,name.ilike.%header%,name.ilike.%footer%');
      
    if (hfError) {
      console.error('Error searching headers/footers:', hfError);
      continue;
    }
    
    if (!headerFooter || headerFooter.length === 0) {
      console.log('  No headers or footers found');
    } else {
      console.log(`  Found ${headerFooter.length} header/footer page(s):`);
      headerFooter.forEach(page => {
        console.log(`    - ${page.name} (${page.page_type || 'N/A'})`);
        if (page.sections) {
          console.log(`      Has sections: ${JSON.stringify(page.sections).substring(0, 100)}...`);
        }
      });
    }
  }
}

checkGlennStore().catch(console.error);