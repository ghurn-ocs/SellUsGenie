import React from 'react'
import { useCart } from '../../contexts/CartContext'
import { useProductsNew } from '../../hooks/useProductsNew'

interface CartDebuggerProps {
  storeId: string
}

export const CartDebugger: React.FC<CartDebuggerProps> = ({ storeId }) => {
  console.log('🧪 CartDebugger rendered with storeId:', storeId)
  
  let cartContext
  try {
    cartContext = useCart()
    console.log('✅ useCart hook successful:', !!cartContext)
  } catch (error) {
    console.error('❌ useCart hook failed:', error)
    return <div className="p-4 bg-red-100 border border-red-400 rounded">
      <h3 className="text-red-800 font-bold">Cart Context Error</h3>
      <p className="text-red-700">useCart hook failed: {error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  }

  const { 
    cartItems, 
    addToCart, 
    itemCount, 
    subtotal, 
    isLoading: cartLoading,
    error: cartError 
  } = cartContext

  console.log('🛒 CartDebugger cart state:', {
    cartItemsLength: cartItems?.length || 0,
    itemCount,
    subtotal,
    cartLoading,
    cartError,
    hasAddToCart: typeof addToCart === 'function'
  })
  
  const { products, isLoading: productsLoading } = useProductsNew(storeId, { is_active: true })

  const handleTestAddToCart = async (productId: string) => {
    try {
      console.log('🧪 CartDebugger: Testing add to cart for product:', productId)
      await addToCart(productId, 1)
      console.log('✅ CartDebugger: Add to cart completed successfully')
    } catch (error) {
      console.error('❌ CartDebugger: Add to cart failed:', error)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">🧪 Cart Debugger</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cart Status */}
        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">📊 Cart Status</h4>
          <div className="space-y-1 text-sm">
            <div>Items: {itemCount}</div>
            <div>Subtotal: ${subtotal.toFixed(2)}</div>
            <div>Loading: {cartLoading ? 'Yes' : 'No'}</div>
            <div>Error: {cartError || 'None'}</div>
            <div>Store ID: {storeId}</div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">📦 Products ({products.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {productsLoading ? (
              <div>Loading products...</div>
            ) : products.length === 0 ? (
              <div>No products found</div>
            ) : (
              products.map(product => (
                <div key={product.id} className="flex items-center justify-between text-sm border-b pb-1">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-gray-600">${product.price}</div>
                  </div>
                  <button
                    onClick={() => handleTestAddToCart(product.id)}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Test Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white p-4 rounded border md:col-span-2">
          <h4 className="font-semibold mb-2">🛒 Cart Items ({cartItems.length})</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-gray-500">Cart is empty</div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm border-b pb-1">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-gray-600">Qty: {item.quantity} × ${item.product.price}</div>
                  </div>
                  <div className="font-semibold">
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}