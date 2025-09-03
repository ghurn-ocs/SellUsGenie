/**
 * Test Utility: Publish and Navigation Flow
 * Tests the complete reconstruct publish function and navigation system
 */

import { SupabasePageRepository } from '../pageBuilder/data/SupabasePageRepository';
import { NavigationManager } from '../pageBuilder/navigation/NavigationManager';
// import type { PageDocument } from '../pageBuilder/types';

interface TestResult {
  success: boolean;
  message: string;
  details?: unknown;
}

export async function testPublishAndNavigation(storeId: string): Promise<{
  overall: boolean;
  results: TestResult[];
}> {
  const results: TestResult[] = [];
  let overall = true;
  
  try {
    console.log('🧪 STARTING publish and navigation test for store:', storeId);
    
    const repository = new SupabasePageRepository(storeId);
    const navigationManager = new NavigationManager();
    
    // Test 1: Load all pages
    console.log('\n📋 TEST 1: Loading all pages');
    const allPages = await repository.listPages();
    results.push({
      success: true,
      message: `Loaded ${allPages.length} total pages`,
      details: allPages.map(p => ({ name: p.name, slug: p.slug, status: p.status }))
    });
    
    // Test 2: Check for pages without slugs
    console.log('\n🔍 TEST 2: Checking for pages without slugs');
    const pagesWithoutSlugs = allPages.filter(p => !p.slug);
    if (pagesWithoutSlugs.length > 0) {
      results.push({
        success: false,
        message: `Found ${pagesWithoutSlugs.length} pages without slugs`,
        details: pagesWithoutSlugs.map(p => ({ id: p.id, name: p.name, status: p.status }))
      });
      overall = false;
    } else {
      results.push({
        success: true,
        message: 'All pages have slugs'
      });
    }
    
    // Test 3: Test publish function on draft pages
    console.log('\n🚀 TEST 3: Testing publish function');
    const draftPages = allPages.filter(p => p.status === 'draft');
    
    if (draftPages.length > 0) {
      // Test publish on first draft page
      const testPage = draftPages[0];
      console.log(`Publishing test page: ${testPage.name} (${testPage.id})`);
      
      try {
        await repository.publish(testPage.id);
        
        // Verify publish worked
        const publishedPage = await repository.getPage(testPage.id);
        if (publishedPage && publishedPage.status === 'published' && publishedPage.slug) {
          results.push({
            success: true,
            message: `Successfully published page: ${testPage.name}`,
            details: {
              id: publishedPage.id,
              name: publishedPage.name,
              slug: publishedPage.slug,
              status: publishedPage.status
            }
          });
        } else {
          results.push({
            success: false,
            message: `Publish failed for page: ${testPage.name}`,
            details: {
              expectedStatus: 'published',
              actualStatus: publishedPage?.status,
              expectedSlug: 'defined',
              actualSlug: publishedPage?.slug
            }
          });
          overall = false;
        }
      } catch (error) {
        results.push({
          success: false,
          message: `Publish error for page: ${testPage.name}`,
          details: { error: error.message }
        });
        overall = false;
      }
    } else {
      results.push({
        success: true,
        message: 'No draft pages to test publishing'
      });
    }
    
    // Test 4: Test navigation generation
    console.log('\n🧭 TEST 4: Testing navigation generation');
    const publishedPages = allPages.filter(p => p.status === 'published');
    
    if (publishedPages.length > 0) {
      const navigation = navigationManager.generateNavigation(publishedPages, {});
      
      results.push({
        success: true,
        message: `Generated navigation with ${navigation.header.length} header items and ${navigation.footer.length} footer items`,
        details: {
          headerItems: navigation.header.map(item => ({ name: item.name, slug: item.slug })),
          footerItems: navigation.footer.map(item => ({ name: item.name, slug: item.slug }))
        }
      });
      
      // Test 5: Check for navigation items without slugs
      console.log('\n🔗 TEST 5: Checking navigation items for missing slugs');
      const allNavItems = [...navigation.header, ...navigation.footer];
      const navItemsWithoutSlugs = allNavItems.filter(item => !item.slug);
      
      if (navItemsWithoutSlugs.length > 0) {
        results.push({
          success: false,
          message: `Found ${navItemsWithoutSlugs.length} navigation items without slugs`,
          details: navItemsWithoutSlugs.map(item => ({ id: item.id, name: item.name }))
        });
        overall = false;
      } else {
        results.push({
          success: true,
          message: 'All navigation items have slugs'
        });
      }
    } else {
      results.push({
        success: true,
        message: 'No published pages to generate navigation'
      });
    }
    
    console.log('\n✅ TEST COMPLETE');
    
  } catch (error) {
    console.error('💥 TEST FAILED:', error);
    results.push({
      success: false,
      message: `Test suite failed: ${error.message}`,
      details: { error }
    });
    overall = false;
  }
  
  return { overall, results };
}

export async function quickSlugCheck(storeId: string): Promise<void> {
  console.log('🔍 QUICK SLUG CHECK for store:', storeId);
  
  const repository = new SupabasePageRepository(storeId);
  const pages = await repository.listPages();
  
  console.log(`\n📊 SLUG STATUS REPORT:`);
  console.log(`Total pages: ${pages.length}`);
  
  const pagesWithSlugs = pages.filter(p => p.slug);
  const pagesWithoutSlugs = pages.filter(p => !p.slug);
  const publishedPages = pages.filter(p => p.status === 'published');
  const publishedPagesWithSlugs = publishedPages.filter(p => p.slug);
  
  console.log(`Pages with slugs: ${pagesWithSlugs.length}`);
  console.log(`Pages without slugs: ${pagesWithoutSlugs.length}`);
  console.log(`Published pages: ${publishedPages.length}`);
  console.log(`Published pages with slugs: ${publishedPagesWithSlugs.length}`);
  
  if (pagesWithoutSlugs.length > 0) {
    console.log('\n❌ PAGES WITHOUT SLUGS:');
    pagesWithoutSlugs.forEach(page => {
      console.log(`  - "${page.name}" (${page.status}) [ID: ${page.id}]`);
    });
  }
  
  if (publishedPages.length > 0) {
    console.log('\n📄 PUBLISHED PAGES:');
    publishedPages.forEach(page => {
      console.log(`  - "${page.name}" → "${page.slug}" (${page.status})`);
    });
  }
}