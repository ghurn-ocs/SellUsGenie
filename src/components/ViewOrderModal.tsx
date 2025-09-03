// View Order Modal
import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ShoppingCart, User, Package, DollarSign, Calendar, MapPin } from 'lucide-react'
import type { Order } from '../lib/supabase'

interface ViewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  customerInfo?: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

export const ViewOrderModal: React.FC<ViewOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  customerInfo
}) => {
  if (!order) return null

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'to_be_paid':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-[#3A3A3A] text-[#A0A0A0] border-[#3A3A3A]'
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
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold text-white">
                  Order #{order.order_number}
                </Dialog.Title>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="text-sm text-[#A0A0A0]">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
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
            {/* Customer Information */}
            {customerInfo && (
              <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="w-5 h-5 text-[#9B51E0]" />
                  <h3 className="text-lg font-semibold text-white">Customer Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Name</div>
                    <div className="text-white">{customerInfo.first_name} {customerInfo.last_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Email</div>
                    <div className="text-white">{customerInfo.email}</div>
                  </div>
                  {customerInfo.phone && (
                    <div>
                      <div className="text-sm text-[#A0A0A0] mb-1">Phone</div>
                      <div className="text-white">{customerInfo.phone}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-[#A0A0A0] mb-1">Customer ID</div>
                    <div className="text-[#666] font-mono text-sm">{order.customer_id}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Package className="w-5 h-5 text-[#9B51E0]" />
                <h3 className="text-lg font-semibold text-white">Order Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-[#A0A0A0] mb-1">Order ID</div>
                  <div className="text-[#666] font-mono text-sm">{order.id}</div>
                </div>
                <div>
                  <div className="text-sm text-[#A0A0A0] mb-1">Created</div>
                  <div className="text-white">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#A0A0A0] mb-1">Last Updated</div>
                  <div className="text-white">
                    {new Date(order.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {order.notes && (
                <div className="mt-4">
                  <div className="text-sm text-[#A0A0A0] mb-1">Notes</div>
                  <div className="text-white bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-3">
                    {order.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <DollarSign className="w-5 h-5 text-[#9B51E0]" />
                <h3 className="text-lg font-semibold text-white">Pricing</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#A0A0A0]">Subtotal</span>
                  <span className="text-white font-medium">${(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A0A0A0]">Tax</span>
                  <div className="text-right">
                    {order.status === 'to_be_paid' && (order.tax || 0) === 0 ? (
                      <div>
                        <span className="text-amber-400 text-sm">To be calculated upon payment</span>
                        <div className="text-xs text-[#A0A0A0] mt-1">Stripe will calculate based on location</div>
                      </div>
                    ) : (
                      <span className="text-white font-medium">${(order.tax || 0).toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A0A0A0]">Shipping</span>
                  <span className="text-white font-medium">${(order.shipping || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-[#3A3A3A] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-[#9B51E0]">
                        ${(order.total || 0).toFixed(2)}
                      </span>
                      {order.status === 'to_be_paid' && (order.tax || 0) === 0 && (
                        <div className="text-xs text-amber-400 mt-1">*Plus taxes calculated by Stripe</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="w-5 h-5 text-[#9B51E0]" />
                <h3 className="text-lg font-semibold text-white">Order Timeline</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-[#9B51E0] rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="text-white font-medium">Order Created</div>
                    <div className="text-sm text-[#A0A0A0]">
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <div>
                      <div className="text-white font-medium">Status Updated to {order.status}</div>
                      <div className="text-sm text-[#A0A0A0]">
                        {new Date(order.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
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