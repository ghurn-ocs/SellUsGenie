// Test authentication status and capabilities
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthentication() {
  console.log('🔐 AUTHENTICATION TESTING')
  console.log('==========================')
  console.log('')

  try {
    // Test 1: Check current user/session
    console.log('1️⃣ Checking current authentication status...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log(`❌ Error getting user: ${userError.message}`)
    } else if (user) {
      console.log(`✅ User authenticated:`)
      console.log(`   - ID: ${user.id}`)
      console.log(`   - Email: ${user.email}`)
      console.log(`   - Provider: ${user.app_metadata?.provider || 'unknown'}`)
      console.log(`   - Role: ${user.role}`)
    } else {
      console.log(`❌ No authenticated user`)
    }
    console.log('')

    // Test 2: Check session
    console.log('2️⃣ Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log(`❌ Error getting session: ${sessionError.message}`)
    } else if (session) {
      console.log(`✅ Active session found:`)
      console.log(`   - Access token exists: ${!!session.access_token}`)
      console.log(`   - Refresh token exists: ${!!session.refresh_token}`)
      console.log(`   - Expires at: ${new Date(session.expires_at * 1000).toLocaleString()}`)
    } else {
      console.log(`❌ No active session`)
    }
    console.log('')

    // Test 3: Try to access store_owners table (authenticated access)
    console.log('3️⃣ Testing authenticated table access...')
    const { data: storeOwners, error: storeOwnersError } = await supabase
      .from('store_owners')
      .select('id, email')
      .limit(5)

    if (storeOwnersError) {
      console.log(`❌ Error accessing store_owners: ${storeOwnersError.message}`)
      console.log(`   Code: ${storeOwnersError.code}`)
      console.log(`   Details: ${storeOwnersError.details}`)
      console.log(`   Hint: ${storeOwnersError.hint}`)
    } else {
      console.log(`✅ Successfully accessed store_owners table`)
      console.log(`   Found ${storeOwners.length} store owner(s)`)
    }
    console.log('')

    // Test 4: Try to insert a test product (this should fail if auth is the issue)
    console.log('4️⃣ Testing product insertion capability...')
    const testProduct = {
      store_id: '638ef028-7752-4996-9aae-878d896734fc', // Testingmy store ID
      name: 'AUTH_TEST_PRODUCT',
      description: 'Test product for authentication debugging',
      price: 1.00,
      inventory_quantity: 1,
      is_active: true
    }

    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single()

    if (insertError) {
      console.log(`❌ Product insertion failed:`)
      console.log(`   Message: ${insertError.message}`)
      console.log(`   Code: ${insertError.code}`)
      console.log(`   Details: ${insertError.details}`)
      console.log(`   Hint: ${insertError.hint}`)
      
      // Check if it's specifically an auth issue
      if (insertError.message.includes('JWT') || insertError.message.includes('anonymous')) {
        console.log(`\n🚨 THIS IS AN AUTHENTICATION ISSUE!`)
        console.log(`   The user is not properly authenticated for database writes.`)
      }
    } else {
      console.log(`✅ Product insertion successful!`)
      console.log(`   Product ID: ${insertedProduct.id}`)
      
      // Clean up test product
      await supabase.from('products').delete().eq('id', insertedProduct.id)
      console.log(`🧹 Test product cleaned up`)
    }
    console.log('')

    // Test 5: Check RLS policies
    console.log('5️⃣ Checking if RLS is blocking access...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1)

    if (productsError) {
      console.log(`❌ Error reading products: ${productsError.message}`)
    } else {
      console.log(`✅ Can read products table (found ${products.length} products)`)
    }

  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`)
  }
}

testAuthentication()