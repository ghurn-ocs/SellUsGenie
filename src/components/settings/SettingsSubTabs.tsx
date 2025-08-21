import React from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { 
  User, 
  Building2, 
  CreditCard, 
  Truck,
  Globe,
  FileText,
  Settings as SettingsIcon,
  Zap
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
      <div className="mb-8">
        <Tabs.List className="flex space-x-1 bg-[#2A2A2A] p-1 rounded-lg border border-[#3A3A3A] shadow-sm w-full">
          <Tabs.Trigger
            value="general"
            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
          >
            <User className="w-4 h-4 mr-2" />
            General
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="business"
            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Business
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="payment"
            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="delivery"
            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
          >
            <Truck className="w-4 h-4 mr-2" />
            Delivery
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="domain"
            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
          >
            <Globe className="w-4 h-4 mr-2" />
            Domain
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="policies"
            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
          >
            <FileText className="w-4 h-4 mr-2" />
            Policies
          </Tabs.Trigger>
          
          <Tabs.Trigger
            value="integrations"
            className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
          >
            <Zap className="w-4 h-4 mr-2" />
            Integrations
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