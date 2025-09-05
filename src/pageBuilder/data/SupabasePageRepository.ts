/**
 * Supabase Page Repository
 * Implements PageRepository interface with Supabase backend
 */

import { supabase } from '../../lib/supabase';
import type { PageDocument, PageTemplate, PageRepository } from '../types';

export class SupabasePageRepository implements PageRepository {
  constructor(private storeId: string) {}

  async getPage(id: string): Promise<PageDocument | null> {
    try {
      const { data, error } = await supabase
        .from('page_documents')
        .select('*')
        .eq('id', id)
        .eq('store_id', this.storeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        version: data.version,
        sections: data.sections || [],
        themeOverrides: data.theme_overrides || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        status: data.status,
        publishedAt: data.published_at,
        scheduledFor: data.scheduled_for,
        seo: data.seo || {},
        analytics: data.analytics || {},
        performance: data.performance || {},
        accessibility: data.accessibility || {},
        customCode: data.custom_code || {},
        globalStyles: data.global_styles || {},
        // System page properties
        pageType: data.page_type,
        isSystemPage: data["isSystemPage"],
        systemPageType: data["systemPageType"],
        editingRestrictions: data.editingRestrictions,
        navigationPlacement: data.navigation_placement,
        footerColumn: data.footer_column,
        history: [] // History loaded separately if needed
      };
    } catch (error) {
      console.error('Error getting page:', error);
      throw error;
    }
  }

