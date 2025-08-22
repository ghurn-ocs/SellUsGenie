import React from 'react'

interface TabItem {
  key: string
  label: string
  disabled?: boolean
}

interface TabNavProps {
  items: TabItem[]
  activeTab: string
  onTabChange: (tabKey: string) => void
  variant?: 'primary' | 'secondary' | 'tertiary'
  className?: string
}

export const TabNav: React.FC<TabNavProps> = ({
  items,
  activeTab,
  onTabChange,
  variant = 'primary',
  className = ''
}) => {
  const baseClasses = 'flex space-x-1 p-1 rounded-lg border shadow-sm w-full'
  
  const variantClasses = {
    primary: 'bg-[#2A2A2A] border-[#3A3A3A]',
    secondary: 'bg-[#1E1E1E] border-[#2A2A2A]',
    tertiary: 'bg-[#0F0F0F] border-[#1A1A1A]'
  }

  const tabButtonClasses = {
    primary: {
      base: 'flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
      active: 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]',
      inactive: 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]',
      disabled: 'text-[#666] cursor-not-allowed opacity-50'
    },
    secondary: {
      base: 'flex items-center justify-center space-x-2 flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
      active: 'bg-[#2A2A2A] text-[#9B51E0] shadow-sm border border-[#3A3A3A]',
      inactive: 'text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#E0E0E0]',
      disabled: 'text-[#666] cursor-not-allowed opacity-50'
    },
    tertiary: {
      base: 'flex items-center justify-center space-x-2 flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap',
      active: 'bg-[#1A1A1A] text-[#9B51E0] shadow-sm border border-[#2A2A2A]',
      inactive: 'text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#E0E0E0]',
      disabled: 'text-[#666] cursor-not-allowed opacity-50'
    }
  }

  const getTabClasses = (item: TabItem) => {
    const classes = tabButtonClasses[variant]
    let tabClasses = classes.base
    
    if (item.disabled) {
      tabClasses += ` ${classes.disabled}`
    } else if (activeTab === item.key) {
      tabClasses += ` ${classes.active}`
    } else {
      tabClasses += ` ${classes.inactive}`
    }
    
    return tabClasses
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => !item.disabled && onTabChange(item.key)}
          className={getTabClasses(item)}
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}