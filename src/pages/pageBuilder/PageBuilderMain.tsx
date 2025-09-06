/**
 * Page Builder Main Component
 * Consolidated page building interface with tabs for Pages, Basics, and AI Generator
 */

import React, { useState } from 'react';
import { FileText, Settings, Wand2 } from 'lucide-react';
import { EmbeddedVisualPageBuilder } from './EmbeddedVisualPageBuilder';
import { AIGeneratorTab } from './AIGeneratorTab';

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const TABS: Tab[] = [
  {
    id: 'pages',
    name: 'Pages',
    icon: FileText,
    description: 'Create and manage your store pages with the Visual Page Builder'
  },
  {
    id: 'ai-generator',
    name: 'AI Generator',
    icon: Wand2,
    description: 'Generate content for policies, about us, and other pages using AI'
  }
];

export const PageBuilderMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pages');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pages':
        return (
          <div className="h-full">
            <EmbeddedVisualPageBuilder />
          </div>
        );
      case 'ai-generator':
        return <AIGeneratorTab />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Page Builder</h1>
        <p className="mt-2 text-[#A0A0A0]">
          Manage your store pages, branding, and content generation tools
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#3A3A3A] mb-6">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-[#9B51E0] text-white'
                    : 'border-transparent text-[#A0A0A0] hover:text-white hover:border-[#6A6A6A]'
                  }
                `}
              >
                <Icon 
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${isActive ? 'text-[#9B51E0]' : 'text-[#A0A0A0] group-hover:text-white'}
                  `}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mb-6">
        <p className="text-[#A0A0A0]">
          {TABS.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Tab Content */}
      <div className={`rounded-lg border border-[#3A3A3A] min-h-[800px] ${activeTab === 'pages' ? '' : 'bg-[#1E1E1E]'}`}>
        {renderTabContent()}
      </div>
    </div>
  );
};