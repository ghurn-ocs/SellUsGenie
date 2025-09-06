import React from 'react'
import { TabSection } from '../ui/TabSection'
import { 
  User, 
  Building2, 
  CreditCard, 
  Truck,
  Globe,
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
  const currentTab = value || defaultValue

  const tabItems = [
    { 
      key: 'general', 
      label: 'General', 
      icon: <User className="w-4 h-4" />,
      title: 'General Settings',
      description: 'Manage your account preferences, subscription details, and basic store configuration options.'
    },
    { 
      key: 'business', 
      label: 'Business', 
      icon: <Building2 className="w-4 h-4" />,
      title: 'Business Information',
      description: 'Configure your store address, business details, and operational settings for your e-commerce store.'
    },
    { 
      key: 'payment', 
      label: 'Payment', 
      icon: <CreditCard className="w-4 h-4" />,
      title: 'Payment Configuration',
      description: 'Set up payment processing, configure Stripe integration, and manage financial year settings.'
    },
    { 
      key: 'delivery', 
      label: 'Delivery', 
      icon: <Truck className="w-4 h-4" />,
      title: 'Delivery & Shipping',
      description: 'Configure delivery areas, shipping zones, and fulfillment options for your store.'
    },
    { 
      key: 'domain', 
      label: 'Domain', 
      icon: <Globe className="w-4 h-4" />,
      title: 'Domain & Branding',
      description: 'Manage custom domains, SSL certificates, and store branding configurations.'
    },
    { 
      key: 'integrations', 
      label: 'Integrations', 
      icon: <Zap className="w-4 h-4" />,
      title: 'Integrations',
      description: 'Configure email services, analytics platforms, and accounting system integrations.'
    }
  ]

  const currentTabInfo = tabItems.find(tab => tab.key === currentTab) || tabItems[0]

  // Extract the content for the active tab
  const childrenArray = React.Children.toArray(children)
  const activeContent = childrenArray.find((child) => {
    return React.isValidElement(child) && 
           (child as React.ReactElement<any>).props.value === currentTab
  })

  return (
    <TabSection
      title={currentTabInfo.title}
      description={currentTabInfo.description}
      items={tabItems.map(tab => ({
        key: tab.key,
        label: tab.label
      }))}
      activeTab={currentTab}
      onTabChange={onValueChange || (() => {})}
      variant="secondary"
    >
      {activeContent}
    </TabSection>
  )
}

// Keep the content component for compatibility
export const SettingsSubTabContent: React.FC<{
  value: string
  children: React.ReactNode
}> = ({ value, children }) => {
  return (
    <div data-tab-content={value} className="space-y-6">
      {children}
    </div>
  )
}