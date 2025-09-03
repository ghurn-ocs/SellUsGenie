/**
 * Recreate About Us Page Utility
 * Recreates a missing About Us page for a specific user/store
 */

import { supabase } from '../lib/supabase';
import { SupabasePageRepository } from '../pageBuilder/data/SupabasePageRepository';
import type { PageDocument } from '../pageBuilder/types';

interface RecreatePageResult {
  success: boolean;
  message: string;
  pageId?: string;
}

/**
 * Recreate About Us page for a specific user by email
 */
export async function recreateAboutUsPageByEmail(userEmail: string): Promise<RecreatePageResult> {
  try {
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // First, find the user by email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: `User not found: ${userEmail}. Error: ${userError?.message || 'Unknown error'}`
      };
    }

    console.log(`✅ Found user ID: ${user.id}`);

    // Find the user's store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, store_name')
      .eq('store_owner_id', user.id)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        message: `Store not found for user ${userEmail}. Error: ${storeError?.message || 'Unknown error'}`
      };
    }

    console.log(`✅ Found store: ${store.store_name} (ID: ${store.id})`);

    // Check if About Us page already exists
    const { data: existingPage, error: checkError } = await supabase
      .from('page_documents')
      .select('id, name')
      .eq('store_id', store.id)
      .eq('name', 'About Us')
      .single();

    if (existingPage) {
      return {
        success: false,
        message: `About Us page already exists for ${store.store_name} (Page ID: ${existingPage.id})`
      };
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing page:', checkError);
    }

    console.log(`✅ No existing About Us page found. Creating new one...`);

    // Create the About Us page using the repository
    const repository = new SupabasePageRepository(store.id);
    const aboutPageContent: PageDocument = {
      id: crypto.randomUUID(),
      name: 'About Us',
      slug: '/about',
      version: 1,
      // About Us content comes from Settings->Policies
      isSystemPage: true,
      systemPageType: 'about',
      editingRestrictions: {
        readOnly: true,
        settingsMessage: 'About Us content is managed in Settings → Policies. Changes made there will automatically appear on this page.'
      },
      sections: [{
        id: crypto.randomUUID(),
        title: 'About Section',
        padding: 'py-16 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 10, lg: 8 },
            props: {
              content: `<div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">About ${store.store_name}</h1>
                <div class="prose prose-lg text-gray-700 space-y-6">
                  <p>Welcome to ${store.store_name}, where quality meets exceptional service. We are committed to providing our customers with the finest products and an outstanding shopping experience.</p>
                  
                  <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
                  <p>To deliver exceptional products and services that exceed our customers' expectations while building lasting relationships based on trust and reliability.</p>
                  
                  <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
                  <ul class="list-disc pl-6 space-y-2">
                    <li>High-quality products carefully selected for you</li>
                    <li>Exceptional customer service and support</li>
                    <li>Fast and reliable shipping</li>
                    <li>Secure and easy shopping experience</li>
                    <li>100% satisfaction guarantee</li>
                  </ul>
                  
                  <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Get in Touch</h2>
                  <p>Have questions or need assistance? We're here to help! Contact us anytime and we'll be happy to assist you with your needs.</p>
                  
                  <p class="text-center mt-8 text-gray-600"><em>This content can be customized in Settings → Policies → About Us</em></p>
                </div>
              </div>`
            }
          }]
        }]
      }],
      status: 'published',
      themeOverrides: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      seo: {
        metaTitle: `About Us - ${store.store_name}`,
        metaDescription: `Learn more about ${store.store_name}, our mission, values, and commitment to providing exceptional products and service to our customers.`,
        metaKeywords: `about us, ${store.store_name}, company info, mission, values`,
        openGraphTitle: `About Us - ${store.store_name}`,
        openGraphDescription: `Discover the story behind ${store.store_name} and what makes us different.`,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          'name': `About ${store.store_name}`,
          'description': `Learn about ${store.store_name} and our commitment to quality.`
        }
      }
    };

    // Save and publish the page
    await repository.saveDraft(aboutPageContent);
    await repository.publish(aboutPageContent.id);

    console.log(`✅ About Us page created and published for ${store.store_name}`);

    return {
      success: true,
      message: `About Us page successfully recreated for ${store.store_name} (${userEmail})`,
      pageId: aboutPageContent.id
    };

  } catch (error) {
    console.error('❌ Failed to recreate About Us page:', error);
    return {
      success: false,
      message: `Failed to recreate About Us page: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Recreate About Us page for a specific store by store ID
 */
export async function recreateAboutUsPageByStoreId(storeId: string): Promise<RecreatePageResult> {
  try {
    console.log(`🔍 Looking for store: ${storeId}`);
    
    // Get store information
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, store_name')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        message: `Store not found: ${storeId}. Error: ${storeError?.message || 'Unknown error'}`
      };
    }

    console.log(`✅ Found store: ${store.store_name}`);

    // Check if About Us page already exists
    const { data: existingPage } = await supabase
      .from('page_documents')
      .select('id, name')
      .eq('store_id', store.id)
      .eq('name', 'About Us')
      .single();

    if (existingPage) {
      return {
        success: false,
        message: `About Us page already exists for ${store.store_name} (Page ID: ${existingPage.id})`
      };
    }

    // Use the same creation logic as above
    const repository = new SupabasePageRepository(store.id);
    const aboutPageContent: PageDocument = {
      id: crypto.randomUUID(),
      name: 'About Us',
      slug: '/about',
      version: 1,
      isSystemPage: true,
      systemPageType: 'about',
      editingRestrictions: {
        readOnly: true,
        settingsMessage: 'About Us content is managed in Settings → Policies. Changes made there will automatically appear on this page.'
      },
      sections: [{
        id: crypto.randomUUID(),
        title: 'About Section',
        padding: 'py-16 px-4',
        rows: [{
          id: crypto.randomUUID(),
          widgets: [{
            id: crypto.randomUUID(),
            type: 'text',
            version: 1,
            colSpan: { sm: 12, md: 10, lg: 8 },
            props: {
              content: `<div class="max-w-4xl mx-auto">
                <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">About ${store.store_name}</h1>
                <div class="prose prose-lg text-gray-700 space-y-6">
                  <p>Welcome to ${store.store_name}, where quality meets exceptional service. We are committed to providing our customers with the finest products and an outstanding shopping experience.</p>
                  
                  <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
                  <p>To deliver exceptional products and services that exceed our customers' expectations while building lasting relationships based on trust and reliability.</p>
                  
                  <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
                  <ul class="list-disc pl-6 space-y-2">
                    <li>High-quality products carefully selected for you</li>
                    <li>Exceptional customer service and support</li>
                    <li>Fast and reliable shipping</li>
                    <li>Secure and easy shopping experience</li>
                    <li>100% satisfaction guarantee</li>
                  </ul>
                  
                  <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Get in Touch</h2>
                  <p>Have questions or need assistance? We're here to help! Contact us anytime and we'll be happy to assist you with your needs.</p>
                  
                  <p class="text-center mt-8 text-gray-600"><em>This content can be customized in Settings → Policies → About Us</em></p>
                </div>
              </div>`
            }
          }]
        }]
      }],
      status: 'published',
      themeOverrides: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      seo: {
        metaTitle: `About Us - ${store.store_name}`,
        metaDescription: `Learn more about ${store.store_name}, our mission, values, and commitment to providing exceptional products and service to our customers.`,
        metaKeywords: `about us, ${store.store_name}, company info, mission, values`,
        openGraphTitle: `About Us - ${store.store_name}`,
        openGraphDescription: `Discover the story behind ${store.store_name} and what makes us different.`,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          'name': `About ${store.store_name}`,
          'description': `Learn about ${store.store_name} and our commitment to quality.`
        }
      }
    };

    await repository.saveDraft(aboutPageContent);
    await repository.publish(aboutPageContent.id);

    return {
      success: true,
      message: `About Us page successfully recreated for ${store.store_name}`,
      pageId: aboutPageContent.id
    };

  } catch (error) {
    console.error('❌ Failed to recreate About Us page:', error);
    return {
      success: false,
      message: `Failed to recreate About Us page: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}