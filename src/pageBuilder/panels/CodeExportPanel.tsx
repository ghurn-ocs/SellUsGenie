/**
 * Code Export Panel
 * Advanced code generation and export system for producing clean, semantic HTML and CSS
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Code, 
  Download, 
  Eye, 
  Copy, 
  Settings, 
  FileText, 
  Globe, 
  Smartphone, 
  Monitor, 
  Zap, 
  Check, 
  X, 
  RefreshCw, 
  Package, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Info
} from 'lucide-react';
import { useEditorStore, type EnhancedElement, type CMSCollection } from '../store/EditorStore';
import type { PageDocument, Breakpoint } from '../types';

interface CodeExportPanelProps {
  className?: string;
}

interface ExportSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

interface ExportOptions {
  format: 'html' | 'react' | 'vue' | 'static';
  includeCSS: boolean;
  inlineCSS: boolean;
  includeJS: boolean;
  minify: boolean;
  responsive: boolean;
  semantic: boolean;
  accessibility: boolean;
  seo: boolean;
  analytics: boolean;
  cdn: boolean;
  framework: 'none' | 'bootstrap' | 'tailwind' | 'custom';
}

interface GeneratedCode {
  html: string;
  css: string;
  js: string;
  manifest: any;
}

// Default export options
const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'html',
  includeCSS: true,
  inlineCSS: false,
  includeJS: true,
  minify: true,
  responsive: true,
  semantic: true,
  accessibility: true,
  seo: true,
  analytics: false,
  cdn: true,
  framework: 'none',
};

// Export Section Component
const ExportSection: React.FC<ExportSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-800">{title}</span>
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
    {isOpen && (
      <div className="p-3 pt-0 space-y-3 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// Code Preview Component
interface CodePreviewProps {
  code: string;
  language: 'html' | 'css' | 'javascript';
  onCopy: () => void;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, language, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-300 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 text-xs overflow-x-auto max-h-64">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Code generator functions
const generateHTML = (document: PageDocument, options: ExportOptions, collections: CMSCollection[]): string => {
  const { semantic, accessibility, seo, responsive, framework } = options;
  
  // Generate DOCTYPE and html opening
  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
  
  // Meta tags
  html += '    <meta charset="UTF-8">\n';
  html += '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  
  if (seo && document.seo) {
    html += `    <title>${document.seo.metaTitle || document.name}</title>\n`;
    if (document.seo.metaDescription) {
      html += `    <meta name="description" content="${document.seo.metaDescription}">\n`;
    }
    if (document.seo.keywords) {
      html += `    <meta name="keywords" content="${document.seo.keywords}">\n`;
    }
  }
  
  // CSS includes
  if (options.includeCSS && !options.inlineCSS) {
    if (framework === 'bootstrap') {
      html += '    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n';
    } else if (framework === 'tailwind') {
      html += '    <link href="https://cdn.tailwindcss.com" rel="stylesheet">\n';
    }
    html += '    <link rel="stylesheet" href="styles.css">\n';
  }
  
  html += '</head>\n<body>\n';
  
  // Generate body content
  for (const section of document.sections) {
    const sectionTag = semantic ? 'section' : 'div';
    html += `    <${sectionTag} class="section section-${section.id}">\n`;
    
    for (const row of section.rows) {
      html += '        <div class="row">\n';
      
      for (const widget of row.widgets) {
        const element = widget as EnhancedElement;
        html += generateElementHTML(element, options, 3);
      }
      
      html += '        </div>\n';
    }
    
    html += `    </${sectionTag}>\n`;
  }
  
  // JavaScript includes
  if (options.includeJS) {
    if (framework === 'bootstrap') {
      html += '    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n';
    }
    html += '    <script src="script.js"></script>\n';
  }
  
  html += '</body>\n</html>';
  
  return options.minify ? minifyHTML(html) : html;
};

const generateElementHTML = (element: EnhancedElement, options: ExportOptions, indentLevel: number): string => {
  const indent = '    '.repeat(indentLevel);
  const { semantic, accessibility } = options;
  
  let attributes = '';
  
  // Add classes
  if (element.classList.length > 0) {
    attributes += ` class="${element.classList.join(' ')}"`;
  }
  
  // Add custom attributes
  for (const [key, value] of Object.entries(element.attributes)) {
    attributes += ` ${key}="${value}"`;
  }
  
  // Add accessibility attributes
  if (accessibility && element.seo) {
    if (element.seo.ariaLabel) {
      attributes += ` aria-label="${element.seo.ariaLabel}"`;
    }
    if (element.seo.role) {
      attributes += ` role="${element.seo.role}"`;
    }
  }
  
  // Generate element HTML
  let html = `${indent}<${element.tagName}${attributes}>`;
  
  if (element.textContent) {
    html += element.textContent;
  } else if (element.innerHTML) {
    html += element.innerHTML;
  }
  
  html += `</${element.tagName}>\n`;
  
  return html;
};

const generateCSS = (document: PageDocument, options: ExportOptions): string => {
  const { responsive, minify } = options;
  let css = '';
  
  // Reset styles
  css += '/* Reset Styles */\n';
  css += '* { margin: 0; padding: 0; box-sizing: border-box; }\n\n';
  
  // Collect all unique elements and their styles
  const elementStyles = new Map<string, EnhancedElement>();
  
  for (const section of document.sections) {
    for (const row of section.rows) {
      for (const widget of row.widgets) {
        const element = widget as EnhancedElement;
        if (element.styles) {
          elementStyles.set(element.id, element);
        }
      }
    }
  }
  
  // Generate base styles
  css += '/* Base Styles */\n';
  for (const [id, element] of elementStyles) {
    if (element.styles.base) {
      css += generateElementCSS(element, 'base', element.styles.base);
    }
  }
  
  // Generate responsive styles
  if (responsive) {
    const breakpoints = { sm: '768px', md: '1024px', lg: '1200px' };
    
    for (const [bp, size] of Object.entries(breakpoints)) {
      let hasResponsiveStyles = false;
      let responsiveCSS = `\n/* ${bp.toUpperCase()} Breakpoint - ${size} and up */\n@media (min-width: ${size}) {\n`;
      
      for (const [id, element] of elementStyles) {
        const responsiveStyles = element.styles.responsive?.[bp as Breakpoint];
        if (responsiveStyles && Object.keys(responsiveStyles).length > 0) {
          responsiveCSS += generateElementCSS(element, bp as Breakpoint, responsiveStyles, 1);
          hasResponsiveStyles = true;
        }
      }
      
      responsiveCSS += '}\n';
      
      if (hasResponsiveStyles) {
        css += responsiveCSS;
      }
    }
  }
  
  // Generate hover and interaction styles
  css += '\n/* Interaction Styles */\n';
  for (const [id, element] of elementStyles) {
    if (element.styles.hover) {
      css += generateElementCSS(element, 'hover', element.styles.hover);
    }
    if (element.styles.focus) {
      css += generateElementCSS(element, 'focus', element.styles.focus);
    }
    if (element.styles.active) {
      css += generateElementCSS(element, 'active', element.styles.active);
    }
  }
  
  return minify ? minifyCSS(css) : css;
};

