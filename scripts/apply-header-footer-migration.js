#!/usr/bin/env node

/**
 * Apply Header/Footer Layout Widget Migration
 * Fixes the header and footer pages to use proper layout widgets
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔧 Header/Footer Layout Widget Migration');
console.log('=======================================');

async function checkCurrentState() {
  console.log('\n📊 Checking current header/footer pages...');
  
  const { data: headerPages, error: headerError } = await supabase
    .from('page_documents')
    .select('store_id, page_type, systemPageType, sections')
    .eq('page_type', 'header')
    .eq('systemPageType', 'header');

  const { data: footerPages, error: footerError } = await supabase
    .from('page_documents')
    .select('store_id, page_type, systemPageType, sections')
    .eq('page_type', 'footer')  
    .eq('systemPageType', 'footer');

  if (headerError || footerError) {
    console.error('❌ Error checking current state:', headerError || footerError);
    return { headerPages: [], footerPages: [] };
  }

  console.log(`✅ Found ${headerPages?.length || 0} header pages`);
  console.log(`✅ Found ${footerPages?.length || 0} footer pages`);

  // Check widget types
  headerPages?.forEach((page, index) => {
    const widgets = page.sections?.[0]?.rows?.[0]?.widgets || [];
    const widgetTypes = widgets.map(w => w.type).join(', ');
    console.log(`   Header ${index + 1}: [${widgetTypes}]`);
  });

  footerPages?.forEach((page, index) => {
    const widgets = page.sections?.[0]?.rows?.[0]?.widgets || [];
    const widgetTypes = widgets.map(w => w.type).join(', ');
    console.log(`   Footer ${index + 1}: [${widgetTypes}]`);
  });

  return { headerPages: headerPages || [], footerPages: footerPages || [] };
}

async function applyHeaderMigration() {
  console.log('\n🔝 Applying header layout widget migration...');

  const headerLayoutSection = [{
    id: "header-section-1",
    backgroundColor: "#ffffff",
    padding: "py-0 px-0",
    rows: [{
      id: "header-row-1",
      widgets: [{
        id: "header-layout-widget",
        type: "header-layout",
        colSpan: { sm: 12, md: 12, lg: 12 },
        props: {
          layout: "logo-left",
          height: "standard",
          logo: {
            type: "text",
            text: null,
            position: "left",
            size: "medium"
          },
          navigation: {
            enabled: true,
            position: "center",
            style: "horizontal",
            links: [
              { id: "1", label: "Home", href: "/", type: "internal" },
              { id: "2", label: "Shop", href: "/products", type: "internal" },
              { id: "3", label: "About", href: "/about", type: "internal" },
              { id: "4", label: "Contact", href: "/contact", type: "internal" }
            ],
            autoDetectPages: false
          },
          cart: {
            enabled: true,
            position: "right",
            style: "icon",
            showCount: true,
            behavior: "sidebar"
          },
          styling: {
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            linkColor: "#0066cc",
            linkHoverColor: "#004499",
            borderBottom: true,
            sticky: false,
            shadow: "sm"
          },
          responsive: {
            mobile: {
              showLogo: true,
              showNavigation: true,
              navigationStyle: "hamburger",
              showCart: true
            },
            tablet: {
              showLogo: true,
              showNavigation: true,
              showCart: true
            }
          }
        }
      }]
    }]
  }];

  const { data, error } = await supabase
    .from('page_documents')
    .update({
      sections: headerLayoutSection,
      updated_at: new Date().toISOString()
    })
    .eq('page_type', 'header')
    .eq('systemPageType', 'header')
    .select();

  if (error) {
    console.error('❌ Error updating header pages:', error);
    return false;
  }

  console.log(`✅ Updated ${data?.length || 0} header pages`);
  return true;
}

async function applyFooterMigration() {
  console.log('\n🦶 Applying footer layout widget migration...');

  const footerLayoutSection = [{
    id: "footer-section-1",
    backgroundColor: "#f8f9fa",
    padding: "py-12 px-4",
    rows: [{
      id: "footer-row-1",
      widgets: [{
        id: "footer-layout-widget",
        type: "footer-layout",
        colSpan: { sm: 12, md: 12, lg: 12 },
        props: {
          layout: "three-column",
          company: {
            name: null,
            description: null,
            logo: { showText: true }
          },
          contact: {
            enabled: false,
            email: null,
            phone: null,
            address: null,
            showIcons: true
          },
          navigation: {
            enabled: true,
            useColumnSystem: true,
            columns: [
              {
                id: "1",
                title: "Shop",
                links: [
                  { id: "1", label: "All Products", href: "/products", type: "internal" },
                  { id: "2", label: "Featured", href: "/featured", type: "internal" },
                  { id: "3", label: "Sale Items", href: "/sale", type: "internal" }
                ]
              },
              {
                id: "2",
                title: "Company",
                links: [
                  { id: "1", label: "About Us", href: "/about", type: "internal" },
                  { id: "2", label: "Contact", href: "/contact", type: "internal" },
                  { id: "3", label: "Careers", href: "/careers", type: "internal" }
                ]
              }
            ],
            autoDetectPages: false
          },
          social: {
            enabled: false,
            platforms: [],
            showLabels: false,
            position: "bottom"
          },
          newsletter: {
            enabled: false,
            title: null,
            description: null,
            placeholder: "Enter your email",
            buttonText: "Subscribe"
          },
          legal: {
            enabled: true,
            links: [
              { id: "1", label: "Privacy Policy", href: "/privacy" },
              { id: "2", label: "Terms of Service", href: "/terms" },
              { id: "3", label: "Cookie Policy", href: "/cookies" }
            ],
            showYear: true
          },
          styling: {
            backgroundColor: "#f8f9fa",
            textColor: "#000000",
            linkColor: "#0066cc",
            linkHoverColor: "#004499",
            borderTop: true,
            padding: "standard"
          },
          responsive: {
            mobile: {
              layout: "stacked",
              showAllSections: true
            }
          }
        }
      }]
    }]
  }];

  const { data, error } = await supabase
    .from('page_documents')
    .update({
      sections: footerLayoutSection,
      updated_at: new Date().toISOString()
    })
    .eq('page_type', 'footer')
    .eq('systemPageType', 'footer')
    .select();

  if (error) {
    console.error('❌ Error updating footer pages:', error);
    return false;
  }

  console.log(`✅ Updated ${data?.length || 0} footer pages`);
  return true;
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration results...');
  
  const { headerPages, footerPages } = await checkCurrentState();
  
  const headerSuccess = headerPages.every(page => {
    const widgets = page.sections?.[0]?.rows?.[0]?.widgets || [];
    return widgets.some(w => w.type === 'header-layout');
  });

  const footerSuccess = footerPages.every(page => {
    const widgets = page.sections?.[0]?.rows?.[0]?.widgets || [];
    return widgets.some(w => w.type === 'footer-layout');
  });

  if (headerSuccess && footerSuccess) {
    console.log('🎉 Migration completed successfully!');
    console.log('   ✅ All header pages now use header-layout widgets');
    console.log('   ✅ All footer pages now use footer-layout widgets');
    return true;
  } else {
    console.log('⚠️  Migration partially completed');
    if (!headerSuccess) console.log('   ❌ Some header pages still missing header-layout widgets');
    if (!footerSuccess) console.log('   ❌ Some footer pages still missing footer-layout widgets');
    return false;
  }
}

async function runMigration() {
  try {
    // Check current state
    await checkCurrentState();
    
    // Apply migrations
    const headerSuccess = await applyHeaderMigration();
    const footerSuccess = await applyFooterMigration();
    
    if (!headerSuccess || !footerSuccess) {
      console.log('❌ Migration failed');
      process.exit(1);
    }
    
    // Verify results
    const success = await verifyMigration();
    
    if (success) {
      console.log('\n🚀 Next Steps:');
      console.log('1. Refresh your storefront to see the header and footer');
      console.log('2. Header content will dynamically use store name/logo from Supabase');
      console.log('3. Footer will use column configuration from store settings');
      process.exit(0);
    } else {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Migration failed with error:', error);
    process.exit(1);
  }
}

runMigration();