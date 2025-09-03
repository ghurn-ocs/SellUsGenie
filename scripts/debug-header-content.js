/**
 * Debug Header Content Script
 * Inspects the actual database content for the Site Header page to identify hardcoded content
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ikbcnpqpzqamihqhwirn.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYmNucHFwenFhbWlocWh3aXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxMjM0MjgsImV4cCI6MjA0MzY5OTQyOH0.4zMb3x7iAkVq9UD5E-XRSHOyRH7fqGBWDvQqvFUG9Hk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugHeaderContent() {
  console.log('🔍 Debugging Site Header content in database...');
  
  try {
    // Query the Site Header page
    const { data, error } = await supabase
      .from('page_documents')
      .select('*')
      .eq('name', 'Site Header')
      .eq('store_id', 'testingmy');
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ No Site Header page found for store testingmy');
      return;
    }
    
    const headerPage = data[0];
    console.log('📄 Site Header Page Found:', {
      id: headerPage.id,
      name: headerPage.name,
      pageType: headerPage.page_type,
      sectionsCount: headerPage.sections?.length || 0,
      isPublished: headerPage.is_published,
      createdAt: headerPage.created_at
    });
    
    // Debug sections and widgets
    if (headerPage.sections && Array.isArray(headerPage.sections)) {
      headerPage.sections.forEach((section, sIdx) => {
        console.log(`🎨 Section [${sIdx}]:`, {
          id: section.id,
          backgroundColor: section.backgroundColor,
          padding: section.padding,
          rowsCount: section.rows?.length || 0
        });
        
        if (section.rows && Array.isArray(section.rows)) {
          section.rows.forEach((row, rIdx) => {
            console.log(`  📋 Row [${sIdx}.${rIdx}]:`, {
              id: row.id,
              widgetsCount: row.widgets?.length || 0
            });
            
            if (row.widgets && Array.isArray(row.widgets)) {
              row.widgets.forEach((widget, wIdx) => {
                console.log(`    🔧 Widget [${sIdx}.${rIdx}.${wIdx}]:`, {
                  id: widget.id,
                  type: widget.type,
                  hasProps: !!widget.props,
                  propsKeys: widget.props ? Object.keys(widget.props) : [],
                  colSpan: widget.colSpan
                });
                
                // Show text widget content if it contains "Shop Now"
                if (widget.type === 'text' && widget.props && widget.props.content) {
                  const content = widget.props.content;
                  if (content.includes('Shop Now')) {
                    console.log('    🚨 FOUND "Shop Now" in text widget content:');
                    console.log('    📄 Content:', content.substring(0, 200) + '...');
                  } else {
                    console.log('    ✅ Text widget content looks clean:', content.substring(0, 100) + '...');
                  }
                }
              });
            }
          });
        }
      });
    }
    
    // Also check theme overrides
    if (headerPage.theme_overrides) {
      console.log('🎨 Theme Overrides:', headerPage.theme_overrides);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the debug script
debugHeaderContent();