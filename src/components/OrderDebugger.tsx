// Order Creation Debugger
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useCustomers } from '../hooks/useCustomers'
import { useOrders } from '../hooks/useOrders'

export const OrderDebugger: React.FC = () => {
  const { user } = useAuth()
  const { currentStore } = useStore()
  const { customers, isLoading: customersLoading } = useCustomers(currentStore?.id || '')
  const { orders, createOrder } = useOrders(currentStore?.id || '')

  const handleTestOrder = async () => {
    if (!currentStore) {
      console.error('❌ No current store')
      alert('No current store selected')
      return
    }

    if (!customers.length) {
      console.error('❌ No customers available')
      alert('No customers available. Create a customer first.')
      return
    }

    const testOrderData = {
      customer_id: customers[0].id,
      order_number: `TEST-${Date.now()}`,
      subtotal: 100.00,
      tax: 8.00,
      shipping: 10.00,
      total: 118.00,
      notes: 'Debug test order'
    }

    console.log('🧪 Testing order creation with data:', testOrderData)
    console.log('👤 User ID:', user?.id)
    console.log('🏪 Store ID:', currentStore.id)
    console.log('🏪 Store Name:', currentStore.store_name)
    console.log('👥 Available customers:', customers.length)
    console.log('📦 Customer for order:', customers[0])

    try {
      const result = await createOrder.mutateAsync(testOrderData)
      console.log('✅ Order created successfully:', result)
      alert('✅ Test order created successfully!')
    } catch (error) {
      console.error('❌ Order creation failed:', error)
      alert(`❌ Order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 Order Creation Debugger</h3>
      
      <div className="space-y-2 text-sm text-yellow-700 mb-4">
        <div><strong>User:</strong> {user?.email || 'Not logged in'}</div>
        <div><strong>User ID:</strong> {user?.id || 'None'}</div>
        <div><strong>Store:</strong> {currentStore?.store_name || 'No store selected'}</div>
        <div><strong>Store ID:</strong> {currentStore?.id || 'None'}</div>
        <div><strong>Customers Available:</strong> {customersLoading ? 'Loading...' : customers.length}</div>
        <div><strong>Orders Count:</strong> {orders.length}</div>
      </div>

      {customers.length > 0 && (
        <div className="mb-4">
          <strong>First Customer:</strong>
          <div className="text-xs bg-white p-2 rounded border">
            ID: {customers[0].id}<br/>
            Name: {customers[0].first_name} {customers[0].last_name}<br/>
            Email: {customers[0].email}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleTestOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!currentStore || !customers.length || createOrder.isPending}
          aria-label="Create test order for debugging purposes"
        >
          {createOrder.isPending ? 'Creating...' : '🧪 Test Order Creation'}
        </button>
        
        <div className="text-xs text-yellow-600">
          This will attempt to create a test order with the first available customer.
        </div>
      </div>
    </div>
  )
}