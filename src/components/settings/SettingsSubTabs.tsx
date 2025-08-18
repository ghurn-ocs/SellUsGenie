import React from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { 
  User, 
  Building2, 
  CreditCard, 
  Truck,
  Globe,
  FileText,
  Settings as SettingsIcon
} from 'lucide-react'

interface SettingsSubTabsProps {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export const SettingsSubTabs: React.FC<SettingsSubTabsProps> = ({ 
  children, 
  defaultValue = "general",
  value,
  onValueChange
}) => {
  return (
    <Tabs.Root 
      defaultValue={defaultValue} 
      value={value}
      onValueChange={onValueChange}
      className="w-full"
    >
      {/* Sub-tab Navigation */}
      <div className="border-b border-[#3A3A3A] mb-8">
        <Tabs.List className="flex space-x-1 overflow-x-auto">
          <Tabs.Trigger
            value="general"
            className="flex items-center px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white border-b-2 border-transparent data-[state=active]:border-[#9B51E0] data-[state=active]:text-white transition-colors whitespace-nowrap"
          >
            <User className="w-4 h-4 mr-2" />
            General
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="business"
            className="flex items-center px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white border-b-2 border-transparent data-[state=active]:border-[#9B51E0] data-[state=active]:text-white transition-colors whitespace-nowrap"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Business
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="payment"
            className="flex items-center px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white border-b-2 border-transparent data-[state=active]:border-[#9B51E0] data-[state=active]:text-white transition-colors whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="delivery"
            className="flex items-center px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white border-b-2 border-transparent data-[state=active]:border-[#9B51E0] data-[state=active]:text-white transition-colors whitespace-nowrap"
          >
            <Truck className="w-4 h-4 mr-2" />
            Delivery
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="domain"
            className="flex items-center px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white border-b-2 border-transparent data-[state=active]:border-[#9B51E0] data-[state=active]:text-white transition-colors whitespace-nowrap"
          >
            <Globe className="w-4 h-4 mr-2" />
            Domain
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="policies"
            className="flex items-center px-4 py-3 text-sm font-medium text-[#A0A0A0] hover:text-white border-b-2 border-transparent data-[state=active]:border-[#9B51E0] data-[state=active]:text-white transition-colors whitespace-nowrap"
          >
            <FileText className="w-4 h-4 mr-2" />
            Policies
          </Tabs.Trigger>
        </Tabs.List>
      </div>

      {/* Sub-tab Content */}
      {children}
    </Tabs.Root>
  )
}

interface SettingsSubTabContentProps {
  value: string
  children: React.ReactNode
}

export const SettingsSubTabContent: React.FC<SettingsSubTabContentProps> = ({ 
  value, 
  children 
}) => {
  return (
    <Tabs.Content value={value} className="space-y-8">
      {children}
    </Tabs.Content>
  )
}