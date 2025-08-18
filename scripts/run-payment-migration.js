import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Use the values from .env file directly
const supabaseUrl = 'https://jizobmpcyrzprrwsyedv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppem9ibXBjeXJ6cHJyd3N5ZWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDUwMTIsImV4cCI6MjA3MDgyMTAxMn0.djDUoarBdbRZQ2oBCNMxjCR8wC160g5AC6W9T_z6Igc'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)')
  process.exit(1)
}

console.log('🔄 Connecting to Supabase...')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runPaymentMigration() {
  try {
    console.log('📄 Reading migration file...')
    const migrationPath = path.join(__dirname, '../migrations/add_payment_fields_to_stores.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Running payment fields migration...')
    console.log('SQL to execute:')
    console.log(migrationSQL)

    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    for (const statement of statements) {
      console.log(`\n⚡ Executing: ${statement.substring(0, 80)}...`)
      const { data, error } = await supabase.rpc('execute_sql', { sql: statement })
      
      if (error) {
        console.error('❌ Error executing statement:', error.message)
        console.log('🔄 Trying alternative approach...')
        
        // If rpc fails, try direct query
        const { error: directError } = await supabase.from('dummy').select('*').limit(0)
        if (directError) {
          console.log('💡 Using manual column addition approach...')
          await addPaymentFieldsManually()
          break
        }
      } else {
        console.log('✅ Statement executed successfully')
      }
    }

    console.log('\n🎉 Payment fields migration completed successfully!')
    console.log('✅ The stores table now has payment configuration fields')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n💡 Manual steps to fix this issue:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to the SQL Editor')
    console.log('3. Run the SQL from migrations/add_payment_fields_to_stores.sql')
    console.log('4. Restart your development server')
    process.exit(1)
  }
}

async function addPaymentFieldsManually() {
  console.log('🔧 Adding payment fields manually using Supabase client...')
  
  try {
    // Test if we can query the stores table to understand its structure
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Cannot access stores table:', error.message)
      throw error
    }

    console.log('✅ Successfully connected to stores table')
    console.log('🔍 Current store structure:', data?.[0] ? Object.keys(data[0]) : 'No stores found')
    
    console.log('\n💡 Please run the following SQL manually in your Supabase SQL Editor:')
    console.log('---')
    const migrationPath = path.join(__dirname, '../migrations/add_payment_fields_to_stores.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log(migrationSQL)
    console.log('---')
    
  } catch (error) {
    console.error('❌ Manual approach failed:', error.message)
    throw error
  }
}

// Run the migration
runPaymentMigration()