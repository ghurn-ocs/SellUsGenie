/**
 * Professional Layout Guide Component
 * Interactive help guide for the enhanced page builder interface
 */

import React, { useState } from 'react';
import { HelpCircle, X, Ruler, FileText, Layers, Maximize2, MousePointer, ArrowRight } from 'lucide-react';

interface LayoutGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_STEPS = [
  {
    id: 'rulers',
    title: 'Professional Rulers',
    icon: Ruler,
    description: 'Fixed rulers show page dimensions and help with precise positioning.',
    points: [
      'Top ruler displays width percentages (0-100%)',
      'Left ruler shows height progress with page boundaries',
      'Orange line indicates standard page end (100%)',
      'Purple markings show extended content areas'
    ],
    tip: 'Rulers stay fixed while you scroll, just like in professional design tools.'
  },
  {
    id: 'canvas',
    title: 'Infinite Canvas',
    icon: FileText,
    description: 'The white canvas area grows automatically as you add content.',
    points: [
      'Starts at standard page size (1200px height)',
      'Grows vertically as you add sections and widgets',
      'Width remains fixed for consistent design',
      'Professional document styling with shadows'
    ],
    tip: 'Your page can be as long as needed - the canvas adapts to your content.'
  },
  {
    id: 'boundaries',
    title: 'Page Size Context',
    icon: Layers,
    description: 'Visual indicators help you understand page structure.',
    points: [
      'Standard page boundary at 100% (orange line)',
      'Extended content indicators (purple)',
      'Page size legend in bottom left corner',
      'Width indicators in top ruler'
    ],
    tip: 'Design above the fold first, then add extended content as needed.'
  },
  {
    id: 'interaction',
    title: 'Professional Interactions',
    icon: MousePointer,
    description: 'Smooth, responsive interactions enhance your workflow.',
    points: [
      'Hover effects provide visual feedback',
      'Drag and drop with professional animations',
      'Zoom controls for detailed editing',
      'Responsive grid overlay on hover'
    ],
    tip: 'Use keyboard shortcuts: Ctrl+S to save, Ctrl+P for preview.'
  },
  {
    id: 'workflow',
    title: 'Optimized Workflow',
    icon: Maximize2,
    description: 'Built for efficiency and professional design work.',
    points: [
      'Fixed rulers eliminate scrolling confusion',
      'Unlimited canvas height for long pages',
      'Professional drop zones and feedback',
      'Document-style layout feels familiar'
    ],
    tip: 'Focus on content creation - the interface adapts to support your workflow.'
  }
];

export const LayoutGuide: React.FC<LayoutGuideProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const currentGuide = GUIDE_STEPS[currentStep];
  const IconComponent = currentGuide.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentGuide.title}</h2>
                <p className="text-blue-100 text-sm">
                  Step {currentStep + 1} of {GUIDE_STEPS.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-slate-600 text-lg leading-relaxed mb-4">
              {currentGuide.description}
            </p>

            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Key Features:</h3>
              <ul className="space-y-2">
                {currentGuide.points.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-amber-900">💡</span>
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Pro Tip</h4>
                  <p className="text-amber-800 text-sm">{currentGuide.tip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-6">
            {GUIDE_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-blue-600 scale-125'
                    : index < currentStep
                    ? 'bg-blue-300'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              ← Previous
            </button>

            <div className="flex items-center space-x-3">
              {currentStep < GUIDE_STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                >
                  Get Started!
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visual demonstration area */}
        {currentStep === 0 && (
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-px bg-slate-400"></div>
                <span className="text-slate-600">Standard Page</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-px bg-orange-400"></div>
                <span className="text-orange-600">Page Boundary</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-px bg-purple-400"></div>
                <span className="text-purple-600">Extended Content</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};