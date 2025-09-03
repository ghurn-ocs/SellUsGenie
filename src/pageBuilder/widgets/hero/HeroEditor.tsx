/**
 * Hero Widget Editor - Enhanced with Expandable Sections
 * Configuration interface for hero banners
 */

import React, { useState } from 'react';
import { WidgetEditorProps } from '../../types';
import { HeroProps } from './index';
import { ExpandableSection } from '../../components/ExpandableSection';
import { 
  FileText,
  Image,
  Palette,
  Settings,
  MousePointer
} from 'lucide-react';

export const HeroEditor: React.FC<WidgetEditorProps> = ({ widget, onChange, onDelete, onDuplicate }) => {
  const props = (widget.props as HeroProps) || {};
  
  // State for managing which sections are open
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['content', 'appearance']) // Open key sections by default
  );

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const handleChange = (updates: Partial<HeroProps>) => {
    onChange({
      props: { ...props, ...updates }
    });
  };

  return (
    <div className="space-y-0">
      {/* Content */}
      <ExpandableSection
        title="Content"
        description="Hero title and subtitle text"
        icon={FileText}
        isOpen={openSections.has('content')}
        onToggle={() => toggleSection('content')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={props.title || ''}
              onChange={(e) => handleChange({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter hero title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <textarea
              value={props.subtitle || ''}
              onChange={(e) => handleChange({ subtitle: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter hero subtitle..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional descriptive text shown below the main title
            </p>
          </div>
        </div>
      </ExpandableSection>

      {/* Background */}
      <ExpandableSection
        title="Background"
        description="Background styling and media"
        icon={Image}
        isOpen={openSections.has('background')}
        onToggle={() => toggleSection('background')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Type
            </label>
            <select
              value={props.backgroundType || 'color'}
              onChange={(e) => handleChange({ backgroundType: e.target.value as 'image' | 'video' | 'color' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="color">Solid Color</option>
              <option value="image">Background Image</option>
              <option value="video">Background Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <input
              type="color"
              value={props.backgroundColor || '#f3f4f6'}
              onChange={(e) => handleChange({ backgroundColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {props.backgroundType === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image URL
              </label>
              <input
                type="url"
                value={props.backgroundImage || ''}
                onChange={(e) => handleChange({ backgroundImage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {props.backgroundImage && props.backgroundImage.includes('unsplash.com/photos/') && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ This looks like an Unsplash page URL. Right-click on the image and select "Copy image address" to get the direct image URL instead.
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
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
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Appearance */}
      <ExpandableSection
        title="Appearance"
        description="Colors, size, and alignment"
        icon={Palette}
        isOpen={openSections.has('appearance')}
        onToggle={() => toggleSection('appearance')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <input
              type="color"
              value={props.textColor || '#000000'}
              onChange={(e) => handleChange({ textColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <select
              value={props.height || 'medium'}
              onChange={(e) => handleChange({ height: e.target.value as 'small' | 'medium' | 'large' | 'full' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="small">Small (256px)</option>
              <option value="medium">Medium (384px)</option>
              <option value="large">Large (100vh)</option>
              <option value="full">Full Screen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Alignment
            </label>
            <select
              value={props.alignment || 'center'}
              onChange={(e) => handleChange({ alignment: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </ExpandableSection>

      {/* Call to Action */}
      <ExpandableSection
        title="Call to Action"
        description="Button text, link, and styling"
        icon={MousePointer}
        isOpen={openSections.has('cta')}
        onToggle={() => toggleSection('cta')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={props.ctaText || ''}
              onChange={(e) => handleChange({ ctaText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Shop Now"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to hide the button
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Link
            </label>
            <input
              type="url"
              value={props.ctaLink || ''}
              onChange={(e) => handleChange({ ctaLink: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Style
            </label>
            <select
              value={props.ctaVariant || 'primary'}
              onChange={(e) => handleChange({ ctaVariant: e.target.value as 'primary' | 'secondary' | 'outline' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="primary">Primary (Blue)</option>
              <option value="secondary">Secondary (Gray)</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
};