/**
 * Visual Page Builder - Advanced Integration
 * Combines all advanced pageBuilder subdirectory components with existing functionality
 * Features: Canvas System, Advanced Panels, Enhanced Editor, Store Management
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Eye, 
  Settings, 
  Save, 
  Globe, 
  Link2,
  Trash2,
  Copy,
  Layout,
  File,
  FileText,
  Phone,
  Shield,
  Users,
  ShoppingBag,
  Home,
  Edit3,
  ExternalLink,
  RefreshCw,
  Image,
  Upload,
  X,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Palette,
  Code,
  Zap,
  Grid,
  MousePointer
} from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

// Core Enhanced Page Builder (existing)
import { EnhancedPageBuilder } from '../pageBuilder/editor/EnhancedPageBuilder';
import { SupabasePageRepository } from '../pageBuilder/data/SupabasePageRepository';

// Advanced Canvas System Integration
import { CanvasContainer } from '../pageBuilder/canvas/CanvasContainer';
import { CanvasEditor } from '../pageBuilder/canvas/CanvasEditor';
import { CreatePageModal } from '../components/pageBuilder/CreatePageModal';
import { AdvancedCanvas } from '../pageBuilder/canvas/AdvancedCanvas';
import { SandboxedCanvas } from '../pageBuilder/canvas/SandboxedCanvas';

// Advanced Panels
import { ElementsPanel } from '../pageBuilder/panels/ElementsPanel';
import { StylePanel } from '../pageBuilder/panels/StylePanel';
import { InteractionsPanel } from '../pageBuilder/panels/InteractionsPanel';
import { CMSPanel } from '../pageBuilder/panels/CMSPanel';
import { CodeExportPanel } from '../pageBuilder/panels/CodeExportPanel';

// Canvas Components
import { BreadcrumbNavigation } from '../pageBuilder/canvas/components/BreadcrumbNavigation';
import { BreakpointControls } from '../pageBuilder/canvas/components/BreakpointControls';
import { ElementTemplates } from '../pageBuilder/canvas/components/ElementTemplates';

// Store Management
import { useCanvasStore, useCanvasHistory } from '../pageBuilder/canvas/store/CanvasStore';
import { useEditorStore } from '../pageBuilder/store/EditorStore';

// Existing Components
// CustomizationPanel archived - Visual Page Builder is now the standard method
import { PolicySettings } from '../components/settings/PolicySettings';
import { HeaderFooterEditor } from '../pageBuilder/components/HeaderFooterEditor';
import { SystemPageModal } from '../pageBuilder/components/SystemPageModal';
import { ProvisioningModal } from '../pageBuilder/components/ProvisioningModal';
import { SystemPagesFixModal } from '../pageBuilder/components/SystemPagesFixModal';

// Types and Utils
import type { PageDocument, PageRepository, User, Breakpoint } from '../pageBuilder/types';
import type { CanvasError } from '../pageBuilder/canvas/types/CanvasTypes';
import { checkProvisioningStatus, provisionCurrentStore } from '../utils/provisionCurrentStore';
import { cleanupDuplicateHomePagesForStore } from '../utils/cleanupDuplicateHomePages';
import { recreateAboutUsPageByEmail } from '../utils/recreateAboutUsPage';
import { recreateMissingSystemPages, publishCoreSystemPages } from '../utils/updateSystemPagesSimple';

// Contexts and Drag/Drop
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useLocation } from 'wouter';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { supabase } from '../lib/supabase';

// Note: Widgets are imported and registered in EnhancedPageBuilder.tsx
// Importing them here as well would cause duplicate registrations

// Simplified - no longer need these view modes since EnhancedPageBuilder handles its own UI
// type ViewMode = 'enhanced' | 'canvas' | 'split' | 'preview';
// type PanelMode = 'widgets' | 'elements' | 'styles' | 'interactions' | 'cms' | 'code' | 'settings' | 'customization';

export const VisualPageBuilder: React.FC = () => {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const [location, setLocation] = useLocation();
  const modal = useModal();

  // Core State
  // Removed viewMode and leftPanelMode - EnhancedPageBuilder handles its own UI
  const [repository, setRepository] = useState<SupabasePageRepository | null>(null);
  const [currentPage, setCurrentPage] = useState<PageDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pages, setPages] = useState<PageDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'pages' | 'system'>('pages');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSystemPageModal, setShowSystemPageModal] = useState(false);
  const [showProvisioningModal, setShowProvisioningModal] = useState(false);
  const [showSystemPagesFixModal, setShowSystemPagesFixModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationMessage, setRegenerationMessage] = useState<string>('');

  // Store Integration
  const canvasStore = useCanvasStore();
  const editorStore = useEditorStore();

  // Initialize repository
  useEffect(() => {
    if (user && currentStore) {
      const pageBuilderUser: User = {
        id: user.id,
        email: user.email || '',
        role: 'owner',
        storeId: currentStore.id,
      };
      const repo = new SupabasePageRepository(currentStore.id);
      setRepository(repo);
      loadPages(repo);
    }
  }, [user, currentStore]);

  const loadPages = async (repo?: SupabasePageRepository) => {
    const repoToUse = repo || repository;
    if (!repoToUse) return;
    
    try {
      setIsLoading(true);
      const pagesData = await repoToUse.listPages();
      setPages(pagesData);
      
      // Don't auto-select any page - let user choose from list
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleError = (error: Error | CanvasError) => {
    console.error('Page builder error:', error);
  };

  const renderPagesList = () => (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Pages</h2>
              <p className="text-gray-600 mt-1">Manage your website pages and system defaults</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open(`/store/${currentStore?.store_slug}`, '_blank')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="View your live store in a new tab"
                disabled={!currentStore?.store_slug}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Store</span>
              </button>
              <button
                onClick={() => setShowRegenerateModal(true)}
                disabled={isRegenerating}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                title="Regenerate default system pages for your website"
              >
                {isRegenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Defaults'}</span>
              </button>
              <button
                onClick={handleNewPage}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Page</span>
              </button>
            </div>
          </div>
          
          {/* Regeneration Status Message */}
          {regenerationMessage && (
            <div className={`mt-3 p-3 rounded-lg ${
              regenerationMessage.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : regenerationMessage.includes('❌')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {regenerationMessage}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading pages...</span>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No pages yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your default system pages</p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setShowRegenerateModal(true)}
                disabled={isRegenerating}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isRegenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                <span>{isRegenerating ? 'Creating System Pages...' : 'Regenerate Defaults'}</span>
              </button>
              <button
                onClick={handleNewPage}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Custom Page</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {pages.map((page) => {
                  const isSystemPage = ['Site Header', 'Home Page', 'Footer', 'Site Footer', 'About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Returns'].includes(page.name);
                  const pageType = page.name === 'Site Header' ? 'Header' :
                                   page.name === 'Footer' || page.name === 'Site Footer' ? 'Footer' :
                                   page.name === 'Home Page' ? 'Homepage' :
                                   isSystemPage ? 'System' : 'Custom';
                  
                  return (
                    <tr 
                      key={page.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handlePageSelect(page.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isSystemPage && (
                            <Shield className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {page.name}
                            </div>
                            {isSystemPage && (
                              <div className="text-xs text-green-600">System Page</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {page.slug || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          page.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : page.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {page.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          isSystemPage
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {pageType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          page.navigationPlacement === 'both' 
                            ? 'bg-purple-50 text-purple-700'
                            : page.navigationPlacement === 'header'
                            ? 'bg-blue-50 text-blue-700'
                            : page.navigationPlacement === 'footer'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {page.navigationPlacement === 'both' ? 'Both' :
                           page.navigationPlacement === 'header' ? 'Header' :
                           page.navigationPlacement === 'footer' ? 'Footer' :
                           'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {page.sections?.length || 0} sections
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Edit3 className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
                            <span className="text-xs text-gray-400">Edit</span>
                          </div>
                          {!isSystemPage && (
                            <button
                              onClick={(e) => handleDeletePage(page.id, page.name, e)}
                              className="flex items-center space-x-1 text-red-400 hover:text-red-600 transition-colors"
                              title={`Delete ${page.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-xs">Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const handleCanvasError = (error: CanvasError) => {
    console.error('Canvas error:', error);
  };

  const handleBackToDashboard = () => {
    setLocation('/admin');
  };

  const handlePageSelect = async (pageId: string) => {
    if (!repository) return;
    
    try {
      const page = await repository.getPage(pageId);
      if (page) {
        // Check if this is a Header or Footer page and route to dedicated config pages
        if (page.systemPageType === 'header' || page.name.toLowerCase().includes('header')) {
          setLocation('/admin/header-config');
          return;
        }
        
        if (page.systemPageType === 'footer' || page.name.toLowerCase().includes('footer')) {
          setLocation('/admin/footer-config');
          return;
        }
        
        // For regular pages, use the normal page builder
        setSelectedPageId(pageId);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading selected page:', error);
    }
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
      // Create page document with appropriate system page metadata
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
        'We encountered an issue while creating your page. Please check your internet connection and try again. If the problem persists, contact support.'
      );
    }
  };

  const handleBackToPagesList = () => {
    setSelectedPageId(null);
    setCurrentPage(null);
  };

  const handleDeletePage = async (pageId: string, pageName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    
    // Check if it's a system page
    const isSystemPage = ['Site Header', 'Home Page', 'Footer', 'Site Footer', 'About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Returns'].includes(pageName);
    
    if (isSystemPage) {
      await modal.showWarning(
        'Cannot Delete Essential Page',
        `The "${pageName}" page is essential for your website to function properly. System pages like headers, footers, and legal pages cannot be deleted as they're required for a complete website experience.`
      );
      return;
    }

    if (!repository) return;
    
    const confirmed = await modal.showConfirmation({
      title: 'Delete Page',
      message: `Are you sure you want to permanently delete "${pageName}"?\n\nThis action cannot be undone. The page and all its content will be lost forever.`,
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
          handleBackToPagesList();
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
          'We encountered an issue while deleting your page. Please check your internet connection and try again. If the problem persists, contact support.'
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

      // Step 1: Recreate missing system pages
      const recreateResult = await recreateMissingSystemPages(currentStore.id);
      console.log('📄 Recreate result:', recreateResult);

      if (recreateResult.success) {
        setRegenerationMessage('System pages updated successfully! Refreshing page list...');
        
        // Step 2: Refresh the pages list
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

  const renderTopBar = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Pages</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Visual Page Builder</h1>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('enhanced')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'enhanced' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layout className="w-4 h-4 mr-2" />
              Enhanced
            </button>
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'canvas' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MousePointer className="w-4 h-4 mr-2" />
              Canvas
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'split' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4 mr-2" />
              Split
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('preview')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
          
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );

  const renderLeftPanel = () => (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Panel Navigation */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'widgets', label: 'Widgets', icon: Layout },
            { id: 'elements', label: 'Elements', icon: Grid },
            { id: 'styles', label: 'Styles', icon: Palette },
            { id: 'interactions', label: 'Actions', icon: Zap },
            { id: 'cms', label: 'CMS', icon: FileText },
            { id: 'code', label: 'Code', icon: Code },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'customization', label: 'Theme', icon: Palette },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setLeftPanelMode(id as PanelMode)}
              className={`p-3 rounded-lg text-xs font-medium transition-colors flex flex-col items-center space-y-1 ${
                leftPanelMode === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {leftPanelMode === 'widgets' && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Enhanced Widgets</h2>
              <p className="text-xs text-gray-500">
                Drag-and-drop widgets for rapid page building
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Enhanced PageBuilder will handle this */}
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">Widget library will appear here</p>
              </div>
            </div>
          </div>
        )}
        
        {leftPanelMode === 'elements' && (
          <DndProvider backend={HTML5Backend}>
            <ElementsPanel />
          </DndProvider>
        )}
        
        {leftPanelMode === 'styles' && <StylePanel />}
        {leftPanelMode === 'interactions' && <InteractionsPanel />}
        {leftPanelMode === 'cms' && <CMSPanel />}
        {leftPanelMode === 'code' && <CodeExportPanel />}
        
        {leftPanelMode === 'settings' && <PolicySettings />}
        
        {leftPanelMode === 'customization' && (
          <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Visual Page Builder</h3>
            <p className="text-purple-700 mb-4">
              The Visual Page Builder is now the standard and only method for creating and customizing store pages. 
              Use the canvas above to design your pages with drag & drop widgets.
            </p>
            <p className="text-sm text-purple-600">
              Legacy customization tools have been archived. All page customization is now done through this interface.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (viewMode === 'preview') {
      return (
        <div className="flex-1 bg-gray-100 p-6">
          <div className="max-w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800 text-white px-4 py-2 text-sm flex justify-between items-center">
              <span>Preview Mode</span>
              <button
                onClick={() => setViewMode('enhanced')}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              src={`/store/${currentStore?.store_slug}`}
              className="w-full border-0"
              style={{ height: 'calc(100vh - 200px)' }}
            />
          </div>
        </div>
      );
    }

    if (viewMode === 'canvas') {
      return (
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 p-3">
            <BreakpointControls />
          </div>
          <div className="flex-1">
            <DndProvider backend={HTML5Backend}>
              <CanvasContainer
                onElementSelect={(id) => console.log('Canvas element selected:', id)}
                onElementHover={(id) => console.log('Canvas element hovered:', id)}
                onCanvasError={handleCanvasError}
              />
            </DndProvider>
          </div>
        </div>
      );
    }

    if (viewMode === 'split') {
      return (
        <div className="flex-1 flex">
          {/* Enhanced Builder */}
          <div className="flex-1 border-r border-gray-200">
            {user && repository && (
              <EnhancedPageBuilder
                pageId={selectedPageId}
                user={user}
                repository={repository}
                onSave={handleSave}
                onPublish={handlePublish}
                onError={handleError}
              />
            )}
          </div>
          
          {/* Canvas Builder */}
          <div className="w-1/2 flex flex-col">
            <div className="border-b border-gray-200 p-2">
              <BreakpointControls />
            </div>
            <div className="flex-1">
              <DndProvider backend={HTML5Backend}>
                <CanvasContainer
                  onElementSelect={(id) => console.log('Canvas element selected:', id)}
                  onElementHover={(id) => console.log('Canvas element hovered:', id)}
                  onCanvasError={handleCanvasError}
                />
              </DndProvider>
            </div>
          </div>
        </div>
      );
    }

    // Default: Enhanced mode
    return (
      <div className="flex-1">
        {user && repository && (
          <EnhancedPageBuilder
            pageId={selectedPageId}
            user={user}
            repository={repository}
            onSave={handleSave}
            onPublish={handlePublish}
            onError={handleError}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Advanced Visual Page Builder...</p>
        </div>
      </div>
    );
  }

  // Simplified: Just render the EnhancedPageBuilder directly
  // The EnhancedPageBuilder has its own complete UI
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Simple header bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={selectedPageId ? handleBackToPagesList : handleBackToDashboard}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title={selectedPageId ? "Back to Pages" : "Back to Dashboard"}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{selectedPageId ? "Back to Pages" : "Back to Dashboard"}</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {selectedPageId ? `Editing: ${currentPage?.name || 'Page'}` : 'Visual Page Builder'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentStore && (
              <span className="text-sm text-gray-600">
                Store: <span className="font-medium">{currentStore.store_name}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content - show pages list or EnhancedPageBuilder */}
      <div className="flex-1 overflow-hidden">
        {user && repository && (
          selectedPageId ? (
            <EnhancedPageBuilder
              pageId={selectedPageId}
              user={user}
              repository={repository}
              onSave={handleSave}
              onPublish={handlePublish}
              onError={handleError}
            />
          ) : (
            renderPagesList()
          )
        )}
      </div>

      {/* Modals */}
      {showProvisioningModal && (
        <ProvisioningModal onClose={() => setShowProvisioningModal(false)} />
      )}
      
      {showSystemPageModal && (
        <SystemPageModal onClose={() => setShowSystemPageModal(false)} />
      )}
      
      {showSystemPagesFixModal && (
        <SystemPagesFixModal onClose={() => setShowSystemPagesFixModal(false)} />
      )}

      {/* Regenerate Defaults Confirmation Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Regenerate Default Pages</h3>
                    <p className="text-sm text-gray-600">Create essential pages for your website</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What this action will do:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Create missing essential pages for your website</li>
                    <li>• Restore any accidentally deleted system pages</li>
                    <li>• Publish core pages (Header, Home, Footer) automatically</li>
                    <li>• Preserve existing content where possible</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">The following system pages will be created/updated:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-green-600" />
                      <span>Home</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Header</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Layout className="w-4 h-4 text-green-600" />
                      <span>Footer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span>About Us</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>Contact Us</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span>Privacy Policy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span>Terms & Conditions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-green-600" />
                      <span>Returns Policy</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-yellow-900">!</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">Important Notes:</h4>
                      <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                        <li>• Existing pages with the same names will be preserved</li>
                        <li>• Only missing pages will be created</li>
                        <li>• All new pages will include professional default content</li>
                        <li>• You can customize all content after creation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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

      {/* Create Page Modal */}
      <CreatePageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePage={handleCreatePage}
      />
    </div>
  );
};

export default VisualPageBuilder;