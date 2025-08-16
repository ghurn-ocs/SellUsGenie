/**
 * Gallery Editor Component
 */

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Image, Settings, Upload, Link2, Tag } from 'lucide-react';
import type { WidgetEditorProps } from '../../types';
import type { GalleryProps, GalleryImage } from './index';

export const GalleryEditor: React.FC<WidgetEditorProps> = ({ widget, onChange, onDelete, onDuplicate }) => {
  const props = widget.props as GalleryProps;
  const [activeTab, setActiveTab] = useState<'images' | 'layout' | 'settings'>('images');
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  const updateProps = useCallback((updates: Partial<GalleryProps>) => {
    onChange({
      props: { ...props, ...updates }
    });
  }, [props, onChange]);

  const addImage = useCallback(() => {
    const newImage: GalleryImage = {
      id: `img_${Date.now()}`,
      src: '',
      alt: '',
      title: '',
      description: '',
    };
    
    updateProps({
      images: [...props.images, newImage]
    });
  }, [props.images, updateProps]);

  const updateImage = useCallback((imageId: string, updates: Partial<GalleryImage>) => {
    const updatedImages = props.images.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    );
    updateProps({ images: updatedImages });
  }, [props.images, updateProps]);

  const removeImage = useCallback((imageId: string) => {
    const updatedImages = props.images.filter(img => img.id !== imageId);
    updateProps({ images: updatedImages });
  }, [props.images, updateProps]);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    const images = [...props.images];
    const [moved] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, moved);
    updateProps({ images });
  }, [props.images, updateProps]);

  const renderImagesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Gallery Images</h3>
        <button
          onClick={addImage}
          className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Image</span>
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {props.images.map((image, index) => (
          <div key={image.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              {image.src ? (
                <img src={image.src} alt={image.alt} className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <Image className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  placeholder="Image URL"
                  value={image.src}
                  onChange={(e) => updateImage(image.id, { src: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                
                <input
                  type="text"
                  placeholder="Alt text (required)"
                  value={image.alt}
                  onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                
                <input
                  type="text"
                  placeholder="Title"
                  value={image.title || ''}
                  onChange={(e) => updateImage(image.id, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                
                <textarea
                  placeholder="Description"
                  value={image.description || ''}
                  onChange={(e) => updateImage(image.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  rows={2}
                />
                
                <input
                  type="url"
                  placeholder="Link URL"
                  value={image.link || ''}
                  onChange={(e) => updateImage(image.id, { link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <button
                onClick={() => removeImage(image.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Layout Type</label>
        <select
          value={props.layout}
          onChange={(e) => updateProps({ layout: e.target.value as GalleryProps['layout'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="grid">Grid</option>
          <option value="masonry">Masonry</option>
          <option value="carousel">Carousel</option>
          <option value="slider">Slider</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mobile</label>
            <select
              value={props.columns.sm}
              onChange={(e) => updateProps({ 
                columns: { ...props.columns, sm: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tablet</label>
            <select
              value={props.columns.md}
              onChange={(e) => updateProps({ 
                columns: { ...props.columns, md: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desktop</label>
            <select
              value={props.columns.lg}
              onChange={(e) => updateProps({ 
                columns: { ...props.columns, lg: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spacing: {props.spacing}px
        </label>
        <input
          type="range"
          min="0"
          max="48"
          step="4"
          value={props.spacing}
          onChange={(e) => updateProps({ spacing: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
        <select
          value={props.aspectRatio || 'auto'}
          onChange={(e) => updateProps({ aspectRatio: e.target.value === 'auto' ? undefined : e.target.value as GalleryProps['aspectRatio'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="auto">Auto</option>
          <option value="square">Square (1:1)</option>
          <option value="16/9">Widescreen (16:9)</option>
          <option value="4/3">Standard (4:3)</option>
          <option value="3/2">Classic (3:2)</option>
        </select>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.showCaptions}
            onChange={(e) => updateProps({ showCaptions: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Show captions</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.enableLightbox}
            onChange={(e) => updateProps({ enableLightbox: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Enable lightbox</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.lazyLoad}
            onChange={(e) => updateProps({ lazyLoad: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Lazy loading</span>
        </label>
      </div>

      {(props.layout === 'carousel' || props.layout === 'slider') && (
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium text-gray-900">Carousel Settings</h4>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.autoplay}
              onChange={(e) => updateProps({ autoplay: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Autoplay</span>
          </label>

          {props.autoplay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autoplay Speed: {props.autoplaySpeed}ms
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={props.autoplaySpeed || 3000}
                onChange={(e) => updateProps({ autoplaySpeed: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.showDots}
              onChange={(e) => updateProps({ showDots: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Show dots</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.showArrows}
              onChange={(e) => updateProps({ showArrows: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Show arrows</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.infinite}
              onChange={(e) => updateProps({ infinite: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Infinite loop</span>
          </label>
        </div>
      )}

      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-gray-900">Animation</h4>
        <select
          value={props.animation}
          onChange={(e) => updateProps({ animation: e.target.value as GalleryProps['animation'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="zoom">Zoom</option>
          <option value="flip">Flip</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Gallery Settings</h3>
        <div className="flex space-x-2">
          <button
            onClick={onDuplicate}
            className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Duplicate
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'images', label: 'Images', icon: Image },
          { id: 'layout', label: 'Layout', icon: Settings },
          { id: 'settings', label: 'Settings', icon: Tag },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'images' && renderImagesTab()}
        {activeTab === 'layout' && renderLayoutTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};