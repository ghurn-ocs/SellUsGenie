#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔧 Direct Update Migration');
console.log('==========================');

async function directUpdate() {
  // First, get the exact IDs
  const { data: pages } = await supabase
    .from('page_documents')
    .select('id, name, sections')
    .in('name', ['Site Header', 'Site Footer']);

  console.log('\n📄 Found pages:');
  pages?.forEach(page => {
    console.log(`- ${page.name}: ${page.id}`);
  });

  const headerPage = pages?.find(p => p.name === 'Site Header');
  const footerPage = pages?.find(p => p.name === 'Site Footer');

  if (!headerPage || !footerPage) {
    console.log('❌ Could not find header or footer pages');
    return;
  }

  // Header layout widget data
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

  // Footer layout widget data
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

  console.log('\n🔝 Updating header by ID...');
  console.log('Current header widgets:', headerPage.sections?.[0]?.rows?.[0]?.widgets?.map(w => w.type).join(', '));
  
  const { data: headerResult, error: headerError } = await supabase
    .from('page_documents')
    .update({ sections: headerLayoutSection })
    .eq('id', headerPage.id)
    .select();

  if (headerError) {
    console.error('❌ Header error:', headerError);
  } else {
    console.log('✅ Header updated:', headerResult?.length, 'rows');
  }

  console.log('\n🦶 Updating footer by ID...');
  console.log('Current footer widgets:', footerPage.sections?.[0]?.rows?.[0]?.widgets?.map(w => w.type).join(', '));
  
  const { data: footerResult, error: footerError } = await supabase
    .from('page_documents') 
    .update({ sections: footerLayoutSection })
    .eq('id', footerPage.id)
    .select();

  if (footerError) {
    console.error('❌ Footer error:', footerError);
  } else {
    console.log('✅ Footer updated:', footerResult?.length, 'rows');
  }

  // Final verification
  console.log('\n🔍 Final verification...');
  const { data: finalPages } = await supabase
    .from('page_documents')
    .select('name, sections')
    .in('name', ['Site Header', 'Site Footer']);

  finalPages?.forEach(page => {
    const widgets = page.sections?.[0]?.rows?.[0]?.widgets || [];
    const widgetTypes = widgets.map(w => w.type).join(', ');
    console.log(`   ${page.name}: [${widgetTypes}]`);
  });
}

directUpdate().catch(console.error);