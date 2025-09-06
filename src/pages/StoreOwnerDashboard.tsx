import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useProductsNew } from '../hooks/useProductsNew'
import { useOrders } from '../hooks/useOrders'
import { useCustomers } from '../hooks/useCustomers'
import { useTrialLimits } from '../hooks/useTrialLimits'
import { NurtureDashboard } from '../components/nurture/NurtureDashboard'
import { CreateProductModal } from '../components/CreateProductModal'
import { ViewProductModal } from '../components/ViewProductModal'
import { EditProductModal } from '../components/EditProductModal'
import { CreateOrderModalProfessional } from '../components/CreateOrderModalProfessional'
import { ViewOrderModal } from '../components/ViewOrderModal'
import { EditOrderModal } from '../components/EditOrderModal'
import { CreateCustomerModal } from '../components/CreateCustomerModal'
import { ViewCustomerModal } from '../components/ViewCustomerModal'
import { EditCustomerModal } from '../components/EditCustomerModal'
import { ProductListNew } from '../components/ProductListNew'
import { OrderListNew } from '../components/OrderListNew'
import { CustomerListNew } from '../components/CustomerListNew'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import EnhancedAnalyticsDashboard from '../components/EnhancedAnalyticsDashboard'
import { WorldClassAnalyticsDashboard } from '../components/analytics/WorldClassAnalyticsDashboard'
import { StripeSettings } from '../components/settings/StripeSettings'
import { FinancialYearSettings } from '../components/settings/FinancialYearSettings'
import { SubscriptionUpgrade } from '../components/settings/SubscriptionUpgrade'
import { DeliveryAreasSettings } from '../components/settings/DeliveryAreasSettings'
import { StoreAddressSettings } from '../components/settings/StoreAddressSettings'
import { CustomDomainSettings } from '../components/settings/CustomDomainSettings'
import { PolicySettings } from '../components/settings/PolicySettings'
import { IntegrationsSettings } from '../components/settings/IntegrationsSettings'
import { PageBuilderSettings } from '../components/settings/PageBuilderSettings'
import { SettingsSubTabs, SettingsSubTabContent } from '../components/settings/SettingsSubTabs'
import { PageBuilderMain } from './pageBuilder/PageBuilderMain'
import { BasicsTab } from './pageBuilder/BasicsTab'
import { useSubscription } from '../hooks/useSubscription'
import { useCustomDomain } from '../hooks/useCustomDomain'
import { useRealAnalytics } from '../hooks/useRealAnalytics'
import { useAnalyticsTracker } from '../lib/analyticsTracker'
import DocumentationRouter from '../components/documentation/DocumentationRouter'
import { GenieMascot, GenieLogotype } from '../components/ui/GenieMascot'
import { SelfServiceHelpCenter } from '../components/help/SelfServiceHelpCenter'
import { TabNav } from '../components/ui/TabNav'
import { TabSection, TertiaryTabContainer } from '../components/ui/TabSection'
import { Building2, Store } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import type { Product } from '../types/product'
import { supabase } from '../lib/supabase'
import { useModal } from '../contexts/ModalContext'

