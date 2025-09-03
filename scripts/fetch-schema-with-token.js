#!/usr/bin/env node

/**
 * Fetch database schema using Supabase Management API
 */

import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_ACCESS_TOKEN = 'sbp_58f422e7754d030b87a1d2d8cceae1d97b306529';
const PROJECT_REF = 'jizobmpcyrzprrwsyedv';

async function fetchDatabaseSchema() {
  console.log('🔍 Fetching database schema using Supabase Management API...');

  try {
    // Get database settings first
    const settingsResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!settingsResponse.ok) {
      const error = await settingsResponse.text();
      console.error('Failed to fetch database settings:', error);
    } else {
      const settings = await settingsResponse.json();
      console.log('Database settings retrieved:', settings.host);
    }

    // Try to run a schema query through the API
    const queryResponse = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
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
            WHERE table_schema IN ('public', 'auth')
            ORDER BY table_schema, table_name, ordinal_position
          `
        })
      }
    );

    if (!queryResponse.ok) {
      const error = await queryResponse.text();
      console.error('Failed to run query:', error);
      
      // Alternative: Try to get table list through another endpoint
      console.log('Trying alternative method...');
      
      const tablesResponse = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/tables`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (tablesResponse.ok) {
        const tables = await tablesResponse.json();
        console.log('Tables found:', tables.length);
        return tables;
      }
    } else {
      const result = await queryResponse.json();
      console.log('Schema query successful');
      return result;
    }

  } catch (error) {
    console.error('Error fetching schema:', error);
    throw error;
  }
}

async function main() {
  try {
    const schema = await fetchDatabaseSchema();
    
    // Save raw data for inspection
    const outputPath = join(__dirname, '..', 'supabase-schema-raw.json');
    writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    console.log(`✅ Raw schema data saved to: supabase-schema-raw.json`);
    
    // Generate markdown if we got column data
    if (schema && Array.isArray(schema)) {
      let markdown = `# Supabase Database Schema (API Dump)
Generated: ${new Date().toISOString()}
Project: ${PROJECT_REF}

## Tables and Columns

`;
      
      // Group by table
      const tables = {};
      schema.forEach(col => {
        const key = `${col.table_schema}.${col.table_name}`;
        if (!tables[key]) tables[key] = [];
        tables[key].push(col);
      });
      
      for (const [tableName, columns] of Object.entries(tables)) {
        markdown += `### ${tableName}\n\n`;
        markdown += `| Column | Type | Nullable | Default |\n`;
        markdown += `|--------|------|----------|----------|\n`;
        columns.forEach(col => {
          let type = col.data_type;
          if (col.character_maximum_length) {
            type += `(${col.character_maximum_length})`;
          } else if (col.numeric_precision) {
            type += `(${col.numeric_precision}${col.numeric_scale ? `,${col.numeric_scale}` : ''})`;
          }
          markdown += `| ${col.column_name} | ${type} | ${col.is_nullable} | ${col.column_default || 'NULL'} |\n`;
        });
        markdown += `\n`;
      }
      
      const mdPath = join(__dirname, '..', 'SUPABASE_SCHEMA_API_DUMP.md');
      writeFileSync(mdPath, markdown);
      console.log(`✅ Schema markdown saved to: SUPABASE_SCHEMA_API_DUMP.md`);
    }
    
  } catch (error) {
    console.error('Failed to fetch schema:', error);
    process.exit(1);
  }
}

main();