import React, { useState } from 'react'
import { Check, Palette } from 'lucide-react'
import type { ColorScheme } from '../../types/storefront'

interface ColorSchemeSelectorProps {
  colorSchemes: ColorScheme[]
  selectedColorScheme: ColorScheme | null
  onColorSchemeSelect: (colorScheme: ColorScheme) => void
  getColorSchemesByCategory: (category: string) => ColorScheme[]
}

export const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  colorSchemes,
  selectedColorScheme,
  onColorSchemeSelect,
  getColorSchemesByCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', 'neutral', 'warm', 'cool', 'bold', 'pastel']
  
  const filteredColorSchemes = selectedCategory === 'All' 
    ? colorSchemes 
    : getColorSchemesByCategory(selectedCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'neutral': return '⚫'
      case 'warm': return '🔥'
      case 'cool': return '❄️'
      case 'bold': return '⚡'
      case 'pastel': return '🌸'
      default: return '🎨'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Choose Your Colors</h3>
        <p className="text-sm text-[#A0A0A0]">
          Pick a color scheme that represents your brand and appeals to your customers
        </p>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-[#A0A0A0] mb-3">Color Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-[#9B51E0] text-white'
                  : 'bg-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A]'
              }`}
            >
              <span className="mr-2">{getCategoryIcon(category)}</span>
              {category === 'All' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-[#A0A0A0]">
          <Palette className="w-4 h-4" />
          <span>
            {filteredColorSchemes.length} color scheme{filteredColorSchemes.length !== 1 ? 's' : ''} available
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </span>
        </div>

        <div className="space-y-3">
          {filteredColorSchemes.map((colorScheme) => (
            <div
              key={colorScheme.id}
              onClick={() => onColorSchemeSelect(colorScheme)}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-[#9B51E0] ${
                selectedColorScheme?.id === colorScheme.id
                  ? 'border-[#9B51E0] bg-[#9B51E0]/10'
                  : 'border-[#3A3A3A] bg-[#2A2A2A]'
              }`}
            >
              {/* Selection Indicator */}
              {selectedColorScheme?.id === colorScheme.id && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[#9B51E0] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-white">{colorScheme.name}</h4>
                  <p className="text-xs text-[#9B51E0] font-medium capitalize">
                    {getCategoryIcon(colorScheme.category)} {colorScheme.category}
                  </p>
                </div>

                {/* Color Palette Display */}
                <div className="space-y-2">
                  {/* Primary Colors */}
                  <div className="flex space-x-2">
                    <div 
                      className="w-8 h-8 rounded-lg border border-gray-300"
                      style={{ backgroundColor: colorScheme.colors.primary }}
                      title={`Primary: ${colorScheme.colors.primary}`}
                    />
                    <div 
                      className="w-8 h-8 rounded-lg border border-gray-300"
                      style={{ backgroundColor: colorScheme.colors.secondary }}
                      title={`Secondary: ${colorScheme.colors.secondary}`}
                    />
                    <div 
                      className="w-8 h-8 rounded-lg border border-gray-300"
                      style={{ backgroundColor: colorScheme.colors.accent }}
                      title={`Accent: ${colorScheme.colors.accent}`}
                    />
                    <div 
                      className="w-8 h-8 rounded-lg border border-gray-300"
                      style={{ backgroundColor: colorScheme.colors.background }}
                      title={`Background: ${colorScheme.colors.background}`}
                    />
                  </div>

                  {/* Color Labels */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorScheme.colors.primary }}
                      />
                      <span className="text-[#A0A0A0]">Primary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorScheme.colors.secondary }}
                      />
                      <span className="text-[#A0A0A0]">Secondary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorScheme.colors.accent }}
                      />
                      <span className="text-[#A0A0A0]">Accent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-400"
                        style={{ backgroundColor: colorScheme.colors.background }}
                      />
                      <span className="text-[#A0A0A0]">Background</span>
                    </div>
                  </div>
                </div>

                {/* Preview Text */}
                <div 
                  className="p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: colorScheme.colors.surface,
                    borderColor: colorScheme.colors.border,
                    color: colorScheme.colors.text.primary
                  }}
                >
                  <div className="space-y-1">
                    <div 
                      className="text-sm font-medium"
                      style={{ color: colorScheme.colors.text.primary }}
                    >
                      Sample Heading
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: colorScheme.colors.text.secondary }}
                    >
                      This is how your text will look with this color scheme.
                    </div>
                  </div>
                  <button 
                    className="mt-2 px-3 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: colorScheme.colors.primary }}
                  >
                    Sample Button
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredColorSchemes.length === 0 && (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 text-[#4A5568] mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No color schemes found</h4>
            <p className="text-[#A0A0A0] text-sm">
              Try selecting a different category or view all color schemes
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">🎨 Color Tips</h4>
        <ul className="text-sm text-[#A0A0A0] space-y-1">
          <li>• <strong>Neutral:</strong> Professional and versatile for any business</li>
          <li>• <strong>Warm:</strong> Friendly and inviting, great for food & lifestyle</li>
          <li>• <strong>Cool:</strong> Clean and trustworthy, perfect for tech & health</li>
          <li>• <strong>Bold:</strong> Energetic and modern, ideal for fashion & sports</li>
          <li>• <strong>Pastel:</strong> Soft and gentle, perfect for beauty & wellness</li>
        </ul>
      </div>
    </div>
  )
}