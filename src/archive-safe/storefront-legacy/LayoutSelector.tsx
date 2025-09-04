import React, { useState } from 'react'
import { Check, Eye, Grid } from 'lucide-react'
import type { StoreFrontLayout, Industry } from '../../types/storefront'
import { INDUSTRIES } from '../../types/storefront'

interface LayoutSelectorProps {
  layouts: StoreFrontLayout[]
  selectedLayout: StoreFrontLayout | null
  onLayoutSelect: (layout: StoreFrontLayout) => void
  getLayoutsByIndustry: (industry: string) => StoreFrontLayout[]
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  layouts,
  selectedLayout,
  onLayoutSelect,
  getLayoutsByIndustry
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | 'All'>('All')

  const filteredLayouts = selectedIndustry === 'All' 
    ? layouts 
    : getLayoutsByIndustry(selectedIndustry)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Choose Your Layout</h3>
        <p className="text-sm text-[#A0A0A0]">
          Select a layout that matches your business type and style preferences
        </p>
      </div>

      {/* Industry Filter */}
      <div>
        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Filter by Industry</label>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value as Industry | 'All')}
          className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
        >
          <option value="All">All Industries</option>
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      {/* Layout Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-[#A0A0A0]">
          <Grid className="w-4 h-4" />
          <span>
            {filteredLayouts.length} layout{filteredLayouts.length !== 1 ? 's' : ''} available
            {selectedIndustry !== 'All' && ` for ${selectedIndustry}`}
          </span>
        </div>

        <div className="grid gap-3">
          {filteredLayouts.map((layout) => (
            <div
              key={layout.id}
              onClick={() => onLayoutSelect(layout)}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-[#9B51E0] ${
                selectedLayout?.id === layout.id
                  ? 'border-[#9B51E0] bg-[#9B51E0]/10'
                  : 'border-[#3A3A3A] bg-[#2A2A2A]'
              }`}
            >
              {/* Selection Indicator */}
              {selectedLayout?.id === layout.id && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[#9B51E0] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-white">{layout.name}</h4>
                  <p className="text-xs text-[#9B51E0] font-medium">{layout.industry}</p>
                </div>

                <p className="text-sm text-[#A0A0A0] line-clamp-2">
                  {layout.description}
                </p>

                {/* Layout Features */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#1A1A1A] rounded px-2 py-1">
                    <span className="text-[#A0A0A0]">Hero:</span>
                    <span className="text-white ml-1 capitalize">
                      {layout.config.hero.style}
                    </span>
                  </div>
                  <div className="bg-[#1A1A1A] rounded px-2 py-1">
                    <span className="text-[#A0A0A0]">Grid:</span>
                    <span className="text-white ml-1">
                      {layout.config.productGrid.columns} cols
                    </span>
                  </div>
                  <div className="bg-[#1A1A1A] rounded px-2 py-1">
                    <span className="text-[#A0A0A0]">Nav:</span>
                    <span className="text-white ml-1 capitalize">
                      {layout.config.navigation.style}
                    </span>
                  </div>
                  <div className="bg-[#1A1A1A] rounded px-2 py-1">
                    <span className="text-[#A0A0A0]">Footer:</span>
                    <span className="text-white ml-1 capitalize">
                      {layout.config.footer.style}
                    </span>
                  </div>
                </div>

                {/* Layout Sections */}
                <div className="space-y-2">
                  <p className="text-xs text-[#A0A0A0] font-medium">Included Sections:</p>
                  <div className="flex flex-wrap gap-1">
                    {layout.sections.map((section) => (
                      <span
                        key={section}
                        className="px-2 py-1 bg-[#3A3A3A] rounded text-xs text-[#A0A0A0] capitalize"
                      >
                        {section.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLayouts.length === 0 && (
          <div className="text-center py-8">
            <Grid className="w-12 h-12 text-[#4A5568] mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No layouts found</h4>
            <p className="text-[#A0A0A0] text-sm">
              Try selecting a different industry or view all layouts
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">💡 Layout Tips</h4>
        <ul className="text-sm text-[#A0A0A0] space-y-1">
          <li>• Choose layouts designed for your industry for better conversion</li>
          <li>• Modern layouts work well for tech and fashion brands</li>
          <li>• Classic layouts are perfect for established businesses</li>
          <li>• Minimal layouts highlight your products beautifully</li>
        </ul>
      </div>
    </div>
  )
}