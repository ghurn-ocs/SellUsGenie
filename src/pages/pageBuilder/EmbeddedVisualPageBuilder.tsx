/**
 * Embedded Visual Page Builder
 * Full Visual Page Builder embedded directly into the Store Admin Portal
 * Dark theme styled to match the admin portal interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Eye, 
  Edit3,
  ExternalLink,
  RefreshCw,
  Shield,
  FileText,
  Calendar,
  Globe,
  Trash2
} from 'lucide-react';

// Core Enhanced Page Builder (existing)
import { EnhancedPageBuilder } from '../../pageBuilder/editor/EnhancedPageBuilder';
import { HeaderConfiguration } from '../HeaderConfiguration';
import { FooterConfiguration } from '../FooterConfiguration';
import { SupabasePageRepository } from '../../pageBuilder/data/SupabasePageRepository';
import { CreatePageModal } from '../../components/pageBuilder/CreatePageModal';

// Types and Utils
import type { PageDocument, User } from '../../pageBuilder/types';
import { recreateMissingSystemPages } from '../../utils/updateSystemPagesSimple';

// Contexts
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { useModal } from '../../contexts/ModalContext';

export const EmbeddedVisualPageBuilder: React.FC = () => {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const modal = useModal();

  // Core State
  const [repository, setRepository] = useState<SupabasePageRepository | null>(null);
  const [pages, setPages] = useState<PageDocument[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationMessage, setRegenerationMessage] = useState<string>('');

  // Initialize repository
  useEffect(() => {
    if (user && currentStore) {
      const repo = new SupabasePageRepository(currentStore.id);
      setRepository(repo);
      loadPages(repo);
    }
  }, [user, currentStore]);

  const loadPages = useCallback(async (repo?: SupabasePageRepository) => {
    const repoToUse = repo || repository;
    if (!repoToUse) return;
    
    try {
      setIsLoading(true);
      const pagesData = await repoToUse.listPages();
      setPages(pagesData);
      
      // Don't auto-select any page - always show the pages list first
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [repository, selectedPageId]);

  const handleSave = async (doc: PageDocument) => {
    if (!repository) return;
    try {
      await repository.saveDraft(doc);
      setCurrentPage(doc);
      // Refresh pages list
      loadPages(repository);
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handlePublish = async (doc: PageDocument) => {
    if (!repository) return;
    try {
      await repository.publish(doc.id);
      loadPages(repository);
    } catch (error) {
      console.error('Error publishing page:', error);
    }
  };

  const handleError = (error: Error) => {
    console.error('Page builder error:', error);
  };

  const handlePageSelect = async (pageId: string) => {
    if (!repository) return;
    
    try {
      const page = await repository.getPage(pageId);
      if (page) {
        setSelectedPageId(pageId);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading selected page:', error);
    }
  };

  const handleBackToPages = () => {
    setSelectedPageId(null);
    setCurrentPage(null);
    loadPages(); // Refresh the pages list
  };

  const handleNewPage = () => {
    setShowCreateModal(true);
  };

  const handleCreatePage = async (pageData: {
    name: string;
    pageType: 'page' | 'header' | 'footer';
    navigationPlacement: 'header' | 'footer' | 'both' | 'none';
    slug?: string;
  }) => {
    if (!repository) {
      await modal.showError(
        'Error Creating Page',
        'Page builder is not initialized. Please refresh the page and try again.'
      );
      return;
    }

    try {
      // Create page document
      const pageDocument: PageDocument = {
        id: crypto.randomUUID(),
        name: pageData.name,
        slug: pageData.slug || null,
        version: 1,
        pageType: pageData.pageType,
        isSystemPage: pageData.pageType !== 'page',
        systemPageType: pageData.pageType !== 'page' ? pageData.pageType : null,
        navigationPlacement: pageData.navigationPlacement,
        sections: [{
          id: crypto.randomUUID(),
          title: 'Main Section',
          rows: [{
            id: crypto.randomUUID(),
            widgets: []
          }]
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: pageData.pageType === 'header' || pageData.pageType === 'footer' ? 'published' : 'draft',
        publishedAt: pageData.pageType === 'header' || pageData.pageType === 'footer' ? new Date().toISOString() : undefined,
        seo: {
          metaTitle: pageData.name,
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

      await repository.saveDraft(pageDocument);
      await loadPages();
      
      await modal.showSuccess(
        'Page Created',
        `"${pageData.name}" has been created successfully. You can now customize it using the page builder.`
      );

      // Auto-select the new page for editing
      setSelectedPageId(pageDocument.id);
      setCurrentPage(pageDocument);

    } catch (error) {
      console.error('Error creating page:', error);
      await modal.showError(
        'Failed to Create Page',
        'We encountered an issue while creating your page. Please check your internet connection and try again.'
      );
    }
  };

  const handleDeletePage = async (pageId: string, pageName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    
    // Check if it's a system page
    const isSystemPage = ['Site Header', 'Home Page', 'Footer', 'Site Footer', 'About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Returns'].includes(pageName);
    
    if (isSystemPage) {
      await modal.showWarning(
        'Cannot Delete Essential Page',
        `The "${pageName}" page is essential for your website to function properly. System pages cannot be deleted.`
      );
      return;
    }

    if (!repository) return;
    
    const confirmed = await modal.showConfirmation({
      title: 'Delete Page',
      message: `Are you sure you want to permanently delete "${pageName}"?\n\nThis action cannot be undone.`,
      type: 'warning',
      confirmText: 'Delete Page',
      cancelText: 'Keep Page',
      confirmButtonClass: 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium'
    });
    
    if (confirmed) {
      try {
        await repository.deletePage(pageId);
        
        // If we're currently viewing the deleted page, go back to list
        if (selectedPageId === pageId) {
          handleBackToPages();
        }
        
        // Refresh pages list
        await loadPages();
        
        await modal.showSuccess(
          'Page Deleted',
          `"${pageName}" has been successfully deleted from your website.`
        );
        
      } catch (error) {
        console.error('Error deleting page:', error);
        await modal.showError(
          'Delete Failed',
          'We encountered an issue while deleting your page. Please check your internet connection and try again.'
        );
      }
    }
  };

  const handleRegenerateSystemPages = async () => {
    if (!currentStore?.id || !repository) return;

    setIsRegenerating(true);
    setRegenerationMessage('');

    try {
      console.log('🔄 Starting system pages regeneration...');
      setRegenerationMessage('Checking and creating missing system pages...');

      const recreateResult = await recreateMissingSystemPages(currentStore.id);
      console.log('📄 Recreate result:', recreateResult);

      if (recreateResult.success) {
        setRegenerationMessage('System pages updated successfully! Refreshing page list...');
        
        await loadPages();
        
        setRegenerationMessage(`✅ Success: ${recreateResult.message}`);
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setRegenerationMessage('');
        }, 5000);
      } else {
        setRegenerationMessage(`❌ Error: ${recreateResult.message}`);
        console.error('Regeneration failed:', recreateResult.errors);
      }

    } catch (error) {
      console.error('💥 System pages regeneration failed:', error);
      setRegenerationMessage(`❌ Regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!user || !currentStore) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B51E0] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show page editor when a page is selected
  if (selectedPageId && repository) {
    const pageBuilderUser: User = {
      id: user.id,
      email: user.email || '',
      role: 'owner',
      storeId: currentStore.id,
    };

    // Determine if this is a Header or Footer page
    const isHeaderPage = currentPage && (
      currentPage.name.toLowerCase().includes('header') ||
      currentPage.pageType === 'header' ||
      currentPage.systemPageType === 'header'
    );
    
    const isFooterPage = currentPage && (
      currentPage.name.toLowerCase().includes('footer') ||
      currentPage.pageType === 'footer' ||
      currentPage.systemPageType === 'footer'
    );

    return (
      <div className="h-full bg-[#1E1E1E]">
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
          {isHeaderPage ? (
            <HeaderConfiguration />
          ) : isFooterPage ? (
            <FooterConfiguration />
          ) : (
            <EnhancedPageBuilder
              pageId={selectedPageId === 'create-new' ? undefined : selectedPageId}
              user={pageBuilderUser}
              repository={repository}
              onSave={handleSave}
              onPublish={handlePublish}
              onError={handleError}
            />
          )}
        </div>
      </div>
    );
  }

  // Show pages list with dark theme styling
  return (
    <div className="h-full bg-[#1E1E1E] text-white">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your Pages</h2>
              <p className="text-[#A0A0A0]">Manage your store pages with the visual page builder</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open(`/store/${currentStore?.store_slug}`, '_blank')}
                className="inline-flex items-center px-4 py-2 bg-[#6B46C1] text-white font-medium rounded-lg hover:bg-[#7C3AED] transition-colors"
                title="View your live store in a new tab"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Store
              </button>
              <button
                onClick={() => setShowRegenerateModal(true)}
                disabled={isRegenerating}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                title="Regenerate default system pages"
              >
                {isRegenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {isRegenerating ? 'Regenerating...' : 'Regenerate Defaults'}
              </button>
              <button
                className="inline-flex items-center px-4 py-2 bg-[#9B51E0] text-white font-medium rounded-lg hover:bg-[#A051E0] transition-colors"
                onClick={handleNewPage}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </button>
            </div>
          </div>
          
          {/* Regeneration Status Message */}
          {regenerationMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              regenerationMessage.includes('✅') 
                ? 'bg-green-900/20 text-green-400 border border-green-500/30'
                : regenerationMessage.includes('❌')
                ? 'bg-red-900/20 text-red-400 border border-red-500/30'
                : 'bg-blue-900/20 text-blue-400 border border-blue-500/30'
            }`}>
              {regenerationMessage}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B51E0] mx-auto mb-4"></div>
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
                    onClick={handleNewPage}
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
                      className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 hover:border-[#9B51E0] transition-colors cursor-pointer"
                      onClick={() => handlePageSelect(page.id)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/store/${currentStore.store_slug}${page.slug}`, '_blank');
                            }}
                            className="inline-flex items-center px-3 py-2 text-sm text-[#A0A0A0] hover:text-white border border-[#3A3A3A] rounded-lg hover:border-[#6A6A6A] transition-colors"
                            title="Preview page"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePageSelect(page.id);
                            }}
                            className="inline-flex items-center px-3 py-2 text-sm bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          {!['Site Header', 'Home Page', 'Footer', 'Site Footer', 'About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Returns'].includes(page.name) && (
                            <button
                              onClick={(e) => handleDeletePage(page.id, page.name, e)}
                              className="inline-flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 border border-[#3A3A3A] rounded-lg hover:border-red-500/30 transition-colors"
                              title={`Delete ${page.name}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          )}
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

      {/* Create Page Modal */}
      <CreatePageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePage={handleCreatePage}
      />

      {/* Regenerate System Pages Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-[#2A2A2A] border-[#3A3A3A]">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-900/20 rounded-full">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Regenerate Default Pages</h3>
                    <p className="text-sm text-[#A0A0A0]">Create essential pages for your website</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="text-[#A0A0A0] hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">What this action will do:</h4>
                  <ul className="text-sm text-blue-300 space-y-1">
                    <li>• Create missing essential pages for your website</li>
                    <li>• Restore any accidentally deleted system pages</li>
                    <li>• Publish core pages (Header, Home, Footer) automatically</li>
                    <li>• Preserve existing content where possible</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-[#3A3A3A]">
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#A0A0A0] bg-[#3A3A3A] hover:bg-[#4A4A4A] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowRegenerateModal(false);
                    handleRegenerateSystemPages();
                  }}
                  className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Proceed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};