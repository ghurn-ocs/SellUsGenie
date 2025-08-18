// Comprehensive storage diagnostics
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 SUPABASE STORAGE DIAGNOSTICS')
console.log('================================')
console.log(`📍 URL: ${supabaseUrl}`)
console.log(`🔑 Key: ${supabaseKey?.substring(0, 20)}...`)
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey)

async function runDiagnostics() {
  console.log('1️⃣ Testing basic connection...')
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log(`   Auth status: ${user ? 'Authenticated' : 'Anonymous'}`)
    console.log(`   User ID: ${user?.id || 'None'}`)
    if (authError) console.log(`   Auth error: ${authError.message}`)
  } catch (error) {
    console.log(`   ❌ Auth test failed: ${error.message}`)
  }
  console.log('')

  console.log('2️⃣ Testing storage.listBuckets()...')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
      console.log(`   Error details:`, error)
    } else {
      console.log(`   ✅ Success! Found ${buckets?.length || 0} bucket(s)`)
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`   📦 ${bucket.name} (${bucket.public ? 'public' : 'private'}) - Created: ${bucket.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`)
  }
  console.log('')

  console.log('3️⃣ Testing direct bucket access...')
  try {
    const { data: files, error } = await supabase.storage
      .from('product-images')
      .list()
    
    if (error) {
      console.log(`   ❌ Bucket access error: ${error.message}`)
      console.log(`   Error code: ${error.statusCode}`)
      console.log(`   Error details:`, error)
    } else {
      console.log(`   ✅ Successfully accessed product-images bucket`)
      console.log(`   📁 Files in bucket: ${files?.length || 0}`)
    }
  } catch (error) {
    console.log(`   ❌ Exception accessing bucket: ${error.message}`)
  }
  console.log('')

  console.log('4️⃣ Testing storage configuration...')
  try {
    // Try to get bucket configuration
    const response = await fetch(`${supabaseUrl}/rest/v1/buckets?select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ REST API accessible`)
      console.log(`   📦 Buckets via REST: ${data.length}`)
      data.forEach(bucket => {
        console.log(`   - ${bucket.id}: ${bucket.name} (public: ${bucket.public})`)
      })
    } else {
      console.log(`   ❌ REST API error: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.log(`   ❌ REST API exception: ${error.message}`)
  }
  console.log('')

  console.log('5️⃣ Testing storage policies...')
  try {
    const { data: policies, error } = await supabase
      .from('policy')
      .select('*')
      .ilike('table_name', '%objects%')
    
    if (error) {
      console.log(`   ⚠️  Policy check failed (expected): ${error.message}`)
    } else {
      console.log(`   📋 Found ${policies?.length || 0} storage-related policies`)
    }
  } catch (error) {
    console.log(`   ⚠️  Policy check exception (expected): ${error.message}`)
  }
  console.log('')

  console.log('🎯 SUMMARY')
  console.log('==========')
  console.log('If buckets show in dashboard but not via API:')
  console.log('• Check if RLS policies block access')
  console.log('• Verify API key has storage permissions')
  console.log('• Ensure project URL matches exactly')
  console.log('• Try regenerating API keys in Supabase dashboard')
}

runDiagnostics()