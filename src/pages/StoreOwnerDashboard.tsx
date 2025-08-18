import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useProductsNew } from '../hooks/useProductsNew'
import { useOrders } from '../hooks/useOrders'
import { useCustomers } from '../hooks/useCustomers'
import { useTrialLimits } from '../hooks/useTrialLimits'
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
import { StripeSettings } from '../components/settings/StripeSettings'
import { FinancialYearSettings } from '../components/settings/FinancialYearSettings'
import { SubscriptionUpgrade } from '../components/settings/SubscriptionUpgrade'
import { useSubscription } from '../hooks/useSubscription'
import { useRealAnalytics } from '../hooks/useRealAnalytics'
import DocumentationRouter from '../components/documentation/DocumentationRouter'
import { GenieMascot, GenieLogotype } from '../components/ui/GenieMascot'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import type { Product } from '../types/product'
import { supabase } from '../lib/supabase'

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
  
  // Analytics data
  const analytics = useRealAnalytics(currentStore?.id || '')
  
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreSlug, setNewStoreSlug] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
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

  const handleAddProduct = () => {
    if (!canCreateProduct) {
      alert(getProductLimitMessage())
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
                
                <ProductListNew
                  products={products}
                  isLoading={productsLoading}
                  onView={handleViewProduct}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleActive={handleToggleProductActive}
                  isDeleting={isDeleting}
                  isToggling={isToggling}
                />
              </Tabs.Content>

              <Tabs.Content value="orders" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Orders</h3>
                  <button 
                    onClick={handleAddOrder}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
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
              </Tabs.Content>

              <Tabs.Content value="customers" className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Customers</h3>
                  <button 
                    onClick={handleAddCustomer}
                    className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg font-medium transition-colors"
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
                      <div className="w-16 h-16 bg-gradient-to-br from-[#9B51E0] to-[#FF7F00] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        🎨 NEW: Webflow-Style Visual Builder
                      </h4>
                      <p className="text-[#A0A0A0] mb-4">
                        Design like a pro with our advanced visual page builder featuring:
                      </p>
                      <div className="text-left text-sm text-[#A0A0A0] mb-6 space-y-1">
                        <div className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Drag & drop elements
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Advanced styling controls
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Responsive design tools
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Animations & interactions
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          CMS & dynamic content
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Clean code export
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setLocation('/admin/page-builder')}
                          className="bg-gradient-to-r from-[#9B51E0] to-[#FF7F00] text-white px-6 py-3 rounded-lg hover:from-[#A051E0] hover:to-[#FF8C00] transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                        >
                          🚀 Launch Builder
                        </button>
                        <button
                          onClick={() => setLocation('/admin/page-builder/new')}
                          className="bg-[#2A2A2A] text-white px-6 py-3 rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium border border-[#3A3A3A]"
                        >
                          Create New Page
                        </button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[#3A3A3A]">
                        <button
                          onClick={() => window.open('/admin/page-builder-legacy', '_blank')}
                          className="text-xs text-[#A0A0A0] hover:text-white transition-colors"
                        >
                          Use Legacy Builder →
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

                {/* Financial Year Settings */}
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <FinancialYearSettings storeId={currentStore.id} />
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
                        <p className="text-sm text-[#A0A0A0]">Complete your store setup in 6 easy steps</p>
                      </div>
                    </div>
                    <div className="text-sm text-[#A0A0A0]">
                      {(() => {
                        let completed = 1 // Account setup is always complete
                        if (currentStore) completed += 1 // Store setup
                        if (analytics?.orderStats?.financialYear?.isConfigured) completed += 1 // Financial year
                        if (products.length > 0) completed += 1 // Products added
                        // Payment setup - we'll count it as done if they have orders (implies payment is set up)
                        if (orders.length > 0) completed += 1 // Payment setup implied by having orders
                        if (orders.length > 0) completed += 1 // First sale
                        return `${completed}/6`
                      })()} Complete
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

                    {/* Step 3: Configure Financial Year */}
                    <div className={`flex items-center p-4 bg-[#1E1E1E] rounded-lg ${!analytics?.orderStats?.financialYear?.isConfigured ? 'border border-[#9B51E0]/30' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${analytics?.orderStats?.financialYear?.isConfigured ? 'bg-green-500/20' : 'bg-[#9B51E0]/20'}`}>
                        {analytics?.orderStats?.financialYear?.isConfigured ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[#9B51E0] text-sm font-bold">3</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">Set Financial Year Period</div>
                        <div className="text-sm text-[#A0A0A0]">Configure your business financial year for accurate reporting</div>
                      </div>
                      {analytics?.orderStats?.financialYear?.isConfigured ? (
                        <div className="text-green-400 text-sm font-medium">Complete</div>
                      ) : (
                        <button 
                          onClick={() => setActiveTab('settings')}
                          className="px-4 py-2 bg-[#9B51E0] text-white text-sm rounded-lg hover:bg-[#A051E0] transition-colors"
                        >
                          Configure
                        </button>
                      )}
                    </div>

                    {/* Step 4: Add Products */}
                    <div className={`flex items-center p-4 bg-[#1E1E1E] rounded-lg ${products.length === 0 ? 'border border-[#9B51E0]/30' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${products.length > 0 ? 'bg-green-500/20' : 'bg-[#9B51E0]/20'}`}>
                        {products.length > 0 ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[#9B51E0] text-sm font-bold">4</span>
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

                    {/* Step 5: Payment Setup */}
                    <div className="flex items-center p-4 bg-[#1E1E1E] rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-yellow-400 text-sm font-bold">5</span>
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

                    {/* Step 6: First Sale */}
                    <div className="flex items-center p-4 bg-[#1E1E1E] rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${orders.length > 0 ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                        {orders.length > 0 ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-yellow-400 text-sm font-bold">6</span>
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
