#!/usr/bin/env node

/**
 * Script to dump Supabase database schema
 * Creates SUPABASE_SCHEMA_SEPT032025.md with complete schema documentation
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables
config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function dumpSchema() {
  console.log('🔍 Querying Supabase database schema...')
  
  const queries = {
    tables: `
      SELECT 
        schemaname as schema_name,
        tablename as table_name,
        tableowner as owner
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'supabase_functions', 'extensions', 'pgsodium', 'pgsodium_masks', 'graphql', 'graphql_public', 'vault')
      ORDER BY schemaname, tablename
    `,
    columns: `
      SELECT 
        table_schema,
        table_name,
        column_name,
        ordinal_position,
        column_default,
        is_nullable,
        data_type,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'supabase_functions', 'extensions', 'pgsodium', 'pgsodium_masks', 'graphql', 'graphql_public', 'vault')
      ORDER BY table_schema, table_name, ordinal_position
    `,
    constraints: `
      SELECT 
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name 
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'supabase_functions', 'extensions', 'pgsodium', 'pgsodium_masks', 'graphql', 'graphql_public', 'vault')
      ORDER BY tc.table_schema, tc.table_name, tc.constraint_name
    `,
    indexes: `
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'supabase_functions', 'extensions', 'pgsodium', 'pgsodium_masks', 'graphql', 'graphql_public', 'vault')
      ORDER BY schemaname, tablename, indexname
    `,
    policies: `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'supabase_functions', 'extensions', 'pgsodium', 'pgsodium_masks', 'graphql', 'graphql_public', 'vault')
      ORDER BY schemaname, tablename, policyname
    `,
    functions: `
      SELECT 
        n.nspname as schema_name,
        p.proname as function_name,
        pg_catalog.pg_get_function_result(p.oid) as result_data_type,
        pg_catalog.pg_get_function_arguments(p.oid) as argument_data_types,
        p.prosrc as function_definition
      FROM pg_catalog.pg_proc p
      LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'supabase_functions', 'extensions', 'pgsodium', 'pgsodium_masks', 'graphql', 'graphql_public', 'vault')
      ORDER BY n.nspname, p.proname
    `,
    triggers: `
      SELECT 
        trigger_schema,
        trigger_name,
        event_manipulation,
        event_object_schema,
        event_object_table,
        action_statement,
        action_orientation,
        action_timing
      FROM information_schema.triggers
      WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema', 'supabase_functions', 'extensions', 'pgsodium', 'pgsodium_masks', 'graphql', 'graphql_public', 'vault')
      ORDER BY trigger_schema, trigger_name
    `,
    views: `
      SELECT 
        schemaname,
        viewname,
        viewowner,
        definition
      FROM pg_views
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'supabase_functions', 'extensions', 'pgsodium', 'pgsodium_masks', 'graphql', 'graphql_public', 'vault')
      ORDER BY schemaname, viewname
    `
  }

  const results = {}
  
  for (const [key, query] of Object.entries(queries)) {
    console.log(`Fetching ${key}...`)
    const { data, error } = await supabase.rpc('sql', { query })
      .catch(async () => {
        // If RPC doesn't work, try direct query
        const { data, error } = await supabase
          .from('pg_tables')
          .select('*')
          .limit(0) // Just test connection
        
        if (error) {
          console.warn(`⚠️  Cannot query ${key}: ${error.message}`)
          return { data: null, error }
        }
        
        return { data: null, error: 'RPC not available' }
      })
    
    if (error) {
      console.warn(`⚠️  Skipping ${key}: ${error}`)
      results[key] = []
    } else {
      results[key] = data || []
    }
  }

  // Generate markdown documentation
  let markdown = `# Supabase Database Schema Documentation
Generated: ${new Date().toISOString()}
Database: ${supabaseUrl}

## Table of Contents
1. [Tables](#tables)
2. [Columns](#columns)
3. [Constraints](#constraints)
4. [Indexes](#indexes)
5. [Row Level Security Policies](#row-level-security-policies)
6. [Functions](#functions)
7. [Triggers](#triggers)
8. [Views](#views)

---

## Tables

| Schema | Table Name | Owner |
|--------|------------|-------|
`

  if (results.tables?.length > 0) {
    results.tables.forEach(table => {
      markdown += `| ${table.schema_name} | ${table.table_name} | ${table.owner || 'N/A'} |\n`
    })
  } else {
    markdown += `| *No tables found or unable to query* | | |\n`
  }

  markdown += `\n## Columns\n\n`
  
  if (results.columns?.length > 0) {
    const tableGroups = {}
    results.columns.forEach(col => {
      const key = `${col.table_schema}.${col.table_name}`
      if (!tableGroups[key]) tableGroups[key] = []
      tableGroups[key].push(col)
    })

    for (const [tableName, columns] of Object.entries(tableGroups)) {
      markdown += `### ${tableName}\n\n`
      markdown += `| Column | Type | Nullable | Default |\n`
      markdown += `|--------|------|----------|----------|\n`
      columns.forEach(col => {
        let type = col.data_type
        if (col.character_maximum_length) {
          type += `(${col.character_maximum_length})`
        } else if (col.numeric_precision) {
          type += `(${col.numeric_precision}${col.numeric_scale ? `,${col.numeric_scale}` : ''})`
        }
        markdown += `| ${col.column_name} | ${type} | ${col.is_nullable} | ${col.column_default || 'NULL'} |\n`
      })
      markdown += `\n`
    }
  } else {
    markdown += `*No column information available or unable to query*\n\n`
  }

  markdown += `## Constraints\n\n`
  
  if (results.constraints?.length > 0) {
    markdown += `| Table | Constraint | Type | Column | References |\n`
    markdown += `|-------|------------|------|---------|------------|\n`
    results.constraints.forEach(con => {
      const ref = con.foreign_table_name 
        ? `${con.foreign_table_name}(${con.foreign_column_name})`
        : ''
      markdown += `| ${con.table_schema}.${con.table_name} | ${con.constraint_name} | ${con.constraint_type} | ${con.column_name || ''} | ${ref} |\n`
    })
  } else {
    markdown += `*No constraint information available or unable to query*\n`
  }

  markdown += `\n## Indexes\n\n`
  
  if (results.indexes?.length > 0) {
    markdown += `| Table | Index Name | Definition |\n`
    markdown += `|-------|------------|------------|\n`
    results.indexes.forEach(idx => {
      markdown += `| ${idx.schemaname}.${idx.tablename} | ${idx.indexname} | \`${idx.indexdef}\` |\n`
    })
  } else {
    markdown += `*No index information available or unable to query*\n`
  }

  markdown += `\n## Row Level Security Policies\n\n`
  
  if (results.policies?.length > 0) {
    markdown += `| Table | Policy | Command | Permissive | Roles |\n`
    markdown += `|-------|---------|---------|------------|--------|\n`
    results.policies.forEach(pol => {
      markdown += `| ${pol.schemaname}.${pol.tablename} | ${pol.policyname} | ${pol.cmd} | ${pol.permissive} | ${pol.roles?.join(', ') || 'ALL'} |\n`
    })
  } else {
    markdown += `*No RLS policies found or unable to query*\n`
  }

  markdown += `\n## Functions\n\n`
  
  if (results.functions?.length > 0) {
    results.functions.forEach(func => {
      markdown += `### ${func.schema_name}.${func.function_name}\n`
      markdown += `- **Arguments:** ${func.argument_data_types || 'None'}\n`
      markdown += `- **Returns:** ${func.result_data_type}\n`
      markdown += `\n`
    })
  } else {
    markdown += `*No functions found or unable to query*\n`
  }

  markdown += `\n## Triggers\n\n`
  
  if (results.triggers?.length > 0) {
    markdown += `| Table | Trigger | Event | Timing | Action |\n`
    markdown += `|-------|---------|-------|---------|--------|\n`
    results.triggers.forEach(trig => {
      markdown += `| ${trig.event_object_schema}.${trig.event_object_table} | ${trig.trigger_name} | ${trig.event_manipulation} | ${trig.action_timing} | ${trig.action_orientation} |\n`
    })
  } else {
    markdown += `*No triggers found or unable to query*\n`
  }

  markdown += `\n## Views\n\n`
  
  if (results.views?.length > 0) {
    results.views.forEach(view => {
      markdown += `### ${view.schemaname}.${view.viewname}\n`
      markdown += `\`\`\`sql\n${view.definition}\n\`\`\`\n\n`
    })
  } else {
    markdown += `*No views found or unable to query*\n`
  }

  markdown += `\n---\n\n## Notes\n\n`
  markdown += `- This schema dump was generated using Supabase client queries\n`
  markdown += `- System schemas and Supabase internal schemas are excluded\n`
  markdown += `- Some information may be limited based on database permissions\n`

  // Save to file
  const outputPath = join(__dirname, '..', 'SUPABASE_SCHEMA_SEPT032025.md')
  writeFileSync(outputPath, markdown)
  console.log(`✅ Schema documentation saved to: SUPABASE_SCHEMA_SEPT032025.md`)
  console.log(`📊 Summary:`)
  console.log(`  - Tables: ${results.tables?.length || 0}`)
  console.log(`  - Columns: ${results.columns?.length || 0}`)
  console.log(`  - Constraints: ${results.constraints?.length || 0}`)
  console.log(`  - Indexes: ${results.indexes?.length || 0}`)
  console.log(`  - Policies: ${results.policies?.length || 0}`)
  console.log(`  - Functions: ${results.functions?.length || 0}`)
  console.log(`  - Triggers: ${results.triggers?.length || 0}`)
  console.log(`  - Views: ${results.views?.length || 0}`)
}

dumpSchema().catch(console.error)