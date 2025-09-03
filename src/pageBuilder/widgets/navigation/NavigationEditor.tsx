import React from 'react';
import type { NavigationWidgetProps } from './NavigationView';

interface NavigationEditorProps {
  widget: NavigationWidgetProps;
  onUpdate: (updates: Partial<NavigationWidgetProps['props']>) => void;
}

export const NavigationEditor: React.FC<NavigationEditorProps> = ({ widget, onUpdate }) => {
  const { links = [], className = '', linkClassName = '', activeLinkClassName = '' } = widget.props;

  const addLink = () => {
    const newLinks = [...links, { name: 'New Link', href: '/new-page' }];
    onUpdate({ links: newLinks });
  };

  const updateLink = (index: number, field: 'name' | 'href', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onUpdate({ links: newLinks });
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    onUpdate({ links: newLinks });
  };

  return (
    <div className="widget-editor">
      <div className="widget-editor-header">
        <h3>Navigation Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Navigation Links */}
        <div>
          <label className="widget-editor-label">Navigation Links</label>
          <div className="space-y-2">
            {links.map((link, index) => (
              <div key={index} className="flex space-x-2 items-center p-2 border rounded">
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => updateLink(index, 'name', e.target.value)}
                  placeholder="Link Name"
                  className="widget-editor-input flex-1"
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateLink(index, 'href', e.target.value)}
                  placeholder="/page-slug"
                  className="widget-editor-input flex-1"
                />
                <button
                  onClick={() => removeLink(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addLink}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              + Add Link
            </button>
          </div>
        </div>

        {/* Styling Options */}
        <div>
          <label className="widget-editor-label">Container CSS Class</label>
          <input
            type="text"
            value={className}
            onChange={(e) => onUpdate({ className: e.target.value })}
            placeholder="hidden md:flex space-x-8"
            className="widget-editor-input"
          />
        </div>

        <div>
          <label className="widget-editor-label">Link CSS Class</label>
          <input
            type="text"
            value={linkClassName}
            onChange={(e) => onUpdate({ linkClassName: e.target.value })}
            placeholder="Leave empty to use theme colors"
            className="widget-editor-input"
          />
        </div>

        <div>
          <label className="widget-editor-label">Active Link CSS Class</label>
          <input
            type="text"
            value={activeLinkClassName}
            onChange={(e) => onUpdate({ activeLinkClassName: e.target.value })}
            placeholder="text-blue-600 font-semibold"
            className="widget-editor-input"
          />
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
          <p><strong>Dynamic Navigation Widget</strong></p>
          <p>This widget automatically handles store routing. Links will be prefixed with your store slug.</p>
          <p>Leave links empty to automatically load published pages from Visual Page Builder with navigation placement set to "header".</p>
        </div>
      </div>
    </div>
  );
};