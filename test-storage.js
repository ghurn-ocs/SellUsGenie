// Quick test script to check Supabase storage connection
// Run with: node test-storage.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.log('Required variables:')
  console.log('- VITE_SUPABASE_URL')
  console.log('- VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorage() {
  console.log('🔍 Testing Supabase storage connection...')
  console.log(`📍 URL: ${supabaseUrl}`)
  
  try {
    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Error connecting to storage:', error.message)
      return
    }
    
    console.log('✅ Successfully connected to Supabase storage')
    console.log(`📦 Found ${buckets.length} bucket(s):`)
    
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
    
    // Check if product-images bucket exists
    const productImagesBucket = buckets.find(b => b.name === 'product-images')
    
    if (productImagesBucket) {
      console.log('✅ product-images bucket found!')
    } else {
      console.log('❌ product-images bucket NOT found')
      console.log('🔧 Please run the storage setup script:')
      console.log('   1. Go to Supabase dashboard → SQL Editor')
      console.log('   2. Copy and paste database/storage-setup.sql')
      console.log('   3. Click Run')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testStorage()