// Modern Customer List with Action Buttons - Following ProductListNew Pattern
import React, { useState } from 'react'
import { Edit3, Trash2, ExternalLink, User, Users, DollarSign, ShoppingBag } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import type { Customer, Order } from '../lib/supabase'

interface CustomerWithOrders extends Customer {
  orders?: Pick<Order, 'id' | 'order_number' | 'total' | 'status' | 'created_at'>[]
}

interface CustomerListNewProps {
  customers: CustomerWithOrders[]
  isLoading: boolean
  onView?: (customer: CustomerWithOrders) => void
  onEdit: (customer: CustomerWithOrders) => void
  onDelete: (customerId: string) => void
  isDeleting?: boolean
}

export const CustomerListNew: React.FC<CustomerListNewProps> = ({
  customers,
  isLoading,
  onView,
  onEdit,
  onDelete,
  isDeleting = false
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (customerId: string) => {
    onDelete(customerId)
    setDeleteConfirm(null)
  }

  const getCustomerTotalSpent = (customer: CustomerWithOrders) => {
    if (!customer.orders || customer.orders.length === 0) return 0
    return customer.orders.reduce((sum: number, order) => sum + order.total, 0)
  }

  const getCustomerOrderCount = (customer: CustomerWithOrders) => {
    return customer.orders ? customer.orders.length : 0
  }

  const getCustomerLastOrder = (customer: CustomerWithOrders) => {
    if (!customer.orders || customer.orders.length === 0) return null
    return customer.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#3A3A3A] rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-[#3A3A3A] rounded w-3/4"></div>
                <div className="h-3 bg-[#3A3A3A] rounded w-1/2"></div>
                <div className="h-3 bg-[#3A3A3A] rounded w-2/3"></div>
              </div>
              <div className="w-32 h-8 bg-[#3A3A3A] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (customers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-12 h-12 text-[#A0A0A0]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">No customers yet</h3>
        <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">
          Customer profiles will appear here once they make purchases or when you add them manually.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-[#666]">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Manage profiles</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Track spending</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>View history</span>
          </div>
        </div>
      </div>
    )
  }

  // Calculate customer statistics
  const getCustomerStats = (customers: CustomerWithOrders[]) => {
    const totalCustomers = customers.length
    const totalOrders = customers.reduce((sum, customer) => getCustomerOrderCount(customer), 0)
    const totalRevenue = customers.reduce((sum, customer) => getCustomerTotalSpent(customer), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
    
    const oauthCustomers = customers.filter(c => c.google_id || c.apple_id).length
    const manualCustomers = totalCustomers - oauthCustomers
    
    const activeCustomers = customers.filter(customer => getCustomerOrderCount(customer) > 0).length
    const newCustomers = customers.filter(customer => {
      const created = new Date(customer.created_at)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return created > thirtyDaysAgo
    }).length

    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      averageCustomerValue,
      oauthCustomers,
      manualCustomers,
      activeCustomers,
      newCustomers
    }
  }

  const stats = getCustomerStats(customers)
  const { totalCustomers, totalOrders, totalRevenue, averageCustomerValue, oauthCustomers, manualCustomers, activeCustomers, newCustomers } = stats

  return (
    <div className="space-y-6">
      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalCustomers}</p>
              <p className="text-sm text-[#A0A0A0]">Total Customers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-[#A0A0A0]">Total Revenue</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${averageCustomerValue.toFixed(2)}</p>
              <p className="text-sm text-[#A0A0A0]">Avg Customer Value</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeCustomers}</p>
              <p className="text-sm text-[#A0A0A0]">Active Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Breakdown */}
      <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Customer Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">{oauthCustomers}</div>
            <div className="text-xs text-[#A0A0A0]">OAuth Customers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">{manualCustomers}</div>
            <div className="text-xs text-[#A0A0A0]">Manual Customers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{newCustomers}</div>
            <div className="text-xs text-[#A0A0A0]">New (30 days)</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">{totalOrders}</div>
            <div className="text-xs text-[#A0A0A0]">Total Orders</div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {customers.map((customer) => {
        const totalSpent = getCustomerTotalSpent(customer)
        const orderCount = getCustomerOrderCount(customer)
        const lastOrder = getCustomerLastOrder(customer)

        return (
          <div
            key={customer.id}
            className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 hover:border-[#4A4A4A] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Customer Avatar */}
                <div className="w-12 h-12 bg-[#9B51E0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-[#9B51E0]" />
                </div>

                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 rounded-full flex-shrink-0">
                      {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                    </span>
                    {(customer.google_id || customer.apple_id) && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex-shrink-0">
                        OAuth
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="text-[#A0A0A0]">{customer.email}</div>
                    {customer.phone && (
                      <div className="text-[#A0A0A0]">{customer.phone}</div>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 text-sm mt-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-[#9B51E0]" />
                      <span className="font-semibold text-white">
                        ${totalSpent.toFixed(2)}
                      </span>
                      <span className="text-[#666]">total spent</span>
                    </div>

                    {lastOrder && (
                      <div className="text-[#A0A0A0]">
                        <span className="text-[#666]">Last order:</span>{' '}
                        {new Date(lastOrder.created_at).toLocaleDateString()}
                      </div>
                    )}

                    <div className="text-[#A0A0A0]">
                      <span className="text-[#666]">Member since:</span>{' '}
                      {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* View Button */}
                {onView && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('👁️ View clicked for customer:', customer.first_name, customer.last_name, customer.id)
                      onView(customer)
                    }}
                    className="p-2 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-colors"
                    title="View customer details"
                    aria-label="View customer details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('✏️ Edit clicked for customer:', customer.first_name, customer.last_name, customer.id)
                    onEdit(customer)
                  }}
                  className="p-2 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-colors"
                  title="Edit customer"
                  aria-label="Edit customer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🗑️ Delete clicked for customer:', customer.first_name, customer.last_name, customer.id)
                    setDeleteConfirm(customer.id)
                  }}
                  disabled={isDeleting}
                  className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete customer"
                  aria-label="Delete customer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold text-white mb-4">
              Delete Customer
            </Dialog.Title>
            <p className="text-[#A0A0A0] mb-6">
              Are you sure you want to delete this customer? This action cannot be undone and will
              remove the customer profile permanently. Note that any existing orders from this
              customer will remain in the system.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}