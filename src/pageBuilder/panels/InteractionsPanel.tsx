/**
 * Interactions & Animations Panel
 * Advanced interaction editor for hover effects, scroll animations, and custom interactions
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Zap, 
  MousePointer, 
  Eye, 
  RotateCw, 
  Move, 
  Scroll, 
  Clock, 
  Play, 
  Pause, 
  SkipForward,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Settings,
  Copy,
  Trash2,
  ChevronUp
} from 'lucide-react';
import { useEditorStore, type EnhancedElement } from '../store/EditorStore';

interface InteractionsPanelProps {
  className?: string;
}

interface InteractionSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

interface AnimationConfig {
  id: string;
  name: string;
  type: 'hover' | 'scroll' | 'click' | 'load' | 'focus';
  trigger: {
    event: string;
    target: 'self' | 'parent' | 'selector';
    selector?: string;
    delay?: number;
    offset?: number;
  };
  animation: {
    property: 'transform' | 'opacity' | 'color' | 'background' | 'filter';
    from: string;
    to: string;
    duration: number;
    easing: string;
    loop?: boolean;
    direction?: 'normal' | 'reverse' | 'alternate';
  };
  conditions?: {
    breakpoint?: 'sm' | 'md' | 'lg';
    userAgent?: string;
    viewport?: { min?: number; max?: number };
  };
}

// Predefined animation presets
const ANIMATION_PRESETS: Omit<AnimationConfig, 'id'>[] = [
  {
    name: 'Fade In',
    type: 'scroll',
    trigger: { event: 'scroll', target: 'self', offset: 100 },
    animation: {
      property: 'opacity',
      from: '0',
      to: '1',
      duration: 600,
      easing: 'ease-out'
    }
  },
  {
    name: 'Slide Up',
    type: 'scroll',
    trigger: { event: 'scroll', target: 'self', offset: 100 },
    animation: {
      property: 'transform',
      from: 'translateY(50px)',
      to: 'translateY(0)',
      duration: 600,
      easing: 'ease-out'
    }
  },
  {
    name: 'Scale on Hover',
    type: 'hover',
    trigger: { event: 'mouseenter', target: 'self' },
    animation: {
      property: 'transform',
      from: 'scale(1)',
      to: 'scale(1.05)',
      duration: 300,
      easing: 'ease-out'
    }
  },
  {
    name: 'Color Shift',
    type: 'hover',
    trigger: { event: 'mouseenter', target: 'self' },
    animation: {
      property: 'color',
      from: 'currentColor',
      to: '#3b82f6',
      duration: 300,
      easing: 'ease-out'
    }
  },
  {
    name: 'Bounce In',
    type: 'load',
    trigger: { event: 'load', target: 'self', delay: 0 },
    animation: {
      property: 'transform',
      from: 'scale(0)',
      to: 'scale(1)',
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  {
    name: 'Rotate',
    type: 'hover',
    trigger: { event: 'mouseenter', target: 'self' },
    animation: {
      property: 'transform',
      from: 'rotate(0deg)',
      to: 'rotate(360deg)',
      duration: 500,
      easing: 'ease-in-out'
    }
  },
  {
    name: 'Blur to Focus',
    type: 'scroll',
    trigger: { event: 'scroll', target: 'self', offset: 50 },
    animation: {
      property: 'filter',
      from: 'blur(5px)',
      to: 'blur(0px)',
      duration: 800,
      easing: 'ease-out'
    }
  }
];

const EASING_OPTIONS = [
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'linear',
  'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // bounce
  'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // back
];

// Interaction Section Component
const InteractionSection: React.FC<InteractionSectionProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
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

// Animation Item Component
interface AnimationItemProps {
  animation: AnimationConfig;
  onEdit: (animation: AnimationConfig) => void;
  onDelete: (id: string) => void;
  onDuplicate: (animation: AnimationConfig) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  isActive?: boolean;
}

const AnimationItem: React.FC<AnimationItemProps> = ({
  animation,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  isActive = true
}) => (
  <div className={`p-3 border border-gray-200 rounded-lg ${isActive ? 'bg-white' : 'bg-gray-50'}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-800">{animation.name}</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            animation.type === 'hover' ? 'bg-blue-100 text-blue-700' :
            animation.type === 'scroll' ? 'bg-green-100 text-green-700' :
            animation.type === 'click' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {animation.type}
          </span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Property: {animation.animation.property}</div>
          <div>Duration: {animation.animation.duration}ms</div>
          <div>Easing: {animation.animation.easing}</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 ml-2">
        {onToggleActive && (
          <button
            onClick={() => onToggleActive(animation.id, !isActive)}
            className={`p-1 rounded ${isActive ? 'text-green-600' : 'text-gray-400'}`}
            title={isActive ? 'Disable' : 'Enable'}
          >
            {isActive ? <Eye className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        )}
        <button
          onClick={() => onEdit(animation)}
          className="p-1 text-gray-400 hover:text-blue-600"
          title="Edit"
        >
          <Settings className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDuplicate(animation)}
          className="p-1 text-gray-400 hover:text-green-600"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(animation.id)}
          className="p-1 text-gray-400 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
);

// Animation Editor Modal (simplified for this implementation)
interface AnimationEditorProps {
  animation: AnimationConfig | null;
  onSave: (animation: AnimationConfig) => void;
  onClose: () => void;
}

const AnimationEditor: React.FC<AnimationEditorProps> = ({ animation, onSave, onClose }) => {
  const [editingAnimation, setEditingAnimation] = useState<AnimationConfig | null>(animation);

  if (!editingAnimation) return null;

  const handleSave = () => {
    onSave(editingAnimation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Animation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editingAnimation.name}
              onChange={(e) => setEditingAnimation({ ...editingAnimation, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select
              value={editingAnimation.animation.property}
              onChange={(e) => setEditingAnimation({
                ...editingAnimation,
                animation: { ...editingAnimation.animation, property: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="transform">Transform</option>
              <option value="opacity">Opacity</option>
              <option value="color">Color</option>
              <option value="background">Background</option>
              <option value="filter">Filter</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="text"
                value={editingAnimation.animation.from}
                onChange={(e) => setEditingAnimation({
                  ...editingAnimation,
                  animation: { ...editingAnimation.animation, from: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="text"
                value={editingAnimation.animation.to}
                onChange={(e) => setEditingAnimation({
                  ...editingAnimation,
                  animation: { ...editingAnimation.animation, to: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (ms)</label>
              <input
                type="number"
                value={editingAnimation.animation.duration}
                onChange={(e) => setEditingAnimation({
                  ...editingAnimation,
                  animation: { ...editingAnimation.animation, duration: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Easing</label>
              <select
                value={editingAnimation.animation.easing}
                onChange={(e) => setEditingAnimation({
                  ...editingAnimation,
                  animation: { ...editingAnimation.animation, easing: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EASING_OPTIONS.map(easing => (
                  <option key={easing} value={easing}>{easing}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Interactions Panel Component
const InteractionsPanel: React.FC<InteractionsPanelProps> = ({ className }) => {
  const {
    selectedElementId,
    document,
    updateElement,
  } = useEditorStore();

  const [openSections, setOpenSections] = useState({
    animations: true,
    triggers: false,
    presets: false,
    advanced: false,
  });

  const [editingAnimation, setEditingAnimation] = useState<AnimationConfig | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  // Get selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId || !document) return null;
    
    for (const section of document.sections) {
      for (const row of section.rows) {
        const widget = row.widgets.find(w => w.id === selectedElementId);
        if (widget) return widget as EnhancedElement;
      }
    }
    return null;
  }, [selectedElementId, document]);

  // Get current animations for selected element
  const currentAnimations = useMemo(() => {
    if (!selectedElement?.animations) return [];
    
    return Object.entries(selectedElement.animations)
      .filter(([_, animation]) => animation)
      .map(([type, animation]) => ({
        id: `${selectedElement.id}_${type}`,
        name: animation!.name || `${type} Animation`,
        type: type as any,
        trigger: {
          event: type === 'hover' ? 'mouseenter' : type === 'scroll' ? 'scroll' : 'load',
          target: 'self' as const,
          delay: animation!.delay || 0,
          offset: 0,
        },
        animation: {
          property: 'transform' as const,
          from: '',
          to: '',
          duration: animation!.duration || 300,
          easing: animation!.easing || 'ease-out',
        }
      }));
  }, [selectedElement]);

  // Toggle section open/closed
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Add animation from preset
  const addAnimationFromPreset = useCallback((preset: Omit<AnimationConfig, 'id'>) => {
    if (!selectedElement) return;

    const newAnimation: AnimationConfig = {
      ...preset,
      id: `${selectedElement.id}_${Date.now()}`,
    };

    // Update element with new animation
    const updates = {
      animations: {
        ...selectedElement.animations,
        [preset.type]: {
          name: preset.name,
          duration: preset.animation.duration,
          easing: preset.animation.easing,
          delay: preset.trigger.delay || 0,
        }
      }
    };

    updateElement(selectedElement.id, updates);
  }, [selectedElement, updateElement]);

  // Edit animation
  const editAnimation = useCallback((animation: AnimationConfig) => {
    setEditingAnimation(animation);
  }, []);

  // Save edited animation
  const saveAnimation = useCallback((animation: AnimationConfig) => {
    if (!selectedElement) return;

    // Update element animations
    const updates = {
      animations: {
        ...selectedElement.animations,
        [animation.type]: {
          name: animation.name,
          duration: animation.animation.duration,
          easing: animation.animation.easing,
          delay: animation.trigger.delay || 0,
        }
      }
    };

    updateElement(selectedElement.id, updates);
    setEditingAnimation(null);
  }, [selectedElement, updateElement]);

  // Delete animation
  const deleteAnimation = useCallback((animationId: string) => {
    if (!selectedElement) return;

    const animationType = animationId.split('_').pop();
    const newAnimations = { ...selectedElement.animations };
    delete newAnimations[animationType as keyof typeof newAnimations];

    updateElement(selectedElement.id, { animations: newAnimations });
  }, [selectedElement, updateElement]);

  // Duplicate animation
  const duplicateAnimation = useCallback((animation: AnimationConfig) => {
    const duplicated = {
      ...animation,
      id: `${selectedElement?.id}_${Date.now()}`,
      name: `${animation.name} Copy`,
    };
    
    // For now, just edit the duplicated animation
    setEditingAnimation(duplicated);
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-medium mb-1">No Element Selected</h3>
          <p className="text-xs">Select an element to add interactions and animations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Interactions</h2>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
          >
            Presets
          </button>
        </div>
        <div className="text-xs text-gray-600">
          Element: <span className="font-medium">{selectedElement.tagName}</span>
          {selectedElement.classList.length > 0 && (
            <span className="text-blue-600 ml-1">
              .{selectedElement.classList.join('.')}
            </span>
          )}
        </div>
      </div>

      {/* Interaction Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Quick Presets */}
        {showPresets && (
          <InteractionSection
            title="Animation Presets"
            icon={Zap}
            isOpen={openSections.presets}
            onToggle={() => toggleSection('presets')}
          >
            <div className="grid grid-cols-1 gap-2">
              {ANIMATION_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => addAnimationFromPreset(preset)}
                  className="p-2 text-left border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-800">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.type} • {preset.animation.duration}ms</div>
                </button>
              ))}
            </div>
          </InteractionSection>
        )}

        {/* Current Animations */}
        <InteractionSection
          title="Current Animations"
          icon={Play}
          isOpen={openSections.animations}
          onToggle={() => toggleSection('animations')}
        >
          {currentAnimations.length > 0 ? (
            <div className="space-y-2">
              {currentAnimations.map((animation) => (
                <AnimationItem
                  key={animation.id}
                  animation={animation}
                  onEdit={editAnimation}
                  onDelete={deleteAnimation}
                  onDuplicate={duplicateAnimation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <Play className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No animations added</p>
              <p className="text-xs text-gray-400">Add presets above to get started</p>
            </div>
          )}
        </InteractionSection>

        {/* Hover Effects */}
        <InteractionSection
          title="Hover Effects"
          icon={MousePointer}
          isOpen={openSections.triggers}
          onToggle={() => toggleSection('triggers')}
        >
          <div className="space-y-3">
            <button
              onClick={() => addAnimationFromPreset(ANIMATION_PRESETS[2])} // Scale on Hover
              className="w-full p-2 text-left border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-sm font-medium">Scale on Hover</div>
              <div className="text-xs text-gray-500">Slightly enlarge element</div>
            </button>
            
            <button
              onClick={() => addAnimationFromPreset(ANIMATION_PRESETS[3])} // Color Shift
              className="w-full p-2 text-left border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-sm font-medium">Color Change</div>
              <div className="text-xs text-gray-500">Change text color on hover</div>
            </button>
          </div>
        </InteractionSection>

        {/* Scroll Animations */}
        <InteractionSection
          title="Scroll Animations"
          icon={Scroll}
          isOpen={openSections.advanced}
          onToggle={() => toggleSection('advanced')}
        >
          <div className="space-y-3">
            <button
              onClick={() => addAnimationFromPreset(ANIMATION_PRESETS[0])} // Fade In
              className="w-full p-2 text-left border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-sm font-medium">Fade In</div>
              <div className="text-xs text-gray-500">Fade in when scrolled into view</div>
            </button>
            
            <button
              onClick={() => addAnimationFromPreset(ANIMATION_PRESETS[1])} // Slide Up
              className="w-full p-2 text-left border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="text-sm font-medium">Slide Up</div>
              <div className="text-xs text-gray-500">Slide up from bottom</div>
            </button>
          </div>
        </InteractionSection>
      </div>

      {/* Animation Editor Modal */}
      {editingAnimation && (
        <AnimationEditor
          animation={editingAnimation}
          onSave={saveAnimation}
          onClose={() => setEditingAnimation(null)}
        />
      )}

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Quick Tips:</p>
          <ul className="space-y-1">
            <li>• Use presets for common effects</li>
            <li>• Hover effects enhance interactivity</li>
            <li>• Scroll animations improve engagement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InteractionsPanel;