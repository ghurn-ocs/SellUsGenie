/**
 * Template Marketplace
 * Browse, preview, and import page templates
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, Download, Eye, Tag, Grid3X3, List, ChevronDown } from 'lucide-react';
import type { PageTemplate } from '../types';
import { templateLibrary } from './library';

interface TemplateMarketplaceProps {
  onSelectTemplate: (template: PageTemplate) => void;
  onClose: () => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'popular' | 'recent' | 'rating';

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  onSelectTemplate,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates', count: templateLibrary.length },
    { id: 'landing', name: 'Landing Pages', count: templateLibrary.filter(t => t.category === 'landing').length },
    { id: 'ecommerce', name: 'E-commerce', count: templateLibrary.filter(t => t.category === 'ecommerce').length },
    { id: 'blog', name: 'Blog', count: templateLibrary.filter(t => t.category === 'blog').length },
    { id: 'portfolio', name: 'Portfolio', count: templateLibrary.filter(t => t.category === 'portfolio').length },
    { id: 'business', name: 'Business', count: templateLibrary.filter(t => t.category === 'business').length },
    { id: 'event', name: 'Events', count: templateLibrary.filter(t => t.category === 'event').length },
  ];

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    templateLibrary.forEach(template => {
      template.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  const filteredTemplates = useMemo(() => {
    let filtered = templateLibrary;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(template =>
        selectedTags.every(tag => template.tags?.includes(tag))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'recent':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const renderTemplateGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredTemplates.map((template) => (
        <div
          key={template.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            {template.thumbnail ? (
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Grid3X3 className="w-12 h-12" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="p-2 bg-white rounded-full text-gray-700 hover:text-primary-600 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="p-2 bg-primary-600 rounded-full text-white hover:bg-primary-700 transition-colors"
                  title="Use Template"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {template.isPro && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                PRO
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {template.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating}</span>
                  </div>
                )}
                {template.downloads && (
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{template.downloads}</span>
                  </div>
                )}
              </div>
              
              {template.author && (
                <span>by {template.author}</span>
              )}
            </div>

            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{template.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTemplateList = () => (
    <div className="space-y-4">
      {filteredTemplates.map((template) => (
        <div
          key={template.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start space-x-4">
            <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {template.thumbnail ? (
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Grid3X3 className="w-8 h-8" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {template.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{template.rating}</span>
                    </div>
                  )}
                  {template.downloads && (
                    <div className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>{template.downloads}</span>
                    </div>
                  )}
                  {template.author && <span>by {template.author}</span>}
                </div>
                
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPreviewModal = () => {
    if (!previewTemplate) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{previewTemplate.name}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelectTemplate(previewTemplate)}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                Use Template
              </button>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {previewTemplate.thumbnail ? (
                <img
                  src={previewTemplate.thumbnail}
                  alt={previewTemplate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Grid3X3 className="w-24 h-24" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{previewTemplate.description}</p>
              </div>
              
              {previewTemplate.features && previewTemplate.features.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {previewTemplate.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {previewTemplate.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{previewTemplate.rating}</span>
                    </div>
                  )}
                  {previewTemplate.downloads && (
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{previewTemplate.downloads} downloads</span>
                    </div>
                  )}
                </div>
                
                {previewTemplate.author && (
                  <span className="text-sm text-gray-500">by {previewTemplate.author}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-40 bg-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Template Marketplace</h1>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
                />
              </div>
              
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Most Recent</option>
                  <option value="name">Name A-Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredTemplates.length} templates
                </p>
                
                {selectedTags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Filtered by:</span>
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => toggleTag(tag)}
                          className="hover:text-primary-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            ) : viewMode === 'grid' ? (
              renderTemplateGrid()
            ) : (
              renderTemplateList()
            )}
          </div>
        </div>
      </div>

      {renderPreviewModal()}
    </div>
  );
};