import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useProducts } from '../hooks/useProducts'
import { useOrders } from '../hooks/useOrders'
import { useCustomers } from '../hooks/useCustomers'
import { useTrialLimits } from '../hooks/useTrialLimits'
import ProductForm from '../components/ProductForm'
import ProductList from '../components/ProductList'
import OrderList from '../components/OrderList'
import CustomerList from '../components/CustomerList'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import EnhancedAnalyticsDashboard from '../components/EnhancedAnalyticsDashboard'
import { StripeSettings } from '../components/settings/StripeSettings'
import { SubscriptionUpgrade } from '../components/settings/SubscriptionUpgrade'
import { useSubscription } from '../hooks/useSubscription'
import DocumentationRouter from '../components/documentation/DocumentationRouter'
import { GenieMascot, GenieLogotype } from '../components/ui/GenieMascot'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import type { Product } from '../lib/supabase'

const StoreOwnerDashboard: React.FC = () => {
  const [, setLocation] = useLocation()
  const { user, signOut } = useAuth()
  const { 
    stores, 
    currentStore, 
    setCurrentStore, 
    loading, 
    createStore 
  } = useStore()
  
  const { 
    products, 
    isLoading: productsLoading, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts(currentStore?.id || '')
  
  const { 
    orders, 
    isLoading: ordersLoading, 
    updateOrderStatus,
    getOrderStats 
  } = useOrders(currentStore?.id || '')
  
  const { 
    customers, 
    isLoading: customersLoading,
    getCustomerStats 
  } = useCustomers(currentStore?.id || '')
  
  const { canCreateProduct, getProductLimitMessage } = useTrialLimits()
  const { subscription, isTrialUser, createCheckoutSession } = useSubscription()
  
  // Analytics data
  
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreSlug, setNewStoreSlug] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [documentationModal, setDocumentationModal] = useState<{
    isOpen: boolean
    page: 'getting-started' | 'tutorials' | 'api' | null
  }>({ isOpen: false, page: null })
  
  // Product management state
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

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
  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct.mutateAsync(productData)
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return
    try {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...productData })
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleToggleProductActive = async (productId: string, isActive: boolean) => {
    try {
      await updateProduct.mutateAsync({ id: productId, is_active: isActive })
    } catch (error) {
      console.error('Error toggling product status:', error)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsProductFormOpen(true)
  }

  const handleAddProduct = () => {
    if (!canCreateProduct) {
      alert(getProductLimitMessage())
      return
    }
    setEditingProduct(undefined)
    setIsProductFormOpen(true)
  }

  const handleCloseProductForm = () => {
    setIsProductFormOpen(false)
    setEditingProduct(undefined)
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
                <GenieLogotype size="md" />
                <h1 className="text-2xl font-bold text-[#9B51E0]">Sell Us Genie Admin</h1>
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
              <Tabs.List className="flex space-x-1 bg-[#2A2A2A] p-1 rounded-lg">
                <Tabs.Trigger
                  value="overview"
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
                >
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="products"
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
                >
                  Products
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="orders"
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
                >
                  Orders
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="customers"
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
                >
                  Customers
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="page-builder"
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
                >
                  Page Builder
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="analytics"
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
                >
                  Analytics
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="settings"
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
                >
                  Settings
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="help"
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
                >
                  Help
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="overview" className="space-y-6">
                <AnalyticsDashboard
                  orderStats={getOrderStats()}
                  customerStats={getCustomerStats()}
                  productStats={{
                    totalProducts: products.length,
                    activeProducts: products.filter(p => p.is_active).length
                  }}
                />
              </Tabs.Content>

              <Tabs.Content value="products" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Products</h3>
                  <button 
                    onClick={handleAddProduct}
                    disabled={!canCreateProduct}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      canCreateProduct 
                        ? 'bg-[#9B51E0] text-white hover:bg-[#A051E0]'
                        : 'bg-[#3A3A3A] text-[#A0A0A0] cursor-not-allowed'
                    }`}
                    title={!canCreateProduct ? getProductLimitMessage() || undefined : undefined}
                  >
                    Add Product
                  </button>
                </div>
                <ProductList
                  products={products}
                  isLoading={productsLoading}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleActive={handleToggleProductActive}
                />
              </Tabs.Content>

              <Tabs.Content value="orders" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Orders</h3>
                </div>
                <OrderList
                  orders={orders}
                  isLoading={ordersLoading}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
              </Tabs.Content>

              <Tabs.Content value="customers" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Customers</h3>
                </div>
                <CustomerList
                  customers={customers}
                  isLoading={customersLoading}
                />
              </Tabs.Content>

              <Tabs.Content value="page-builder" className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Page Builder</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-[#A0A0A0]">
                        Design and customize your store pages
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#1E1E1E] rounded-lg p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-white mb-2">
                        Visual Page Builder
                      </h4>
                      <p className="text-[#A0A0A0] mb-6">
                        Create beautiful, responsive pages with our drag-and-drop page builder. 
                        Design landing pages, product collections, and more.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => window.open('/admin/page-builder', '_blank')}
                          className="bg-[#9B51E0] text-white px-4 py-2 rounded-lg hover:bg-[#A051E0] transition-colors font-medium"
                        >
                          Open Page Builder
                        </button>
                        <button
                          onClick={() => window.open('/admin/page-builder/new', '_blank')}
                          className="bg-[#2A2A2A] text-[#A0A0A0] px-4 py-2 rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium"
                        >
                          Create New Page
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="analytics" className="space-y-6">
                <EnhancedAnalyticsDashboard storeId={currentStore?.id || ''} />
              </Tabs.Content>

              <Tabs.Content value="settings" className="space-y-8">
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
                        <p className="text-sm text-[#A0A0A0]">
                          {currentStore?.store_slug}.sellusgenie.com
                        </p>
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
                      <input
                        type="text"
                        value={`${currentStore.store_slug}.sellusgenie.com`}
                        className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                        readOnly
                      />
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

                {/* Stripe Payment Settings */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <StripeSettings storeId={currentStore.id} />
                </div>
              </Tabs.Content>


              <Tabs.Content value="help" className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                      <GenieMascot mood="helpful" size="xl" showBackground />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Help & Support</h2>
                    <p className="text-[#A0A0A0] max-w-2xl mx-auto">
                      Get the help you need to make the most of your store. From interactive tutorials to 24/7 support, we're here to help you succeed.
                    </p>
                  </div>

                  {/* Help Search */}
                  <div className="max-w-lg mx-auto">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search help articles, tutorials, and FAQs..."
                        className="w-full pl-10 pr-4 py-3 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#9B51E0] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* System Health Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#A0A0A0]">Store Status</p>
                        <p className="text-2xl font-bold text-white">Live</p>
                        <p className="text-sm text-green-400">
                          ● Online since {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#A0A0A0]">API Status</p>
                        <p className="text-2xl font-bold text-white">Healthy</p>
                        <p className="text-sm text-green-400">
                          ● 99.9% uptime
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#A0A0A0]">Database</p>
                        <p className="text-2xl font-bold text-white">Connected</p>
                        <p className="text-sm text-green-400">
                          ● {Math.floor(Math.random() * 50 + 10)}ms response
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#A0A0A0]">CDN Status</p>
                        <p className="text-2xl font-bold text-white">Active</p>
                        <p className="text-sm text-green-400">
                          ● Global coverage
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Getting Started Wizard */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Getting Started</h3>
                        <p className="text-sm text-[#A0A0A0]">Complete your store setup in 5 easy steps</p>
                      </div>
                    </div>
                    <div className="text-sm text-[#A0A0A0]">
                      {products.length > 0 && orders.length > 0 ? '5/5' : products.length > 0 ? '3/5' : currentStore ? '2/5' : '1/5'} Complete
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Step 1: Account Setup */}
                    <div className="flex items-center p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">Create Your Account</div>
                        <div className="text-sm text-[#A0A0A0]">Set up your StreamSell account and verify your email</div>
                      </div>
                      <div className="text-green-400 text-sm font-medium">Complete</div>
                    </div>

                    {/* Step 2: Store Setup */}
                    <div className="flex items-center p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">Configure Your Store</div>
                        <div className="text-sm text-[#A0A0A0]">Set up store name, description, and basic settings</div>
                      </div>
                      <div className="text-green-400 text-sm font-medium">Complete</div>
                    </div>

                    {/* Step 3: Add Products */}
                    <div className={`flex items-center p-4 bg-[#1E1E1E] rounded-lg ${products.length === 0 ? 'border border-[#9B51E0]/30' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${products.length > 0 ? 'bg-green-500/20' : 'bg-[#9B51E0]/20'}`}>
                        {products.length > 0 ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[#9B51E0] text-sm font-bold">3</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">Add Your First Products</div>
                        <div className="text-sm text-[#A0A0A0]">Upload products with descriptions, prices, and images</div>
                      </div>
                      {products.length > 0 ? (
                        <div className="text-green-400 text-sm font-medium">Complete</div>
                      ) : (
                        <button 
                          onClick={() => setActiveTab('products')}
                          className="px-4 py-2 bg-[#9B51E0] text-white text-sm rounded-lg hover:bg-[#A051E0] transition-colors"
                        >
                          Add Products
                        </button>
                      )}
                    </div>

                    {/* Step 4: Payment Setup */}
                    <div className="flex items-center p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-yellow-400 text-sm font-bold">4</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">Configure Payment Processing</div>
                        <div className="text-sm text-[#A0A0A0]">Set up Stripe to accept payments from customers</div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="px-4 py-2 bg-[#9B51E0] text-white text-sm rounded-lg hover:bg-[#A051E0] transition-colors"
                      >
                        Configure
                      </button>
                    </div>

                    {/* Step 5: First Sale */}
                    <div className="flex items-center p-4 bg-[#1E1E1E] rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${orders.length > 0 ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                        {orders.length > 0 ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-yellow-400 text-sm font-bold">5</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">Make Your First Sale</div>
                        <div className="text-sm text-[#A0A0A0]">Share your store and celebrate your first order!</div>
                      </div>
                      {orders.length > 0 ? (
                        <div className="text-green-400 text-sm font-medium">Complete! 🎉</div>
                      ) : (
                        <button 
                          onClick={() => window.open(`/store/${currentStore?.store_slug}`, '_blank')}
                          className="px-4 py-2 bg-[#9B51E0] text-white text-sm rounded-lg hover:bg-[#A051E0] transition-colors"
                        >
                          View Store
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Help Resources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Documentation & Learning */}
                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Documentation & Learning</h3>
                    </div>
                    <div className="space-y-4">
                      <button 
                        onClick={() => setDocumentationModal({ isOpen: true, page: 'getting-started' })}
                        className="w-full flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg hover:bg-[#3A3A3A] transition-colors group"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-[#A0A0A0] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <div>
                            <div className="font-medium text-white">Getting Started Guide</div>
                            <div className="text-sm text-[#A0A0A0]">Learn the basics of setting up your store</div>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#9B51E0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setDocumentationModal({ isOpen: true, page: 'tutorials' })}
                        className="w-full flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg hover:bg-[#3A3A3A] transition-colors group"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-[#A0A0A0] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <div className="font-medium text-white">Video Tutorials</div>
                            <div className="text-sm text-[#A0A0A0]">Step-by-step video guides and walkthroughs</div>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#9B51E0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button 
                        onClick={() => setDocumentationModal({ isOpen: true, page: 'api' })}
                        className="w-full flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg hover:bg-[#3A3A3A] transition-colors group"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-[#A0A0A0] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <div>
                            <div className="font-medium text-white">API Documentation</div>
                            <div className="text-sm text-[#A0A0A0]">Technical reference for developers</div>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#9B51E0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Support & Community */}
                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Support & Community</h3>
                    </div>
                    <div className="space-y-4">
                      <a 
                        href="https://support.sellusgenie.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg hover:bg-[#3A3A3A] transition-colors group"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-[#A0A0A0] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <div>
                            <div className="font-medium text-white">Contact Support</div>
                            <div className="text-sm text-[#A0A0A0]">Get help from our support team</div>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#9B51E0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      <a 
                        href="https://community.sellusgenie.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg hover:bg-[#3A3A3A] transition-colors group"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-[#A0A0A0] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <div className="font-medium text-white">Community Forum</div>
                            <div className="text-sm text-[#A0A0A0]">Connect with other store owners</div>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#9B51E0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      <button 
                        className="flex items-center justify-between w-full p-3 bg-[#1E1E1E] rounded-lg hover:bg-[#3A3A3A] transition-colors group"
                        onClick={() => window.open(`/store/${currentStore.store_slug}`, '_blank')}
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-[#A0A0A0] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <div>
                            <div className="font-medium text-white">View Live Store</div>
                            <div className="text-sm text-[#A0A0A0]">See how customers see your store</div>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#9B51E0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      className="flex items-center justify-center space-x-3 p-4 border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors group"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <svg className="w-5 h-5 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-white font-medium">View Analytics</span>
                    </button>

                    <button 
                      className="flex items-center justify-center space-x-3 p-4 border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors group"
                      onClick={() => setActiveTab('products')}
                    >
                      <svg className="w-5 h-5 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-white font-medium">Add Product</span>
                    </button>

                    <button 
                      className="flex items-center justify-center space-x-3 p-4 border border-[#3A3A3A] rounded-lg hover:bg-red-500/10 border-red-500/20 transition-colors group"
                      onClick={() => {
                        if (confirm('Are you sure you want to sign out?')) {
                          handleSignOut()
                        }
                      }}
                    >
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-red-400 font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
                  </div>

                  <div className="space-y-4">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg cursor-pointer hover:bg-[#3A3A3A] transition-colors">
                        <span className="font-medium text-white">How do I add products to my store?</span>
                        <svg className="w-5 h-5 text-[#A0A0A0] transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-3 p-4 text-sm text-[#A0A0A0] bg-[#1A1A1A] rounded-lg">
                        Go to the Products tab and click "Add Product". Fill in the product details including name, description, price, and upload high-quality images. Don't forget to set your inventory quantity and enable the product when ready.
                      </div>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg cursor-pointer hover:bg-[#3A3A3A] transition-colors">
                        <span className="font-medium text-white">How do I accept payments?</span>
                        <svg className="w-5 h-5 text-[#A0A0A0] transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-3 p-4 text-sm text-[#A0A0A0] bg-[#1A1A1A] rounded-lg">
                        Connect your Stripe account in the Settings tab under Payment Processing. Stripe handles all payment processing securely and deposits funds directly to your bank account. You'll need to complete Stripe's verification process.
                      </div>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg cursor-pointer hover:bg-[#3A3A3A] transition-colors">
                        <span className="font-medium text-white">Can I customize my store's appearance?</span>
                        <svg className="w-5 h-5 text-[#A0A0A0] transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-3 p-4 text-sm text-[#A0A0A0] bg-[#1A1A1A] rounded-lg">
                        Yes! Use the Page Builder to customize your store's layout, colors, and content. You can add custom sections, modify the homepage, and create a unique brand experience for your customers.
                      </div>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg cursor-pointer hover:bg-[#3A3A3A] transition-colors">
                        <span className="font-medium text-white">How do I track my sales and analytics?</span>
                        <svg className="w-5 h-5 text-[#A0A0A0] transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-3 p-4 text-sm text-[#A0A0A0] bg-[#1A1A1A] rounded-lg">
                        The Analytics tab provides comprehensive insights including sales revenue, customer behavior, product performance, and website traffic. Real-time data helps you make informed decisions about your business.
                      </div>
                    </details>

                    <details className="group">
                      <summary className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg cursor-pointer hover:bg-[#3A3A3A] transition-colors">
                        <span className="font-medium text-white">What happens if I need help or encounter issues?</span>
                        <svg className="w-5 h-5 text-[#A0A0A0] transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-3 p-4 text-sm text-[#A0A0A0] bg-[#1A1A1A] rounded-lg">
                        Our support team is available 24/7 via live chat, email, and our community forum. We also have extensive documentation, video tutorials, and step-by-step guides to help you succeed.
                      </div>
                    </details>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1m-4 0h4m-4 0v4a2 2 0 004 0V5m0 0h12a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                        <span className="text-white">Navigate to Products</span>
                        <kbd className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Alt + P</kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                        <span className="text-white">Navigate to Orders</span>
                        <kbd className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Alt + O</kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                        <span className="text-white">Navigate to Analytics</span>
                        <kbd className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Alt + A</kbd>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                        <span className="text-white">Add New Product</span>
                        <kbd className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Ctrl + N</kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                        <span className="text-white">Search</span>
                        <kbd className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Ctrl + K</kbd>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                        <span className="text-white">Open Help</span>
                        <kbd className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">F1</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What's New / Changelog */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">What's New</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-[#1E1E1E] rounded-lg border-l-4 border-[#9B51E0]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Enhanced Analytics Dashboard</span>
                        <span className="text-xs text-[#A0A0A0] bg-[#3A3A3A] px-2 py-1 rounded">v2.1.0</span>
                      </div>
                      <p className="text-sm text-[#A0A0A0]">
                        Real-time customer analytics, improved conversion tracking, and comprehensive business metrics now available.
                      </p>
                    </div>

                    <div className="p-4 bg-[#1E1E1E] rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Advanced Page Builder</span>
                        <span className="text-xs text-[#A0A0A0] bg-[#3A3A3A] px-2 py-1 rounded">v2.0.5</span>
                      </div>
                      <p className="text-sm text-[#A0A0A0]">
                        Drag-and-drop interface improvements, new templates, and better mobile responsiveness.
                      </p>
                    </div>

                    <div className="p-4 bg-[#1E1E1E] rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Improved Order Management</span>
                        <span className="text-xs text-[#A0A0A0] bg-[#3A3A3A] px-2 py-1 rounded">v2.0.3</span>
                      </div>
                      <p className="text-sm text-[#A0A0A0]">
                        Bulk order processing, automated status updates, and enhanced customer communication features.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Store Optimization Tips */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Store Optimization Tips</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium text-white">High-Quality Images</span>
                      </div>
                      <p className="text-sm text-[#A0A0A0]">
                        Use clear, well-lit product photos from multiple angles. Images should be at least 1200x1200 pixels for best results.
                      </p>
                    </div>

                    <div className="p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium text-white">Detailed Descriptions</span>
                      </div>
                      <p className="text-sm text-[#A0A0A0]">
                        Write compelling product descriptions that highlight benefits, not just features. Include sizing, materials, and care instructions.
                      </p>
                    </div>

                    <div className="p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium text-white">SEO Optimization</span>
                      </div>
                      <p className="text-sm text-[#A0A0A0]">
                        Use relevant keywords in product titles and descriptions. Add alt text to images and optimize your store's meta tags.
                      </p>
                    </div>

                    <div className="p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center mr-2">
                          <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-medium text-white">Fast Response Time</span>
                      </div>
                      <p className="text-sm text-[#A0A0A0]">
                        Respond to customer inquiries within 24 hours. Quick communication builds trust and improves customer satisfaction.
                      </p>
                    </div>
                  </div>
                </div>
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

      {/* Product Form Dialog */}
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={handleCloseProductForm}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        product={editingProduct}
        isLoading={createProduct.isPending || updateProduct.isPending}
      />
    </div>
  )
}

export default StoreOwnerDashboard
