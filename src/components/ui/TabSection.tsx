import React from 'react'
import { TabNav } from './TabNav'

interface TabItem {
  key: string
  label: string
  disabled?: boolean
}

interface TabSectionProps {
  title: string
  description: string
  items: TabItem[]
  activeTab: string
  onTabChange: (tabKey: string) => void
  children: React.ReactNode
  className?: string
  variant?: 'secondary' | 'tertiary'
}

export const TabSection: React.FC<TabSectionProps> = ({
  title,
  description,
  items,
  activeTab,
  onTabChange,
  children,
  className = '',
  variant = 'secondary'
}) => {
  const containerClasses = {
    secondary: 'bg-[#2A2A2A] border-[#3A3A3A]',
    tertiary: 'bg-[#1E1E1E] border-[#2A2A2A]'
  }

  const headerClasses = {
    secondary: 'border-b border-[#3A3A3A]',
    tertiary: 'border-b border-[#2A2A2A]'
  }

  const contentContainerClasses = {
    secondary: 'bg-[#2A2A2A] border-[#3A3A3A]',
    tertiary: 'bg-[#0F0F0F] border-[#1A1A1A]'
  }

  return (
    <div className="space-y-6">
      {/* Secondary Level Tab Navigation Section */}
      <div className={`rounded-lg border p-6 ${containerClasses[variant]} ${className}`}>
        {/* Section Header */}
        <div className={`pb-4 mb-6 ${headerClasses[variant]}`}>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-[#A0A0A0] leading-relaxed">{description}</p>
        </div>

        {/* Tab Navigation */}
        <TabNav
          items={items}
          activeTab={activeTab}
          onTabChange={onTabChange}
          variant={variant}
        />
      </div>

      {/* Content Section - Separate Border */}
      <div className={`rounded-lg border p-6 ${contentContainerClasses[variant]}`}>
        {children}
      </div>
    </div>
  )
}

interface TertiaryTabContainerProps {
  title?: string
  description?: string
  items: TabItem[]
  activeTab: string
  onTabChange: (tabKey: string) => void
  children: React.ReactNode
  className?: string
}

export const TertiaryTabContainer: React.FC<TertiaryTabContainerProps> = ({
  title,
  description,
  items,
  activeTab,
  onTabChange,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Optional Title and Description for Tertiary Level */}
      {title && (
        <div className="border-b border-[#1A1A1A] pb-3 mb-4">
          <h4 className="text-lg font-medium text-white mb-1">{title}</h4>
          {description && (
            <p className="text-sm text-[#A0A0A0]">{description}</p>
          )}
        </div>
      )}

      {/* Tertiary Tab Navigation - Embedded within content */}
      <TabNav
        items={items}
        activeTab={activeTab}
        onTabChange={onTabChange}
        variant="tertiary"
        className="max-w-2xl" // Constrain width for embedded tabs
      />

      {/* Tertiary Tab Content */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}