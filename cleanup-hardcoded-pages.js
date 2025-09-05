#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase connection
const supabaseUrl = 'https://jizobmpcyrzprrwsyedv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppem9ibXBjeXJ6cHJyd3N5ZWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDUwMTIsImV4cCI6MjA3MDgyMTAxMn0.djDUoarBdbRZQ2oBCNMxjCR8wC160g5AC6W9T_z6Igc';
const supabase = createClient(supabaseUrl, supabaseKey);

const STORE_ID = '638ef028-7752-4996-9aae-878d896734fc';

// Patterns that indicate hardcoded content
const hardcodedPatterns = [
  /class="bg-gray-800/,
  /class="grid grid-cols-3/,
  /data-nav=/,
  /<header class=/,
  /<footer class=/,
  /Quick Links/,
  /Contact Info/,
  /Get in touch with us today/,
  /grid-cols-3/,
  /bg-gray-800/,
  /<div class="[^"]*grid/,
  /<nav[^>]*>/,
  /flexDirection.*column/,
  /justifyContent.*space-between/,
];

async function analyzeAndCleanupPages() {
  console.log(`🔍 Analyzing pages for store: ${STORE_ID}`);
  
  try {
    // Fetch all page documents for the store
    const { data: pages, error } = await supabase
      .from('page_documents')
      .select('*')
      .eq('store_id', STORE_ID);

    if (error) {
      console.error('❌ Error fetching pages:', error);
      return;
    }

    console.log(`📄 Found ${pages.length} pages for store`);
    
    const hardcodedPages = [];
    const legitimatePages = [];

    // Analyze each page
    for (const page of pages) {
      console.log(`\n🔎 Analyzing page: "${page.name}" (${page.slug})`);
      console.log(`📋 Status: ${page.status || 'undefined'}`);
      
      const contentStr = JSON.stringify(page.sections || {});
      const isHardcoded = hardcodedPatterns.some(pattern => pattern.test(contentStr));
      
      if (isHardcoded) {
        console.log(`🚫 HARDCODED PAGE DETECTED: "${page.name}"`);
        console.log(`📝 Content preview: ${contentStr.substring(0, 200)}...`);
        hardcodedPages.push(page);
      } else {
        console.log(`✅ LEGITIMATE PAGE: "${page.name}"`);
        legitimatePages.push(page);
      }
    }

    console.log(`\n📊 ANALYSIS SUMMARY:`);
    console.log(`🚫 Hardcoded pages to delete: ${hardcodedPages.length}`);
    console.log(`✅ Legitimate pages to keep: ${legitimatePages.length}`);

    if (hardcodedPages.length > 0) {
      console.log(`\n🗑️  HARDCODED PAGES TO DELETE:`);
      hardcodedPages.forEach(page => {
        console.log(`- "${page.name}" (${page.slug}) - ${page.status || 'no status'}`);
      });

      // Delete hardcoded pages
      const pageIds = hardcodedPages.map(p => p.id);
      console.log(`\n🔥 DELETING ${pageIds.length} hardcoded pages...`);
      
      const { data: deletedData, error: deleteError } = await supabase
        .from('page_documents')
        .delete()
        .in('id', pageIds);

      if (deleteError) {
        console.error('❌ Error deleting pages:', deleteError);
      } else {
        console.log(`✅ Successfully deleted ${pageIds.length} hardcoded pages!`);
      }
    }

    if (legitimatePages.length > 0) {
      console.log(`\n✅ LEGITIMATE PAGES REMAINING:`);
      legitimatePages.forEach(page => {
        console.log(`- "${page.title}" (${page.slug}) - ${page.page_type || 'no type'}`);
      });
    }

    // Final verification
    const { data: remainingPages, error: verifyError } = await supabase
      .from('pages')
      .select('id, title, slug, page_type')
      .eq('store_id', STORE_ID);

    if (verifyError) {
      console.error('❌ Error verifying remaining pages:', verifyError);
    } else {
      console.log(`\n🎉 FINAL RESULT: ${remainingPages.length} pages remaining in database`);
      remainingPages.forEach(page => {
        console.log(`  ✓ "${page.title}" (${page.slug}) - ${page.page_type || 'no type'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the cleanup
analyzeAndCleanupPages()
  .then(() => {
    console.log('\n🏁 Cleanup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });