/**
 * Page Repository
 * Handles data persistence for page documents with draft/publish functionality
 */

import type { PageDocument, PageTemplate, User } from '../types';
import { widgetRegistry } from '../widgets/registry';

export abstract class BasePageRepository {
  protected user: User;

  constructor(user: User) {
    this.user = user;
  }

  /**
   * Check if user has permission to modify pages
   */
  protected canModify(): boolean {
    return this.user.role === 'owner' || this.user.role === 'editor';
  }

  /**
   * Check if user has permission to view pages
   */
  protected canView(): boolean {
    return true; // All roles can view
  }

  /**
   * Generate a new page ID
   */
  protected generateId(): string {
    return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new page from template or empty
   */
  async createPage(name: string, template?: PageTemplate): Promise<PageDocument> {
    if (!this.canModify()) {
      throw new Error('Insufficient permissions to create pages');
    }

    const now = new Date().toISOString();
    const baseDoc: Omit<PageDocument, 'id'> = template?.document || {
      name,
      version: 1,
      sections: [],
      createdAt: now,
      updatedAt: now,
      status: 'draft'
    };

    const page: PageDocument = {
      id: this.generateId(),
      ...baseDoc,
      name,
      createdAt: now,
      updatedAt: now,
      status: 'draft'
    };

    await this.saveDraft(page);
    return page;
  }

  /**
   * Save a draft version of a page
   */
  async saveDraft(doc: PageDocument): Promise<void> {
    if (!this.canModify()) {
      throw new Error('Insufficient permissions to save pages');
    }

    // Migrate widgets to latest versions
    const migratedDoc = this.migratePage(doc);
    migratedDoc.updatedAt = new Date().toISOString();

    await this.saveDraftInternal(migratedDoc);
  }

  /**
   * Publish a page (creates version history)
   */
  async publish(id: string): Promise<void> {
    if (!this.canModify()) {
      throw new Error('Insufficient permissions to publish pages');
    }

    const draft = await this.getPage(id);
    if (!draft) {
      throw new Error('Page not found');
    }

    // Create version history entry
    const historyEntry = {
      id: `version_${Date.now()}`,
      createdAt: new Date().toISOString(),
      authorId: this.user.id,
      version: draft.version,
      note: 'Published'
    };

    const publishedDoc: PageDocument = {
      ...draft,
      status: 'published',
      version: draft.version + 1,
      updatedAt: new Date().toISOString(),
      history: [...(draft.history || []), historyEntry]
    };

    await this.publishInternal(publishedDoc);
  }

  /**
   * Restore a page to a previous version
   */
  async restoreVersion(id: string, versionId: string): Promise<void> {
    if (!this.canModify()) {
      throw new Error('Insufficient permissions to restore pages');
    }

    const version = await this.getVersion(id, versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    const restoredDoc: PageDocument = {
      ...version,
      status: 'draft',
      version: version.version + 1,
      updatedAt: new Date().toISOString()
    };

    await this.saveDraft(restoredDoc);
  }

  /**
   * Migrate a page document to the latest version
   */
  protected migratePage(doc: PageDocument): PageDocument {
    const migratedSections = doc.sections.map(section => ({
      ...section,
      rows: section.rows.map(row => ({
        ...row,
        widgets: row.widgets.map(widget => 
          widgetRegistry.migrateWidget(widget, widget.version)
        )
      }))
    }));

    return {
      ...doc,
      sections: migratedSections
    };
  }

  /**
   * Abstract methods to be implemented by concrete repositories
   */
  abstract getPage(id: string): Promise<PageDocument | null>;
  abstract listPages(): Promise<PageDocument[]>;
  abstract getVersion(id: string, versionId: string): Promise<PageDocument | null>;
  abstract deletePage(id: string): Promise<void>;
  protected abstract saveDraftInternal(doc: PageDocument): Promise<void>;
  protected abstract publishInternal(doc: PageDocument): Promise<void>;
}

/**
 * In-Memory Page Repository (for development)
 */
export class InMemoryPageRepository extends BasePageRepository {
  private pages = new Map<string, PageDocument>();
  private versions = new Map<string, Map<string, PageDocument>>();

  async getPage(id: string): Promise<PageDocument | null> {
    if (!this.canView()) {
      throw new Error('Insufficient permissions to view pages');
    }
    return this.pages.get(id) || null;
  }

  async listPages(): Promise<PageDocument[]> {
    if (!this.canView()) {
      throw new Error('Insufficient permissions to list pages');
    }
    return Array.from(this.pages.values());
  }

  async getVersion(id: string, versionId: string): Promise<PageDocument | null> {
    if (!this.canView()) {
      throw new Error('Insufficient permissions to view versions');
    }
    const pageVersions = this.versions.get(id);
    return pageVersions?.get(versionId) || null;
  }

  async deletePage(id: string): Promise<void> {
    if (!this.canModify()) {
      throw new Error('Insufficient permissions to delete pages');
    }
    this.pages.delete(id);
    this.versions.delete(id);
  }

  protected async saveDraftInternal(doc: PageDocument): Promise<void> {
    this.pages.set(doc.id, doc);
  }

  protected async publishInternal(doc: PageDocument): Promise<void> {
    this.pages.set(doc.id, doc);
    
    // Store version history
    if (!this.versions.has(doc.id)) {
      this.versions.set(doc.id, new Map());
    }
    const pageVersions = this.versions.get(doc.id)!;
    pageVersions.set(doc.id, doc);
  }
}

/**
 * External Page Repository Interface (for Supabase/Firestore)
 */
export interface ExternalPageRepository extends BasePageRepository {
  // Additional methods for external storage
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

