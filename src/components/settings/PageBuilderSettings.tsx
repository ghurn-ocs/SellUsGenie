/**
 * Page Builder Settings
 * Interface for managing page builder content in Customer Portal
 */

import React, { useState, useEffect } from 'react';
import { Edit, Eye, Plus, Trash2, Globe, FileText, Save } from 'lucide-react';
import { SupabasePageRepository } from '../../pageBuilder/data/SupabasePageRepository';
import { EnhancedPageBuilder } from '../../pageBuilder/editor/EnhancedPageBuilder';
import type { PageDocument, User } from '../../pageBuilder/types';

interface PageBuilderSettingsProps {
  storeId: string;
}

interface PageListItemProps {
  page: PageDocument;
  onEdit: (page: PageDocument) => void;
  onDelete: (pageId: string) => void;
  onSetAsStorefront: (pageId: string) => void;
  isStorefrontPage: boolean;
}

const PageListItem: React.FC<PageListItemProps> = ({
  page,
  onEdit,
  onDelete,
  onSetAsStorefront,
  isStorefrontPage
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-6 hover:border-[#9B51E0] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{page.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(page.status)}`}>
              {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
            </span>
            {isStorefrontPage && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                Storefront Page
              </span>
            )}
          </div>
          
          <div className="text-sm text-[#A0A0A0] space-y-1">
            <p>Sections: {page.sections.length}</p>
            <p>Last updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
            {page.publishedAt && (
              <p>Published: {new Date(page.publishedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(page)}
            className="p-2 text-[#A0A0A0] hover:text-[#9B51E0] transition-colors"
            title="Edit page"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {page.status === 'published' && !isStorefrontPage && (
            <button
              onClick={() => onSetAsStorefront(page.id)}
              className="p-2 text-[#A0A0A0] hover:text-green-400 transition-colors"
              title="Set as storefront page"
            >
              <Globe className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(page.id)}
            className="p-2 text-[#A0A0A0] hover:text-red-400 transition-colors"
            title="Delete page"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const PageBuilderSettings: React.FC<PageBuilderSettingsProps> = ({ storeId }) => {
  const [pages, setPages] = useState<PageDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageDocument | null>(null);
  const [storefrontPageId, setStorefrontPageId] = useState<string | null>(null);
  const [repository] = useState(() => new SupabasePageRepository(storeId));

  // Mock user for now - in a real app, this would come from auth context
  const mockUser: User = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'owner',
    storeId: storeId
  };

  useEffect(() => {
    loadPages();
    loadStorefrontPageId();
  }, []);

  const loadPages = async () => {
    try {
      const pageList = await repository.listPages();
      setPages(pageList);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStorefrontPageId = async () => {
    try {
      const storefrontPage = await repository.getStorefrontPage();
      setStorefrontPageId(storefrontPage?.id || null);
    } catch (error) {
      console.error('Error loading storefront page:', error);
    }
  };

  const handleCreatePage = async () => {
    try {
      const newPage = await repository.createPage('New Page');
      setPages([newPage, ...pages]);
      setEditingPage(newPage);
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  const handleEditPage = (page: PageDocument) => {
    setEditingPage(page);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await repository.deletePage(pageId);
      setPages(pages.filter(p => p.id !== pageId));
      
      if (storefrontPageId === pageId) {
        setStorefrontPageId(null);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const handleSetAsStorefront = async (pageId: string) => {
    try {
      await repository.setStorefrontPage(pageId);
      setStorefrontPageId(pageId);
    } catch (error) {
      console.error('Error setting storefront page:', error);
    }
  };

  const handlePageSave = async (doc: PageDocument) => {
    setPages(pages.map(p => p.id === doc.id ? doc : p));
  };

  const handlePagePublish = async (doc: PageDocument) => {
    setPages(pages.map(p => p.id === doc.id ? doc : p));
  };

  const handleCloseEditor = () => {
    setEditingPage(null);
    loadPages(); // Refresh the list
  };

  if (editingPage) {
    return (
      <div className="h-screen">
        <EnhancedPageBuilder
          pageId={editingPage.id}
          user={mockUser}
          repository={repository}
          onSave={handlePageSave}
          onPublish={handlePagePublish}
          onError={(error) => console.error('Page builder error:', error)}
        />
        
        {/* Close button */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={handleCloseEditor}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Pages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Page Builder</h3>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Create and manage custom pages for your storefront using drag-and-drop page builder
          </p>
        </div>
        <button
          onClick={handleCreatePage}
          className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#A051E0] rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Page</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#A0A0A0]">Loading pages...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
          <FileText className="w-12 h-12 text-[#A0A0A0] mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">No pages created yet</h4>
          <p className="text-[#A0A0A0] text-sm mb-4">
            Create your first page using our drag-and-drop page builder
          </p>
          <button
            onClick={handleCreatePage}
            className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#A051E0] rounded-lg font-medium transition-colors"
          >
            Create First Page
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <PageListItem
              key={page.id}
              page={page}
              onEdit={handleEditPage}
              onDelete={handleDeletePage}
              onSetAsStorefront={handleSetAsStorefront}
              isStorefrontPage={storefrontPageId === page.id}
            />
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
        <h4 className="text-sm font-medium text-blue-300 mb-2">💡 How to use Page Builder</h4>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Create pages using our drag-and-drop interface</li>
          <li>• Drag section headers (⋮⋮) to reorder sections vertically</li>
          <li>• Publish pages when ready to go live</li>
          <li>• Set a published page as your main storefront page</li>
          <li>• Hero sections typically go first, followed by products, then footer content</li>
        </ul>
      </div>
    </div>
  );
};