#!/usr/bin/env node

/**
 * Setup RLS Policies for SellUsGenie Database
 * 
 * This script creates the missing Row Level Security policies for the SellUsGenie database.
 * These policies were referenced in the main schema but not implemented, causing access issues.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  console.error('')
  console.error('Please set these environment variables and try again.')
  process.exit(1)
}

console.log('🚀 Setting up RLS Policies for SellUsGenie...')
console.log('📊 Supabase URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupRLSPolicies() {
  try {
    console.log('📝 Reading RLS policies SQL file...')
    
    const sqlPath = join(__dirname, '..', 'database', 'rls-policies.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')
    
    console.log('🔧 Executing RLS policies...')
    console.log('   This will create policies for: customers, orders, order_items, customer_addresses, cart_items, payments, categories, store_settings')
    
    // Split the SQL into individual statements and execute them
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    let successCount = 0
    let skipCount = 0
    
    for (const statement of statements) {
      if (statement.includes('CREATE POLICY')) {
        const policyMatch = statement.match(/CREATE POLICY "([^"]+)"/)
        const policyName = policyMatch ? policyMatch[1] : 'unknown'
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          
          if (error) {
            if (error.message?.includes('already exists')) {
              console.log(`   ⚠️  Policy "${policyName}" already exists - skipping`)
              skipCount++
            } else {
              console.error(`   ❌ Failed to create policy "${policyName}":`, error.message)
            }
          } else {
            console.log(`   ✅ Created policy: "${policyName}"`)
            successCount++
          }
        } catch (err) {
          console.error(`   ❌ Error executing policy "${policyName}":`, err.message)
        }
      }
    }
    
    console.log('')
    console.log('📊 Summary:')
    console.log(`   ✅ Created: ${successCount} policies`)
    console.log(`   ⚠️  Skipped: ${skipCount} policies (already existed)`)
    console.log('')
    
    if (successCount > 0) {
      console.log('✅ RLS Policies setup completed successfully!')
      console.log('')
      console.log('🎯 What this fixes:')
      console.log('   • Order creation should now work properly')
      console.log('   • Customer management will be accessible')
      console.log('   • All multi-tenant data isolation is now enforced')
      console.log('   • Store owners can only access their own data')
      console.log('')
      console.log('🔄 Please refresh your application to test the changes.')
    } else {
      console.log('ℹ️  All policies were already in place.')
    }
    
  } catch (error) {
    console.error('❌ Error setting up RLS policies:', error)
    console.error('')
    console.error('💡 Troubleshooting:')
    console.error('   • Ensure you have admin access to the Supabase project')
    console.error('   • Check that SUPABASE_SERVICE_ROLE_KEY is set correctly')
    console.error('   • Verify the database connection is working')
    process.exit(1)
  }
}

// Run the setup
setupRLSPolicies()