const generateElementCSS = (element: EnhancedElement, state: string, styles: any, indentLevel: number = 0): string => {
  const indent = '    '.repeat(indentLevel);
  const selector = element.classList.length > 0 
    ? `.${element.classList.join('.')}`
    : `#${element.id}`;
  
  let selectorSuffix = '';
  if (state === 'hover') selectorSuffix = ':hover';
  else if (state === 'focus') selectorSuffix = ':focus';
  else if (state === 'active') selectorSuffix = ':active';
  
  let css = `${indent}${selector}${selectorSuffix} {\n`;
  
  for (const [property, value] of Object.entries(styles)) {
    if (value !== undefined && value !== null) {
      const cssProperty = camelToDash(property);
      css += `${indent}    ${cssProperty}: ${value};\n`;
    }
  }
  
  css += `${indent}}\n\n`;
  
  return css;
};

const generateJavaScript = (document: PageDocument, options: ExportOptions, collections: CMSCollection[]): string => {
  let js = '';
  
  // Animation and interaction scripts
  js += '// Page interactions and animations\n';
  js += 'document.addEventListener("DOMContentLoaded", function() {\n';
  
  // Collect elements with animations
  for (const section of document.sections) {
    for (const row of section.rows) {
      for (const widget of row.widgets) {
        const element = widget as EnhancedElement;
        if (element.animations) {
          js += generateElementAnimations(element);
        }
        if (element.interactions) {
          js += generateElementInteractions(element);
        }
      }
    }
  }
  
  js += '});\n\n';
  
  // CMS data binding scripts
  if (collections.length > 0) {
    js += '// CMS Data Binding\n';
    js += 'const cmsData = {\n';
    for (const collection of collections) {
      js += `    ${collection.slug}: ${JSON.stringify(collection.items, null, 2)},\n`;
    }
    js += '};\n\n';
    js += generateDataBindingScript();
  }
  
  return options.minify ? minifyJS(js) : js;
};

