/**
 * Test Customizations Save Functionality
 * Verify that database fields exist and save functionality works
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

async function testCustomizationsSave() {
  try {
    console.log('🧪 Testing Customizations Save Functionality...\n');
    
    const storeId = '638ef028-7752-4996-9aae-878d896734fc';
    
    // Test 1: Check which fields exist in stores table
    console.log('1️⃣ Checking stores table schema...');
    const { data: storeData, error: schemaError } = await supabase
      .from('stores')
      .select('id, store_name, store_phone, store_email, store_address, store_description')
      .eq('id', storeId)
      .single();
    
    if (schemaError) {
      console.error('❌ Schema error:', schemaError.message);
      // Try with basic fields only
      const { data: basicData, error: basicError } = await supabase
        .from('stores')
        .select('id, store_name')
        .eq('id', storeId)
        .single();
        
      if (basicError) {
        console.error('❌ Basic query failed:', basicError.message);
        return;
      }
      
      console.log('⚠️  Some fields may not exist, basic store data:', basicData);
    } else {
      console.log('✅ Store schema check passed:', {
        hasPhone: 'store_phone' in storeData,
        hasEmail: 'store_email' in storeData,  
        hasAddress: 'store_address' in storeData,
        hasDescription: 'store_description' in storeData,
        currentValues: storeData
      });
    }
    
    // Test 2: Test save functionality
    console.log('\n2️⃣ Testing save functionality...');
    
    const testCustomizations = {
      contact: {
        phone: '+1 (555) 123-4567',
        email: 'test@example.com',
        address: '123 Test St, Test City, TC 12345'
      },
      seo: {
        title: 'Testingmy - Quality Products Online',
        description: 'Shop the best products at Testingmy. Fast shipping, secure checkout, and excellent customer service.',
        keywords: ['online store', 'quality products', 'fast shipping']
      }
    };
    
    // Prepare update object
    const storeUpdates = {};
    if (testCustomizations.contact.phone) storeUpdates.store_phone = testCustomizations.contact.phone;
    if (testCustomizations.contact.email) storeUpdates.store_email = testCustomizations.contact.email;
    if (testCustomizations.contact.address) storeUpdates.store_address = testCustomizations.contact.address;
    if (testCustomizations.seo.description) storeUpdates.store_description = testCustomizations.seo.description;
    
    console.log('📝 Attempting to update with:', storeUpdates);
    
    // Test the update
    const { data: updateData, error: updateError } = await supabase
      .from('stores')
      .update({
        ...storeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      console.log('💡 This might be due to missing columns or RLS policies');
      
      // Try to identify which fields are missing
      for (const [field, value] of Object.entries(storeUpdates)) {
        try {
          const singleFieldUpdate = { [field]: value, updated_at: new Date().toISOString() };
          const { error: fieldError } = await supabase
            .from('stores')
            .update(singleFieldUpdate)
            .eq('id', storeId);
          
          if (fieldError) {
            console.error(`❌ Field '${field}' failed:`, fieldError.message);
          } else {
            console.log(`✅ Field '${field}' updated successfully`);
          }
        } catch (fieldTest) {
          console.error(`❌ Field '${field}' test failed:`, fieldTest.message);
        }
      }
    } else {
      console.log('✅ Update successful:', updateData);
    }
    
    // Test 3: Verify the changes
    console.log('\n3️⃣ Verifying changes...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('stores')
      .select('store_name, store_phone, store_email, store_address, store_description, updated_at')
      .eq('id', storeId)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Current store data after update:', verifyData);
    }
    
    console.log('\n✅ Customizations save test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCustomizationsSave();