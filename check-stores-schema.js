/**
 * Check Stores Table Schema
 * Find out what columns actually exist in the stores table
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

async function checkStoresSchema() {
  try {
    console.log('🔍 Checking actual stores table schema...\n');
    
    const storeId = '638ef028-7752-4996-9aae-878d896734fc';
    
    // Get all available columns by selecting *
    const { data: storeData, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();
    
    if (error) {
      console.error('❌ Failed to fetch store data:', error.message);
      return;
    }
    
    console.log('📋 Available columns in stores table:');
    const columns = Object.keys(storeData);
    columns.forEach((column, index) => {
      const value = storeData[column];
      const type = typeof value;
      const preview = value ? (type === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value) : 'NULL';
      
      console.log(`  ${index + 1}. ${column} (${type}): ${preview}`);
    });
    
    console.log('\n🎯 Relevant columns for customizations:');
    const customizationFields = [
      'store_name',
      'store_phone', 
      'store_email',
      'store_address',
      'store_description',
      'contact_info',
      'contact_email',
      'contact_phone',
      'store_logo_url',
      'seo_title',
      'seo_description'
    ];
    
    customizationFields.forEach(field => {
      if (field in storeData) {
        console.log(`  ✅ ${field}: Available`);
      } else {
        console.log(`  ❌ ${field}: Missing`);
      }
    });
    
    console.log('\n📊 Store data summary:');
    console.log(`  - Store ID: ${storeData.id}`);
    console.log(`  - Store Name: ${storeData.store_name}`);
    console.log(`  - Has Logo: ${!!storeData.store_logo_url}`);
    console.log(`  - Total Columns: ${columns.length}`);
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkStoresSchema();