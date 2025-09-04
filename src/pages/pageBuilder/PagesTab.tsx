/**
 * Pages Tab Component
 * Shows list of pages and allows editing individual pages
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { EnhancedPageBuilder } from '../../pageBuilder/editor/EnhancedPageBuilder';
import { SupabasePageRepository } from '../../pageBuilder/data/SupabasePageRepository';
import type { User, PageDocument } from '../../pageBuilder/types';
import { FileText, Plus, Edit3, Eye, Globe, ArrowLeft, Calendar } from 'lucide-react';

export const PagesTab: React.FC = () => {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const [repository, setRepository] = useState<SupabasePageRepository | null>(null);
  const [pages, setPages] = useState<PageDocument[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && currentStore) {
      const repo = new SupabasePageRepository(currentStore.id);
      setRepository(repo);
      loadPages(repo);
    }
  }, [user, currentStore, loadPages]);

  const loadPages = useCallback(async (repo?: SupabasePageRepository) => {
    const repoToUse = repo || repository;
    if (!repoToUse) return;
    
    setIsLoading(true);
    try {
      const allPages = await repoToUse.listPages();
      setPages(allPages);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [repository, currentStore?.id]);

  const handleEditPage = (pageId: string) => {
    setSelectedPageId(pageId);
  };

  const handleBackToPages = () => {
    setSelectedPageId(null);
    loadPages(); // Refresh the pages list
  };

  if (!user || !currentStore) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show page editor when a page is selected
  if (selectedPageId && repository) {
    return (
      <div className="h-full">
        <div className="border-b border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3">
          <button
            onClick={handleBackToPages}
            className="inline-flex items-center px-3 py-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pages
          </button>
        </div>
        <div className="h-full">
          <EnhancedPageBuilder
            pageId={selectedPageId === 'create-new' ? undefined : selectedPageId}
            user={{
              id: user.id,
              email: user.email || '',
              role: 'owner',
              storeId: currentStore.id,
            }}
            repository={repository}
            onSave={() => {
              console.log('Page saved');
              loadPages(); // Refresh pages list after save
            }}
            onPublish={() => {
              console.log('Page published');
              loadPages(); // Refresh pages list after publish
            }}
            onError={(error) => console.error('Page builder error:', error)}
          />
        </div>
      </div>
    );
  }

  // Show pages list
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Pages</h2>
            <p className="text-[#A0A0A0]">Manage your store pages with the visual page builder</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="inline-flex items-center px-4 py-2 bg-[#6B46C1] text-white font-medium rounded-lg hover:bg-[#7C3AED] transition-colors"
              onClick={() => setSelectedPageId('create-new')}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Visual Page Builder
            </button>
            <button
              className="inline-flex items-center px-4 py-2 bg-[#9B51E0] text-white font-medium rounded-lg hover:bg-[#A051E0] transition-colors"
              onClick={() => {/* TODO: Add create page functionality */}}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-[#A0A0A0]">Loading pages...</p>
          </div>
        )}

        {/* Pages List */}
        {!isLoading && (
          <div className="space-y-4">
            {pages.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-[#A0A0A0] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No pages yet</h3>
                <p className="text-[#A0A0A0] mb-4">
                  Create your first page to get started with the visual page builder.
                </p>
                <button
                  className="inline-flex items-center px-4 py-2 bg-[#9B51E0] text-white font-medium rounded-lg hover:bg-[#A051E0] transition-colors"
                  onClick={() => {/* TODO: Add create page functionality */}}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Page
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 hover:border-[#9B51E0] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="h-5 w-5 text-[#9B51E0]" />
                          <h3 className="text-lg font-semibold text-white">{page.name}</h3>
                          {page.slug === '/' && (
                            <span className="px-2 py-1 text-xs bg-green-900/20 text-green-400 rounded-full border border-green-500/30">
                              Home Page
                            </span>
                          )}
                          {page.status === 'published' && (
                            <span className="px-2 py-1 text-xs bg-blue-900/20 text-blue-400 rounded-full border border-blue-500/30">
                              Published
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-[#A0A0A0]">
                          <span className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            {page.slug || '/'}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(page.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {page.seo?.metaTitle && (
                          <p className="text-sm text-[#A0A0A0] mt-2 line-clamp-2">
                            {page.seo.metaTitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={() => window.open(`/store/${currentStore.store_slug}${page.slug}`, '_blank')}
                          className="inline-flex items-center px-3 py-2 text-sm text-[#A0A0A0] hover:text-white border border-[#3A3A3A] rounded-lg hover:border-[#6A6A6A] transition-colors"
                          title="Preview page"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleEditPage(page.id)}
                          className="inline-flex items-center px-3 py-2 text-sm bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};