  async saveDraft(doc: PageDocument): Promise<void> {
    try {
      const { error } = await supabase
        .from('page_documents')
        .upsert({
          id: doc.id,
          store_id: this.storeId,
          name: doc.name,
          slug: doc.slug,
          version: doc.version,
          sections: doc.sections,
          theme_overrides: doc.themeOverrides || {},
          status: 'draft',
          seo: doc.seo || {},
          analytics: doc.analytics || {},
          performance: doc.performance || {},
          accessibility: doc.accessibility || {},
          custom_code: doc.customCode || {},
          global_styles: doc.globalStyles || {},
          // System page properties
          page_type: doc.pageType || 'page',
          "isSystemPage": doc.isSystemPage || false,
          "systemPageType": doc.systemPageType || null,
          editingRestrictions: doc.editingRestrictions || null,
          navigation_placement: doc.navigationPlacement || 'both',
          footer_column: doc.footerColumn || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  async publish(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('page_documents')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('store_id', this.storeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error publishing page:', error);
      throw error;
    }
  }

  async listPages(): Promise<PageDocument[]> {
    try {
      const { data, error } = await supabase
        .from('page_documents')
        .select('*')
        .eq('store_id', this.storeId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        version: item.version,
        sections: item.sections || [],
        themeOverrides: item.theme_overrides || {},
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        status: item.status,
        publishedAt: item.published_at,
        scheduledFor: item.scheduled_for,
        seo: item.seo || {},
        analytics: item.analytics || {},
        performance: item.performance || {},
        accessibility: item.accessibility || {},
        customCode: item.custom_code || {},
        globalStyles: item.global_styles || {},
        // System page properties
        pageType: item.page_type,
        isSystemPage: item["isSystemPage"],
        systemPageType: item["systemPageType"],
        editingRestrictions: item.editingRestrictions,
        navigationPlacement: item.navigation_placement,
        footerColumn: item.footer_column,
        history: []
      }));
    } catch (error) {
      console.error('Error listing pages:', error);
      throw error;
    }
  }

  async createPage(name: string, template?: PageTemplate): Promise<PageDocument> {
    const now = new Date().toISOString();
    const newPage: PageDocument = template ? {
      ...template.document,
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now,
      status: 'draft'
    } : {
      id: crypto.randomUUID(),
      name,
      version: 1,
      sections: [{
        id: crypto.randomUUID(),
        title: 'Main Section',
        rows: [{
          id: crypto.randomUUID(),
          widgets: []
        }]
      }],
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      seo: {
        metaTitle: name,
        metaDescription: '',
      },
      analytics: {
        trackingId: '',
        events: [],
        heatmap: false,
        scrollTracking: true,
      },
      performance: {
        lazyLoading: true,
        imageOptimization: true,
        minifyCSS: true,
        minifyJS: true,
      },
      accessibility: {
        altTextRequired: true,
        contrastChecking: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
    };

    await this.saveDraft(newPage);
    return newPage;
  }

  async getVersion(id: string, versionId: string): Promise<PageDocument | null> {
    try {
      const { data, error } = await supabase
        .from('page_history')
        .select('snapshot')
        .eq('page_id', id)
        .eq('id', versionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data.snapshot as PageDocument;
    } catch (error) {
      console.error('Error getting page version:', error);
      throw error;
    }
  }

  async restoreVersion(id: string, versionId: string): Promise<void> {
    try {
      const versionDoc = await this.getVersion(id, versionId);
      if (!versionDoc) {
        throw new Error('Version not found');
      }

      // Save current version to history
      const currentDoc = await this.getPage(id);
      if (currentDoc) {
        await this.saveToHistory(currentDoc, 'Backup before version restore');
      }

      // Restore the version
      const restoredDoc = {
        ...versionDoc,
        id, // Keep the same ID
        version: (currentDoc?.version || 0) + 1,
        updatedAt: new Date().toISOString(),
        status: 'draft' as const
      };

      await this.saveDraft(restoredDoc);
    } catch (error) {
      console.error('Error restoring version:', error);
      throw error;
    }
  }

  async deletePage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('page_documents')
        .delete()
        .eq('id', id)
        .eq('store_id', this.storeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }

  private async saveToHistory(doc: PageDocument, note?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('page_history')
        .insert({
          page_id: doc.id,
          version: doc.version,
          author_id: (await supabase.auth.getUser()).data.user?.id,
          note: note || `Version ${doc.version}`,
          snapshot: doc
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving to history:', error);
      // Don't throw here as this is not critical
    }
  }

  // Get the active storefront page for a store
  async getStorefrontPage(): Promise<PageDocument | null> {
    try {
      const { data, error } = await supabase
        .from('store_page_layouts')
        .select(`
          page_document_id,
          page_documents (*)
        `)
        .eq('store_id', this.storeId)
        .eq('page_type', 'storefront')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No active storefront page
        }
        throw error;
      }

      const pageData = (data as any).page_documents;
      if (!pageData) return null;

      return {
        id: pageData.id,
        name: pageData.name,
        slug: pageData.slug,
        version: pageData.version,
        sections: pageData.sections || [],
        themeOverrides: pageData.theme_overrides || {},
        createdAt: pageData.created_at,
        updatedAt: pageData.updated_at,
        status: pageData.status,
        publishedAt: pageData.published_at,
        scheduledFor: pageData.scheduled_for,
        seo: pageData.seo || {},
        analytics: pageData.analytics || {},
        performance: pageData.performance || {},
        accessibility: pageData.accessibility || {},
        customCode: pageData.custom_code || {},
        globalStyles: pageData.global_styles || {},
        // System page properties
        pageType: pageData.page_type,
        isSystemPage: pageData.isSystemPage,
        systemPageType: pageData.systemPageType,
        editingRestrictions: pageData.editingRestrictions,
        navigationPlacement: pageData.navigation_placement,
        footerColumn: pageData.footer_column,
        history: []
      };
    } catch (error) {
      console.error('Error getting storefront page:', error);
      throw error;
    }
  }

  // Set a page as the active storefront page
  async setStorefrontPage(pageId: string): Promise<void> {
    try {
      // First, deactivate any existing storefront page
      await supabase
        .from('store_page_layouts')
        .update({ is_active: false })
        .eq('store_id', this.storeId)
        .eq('page_type', 'storefront');

      // Then activate the new one
      const { error } = await supabase
        .from('store_page_layouts')
        .upsert({
          store_id: this.storeId,
          page_type: 'storefront',
          page_document_id: pageId,
          is_active: true
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting storefront page:', error);
      throw error;
    }
  }

  async getPageBySlug(slug: string): Promise<PageDocument | null> {
    try {
      // Normalize slug: ensure it starts with / (or is just / for home)
      let normalizedSlug = slug;
      if (slug === '' || slug === null) {
        normalizedSlug = '/';
      } else if (!slug.startsWith('/')) {
        normalizedSlug = `/${slug}`;
      }
      
      const { data, error } = await supabase
        .from('page_documents')
        .select('*')
        .eq('store_id', this.storeId)
        .eq('slug', normalizedSlug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        version: data.version,
        sections: data.sections || [],
        themeOverrides: data.theme_overrides || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        status: data.status,
        publishedAt: data.published_at,
        scheduledFor: data.scheduled_for,
        seo: data.seo || {},
        analytics: data.analytics || {},
        performance: data.performance || {},
        accessibility: data.accessibility || {},
        customCode: data.custom_code || {},
        globalStyles: data.global_styles || {},
        // System page properties
        pageType: data.page_type,
        isSystemPage: data["isSystemPage"],
        systemPageType: data["systemPageType"],
        editingRestrictions: data.editingRestrictions,
        navigationPlacement: data.navigation_placement,
        footerColumn: data.footer_column,
        history: []
      };
    } catch (error) {
      console.error('Error getting page by slug:', error);
      throw error;
    }
  }

  /**
   * List system pages (header/footer) for the current store
   */
  async listSystemPages(): Promise<{ header: PageDocument | null; footer: PageDocument | null }> {
    try {
      console.log('🔍 Listing system pages for store:', this.storeId);
      
      const { data, error } = await supabase
        .from('page_documents')
        .select('*')
        .eq('store_id', this.storeId)
        .in('page_type', ['header', 'footer']);

      if (error) {
        console.error('❌ Error listing system pages:', error);
        throw error;
      }

      const pages = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        version: item.version,
        sections: item.sections || [],
        themeOverrides: item.theme_overrides || {},
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        status: item.status,
        publishedAt: item.published_at,
        scheduledFor: item.scheduled_for,
        seo: item.seo || {},
        analytics: item.analytics || {},
        performance: item.performance || {},
        accessibility: item.accessibility || {},
        customCode: item.custom_code || {},
        globalStyles: item.global_styles || {},
        // System page properties
        pageType: item.page_type,
        isSystemPage: item["isSystemPage"],
        systemPageType: item["systemPageType"],
        editingRestrictions: item.editingRestrictions,
        navigationPlacement: item.navigation_placement,
        footerColumn: item.footer_column,
        history: []
      }));

      const result = {
        header: pages.find((p: any) => p.pageType === 'header') || null,
        footer: pages.find((p: any) => p.pageType === 'footer') || null
      };

      console.log('✅ System pages loaded:', {
        hasHeader: !!result.header,
        hasFooter: !!result.footer,
        headerName: result.header?.name,
        footerName: result.footer?.name
      });

      return result;
    } catch (error) {
      console.error('❌ Error listing system pages:', error);
      throw error;
    }
  }

  /**
   * Create a system page (header or footer)
   */
  async createSystemPage(pageType: 'header' | 'footer'): Promise<PageDocument> {
    try {
      console.log(`🔧 Creating ${pageType} system page for store:`, this.storeId);

      // Check if a system page of this type already exists
      const existing = await this.listSystemPages();
      if (existing[pageType]) {
        throw new Error(`A ${pageType} page already exists for this store`);
      }

      const now = new Date().toISOString();
      const pageId = crypto.randomUUID();
      
      const systemPageName = pageType === 'header' ? 'Site Header' : 'Site Footer';
      
      // Create basic system page structure
      const newPage: PageDocument = {
        id: pageId,
        name: systemPageName,
        slug: undefined, // System pages don't have slugs
        version: 1,
        pageType: pageType,
        isSystemPage: true,
        systemPageType: pageType,
        status: 'published', // System pages are published by default
        sections: [{
          id: crypto.randomUUID(),
          title: `${systemPageName} Section`,
          rows: [{
            id: crypto.randomUUID(),
            widgets: [{
              id: crypto.randomUUID(),
              type: 'text',
              version: 1,
              colSpan: { sm: 12, md: 12, lg: 12 },
              props: {
                content: pageType === 'header' 
                  ? `<div class="bg-white border-b border-gray-200 py-4 px-6">
                      <div class="flex justify-between items-center max-w-7xl mx-auto">
                        <h1 class="text-2xl font-bold text-gray-900">Your Store</h1>
                        <nav class="space-x-6">
                          <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
                          <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
                          <a href="/contact" class="text-gray-600 hover:text-gray-900">Contact</a>
                        </nav>
                      </div>
                    </div>`
                  : `<div class="bg-gray-900 text-white py-8 px-6">
                      <div class="max-w-7xl mx-auto text-center">
                        <p class="text-gray-300">© 2024 Your Store. All rights reserved.</p>
                      </div>
                    </div>`,
                allowHtml: true
              }
            }]
          }]
        }],
        themeOverrides: {},
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
        seo: {
          metaTitle: `${systemPageName}`,
          metaDescription: `${systemPageName} for the store`
        },
        analytics: {
          trackingId: '',
          events: [],
          heatmap: false,
          scrollTracking: false
        },
        performance: {
          lazyLoading: true,
          imageOptimization: true,
          minifyCSS: true,
          minifyJS: true
        },
        accessibility: {
          altTextRequired: true,
          contrastChecking: true,
          keyboardNavigation: true,
          screenReaderSupport: true
        }
      };

      // Save the system page
      await this.saveDraft(newPage);
      
      // Immediately publish it
      await this.publish(newPage.id);

      console.log(`✅ Created and published ${pageType} system page:`, newPage.name);
      
      return newPage;
    } catch (error) {
      console.error(`❌ Error creating ${pageType} system page:`, error);
      throw error;
    }
  }
}