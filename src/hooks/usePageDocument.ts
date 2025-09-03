/**
 * Hook for managing page documents with Supabase persistence
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PageDocument } from '../pageBuilder/types';
import { applyColorPaletteToRoot } from '../pageBuilder/utils/colorPaletteUtils';
import { getPaletteById } from '../pageBuilder/data/colorPalettes';

interface UsePageDocumentOptions {
  pageId?: string;
  storeId?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const usePageDocument = (options: UsePageDocumentOptions = {}) => {
  const { pageId, storeId, autoSave = true, autoSaveDelay = 2000 } = options;
  
  const [document, setDocument] = useState<PageDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save timeout
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load page document from Supabase
  const loadDocument = async (docId: string) => {
    if (!docId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('page_documents')
        .select('*')
        .eq('id', docId)
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data) {
        // Transform snake_case from database to camelCase for application
        const transformedDoc = {
          ...data,
          publishedAt: data.published_at,
          scheduledFor: data.scheduled_for,
          themeOverrides: data.theme_overrides,
          customCode: data.custom_code,
          globalStyles: data.global_styles,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        
        setDocument(transformedDoc);
        setHasUnsavedChanges(false);
        
        // Apply color palette if it exists
        const themeOverrides = data.theme_overrides || {};
        const colorPaletteData = themeOverrides.colorPalette;
        if (colorPaletteData?.paletteId) {
          const palette = getPaletteById(colorPaletteData.paletteId);
          if (palette) {
            const effectivePalette = {
              ...palette,
              colors: { ...palette.colors, ...colorPaletteData.customColors }
            };
            applyColorPaletteToRoot(effectivePalette);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  // Save page document to Supabase
  const saveDocument = async (doc: PageDocument) => {
    if (!doc.id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Transform the document to match database schema
      const databaseDoc = {
        id: doc.id,
        store_id: storeId,
        name: doc.name,
        slug: doc.slug,
        version: doc.version,
        status: doc.status,
        published_at: doc.publishedAt,
        scheduled_for: doc.scheduledFor,
        sections: doc.sections,
        theme_overrides: doc.themeOverrides || {},
        seo: doc.seo || {},
        analytics: doc.analytics || {},
        performance: doc.performance || {},
        accessibility: doc.accessibility || {},
        custom_code: doc.customCode || {},
        global_styles: doc.globalStyles || {},
        updated_at: new Date().toISOString()
      };

      const { error: supabaseError } = await supabase
        .from('page_documents')
        .upsert(databaseDoc, {
          onConflict: 'id'
        });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Update document and handle auto-save
  const updateDocument = (updatedDoc: PageDocument) => {
    setDocument(updatedDoc);
    setHasUnsavedChanges(true);

    // Handle auto-save
    if (autoSave && storeId) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save
      const timeout = setTimeout(() => {
        saveDocument(updatedDoc);
      }, autoSaveDelay);

      setAutoSaveTimeout(timeout);
    }
  };

  // Manual save
  const save = async () => {
    if (!document) return;
    await saveDocument(document);
  };

  // Create new document
  const createDocument = async (name: string, templateDocument?: Partial<PageDocument>) => {
    if (!storeId) {
      throw new Error('Store ID is required to create a document');
    }

    const newDoc: PageDocument = {
      id: crypto.randomUUID(),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      version: 1,
      status: 'draft',
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      themeOverrides: {},
      seo: {},
      analytics: {},
      performance: {},
      accessibility: {},
      customCode: {},
      globalStyles: {},
      ...templateDocument
    };

    await saveDocument(newDoc);
    setDocument(newDoc);
    setHasUnsavedChanges(false);
    return newDoc;
  };

  // Load document on pageId change
  useEffect(() => {
    if (pageId) {
      loadDocument(pageId);
    }
  }, [pageId]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    document,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    updateDocument,
    save,
    createDocument,
    loadDocument,
    reload: () => pageId ? loadDocument(pageId) : null
  };
};