const generateElementAnimations = (element: EnhancedElement): string => {
  let js = '';
  
  if (element.animations.scroll) {
    js += `    // Scroll animation for ${element.id}\n`;
    js += `    const observer${element.id} = new IntersectionObserver((entries) => {\n`;
    js += `        entries.forEach(entry => {\n`;
    js += `            if (entry.isIntersecting) {\n`;
    js += `                entry.target.classList.add('animate-in');\n`;
    js += `            }\n`;
    js += `        });\n`;
    js += `    });\n`;
    js += `    const element${element.id} = document.getElementById('${element.id}');\n`;
    js += `    if (element${element.id}) observer${element.id}.observe(element${element.id});\n\n`;
  }
  
  return js;
};

const generateElementInteractions = (element: EnhancedElement): string => {
  let js = '';
  
  if (element.interactions.onClick) {
    js += `    // Click interaction for ${element.id}\n`;
    js += `    document.getElementById('${element.id}')?.addEventListener('click', function() {\n`;
    js += `        ${element.interactions.onClick}\n`;
    js += `    });\n\n`;
  }
  
  return js;
};

const generateDataBindingScript = (): string => {
  return `
// Data binding utility
function bindCMSData() {
    document.querySelectorAll('[data-cms-bind]').forEach(element => {
        const binding = element.getAttribute('data-cms-bind');
        const [collection, field] = binding.split('.');
        
        if (cmsData[collection] && cmsData[collection].length > 0) {
            const item = cmsData[collection][0];
            if (item.data[field]) {
                element.textContent = item.data[field];
            }
        }
    });
}

bindCMSData();
`;
};

// Utility functions
const camelToDash = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

const minifyHTML = (html: string): string => {
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
};

const minifyCSS = (css: string): string => {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/;\s*}/g, '}')
    .replace(/{\s*/g, '{')
    .replace(/;\s*/g, ';')
    .trim();
};