const StoreOwnerDashboard: React.FC = () => {
  const [, setLocation] = useLocation()
  const { user, signOut } = useAuth()
  const modal = useModal()
  const { 
    stores, 
    currentStore, 
    setCurrentStore, 
    loading, 
    createStore 
  } = useStore()
  
  // Initialize analytics tracking
  useAnalyticsTracker()
  
  const { 
    products, 
    isLoading: productsLoading, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    toggleProductStatus,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling
  } = useProductsNew(currentStore?.id || '')
  
  const { 
    orders, 
    isLoading: ordersLoading, 
    createOrder,
    createProfessionalOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderStats 
  } = useOrders(currentStore?.id || '')
  
  const { 
    customers, 
    isLoading: customersLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats 
  } = useCustomers(currentStore?.id || '')
  
  const { canCreateProduct, getProductLimitMessage } = useTrialLimits()
  const { subscription, isTrialUser, createCheckoutSession } = useSubscription()
  const { primaryDomain } = useCustomDomain(currentStore?.id || '')
  
  // Analytics data
  const analytics = useRealAnalytics(currentStore?.id || '')
  
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreSlug, setNewStoreSlug] = useState('')
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL parameters for initial tab
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') || 'overview'
  })
  const [productsSubTab, setProductsSubTab] = useState('products')
  const [settingsSubTab, setSettingsSubTab] = useState(() => {
    // Check URL parameters for settings section
    const params = new URLSearchParams(window.location.search)
    return params.get('section') || 'general'
  })
  const [businessTertiaryTab, setBusinessTertiaryTab] = useState('branding')
  const [documentationModal, setDocumentationModal] = useState<{
    isOpen: boolean
    page: 'getting-started' | 'tutorials' | 'api' | null
  }>({ isOpen: false, page: null })
  
  // Product management state
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Order management state
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  
  // Customer management state
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false)
  const [viewingCustomer, setViewingCustomer] = useState<any>(null)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStoreName.trim() || !newStoreSlug.trim()) return

    try {
      await createStore({
        store_name: newStoreName,
        store_slug: newStoreSlug
      })
      setNewStoreName('')
      setNewStoreSlug('')
      setIsCreateStoreOpen(false)
    } catch (error) {
      console.error('Error creating store:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to landing page after successful sign out
      setLocation('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Product management handlers
  const handleProductCreated = () => {
    console.log('✅ Product created successfully - refreshing list')
    // The TanStack Query will automatically refresh due to cache invalidation in the hook
    refetch()
  }

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return
    try {
      await updateProduct({ id: editingProduct.id, ...productData })
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleToggleProductActive = async (productId: string, isActive: boolean) => {
    try {
      await toggleProductStatus({ productId, isActive })
    } catch (error) {
      console.error('Error toggling product status:', error)
    }
  }

  const handleToggleProductFeatured = async (productId: string, isFeatured: boolean) => {
    try {
      setIsToggling(true)
      const { error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured })
        .eq('id', productId)

      if (error) throw error

      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, is_featured: isFeatured }
            : product
        )
      )
    } catch (error) {
      console.error('Error toggling product featured status:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleViewProduct = (product: Product) => {
    console.log('👁️ View product:', product.name)
    setViewingProduct(product)
  }

  const handleEditProduct = (product: Product) => {
    console.log('✏️ Edit product:', product.name)
    setEditingProduct(product)
  }

  const handleCloseViewProduct = () => {
    setViewingProduct(null)
  }

  const handleCloseEditProduct = () => {
    setEditingProduct(null)
  }

  // Order management handlers
  const handleAddOrder = () => {
    console.log('📝 Opening create order modal')
    setIsCreateOrderOpen(true)
  }

  const handleCreateProfessionalOrder = async (orderData: any) => {
    try {
      console.log('🚀 Creating professional order:', orderData)
      await createProfessionalOrder.mutateAsync(orderData)
      console.log('✅ Professional order created successfully')
      // TODO: Show success message with payment link info
    } catch (error) {
      console.error('❌ Error creating professional order:', error)
      throw error
    }
  }

  const handleCloseCreateOrder = () => {
    setIsCreateOrderOpen(false)
  }

  // Navigation handlers
  const handleNavigateToDomainSettings = () => {
    setActiveTab('settings')
    setSettingsSubTab('domain')
  }

  const handleViewOrder = (order: any) => {
    console.log('👁️ View order:', order.order_number)
    setViewingOrder(order)
  }

  const handleEditOrder = (order: any) => {
    console.log('✏️ Edit order:', order.order_number)
    setEditingOrder(order)
  }

  const handleUpdateOrder = async (orderData: any) => {
    if (!editingOrder) return
    try {
      await updateOrder.mutateAsync(orderData)
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder.mutateAsync(orderId)
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }

  const handleCloseViewOrder = () => {
    setViewingOrder(null)
  }

  const handleCloseEditOrder = () => {
    setEditingOrder(null)
  }

  // Customer management handlers
  const handleAddCustomer = () => {
    console.log('👤 Opening create customer modal')
    setIsCreateCustomerOpen(true)
  }

  const handleCreateCustomer = async (customerData: any) => {
    try {
      console.log('🚀 Creating customer:', customerData)
      await createCustomer.mutateAsync(customerData)
      console.log('✅ Customer created successfully')
    } catch (error) {
      console.error('❌ Error creating customer:', error)
      throw error
    }
  }

  const handleCloseCreateCustomer = () => {
    setIsCreateCustomerOpen(false)
  }

  const handleViewCustomer = (customer: any) => {
    console.log('👁️ View customer:', customer.first_name, customer.last_name)
    setViewingCustomer(customer)
  }

  const handleEditCustomer = (customer: any) => {
    console.log('✏️ Edit customer:', customer.first_name, customer.last_name)
    setEditingCustomer(customer)
  }

  const handleUpdateCustomer = async (customerData: any) => {
    if (!editingCustomer) return
    try {
      await updateCustomer.mutateAsync(customerData)
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await deleteCustomer.mutateAsync(customerId)
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const handleCloseViewCustomer = () => {
    setViewingCustomer(null)
  }

  const handleCloseEditCustomer = () => {
    setEditingCustomer(null)
  }

  const handleAddProduct = async () => {
    if (!canCreateProduct) {
      await modal.showWarning(
        'Product Limit Reached',
        getProductLimitMessage()
      )
      return
    }
    console.log('🎯 Opening create product modal')
    setIsCreateProductOpen(true)
  }

  const handleCloseCreateProduct = () => {
    console.log('🚪 Closing create product modal')
    setIsCreateProductOpen(false)
  }

  // Order management handlers
  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status })
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const handleSubscriptionUpgrade = async (planId: string, billingData: any) => {
    try {
      await createCheckoutSession.mutateAsync({
        planId,
        ...billingData
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B51E0] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Loading your stores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Header */}
      <header className="bg-[#2A2A2A] shadow-lg border-b border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <GenieMascot mood="happy" size="md" showBackground={true} />
                <h1 className="text-2xl font-bold text-[#9B51E0]">Sell Us Genie</h1>
              </div>
              
              {/* Store Selector */}
              <div className="flex items-center space-x-2">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center space-x-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg px-3 py-2 hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] transition-colors">
                      <span className="font-medium text-white">
                        {currentStore?.store_name || 'Select Store'}
                      </span>
                      <svg className="w-4 h-4 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </DropdownMenu.Trigger>
                  
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="min-w-[220px] bg-[#2A2A2A] rounded-lg shadow-lg border border-[#3A3A3A] p-1 z-50"
                      sideOffset={5}
                    >
                      {stores.map((store) => (
                        <DropdownMenu.Item
                          key={store.id}
                          className="flex items-center px-3 py-2 text-sm text-[#E0E0E0] hover:bg-[#3A3A3A] rounded cursor-pointer transition-colors"
                          onClick={() => setCurrentStore(store)}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-white">{store.store_name}</div>
                            <div className="text-xs text-[#A0A0A0]">{store.store_slug}.sellusgenie.com</div>
                          </div>
                          {currentStore?.id === store.id && (
                            <svg className="w-4 h-4 text-[#9B51E0]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </DropdownMenu.Item>
                      ))}
                      
                      <DropdownMenu.Separator className="h-px bg-[#3A3A3A] my-1" />
                      
                      <DropdownMenu.Item
                        className="flex items-center px-3 py-2 text-sm text-[#9B51E0] hover:bg-[#3A3A3A] rounded cursor-pointer transition-colors"
                        onClick={() => setIsCreateStoreOpen(true)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Store
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#A0A0A0]">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-[#A0A0A0] hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentStore ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">No Store Selected</h2>
              <p className="text-[#A0A0A0] mb-6">
                Select a store from the dropdown above or create a new one to get started.
              </p>
              <button
                onClick={() => setIsCreateStoreOpen(true)}
                className="bg-[#FF7F00] text-white px-6 py-3 rounded-lg hover:bg-[#FF8C00] transition-colors font-medium"
              >
                Create Your First Store
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <Tabs.List className="flex space-x-1 bg-[#2A2A2A] p-1 rounded-lg border border-[#3A3A3A] shadow-sm w-full">
                <Tabs.Trigger
                  value="overview"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="products"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Products & Inventory
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="orders"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Orders
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="customers"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Customers
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="nurture"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Marketing
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="analytics"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Analytics
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="storefront"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Page Builder
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="settings"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Settings
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="help"
                  className="flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[#4A4A4A] data-[state=inactive]:text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]"
                >
                  Help
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="overview" className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">Business Overview</h3>
                  </div>
                  
                  <AnalyticsDashboard
                    orderStats={getOrderStats()}
                    customerStats={getCustomerStats()}
                    productStats={{
                      totalProducts: products.length,
                      activeProducts: products.filter(p => p.is_active).length
                    }}
                  />
                </div>
              </Tabs.Content>

              <Tabs.Content value="products" className="space-y-6">
                <TabSection
                  title="Products & Inventory Management"
                  description="Manage your product catalog, inventory levels, and stock settings. Track product performance and maintain accurate inventory records across your store."
                  items={[
                    { key: 'products', label: 'Products' },
                    { key: 'inventory', label: 'Inventory Management' }
                  ]}
                  activeTab={productsSubTab}
                  onTabChange={setProductsSubTab}
                >
                
                {/* Products Sub-tab Content */}
                {productsSubTab === 'products' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#3A3A3A]/50">
                      <div>
                        <h4 className="text-lg font-medium text-white">Product Catalog</h4>
                        <p className="text-sm text-[#A0A0A0] mt-1">Manage your product listings and details</p>
                      </div>
                      <button 
                        onClick={handleAddProduct}
                        disabled={!canCreateProduct}
                        className={canCreateProduct ? 'flex items-center space-x-2 px-3 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors' : 'flex items-center space-x-2 px-3 py-2 bg-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:bg-[#4A4A4A] transition-colors cursor-not-allowed'}
                        title={!canCreateProduct ? getProductLimitMessage() || undefined : undefined}
                      >
                        Add Product
                      </button>
                    </div>
                    
                    <ProductListNew
                      products={products}
                      isLoading={productsLoading}
                      onView={handleViewProduct}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onToggleActive={handleToggleProductActive}
                      onToggleFeatured={handleToggleProductFeatured}
                      isDeleting={isDeleting}
                      isToggling={isToggling}
                    />
                  </div>
                )}
                
                {/* Inventory Sub-tab Content */}
                {productsSubTab === 'inventory' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#3A3A3A]/50">
                      <div>
                        <h4 className="text-lg font-medium text-white">Stock Management</h4>
                        <p className="text-sm text-[#A0A0A0] mt-1">Monitor and update product inventory levels</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-3 py-2 bg-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:bg-[#4A4A4A] transition-colors">
                          Bulk Update
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors">
                          Add Stock
                        </button>
                      </div>
                    </div>
                    
                    {/* Inventory Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#A0A0A0]">Total Products</p>
                            <p className="text-2xl font-bold text-white">{products.length}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#A0A0A0]">Low Stock</p>
                            <p className="text-2xl font-bold text-orange-500">
                              {products.filter(p => p.inventory <= 10).length}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#A0A0A0]">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-500">
                              {products.filter(p => p.inventory === 0).length}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#A0A0A0]">Total Value</p>
                            <p className="text-2xl font-bold text-green-500">
                              ${products.reduce((sum, p) => sum + (p.price * p.inventory), 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
            
                    {/* Inventory Table */}
                    <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#2A2A2A]">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Product</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">SKU</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Stock</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Value</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#3A3A3A]">
                            {products.map((product) => (
                              <tr key={product.id} className="hover:bg-[#2A2A2A] transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    {product.images && product.images.length > 0 ? (
                                      <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded object-cover mr-3" />
                                    ) : (
                                      <div className="h-10 w-10 bg-[#3A3A3A] rounded flex items-center justify-center mr-3">
                                        <svg className="h-5 w-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-sm font-medium text-white">{product.name}</div>
                                      <div className="text-sm text-[#A0A0A0]">${product.price}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#E0E0E0]">
                                  {product.sku || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-white">
                                  {product.inventory}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    product.inventory === 0 
                                      ? 'bg-red-100 text-red-800'
                                      : product.inventory <= 10
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {product.inventory === 0 ? 'Out of Stock' : product.inventory <= 10 ? 'Low Stock' : 'In Stock'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#E0E0E0]">
                                  ${(product.price * product.inventory).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <button className="text-[#9B51E0] hover:text-[#A051E0] font-medium">
                                    Update Stock
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                </TabSection>
              </Tabs.Content>

              <Tabs.Content value="orders" className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">Orders</h3>
                    <button 
                      onClick={handleAddOrder}
                      className="flex items-center space-x-2 px-3 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
                    >
                      Add Order
                    </button>
                  </div>
                <OrderListNew
                  orders={orders}
                  isLoading={ordersLoading}
                  onView={handleViewOrder}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                  onStatusChange={handleUpdateOrderStatus}
                  isDeleting={deleteOrder.isPending}
                  isUpdating={updateOrderStatus.isPending}
                />
                </div>
              </Tabs.Content>

              <Tabs.Content value="customers" className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">Customers</h3>
                    <button 
                      onClick={handleAddCustomer}
                      className="flex items-center space-x-2 px-3 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
                    >
                      Add Customer
                    </button>
                  </div>
                <CustomerListNew
                  customers={customers}
                  isLoading={customersLoading}
                  onView={handleViewCustomer}
                  onEdit={handleEditCustomer}
                  onDelete={handleDeleteCustomer}
                  isDeleting={deleteCustomer.isPending}
                />
                </div>
              </Tabs.Content>


              <Tabs.Content value="nurture" className="space-y-6">
                <NurtureDashboard />
              </Tabs.Content>

              <Tabs.Content value="storefront" className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
                  <PageBuilderMain />
                </div>
              </Tabs.Content>
              <Tabs.Content value="page-builder" className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
                  <PageBuilderMain />
                </div>
              </Tabs.Content>

              <Tabs.Content value="analytics" className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <WorldClassAnalyticsDashboard storeId={currentStore?.id || ''} />
                </div>
              </Tabs.Content>

              <Tabs.Content value="settings" className="space-y-8">
                <SettingsSubTabs 
                  value={settingsSubTab}
                  onValueChange={setSettingsSubTab}
                >
                  {/* General Tab */}
                  <SettingsSubTabContent value="general">
                    {/* Subscription Management - Only show for trial users */}
                {isTrialUser && (
                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <SubscriptionUpgrade 
                      currentPlan={subscription?.planId || 'trial'}
                      onUpgrade={handleSubscriptionUpgrade}
                    />
                  </div>
                )}

                {/* Account Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#A0A0A0]">Account Status</p>
                        <p className="text-2xl font-bold text-white">
                          {isTrialUser ? 'Trial' : (subscription?.planId ? subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1) : 'Free')}
                        </p>
                        <p className="text-sm text-[#A0A0A0]">
                          {isTrialUser ? 'Upgrade to unlock more features' : 'Active subscription'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#A0A0A0]">Total Stores</p>
                        <p className="text-2xl font-bold text-white">{stores.length}</p>
                        <p className="text-sm text-[#A0A0A0]">
                          Active stores in your account
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#A0A0A0]">Current Store</p>
                        <p className="text-2xl font-bold text-white">{currentStore?.store_name}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-[#A0A0A0]">
                            {primaryDomain?.verification_status === 'verified' && primaryDomain?.ssl_status === 'active' 
                              ? primaryDomain.full_domain 
                              : `${currentStore?.store_slug}.sellusgenie.com`}
                          </p>
                          {primaryDomain?.verification_status === 'verified' && primaryDomain?.ssl_status === 'active' && (
                            <div className="flex items-center space-x-1 text-green-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Information */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Store Information</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={currentStore.store_name}
                        className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                        Store URL
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={primaryDomain?.verification_status === 'verified' && primaryDomain?.ssl_status === 'active' 
                            ? `https://${primaryDomain.full_domain}` 
                            : `https://${currentStore.store_slug}.sellusgenie.com`}
                          className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                          readOnly
                        />
                        {primaryDomain?.verification_status === 'verified' && primaryDomain?.ssl_status === 'active' ? (
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="flex items-center space-x-1 text-green-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Using custom domain</span>
                            </div>
                            <span className="text-[#A0A0A0]">•</span>
                            <span className="text-[#A0A0A0]">Default: {currentStore.store_slug}.sellusgenie.com</span>
                          </div>
                        ) : primaryDomain?.verification_status === 'pending' ? (
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="flex items-center space-x-1 text-yellow-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm0 8a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                              </svg>
                              <span>Custom domain pending verification</span>
                            </div>
                            <span className="text-[#A0A0A0]">•</span>
                            <span className="text-[#A0A0A0]">Using default for now</span>
                          </div>
                        ) : (
                          <div className="text-xs text-[#A0A0A0]">
                            Default store URL • <button onClick={handleNavigateToDomainSettings} className="text-[#9B51E0] hover:text-[#B16CE8] underline hover:no-underline">Add custom domain in Domain settings</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                        Subscription Status
                      </label>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          currentStore.subscription_status === 'active' 
                            ? 'bg-green-500/20 text-green-400'
                            : currentStore.subscription_status === 'trial'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            currentStore.subscription_status === 'active' 
                              ? 'bg-green-400'
                              : currentStore.subscription_status === 'trial'
                              ? 'bg-orange-400'
                              : 'bg-red-400'
                          }`}></div>
                          {currentStore.subscription_status === 'trial' ? 'Trial Account' : 
                           currentStore.subscription_status === 'active' ? 'Active Account' : 'Inactive Account'}
                        </span>
                        {currentStore.subscription_status === 'trial' && currentStore.trial_expires_at && (
                          <span className="text-sm text-[#A0A0A0]">
                            Expires: {new Date(currentStore.trial_expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                  </SettingsSubTabContent>

                  {/* Online Store Tab */}
                  <SettingsSubTabContent value="business">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center space-x-3">
                        <Store className="w-6 h-6 text-[#9B51E0]" />
                        <div>
                          <h3 className="text-lg font-semibold text-white">Online Store</h3>
                          <p className="text-sm text-[#A0A0A0]">
                            Configure your store branding, logo, tagline, and business information
                          </p>
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div className="flex space-x-1 bg-[#1E1E1E] p-1 rounded-lg border border-[#3A3A3A]">
                        {[
                          { id: 'branding', label: 'Store Branding' },
                          { id: 'financial', label: 'Financial Year' },
                          { id: 'address', label: 'Store Address' }
                        ].map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setBusinessTertiaryTab(category.id)}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                              businessTertiaryTab === category.id
                                ? 'bg-[#9B51E0] text-white'
                                : 'text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A]'
                            }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>

                      {/* Content */}
                      {businessTertiaryTab === 'branding' && (
                        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                          <BasicsTab />
                        </div>
                      )}
                      {businessTertiaryTab === 'financial' && (
                        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                          <FinancialYearSettings storeId={currentStore.id} />
                        </div>
                      )}
                      {businessTertiaryTab === 'address' && (
                        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                          <StoreAddressSettings storeId={currentStore.id} />
                        </div>
                      )}
                    </div>
                  </SettingsSubTabContent>

                  {/* Payment Tab */}
                  <SettingsSubTabContent value="payment">
                    {/* Stripe Payment Settings */}
                    <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                      <StripeSettings storeId={currentStore.id} />
                    </div>
                  </SettingsSubTabContent>

                  {/* Delivery Tab */}
                  <SettingsSubTabContent value="delivery">
                    {/* Delivery Areas Settings */}
                    <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                      <DeliveryAreasSettings storeId={currentStore.id} />
                    </div>
                  </SettingsSubTabContent>

                  {/* Custom Domain Tab */}
                  <SettingsSubTabContent value="domain">
                    <CustomDomainSettings storeId={currentStore.id} />
                  </SettingsSubTabContent>
                  {/* Policies Tab */}
                  <SettingsSubTabContent value="policies">
                    <PolicySettings storeId={currentStore.id} />
                  </SettingsSubTabContent>
                  
                  <SettingsSubTabContent value="integrations">
                    <IntegrationsSettings storeId={currentStore.id} />
                  </SettingsSubTabContent>
                  
                  <SettingsSubTabContent value="pagebuilder">
                    <PageBuilderSettings storeId={currentStore.id} />
                  </SettingsSubTabContent>
                </SettingsSubTabs>
              </Tabs.Content>


              <Tabs.Content value="help" className="space-y-6">
                <SelfServiceHelpCenter 
                  onNavigateToSection={(section: string) => {
                    // Handle navigation to different sections based on help article
                    switch (section) {
                      case 'troubleshooting':
                        // Could expand to show troubleshooting content or navigate to support
                        console.log('Navigating to troubleshooting section')
                        break
                      case 'getting-started-guides':
                        // Navigate to a specific getting started section
                        setActiveTab('help')
                        break
                      case 'video-tutorials':
                        // Could open video tutorial modal or navigate to tutorials
                        console.log('Opening video tutorials')
                        break
                      default:
                        // Default handler for other sections
                        console.log(`Navigating to section: ${section}`)
                        break
                    }
                  }}
                  onNavigateToTab={(tab: string) => setActiveTab(tab)}
                />
              </Tabs.Content>
            </Tabs.Root>
          </div>
        )}

        {/* Documentation Modal */}
        {documentationModal.isOpen && documentationModal.page && (
          <Dialog.Root open={documentationModal.isOpen} onOpenChange={(open) => setDocumentationModal({ isOpen: open, page: null })}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
              <Dialog.Content className="fixed top-0 left-0 w-full h-full bg-[#1E1E1E] z-50 overflow-auto">
                <div className="relative">
                  <DocumentationRouter page={documentationModal.page} />
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </main>

      {/* Create Store Dialog */}
      <Dialog.Root open={isCreateStoreOpen} onOpenChange={setIsCreateStoreOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] rounded-lg shadow-xl p-6 w-full max-w-md z-50 border border-[#3A3A3A]">
            <Dialog.Title className="text-lg font-semibold text-white mb-4">
              Create New Store
            </Dialog.Title>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                  placeholder="Enter store name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Store URL
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newStoreSlug}
                    onChange={(e) => setNewStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-3 py-2 border border-[#3A3A3A] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                    placeholder="store-name"
                    required
                  />
                  <span className="px-3 py-2 bg-[#3A3A3A] border border-l-0 border-[#3A3A3A] rounded-r-lg text-[#A0A0A0]">
                    .sellusgenie.com
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateStoreOpen(false)}
                  className="px-4 py-2 text-[#A0A0A0] bg-[#3A3A3A] rounded-lg hover:bg-[#4A4A4A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF7F00] text-white rounded-lg hover:bg-[#FF8C00] transition-colors"
                >
                  Create Store
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateProductOpen}
        onClose={handleCloseCreateProduct}
        onSuccess={handleProductCreated}
      />

      {/* View Product Modal */}
      <ViewProductModal
        product={viewingProduct}
        isOpen={!!viewingProduct}
        onClose={handleCloseViewProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={handleCloseEditProduct}
        onSuccess={handleProductCreated}
      />

      {/* Create Professional Order Modal */}
      <CreateOrderModalProfessional
        isOpen={isCreateOrderOpen}
        onClose={handleCloseCreateOrder}
        onSuccess={handleCreateProfessionalOrder}
      />

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={isCreateCustomerOpen}
        onClose={handleCloseCreateCustomer}
        onSuccess={handleCreateCustomer}
      />

      {/* View Order Modal */}
      <ViewOrderModal
        isOpen={!!viewingOrder}
        onClose={handleCloseViewOrder}
        order={viewingOrder}
        customerInfo={viewingOrder?.customers}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={!!editingOrder}
        onClose={handleCloseEditOrder}
        onSuccess={handleUpdateOrder}
        order={editingOrder}
      />

      {/* View Customer Modal */}
      <ViewCustomerModal
        isOpen={!!viewingCustomer}
        onClose={handleCloseViewCustomer}
        customer={viewingCustomer}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={!!editingCustomer}
        onClose={handleCloseEditCustomer}
        onSuccess={handleUpdateCustomer}
        customer={editingCustomer}
      />
    </div>
  )
}

export default StoreOwnerDashboard
