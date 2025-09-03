/**
 * Header Footer Modal Component
 * Allows users to create and manage header and footer pages
 */
import React, { useState, useEffect } from 'react';
import { X, Navigation, Plus, Edit, Eye, Palette } from 'lucide-react';
import type { PageDocument, PageType } from '../types';
import { SupabasePageRepository } from '../data/SupabasePageRepository';
interface HeaderFooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  onPageCreated?: (page: PageDocument) => void;
  onEditPage?: (page: PageDocument) => void;
}
export const HeaderFooterModal: React.FC<HeaderFooterModalProps> = ({
  isOpen,
  onClose,
  storeId,
  onPageCreated,
  onEditPage
}) => {
  const [systemPages, setSystemPages] = useState<{
    header: PageDocument | null;
    footer: PageDocument | null;
  }>({ header: null, footer: null });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<'header' | 'footer' | null>(null);
  const repository = new SupabasePageRepository(storeId);
  // Load existing system pages when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSystemPages();
    }
  }, [isOpen, storeId]);
  const loadSystemPages = async () => {
    setLoading(true);
    try {
      const pages = await repository.listSystemPages();
      setSystemPages(pages);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const createSystemPage = async (pageType: 'header' | 'footer') => {
    setCreating(pageType);
    try {
      const newPage = await repository.createSystemPage(pageType);
      setSystemPages(prev => ({ ...prev, [pageType]: newPage }));
      onPageCreated?.(newPage);
    } catch (error) {
      alert(`Failed to create ${pageType} page. Please try again.`);
    } finally {
      setCreating(null);
    }
  };
  const handleEditPage = (page: PageDocument) => {
    onEditPage?.(page);
    onClose();
  };
  if (!isOpen) return null;
  const SystemPageCard = ({ 
    pageType, 
    page, 
    title, 
    description, 
    icon: Icon 
  }: {
    pageType: 'header' | 'footer';
    page: PageDocument | null;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {page && page.colorPalette && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 rounded-md">
            <Palette className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">
              {page.colorPalette.name}
            </span>
          </div>
        )}
      </div>
      {page ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">{page.name}</div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(page.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  page.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {page.sections.length} section{page.sections.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditPage(page)}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-gray-500 mb-4">
            No {pageType} page created yet
          </div>
          <button
            onClick={() => createSystemPage(pageType)}
            disabled={creating === pageType}
            className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>
              {creating === pageType ? 'Creating...' : `Create ${title}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Header & Footer Pages</h2>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage your website's header and footer areas
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading system pages...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SystemPageCard
                pageType="header"
                page={systemPages.header}
                title="Site Header"
                description="Top navigation and branding area"
                icon={Navigation}
              />
              <SystemPageCard
                pageType="footer"
                page={systemPages.footer}
                title="Site Footer"
                description="Bottom content and links area"
                icon={Navigation}
              />
            </div>
          )}
          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">About Header & Footer Pages</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Header and footer pages are displayed on all pages of your website</li>
              <li>• They support all page builder widgets and color palette customization</li>
              <li>• System pages do not appear in your site navigation by default</li>
              <li>• Each store can only have one header and one footer page</li>
              <li>• Use widgets like navigation menus, logos, contact info, and social links</li>
            </ul>
          </div>
        </div>
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};