const minifyJS = (js: string): string => {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Main Code Export Panel Component
const CodeExportPanel: React.FC<CodeExportPanelProps> = ({ className }) => {
  const { document, collections, generateCode, exportHTML, exportCSS } = useEditorStore();
  
  const [openSections, setOpenSections] = useState({
    options: true,
    preview: false,
    download: false,
  });
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Toggle section open/closed
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Generate code
  const handleGenerateCode = useCallback(async () => {
    if (!document) return;
    
    setIsGenerating(true);
    
    try {
      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const html = generateHTML(document, exportOptions, collections);
      const css = generateCSS(document, exportOptions);
      const js = generateJavaScript(document, exportOptions, collections);
      
      const manifest = {
        name: document.name,
        version: document.version,
        description: document.seo?.metaDescription || '',
        author: 'Generated by SellUsGenie Page Builder',
        createdAt: new Date().toISOString(),
        options: exportOptions,
        stats: {
          htmlSize: html.length,
          cssSize: css.length,
          jsSize: js.length,
          totalElements: document.sections.reduce((acc, section) => 
            acc + section.rows.reduce((rowAcc, row) => rowAcc + row.widgets.length, 0), 0
          ),
        }
      };
      
      setGeneratedCode({ html, css, js, manifest });
      
      // Update store
      generateCode();
      
    } catch (error) {
      console.error('Code generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [document, exportOptions, collections, generateCode]);

  // Download generated files
  const handleDownload = useCallback((type: 'html' | 'css' | 'js' | 'all') => {
    if (!generatedCode) return;
    
    const downloadFile = (content: string, filename: string) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    switch (type) {
      case 'html':
        downloadFile(generatedCode.html, 'index.html');
        break;
      case 'css':
        downloadFile(generatedCode.css, 'styles.css');
        break;
      case 'js':
        downloadFile(generatedCode.js, 'script.js');
        break;
      case 'all':
        // Create a zip file (simplified - in real implementation would use JSZip)
        const allFiles = `
=== index.html ===
${generatedCode.html}

=== styles.css ===
${generatedCode.css}

=== script.js ===
${generatedCode.js}

=== manifest.json ===
${JSON.stringify(generatedCode.manifest, null, 2)}
        `;
        downloadFile(allFiles, 'page-export.txt');
        break;
    }
  }, [generatedCode]);

  if (!document) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-medium mb-1">No Document</h3>
          <p className="text-xs">Create a page to export code</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Code Export</h2>
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 inline animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 mr-1 inline" />
                Generate
              </>
            )}
          </button>
        </div>
        <div className="text-xs text-gray-600">
          Export clean, production-ready code
        </div>
      </div>

      {/* Export Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Export Options */}
        <ExportSection
          title="Export Options"
          icon={Settings}
          isOpen={openSections.options}
          onToggle={() => toggleSection('options')}
        >
          <div className="space-y-4">
            {/* Format */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                {['html', 'react', 'vue', 'static'].map(format => (
                  <button
                    key={format}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format as any }))}
                    className={`p-2 text-xs border rounded transition-colors ${
                      exportOptions.format === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">CSS Framework</label>
              <select
                value={exportOptions.framework}
                onChange={(e) => setExportOptions(prev => ({ ...prev, framework: e.target.value as any }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="none">None (Custom CSS)</option>
                <option value="tailwind">Tailwind CSS</option>
                <option value="bootstrap">Bootstrap 5</option>
                <option value="custom">Custom Framework</option>
              </select>
            </div>

            {/* Options checkboxes */}
            <div className="space-y-2">
              {[
                { key: 'includeCSS', label: 'Include CSS' },
                { key: 'inlineCSS', label: 'Inline CSS' },
                { key: 'includeJS', label: 'Include JavaScript' },
                { key: 'minify', label: 'Minify Code' },
                { key: 'responsive', label: 'Responsive Design' },
                { key: 'semantic', label: 'Semantic HTML' },
                { key: 'accessibility', label: 'Accessibility Features' },
                { key: 'seo', label: 'SEO Optimization' },
              ].map(option => (
                <label key={option.key} className="flex items-center space-x-2 text-xs">
                  <input
                    type="checkbox"
                    checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      [option.key]: e.target.checked 
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </ExportSection>

        {/* Code Preview */}
        {generatedCode && (
          <ExportSection
            title="Code Preview"
            icon={Eye}
            isOpen={openSections.preview}
            onToggle={() => toggleSection('preview')}
          >
            <div className="space-y-3">
              <CodePreview
                code={generatedCode.html}
                language="html"
                onCopy={() => {}}
              />
              <CodePreview
                code={generatedCode.css}
                language="css"
                onCopy={() => {}}
              />
              {generatedCode.js && (
                <CodePreview
                  code={generatedCode.js}
                  language="javascript"
                  onCopy={() => {}}
                />
              )}
            </div>
          </ExportSection>
        )}

        {/* Download Options */}
        {generatedCode && (
          <ExportSection
            title="Download"
            icon={Download}
            isOpen={openSections.download}
            onToggle={() => toggleSection('download')}
          >
            <div className="space-y-3">
              {/* Stats */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-700 mb-2">Export Statistics</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>HTML: {(generatedCode.manifest.stats.htmlSize / 1024).toFixed(1)}KB</div>
                  <div>CSS: {(generatedCode.manifest.stats.cssSize / 1024).toFixed(1)}KB</div>
                  <div>JS: {(generatedCode.manifest.stats.jsSize / 1024).toFixed(1)}KB</div>
                  <div>Elements: {generatedCode.manifest.stats.totalElements}</div>
                </div>
              </div>

              {/* Download buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownload('html')}
                  className="flex items-center justify-center space-x-1 p-2 text-xs border border-gray-200 rounded hover:bg-gray-50"
                >
                  <FileText className="w-3 h-3" />
                  <span>HTML</span>
                </button>
                <button
                  onClick={() => handleDownload('css')}
                  className="flex items-center justify-center space-x-1 p-2 text-xs border border-gray-200 rounded hover:bg-gray-50"
                >
                  <Layers className="w-3 h-3" />
                  <span>CSS</span>
                </button>
                <button
                  onClick={() => handleDownload('js')}
                  className="flex items-center justify-center space-x-1 p-2 text-xs border border-gray-200 rounded hover:bg-gray-50"
                >
                  <Zap className="w-3 h-3" />
                  <span>JS</span>
                </button>
                <button
                  onClick={() => handleDownload('all')}
                  className="flex items-center justify-center space-x-1 p-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Package className="w-3 h-3" />
                  <span>All</span>
                </button>
              </div>

              {/* Deploy options */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-2">Deploy Options</div>
                <div className="space-y-1">
                  <button className="w-full flex items-center space-x-2 p-2 text-xs border border-gray-200 rounded hover:bg-gray-50">
                    <Globe className="w-3 h-3" />
                    <span>Deploy to Netlify</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </button>
                  <button className="w-full flex items-center space-x-2 p-2 text-xs border border-gray-200 rounded hover:bg-gray-50">
                    <Globe className="w-3 h-3" />
                    <span>Deploy to Vercel</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          </ExportSection>
        )}
      </div>

      {/* Generation Status */}
      {!generatedCode && !isGenerating && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-gray-500">
            <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs font-medium mb-1">Ready to Export</p>
            <p className="text-xs">Configure options and click Generate</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Export Features:</p>
          <ul className="space-y-1">
            <li>• Clean, semantic HTML5 code</li>
            <li>• Optimized CSS with responsive design</li>
            <li>• Interactive JavaScript functionality</li>
            <li>• SEO and accessibility ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { CodeExportPanel };