import React from 'react'
import type { Customer, Order } from '../lib/supabase'

interface CustomerWithOrders extends Customer {
  orders?: Pick<Order, 'id' | 'order_number' | 'total' | 'status' | 'created_at'>[]
}

interface CustomerListProps {
  customers: CustomerWithOrders[]
  isLoading: boolean
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  isLoading
}) => {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#3A3A3A] rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#3A3A3A] rounded w-48"></div>
                <div className="h-3 bg-[#3A3A3A] rounded w-32"></div>
              </div>
              <div className="w-20 h-8 bg-[#3A3A3A] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No customers yet</h3>
        <p className="text-[#A0A0A0]">Customer profiles will appear here once they make purchases.</p>
      </div>
    )
  }

  // Calculate statistics
  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, customer) => sum + getCustomerTotalSpent(customer), 0)
  const averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
  const totalOrders = customers.reduce((sum, customer) => sum + getCustomerOrderCount(customer), 0)

  return (
    <div className="space-y-6">
      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A0A0A0]">Total Customers</p>
              <p className="text-2xl font-bold text-white">{totalCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A0A0A0]">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A0A0A0]">Avg. Customer Value</p>
              <p className="text-2xl font-bold text-white">${averageOrderValue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A0A0A0]">Total Orders</p>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customers List */}
      <div className="space-y-4">
      {customers.map((customer) => {
        const totalSpent = getCustomerTotalSpent(customer)
        const orderCount = getCustomerOrderCount(customer)
        const lastOrder = getCustomerLastOrder(customer)

        return (
          <div key={customer.id} className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#9B51E0]/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-white">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                      {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-[#A0A0A0]">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-sm text-[#A0A0A0]">{customer.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  ${totalSpent.toFixed(2)}
                </div>
                <div className="text-sm text-[#A0A0A0]">Total spent</div>
                {lastOrder && (
                  <div className="text-xs text-[#A0A0A0] mt-1">
                    Last order: {new Date(lastOrder.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent orders section removed for performance - orders no longer loaded with customers */}
          </div>
        )
      })}
      </div>
    </div>
  )
}

export default CustomerList
