/**
 * Supabase Page Repository
 * Real data persistence for page documents using Supabase
 */

import { supabase } from '../../lib/supabase';
import type { Page, PageVersion } from '../../lib/supabase';
import type { PageDocument, User } from '../types';
import { BasePageRepository } from './PageRepository';

export class SupabasePageRepository extends BasePageRepository {
  private storeId: string;

  constructor(user: User, storeId: string) {
    super(user);
    this.storeId = storeId;
  }

  /**
   * Convert Supabase Page to PageDocument
   */
  private pageToDocument(page: Page): PageDocument {
    return {
      id: page.id,
      name: page.name,
      status: page.status,
      version: page.version,
      createdAt: page.created_at,
      updatedAt: page.updated_at,
      ...page.content // Spread the JSON content
    };
  }

  /**
   * Convert PageDocument to Supabase Page format
   */
  private documentToPage(doc: PageDocument): Omit<Page, 'created_at' | 'updated_at'> {
    const { id, name, status, version, createdAt, updatedAt, ...content } = doc;
    return {
      id,
      store_id: this.storeId,
      name,
      status,
      version,
      content
    };
  }

  async getPage(id: string): Promise<PageDocument | null> {
    if (!this.canView()) {
      throw new Error('Insufficient permissions to view pages');
    }

    try {
      const { data, error } = await supabase
        .from('pages')
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

      return this.pageToDocument(data);
    } catch (error) {
      console.error('Error fetching page:', error);
      throw new Error('Failed to fetch page');
    }
  }

  async listPages(): Promise<PageDocument[]> {
    if (!this.canView()) {
      throw new Error('Insufficient permissions to list pages');
    }

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('store_id', this.storeId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(page => this.pageToDocument(page));
    } catch (error) {
      console.error('Error listing pages:', error);
      throw new Error('Failed to list pages');
    }
  }

  async getVersion(pageId: string, versionId: string): Promise<PageDocument | null> {
    if (!this.canView()) {
      throw new Error('Insufficient permissions to view versions');
    }

    try {
      const { data, error } = await supabase
        .from('page_versions')
        .select('*')
        .eq('id', versionId)
        .eq('page_id', pageId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      // Convert PageVersion to PageDocument format
      return {
        id: data.page_id,
        name: data.content.name || 'Page',
        status: 'draft', // Versions are always considered drafts when restored
        version: data.version,
        createdAt: data.created_at,
        updatedAt: data.created_at,
        ...data.content
      };
    } catch (error) {
      console.error('Error fetching page version:', error);
      throw new Error('Failed to fetch page version');
    }
  }

  async deletePage(id: string): Promise<void> {
    if (!this.canModify()) {
      throw new Error('Insufficient permissions to delete pages');
    }

    try {
      // Delete page versions first (foreign key constraint)
      await supabase
        .from('page_versions')
        .delete()
        .eq('page_id', id);

      // Delete the page
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)
        .eq('store_id', this.storeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting page:', error);
      throw new Error('Failed to delete page');
    }
  }

  protected async saveDraftInternal(doc: PageDocument): Promise<void> {
    try {
      const pageData = this.documentToPage(doc);
      
      const { error } = await supabase
        .from('pages')
        .upsert(pageData, {
          onConflict: 'id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving page draft:', error);
      throw new Error('Failed to save page draft');
    }
  }

  protected async publishInternal(doc: PageDocument): Promise<void> {
    try {
      // Start a transaction by updating the page and creating a version
      const pageData = this.documentToPage(doc);
      
      // Update the page
      const { error: pageError } = await supabase
        .from('pages')
        .upsert(pageData, {
          onConflict: 'id'
        });

      if (pageError) throw pageError;

      // Create version history entry
      if (doc.history && doc.history.length > 0) {
        const latestHistory = doc.history[doc.history.length - 1];
        
        const versionData: Omit<PageVersion, 'created_at'> = {
          id: latestHistory.id,
          page_id: doc.id,
          version: latestHistory.version,
          content: doc,
          author_id: latestHistory.authorId,
          note: latestHistory.note
        };

        const { error: versionError } = await supabase
          .from('page_versions')
          .insert(versionData);

        if (versionError) {
          console.error('Error creating page version:', versionError);
          // Don't throw here - page was saved successfully
        }
      }
    } catch (error) {
      console.error('Error publishing page:', error);
      throw new Error('Failed to publish page');
    }
  }

  /**
   * Get page history/versions
   */
  async getPageHistory(pageId: string): Promise<PageVersion[]> {
    if (!this.canView()) {
      throw new Error('Insufficient permissions to view page history');
    }

    try {
      const { data, error } = await supabase
        .from('page_versions')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching page history:', error);
      throw new Error('Failed to fetch page history');
    }
  }
}