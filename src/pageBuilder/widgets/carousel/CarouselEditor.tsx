/**
 * Carousel Editor Component
 */

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Image, Video, FileText, Settings, Play, Eye, Move } from 'lucide-react';
import type { WidgetEditorProps } from '../../types';
import type { CarouselProps, CarouselSlide } from './index';

export const CarouselEditor: React.FC<WidgetEditorProps> = ({ widget, onChange, onDelete, onDuplicate }) => {
  const props = widget.props as CarouselProps;
  const [activeTab, setActiveTab] = useState<'slides' | 'settings' | 'design'>('slides');
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);

  const updateProps = useCallback((updates: Partial<CarouselProps>) => {
    onChange({
      props: { ...props, ...updates }
    });
  }, [props, onChange]);

  const addSlide = useCallback((type: CarouselSlide['type']) => {
    const newSlide: CarouselSlide = {
      id: `slide_${Date.now()}`,
      type,
      ...(type === 'image' || type === 'video' ? {
        media: {
          src: '',
          alt: type === 'image' ? 'Slide image' : undefined,
          poster: type === 'video' ? '' : undefined,
        }
      } : {}),
      content: {
        title: 'Slide Title',
        subtitle: 'Slide Subtitle',
        description: 'Slide description goes here',
      },
      overlay: {
        enabled: true,
        color: '#000000',
        opacity: 0.4,
        position: 'center',
      },
    };
    
    updateProps({
      slides: [...props.slides, newSlide]
    });
  }, [props.slides, updateProps]);

  const updateSlide = useCallback((slideId: string, updates: Partial<CarouselSlide>) => {
    const updatedSlides = props.slides.map(slide => 
      slide.id === slideId ? { ...slide, ...updates } : slide
    );
    updateProps({ slides: updatedSlides });
  }, [props.slides, updateProps]);

  const removeSlide = useCallback((slideId: string) => {
    const updatedSlides = props.slides.filter(slide => slide.id !== slideId);
    updateProps({ slides: updatedSlides });
  }, [props.slides, updateProps]);

  const moveSlide = useCallback((fromIndex: number, toIndex: number) => {
    const slides = [...props.slides];
    const [moved] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, moved);
    updateProps({ slides });
  }, [props.slides, updateProps]);

  const renderSlidesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Carousel Slides</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => addSlide('image')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Add Image Slide"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            onClick={() => addSlide('video')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Add Video Slide"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            onClick={() => addSlide('content')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Add Content Slide"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {props.slides.map((slide, index) => (
          <div key={slide.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {slide.type === 'image' && <Image className="w-5 h-5 text-blue-600" />}
                {slide.type === 'video' && <Video className="w-5 h-5 text-purple-600" />}
                {slide.type === 'content' && <FileText className="w-5 h-5 text-green-600" />}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Slide {index + 1} ({slide.type})
                  </h4>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => moveSlide(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSlide(index, Math.min(props.slides.length - 1, index + 1))}
                      disabled={index === props.slides.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeSlide(slide.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Media settings */}
                {(slide.type === 'image' || slide.type === 'video') && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder={slide.type === 'image' ? 'Image URL' : 'Video URL'}
                      value={slide.media?.src || ''}
                      onChange={(e) => updateSlide(slide.id, {
                        media: { ...slide.media, src: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    {slide.type === 'image' && index === 0 && (
                      <p className="text-xs text-gray-500">
                        Need images? Visit{' '}
                        <a
                          href="https://unsplash.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Unsplash
                        </a>{' '}
                        for free photos. Right-click on an image and select "Copy image address" to get the direct URL.
                      </p>
                    )}
                    
                    {slide.type === 'image' && (
                      <input
                        type="text"
                        placeholder="Alt text"
                        value={slide.media?.alt || ''}
                        onChange={(e) => updateSlide(slide.id, {
                          media: { ...slide.media, alt: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    )}
                    
                    {slide.type === 'video' && (
                      <input
                        type="url"
                        placeholder="Video poster image URL"
                        value={slide.media?.poster || ''}
                        onChange={(e) => updateSlide(slide.id, {
                          media: { ...slide.media, poster: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    )}
                  </div>
                )}

                {/* Content settings */}
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={slide.content?.title || ''}
                    onChange={(e) => updateSlide(slide.id, {
                      content: { ...slide.content, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium"
                  />
                  
                  <input
                    type="text"
                    placeholder="Subtitle"
                    value={slide.content?.subtitle || ''}
                    onChange={(e) => updateSlide(slide.id, {
                      content: { ...slide.content, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  
                  <textarea
                    placeholder="Description"
                    value={slide.content?.description || ''}
                    onChange={(e) => updateSlide(slide.id, {
                      content: { ...slide.content, description: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                    rows={2}
                  />

                  {/* Button settings */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Button text"
                      value={slide.content?.button?.text || ''}
                      onChange={(e) => updateSlide(slide.id, {
                        content: {
                          ...slide.content,
                          button: { ...slide.content?.button, text: e.target.value, url: slide.content?.button?.url || '', style: slide.content?.button?.style || 'primary' }
                        }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    
                    <input
                      type="url"
                      placeholder="Button URL"
                      value={slide.content?.button?.url || ''}
                      onChange={(e) => updateSlide(slide.id, {
                        content: {
                          ...slide.content,
                          button: { ...slide.content?.button, url: e.target.value, text: slide.content?.button?.text || '', style: slide.content?.button?.style || 'primary' }
                        }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <select
                    value={slide.content?.button?.style || 'primary'}
                    onChange={(e) => updateSlide(slide.id, {
                      content: {
                        ...slide.content,
                        button: { ...slide.content?.button, style: e.target.value as any, text: slide.content?.button?.text || '', url: slide.content?.button?.url || '' }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="primary">Primary Button</option>
                    <option value="secondary">Secondary Button</option>
                    <option value="outline">Outline Button</option>
                  </select>
                </div>

                {/* Overlay settings */}
                <div className="border-t pt-3 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={slide.overlay?.enabled || false}
                      onChange={(e) => updateSlide(slide.id, {
                        overlay: { ...slide.overlay, enabled: e.target.checked, color: slide.overlay?.color || '#000000', opacity: slide.overlay?.opacity || 0.4, position: slide.overlay?.position || 'center' }
                      })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Enable overlay</span>
                  </label>

                  {slide.overlay?.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="color"
                        value={slide.overlay.color}
                        onChange={(e) => updateSlide(slide.id, {
                          overlay: { ...slide.overlay, color: e.target.value }
                        })}
                        className="h-8 border border-gray-300 rounded"
                      />
                      
                      <select
                        value={slide.overlay.position}
                        onChange={(e) => updateSlide(slide.id, {
                          overlay: { ...slide.overlay, position: e.target.value as any }
                        })}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Opacity: {Math.round((slide.overlay.opacity || 0.4) * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={slide.overlay.opacity || 0.4}
                          onChange={(e) => updateSlide(slide.id, {
                            overlay: { ...slide.overlay, opacity: parseFloat(e.target.value) }
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {props.slides.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No slides added yet</p>
          <p className="text-sm">Click the buttons above to add your first slide</p>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Playback</h4>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.autoplay}
            onChange={(e) => updateProps({ autoplay: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Autoplay slides</span>
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
              value={props.autoplaySpeed}
              onChange={(e) => updateProps({ autoplaySpeed: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.infinite}
            onChange={(e) => updateProps({ infinite: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Infinite loop</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.pauseOnHover}
            onChange={(e) => updateProps({ pauseOnHover: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Pause on hover</span>
        </label>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-gray-900">Display</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
          <select
            value={props.aspectRatio}
            onChange={(e) => updateProps({ aspectRatio: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="auto">Auto</option>
            <option value="16/9">16:9 (Widescreen)</option>
            <option value="4/3">4:3 (Standard)</option>
            <option value="3/2">3:2 (Classic)</option>
            <option value="square">1:1 (Square)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {props.aspectRatio === 'custom' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="number"
                min="1"
                value={props.customAspectRatio?.width || 16}
                onChange={(e) => updateProps({
                  customAspectRatio: {
                    width: parseInt(e.target.value) || 16,
                    height: props.customAspectRatio?.height || 9
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="number"
                min="1"
                value={props.customAspectRatio?.height || 9}
                onChange={(e) => updateProps({
                  customAspectRatio: {
                    width: props.customAspectRatio?.width || 16,
                    height: parseInt(e.target.value) || 9
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.showArrows}
              onChange={(e) => updateProps({ showArrows: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Show navigation arrows</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.showDots}
              onChange={(e) => updateProps({ showDots: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Show dots indicator</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={props.showProgress}
              onChange={(e) => updateProps({ showProgress: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Show progress bar</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Navigation Style</h4>
        
        {props.showArrows && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arrow Style</label>
              <select
                value={props.navigation.arrowStyle}
                onChange={(e) => updateProps({
                  navigation: { ...props.navigation, arrowStyle: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="default">Default</option>
                <option value="minimal">Minimal</option>
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arrow Size</label>
              <select
                value={props.navigation.arrowSize}
                onChange={(e) => updateProps({
                  navigation: { ...props.navigation, arrowSize: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arrow Color</label>
              <input
                type="color"
                value={props.navigation.arrowColor}
                onChange={(e) => updateProps({
                  navigation: { ...props.navigation, arrowColor: e.target.value }
                })}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}

        {props.showDots && (
          <div className="space-y-3 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dot Style</label>
              <select
                value={props.navigation.dotStyle}
                onChange={(e) => updateProps({
                  navigation: { ...props.navigation, dotStyle: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="default">Default</option>
                <option value="line">Line</option>
                <option value="square">Square</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dot Size</label>
              <select
                value={props.navigation.dotSize}
                onChange={(e) => updateProps({
                  navigation: { ...props.navigation, dotSize: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dot Color</label>
                <input
                  type="color"
                  value={props.navigation.dotColor}
                  onChange={(e) => updateProps({
                    navigation: { ...props.navigation, dotColor: e.target.value }
                  })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Active Color</label>
                <input
                  type="color"
                  value={props.navigation.dotActiveColor}
                  onChange={(e) => updateProps({
                    navigation: { ...props.navigation, dotActiveColor: e.target.value }
                  })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-gray-900">Transition</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transition Type</label>
          <select
            value={props.transition.type}
            onChange={(e) => updateProps({
              transition: { ...props.transition, type: e.target.value as any }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="cube">Cube</option>
            <option value="flip">Flip</option>
            <option value="coverflow">Coverflow</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration: {props.transition.duration}ms
          </label>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={props.transition.duration}
            onChange={(e) => updateProps({
              transition: { ...props.transition, duration: parseInt(e.target.value) }
            })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Easing</label>
          <select
            value={props.transition.easing}
            onChange={(e) => updateProps({
              transition: { ...props.transition, easing: e.target.value as any }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="ease">Ease</option>
            <option value="ease-in">Ease In</option>
            <option value="ease-out">Ease Out</option>
            <option value="ease-in-out">Ease In Out</option>
            <option value="linear">Linear</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Carousel Settings</h3>
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
          { id: 'slides', label: 'Slides', icon: Play },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'design', label: 'Design', icon: Eye },
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
      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'slides' && renderSlidesTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'design' && renderDesignTab()}
      </div>
    </div>
  );
};