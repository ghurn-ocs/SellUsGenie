// View Customer Modal
import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, User, Mail, Calendar, ShoppingBag, DollarSign } from 'lucide-react'
import type { Customer, Order } from '../lib/supabase'

interface CustomerWithOrders extends Customer {
  orders?: Pick<Order, 'id' | 'order_number' | 'total' | 'status' | 'created_at'>[]
}

interface ViewCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: CustomerWithOrders | null
}

export const ViewCustomerModal: React.FC<ViewCustomerModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  if (!customer) return null

  const totalSpent = customer.orders?.reduce((sum, order) => sum + order.total, 0) || 0
  const orderCount = customer.orders?.length || 0
  const lastOrder = customer.orders?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400'
      case 'processing':
        return 'text-blue-400'
      case 'shipped':
        return 'text-purple-400'
      case 'delivered':
        return 'text-green-400'
      case 'cancelled':
        return 'text-red-400'
      default:
        return 'text-[#A0A0A0]'
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-[#9B51E0]" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold text-white">
                  {customer.first_name} {customer.last_name}
                </Dialog.Title>
                <p className="text-sm text-[#A0A0A0] mt-1">
                  Customer since {new Date(customer.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#A0A0A0] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Mail className="w-5 h-5 text-[#9B51E0]" />
                <h3 className="text-lg font-semibold text-white">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#A0A0A0] mb-1">Email Address</div>
                  <div className="text-white">{customer.email}</div>
                </div>
                {customer.phone && (
                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Phone Number</div>
                    <div className="text-white">{customer.phone}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-[#A0A0A0] mb-1">Full Name</div>
                  <div className="text-white">{customer.first_name} {customer.last_name}</div>
                </div>
                <div>
                  <div className="text-sm text-[#A0A0A0] mb-1">Customer ID</div>
                  <div className="text-[#666] font-mono text-sm">{customer.id}</div>
                </div>
              </div>
            </div>

            {/* Customer Statistics */}
            <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <DollarSign className="w-5 h-5 text-[#9B51E0]" />
                <h3 className="text-lg font-semibold text-white">Purchase History</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#9B51E0]">{orderCount}</div>
                  <div className="text-sm text-[#A0A0A0]">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">${totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-[#A0A0A0]">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    ${orderCount > 0 ? (totalSpent / orderCount).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-sm text-[#A0A0A0]">Avg Order Value</div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="w-5 h-5 text-[#9B51E0]" />
                <h3 className="text-lg font-semibold text-white">Account Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[#A0A0A0] mb-1">Account Created</div>
                  <div className="text-white">
                    {new Date(customer.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#A0A0A0] mb-1">Last Updated</div>
                  <div className="text-white">
                    {new Date(customer.updated_at).toLocaleString()}
                  </div>
                </div>
                {customer.google_id && (
                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Google Account</div>
                    <div className="text-green-400">✓ Connected</div>
                  </div>
                )}
                {customer.apple_id && (
                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Apple Account</div>
                    <div className="text-green-400">✓ Connected</div>
                  </div>
                )}
                {lastOrder && (
                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Last Order</div>
                    <div className="text-white">
                      {new Date(lastOrder.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            {customer.orders && customer.orders.length > 0 && (
              <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <ShoppingBag className="w-5 h-5 text-[#9B51E0]" />
                  <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                </div>
                <div className="space-y-3">
                  {customer.orders
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg">
                        <div>
                          <div className="text-white font-medium">Order #{order.order_number}</div>
                          <div className="text-sm text-[#A0A0A0]">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">${order.total.toFixed(2)}</div>
                          <div className={`text-sm ${getOrderStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  {customer.orders.length > 5 && (
                    <div className="text-center py-2">
                      <div className="text-sm text-[#A0A0A0]">
                        And {customer.orders.length - 5} more order{customer.orders.length - 5 !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Notes Section */}
            <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <User className="w-5 h-5 text-[#9B51E0]" />
                <h3 className="text-lg font-semibold text-white">Customer Type</h3>
              </div>
              <div className="text-[#A0A0A0]">
                {customer.google_id || customer.apple_id ? (
                  <span className="text-green-400">OAuth Customer - Created through checkout with Google/Apple authentication</span>
                ) : (
                  <span className="text-blue-400">Manual Customer - Created by store admin</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-6 border-t border-[#3A3A3A] mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}