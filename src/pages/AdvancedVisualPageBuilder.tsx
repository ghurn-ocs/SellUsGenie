/**
 * Advanced Visual Page Builder
 * Comprehensive integration of all advanced pageBuilder components
 * Combines EnhancedPageBuilder with Canvas system and advanced panels
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
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Palette,
  Code,
  Zap,
  Grid
} from 'lucide-react';

// Enhanced PageBuilder Core
import { EnhancedPageBuilder } from '../pageBuilder/editor/EnhancedPageBuilder';
import { SupabasePageRepository } from '../pageBuilder/data/SupabasePageRepository';

// Advanced Canvas System
import { CanvasContainer } from '../pageBuilder/canvas/CanvasContainer';
import { CanvasEditor } from '../pageBuilder/canvas/CanvasEditor';
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

// Additional Components
import { CustomizationPanel } from '../components/storefront/CustomizationPanel';
import { HeaderFooterEditor } from '../pageBuilder/components/HeaderFooterEditor';
import { SystemPageModal } from '../pageBuilder/components/SystemPageModal';
import { ProvisioningModal } from '../pageBuilder/components/ProvisioningModal';

// Types
import type { PageDocument, User, Breakpoint } from '../pageBuilder/types';
import type { CanvasError } from '../pageBuilder/canvas/types/CanvasTypes';

// Contexts
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type PanelMode = 'enhanced' | 'canvas' | 'elements' | 'styles' | 'interactions' | 'cms' | 'code';
type ViewMode = 'split' | 'canvas-only' | 'enhanced-only' | 'preview';

interface AdvancedVisualPageBuilderProps {
  pageId?: string;
}

export const AdvancedVisualPageBuilder: React.FC<AdvancedVisualPageBuilderProps> = ({ pageId }) => {
  const { user } = useAuth();
  const { currentStore } = useStore();
  
  // UI State
  const [activePanel, setActivePanel] = useState<PanelMode>('enhanced');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [showProvisioningModal, setShowProvisioningModal] = useState(false);
  const [showSystemPageModal, setShowSystemPageModal] = useState(false);
  
  // Page Builder State
  const [repository, setRepository] = useState<SupabasePageRepository | null>(null);
  const [currentPage, setCurrentPage] = useState<PageDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Store references
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
      setRepository(new SupabasePageRepository(currentStore.id));
    }
  }, [user, currentStore]);

  // Load page
  useEffect(() => {
    if (pageId && repository) {
      loadPage(pageId);
    } else {
      setIsLoading(false);
    }
  }, [pageId, repository]);

  const loadPage = async (id: string) => {
    if (!repository) return;
    
    try {
      setIsLoading(true);
      const page = await repository.getPage(id);
      if (page) {
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (doc: PageDocument) => {
    if (!repository) return;
    try {
      await repository.saveDraft(doc);
      setCurrentPage(doc);
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handlePublish = async (doc: PageDocument) => {
    if (!repository) return;
    try {
      await repository.publish(doc.id);
    } catch (error) {
      console.error('Error publishing page:', error);
    }
  };

  const handleError = (error: Error | CanvasError) => {
    console.error('Page builder error:', error);
  };

  const renderTopBar = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900">Advanced Visual Page Builder</h1>
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'split' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('canvas-only')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'canvas-only' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Canvas Only
          </button>
          <button
            onClick={() => setViewMode('enhanced-only')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'enhanced-only' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Enhanced Only
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setViewMode('preview')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Globe className="w-4 h-4 mr-2" />
          Publish
        </button>
      </div>
    </div>
  );

  const renderLeftPanel = () => (
    <div className="bg-white border-r border-gray-200 flex flex-col" style={{ width: leftPanelWidth }}>
      {/* Panel Navigation */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'enhanced', label: 'Enhanced', icon: Layout },
            { id: 'elements', label: 'Elements', icon: Grid },
            { id: 'styles', label: 'Styles', icon: Palette },
            { id: 'interactions', label: 'Actions', icon: Zap },
            { id: 'cms', label: 'CMS', icon: FileText },
            { id: 'code', label: 'Code', icon: Code },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActivePanel(id as PanelMode)}
              className={`p-2 rounded text-xs font-medium transition-colors ${
                activePanel === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === 'enhanced' && (
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Enhanced Panel</h3>
            <p className="text-sm text-gray-600">
              Traditional widget-based page building with drag-and-drop sections, rows, and widgets.
            </p>
          </div>
        )}
        {activePanel === 'elements' && (
          <DndProvider backend={HTML5Backend}>
            <ElementsPanel />
          </DndProvider>
        )}
        {activePanel === 'styles' && <StylePanel />}
        {activePanel === 'interactions' && <InteractionsPanel />}
        {activePanel === 'cms' && <CMSPanel />}
        {activePanel === 'code' && <CodeExportPanel />}
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (viewMode === 'preview') {
      return (
        <div className="flex-1 bg-gray-100 p-4">
          <div className="max-w-full mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
            <iframe
              src={`/store/${currentStore?.store_slug}`}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 200px)' }}
            />
          </div>
        </div>
      );
    }

    if (viewMode === 'canvas-only') {
      return (
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 p-2">
            <BreakpointControls />
          </div>
          <DndProvider backend={HTML5Backend}>
            <CanvasContainer
              onElementSelect={(id) => console.log('Selected:', id)}
              onElementHover={(id) => console.log('Hovered:', id)}
              onCanvasError={handleError}
            />
          </DndProvider>
        </div>
      );
    }

    if (viewMode === 'enhanced-only') {
      return (
        <div className="flex-1">
          {user && repository && (
            <EnhancedPageBuilder
              pageId={pageId}
              user={user}
              repository={repository}
              onSave={handleSave}
              onPublish={handlePublish}
              onError={handleError}
            />
          )}
        </div>
      );
    }

    // Split view
    return (
      <div className="flex-1 flex">
        <div className="flex-1 border-r border-gray-200">
          {user && repository && (
            <EnhancedPageBuilder
              pageId={pageId}
              user={user}
              repository={repository}
              onSave={handleSave}
              onPublish={handlePublish}
              onError={handleError}
            />
          )}
        </div>
        <div className="w-1/2">
          <div className="border-b border-gray-200 p-2">
            <BreakpointControls />
          </div>
          <DndProvider backend={HTML5Backend}>
            <CanvasContainer
              onElementSelect={(id) => console.log('Selected:', id)}
              onElementHover={(id) => console.log('Hovered:', id)}
              onCanvasError={handleError}
            />
          </DndProvider>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Advanced Page Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {renderTopBar()}
      
      <div className="flex-1 flex overflow-hidden">
        {viewMode !== 'enhanced-only' && viewMode !== 'preview' && renderLeftPanel()}
        {renderMainContent()}
      </div>

      {/* Modals */}
      {showProvisioningModal && (
        <ProvisioningModal onClose={() => setShowProvisioningModal(false)} />
      )}
      
      {showSystemPageModal && (
        <SystemPageModal onClose={() => setShowSystemPageModal(false)} />
      )}
    </div>
  );
};

export default AdvancedVisualPageBuilder;