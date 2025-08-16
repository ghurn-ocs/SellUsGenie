# Modern Shopping Cart System

A complete e-commerce shopping cart solution with Stripe integration, designed for minimal clicks to purchase.

## Features

### 🛒 **Modern Shopping Cart**
- **Persistent Cart**: Saves cart items across sessions (guest & authenticated users)
- **Real-time Updates**: Instant quantity changes and item removal
- **Smart Session Management**: Guest carts with automatic session tracking
- **Responsive Design**: Works perfectly on mobile and desktop

### ⚡ **Streamlined Checkout** 
- **One-Click Buy Now**: Skip cart, go straight to checkout
- **Guest Checkout**: No registration required
- **Smart Forms**: Auto-validation and error handling
- **Progress Indicators**: Clear checkout steps

### 💳 **Stripe Integration**
- **Secure Payments**: Bank-level security with Stripe
- **Multiple Payment Methods**: Cards, Apple Pay, Google Pay
- **Real-time Processing**: Instant payment confirmation
- **Automatic Receipts**: Email confirmations

### 📱 **Mobile-First Design**
- **Touch Optimized**: Large tap targets, swipe gestures
- **Fast Loading**: Optimized for mobile networks
- **Intuitive UI**: Clear visual hierarchy

## Quick Start

### 1. Setup Environment Variables

```bash
# Add to .env file
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 2. Basic Implementation

```tsx
import { ShoppingCartSystem, CartIcon } from './components/cart'

function App() {
  return (
    <ShoppingCartSystem storeId="your-store-id">
      {/* Your app content */}
      <header>
        <CartIcon /> {/* Shows cart icon with item count */}
      </header>
      
      {/* Cart sidebar and checkout modal are automatically included */}
    </ShoppingCartSystem>
  )
}
```

### 3. Add Product Actions

```tsx
import { AddToCartButton, BuyNowButton } from './components/cart'

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      
      {/* Add to cart with success feedback */}
      <AddToCartButton 
        productId={product.id}
        quantity={1}
        size="md"
        variant="primary"
      />
      
      {/* One-click purchase */}
      <BuyNowButton 
        productId={product.id}
        size="md"
      />
    </div>
  )
}
```

## Components Overview

### Core System
- **`ShoppingCartSystem`**: Main wrapper component that provides all cart functionality
- **`CartProvider`**: Context provider for cart state management
- **`CheckoutProvider`**: Context provider for checkout flow

### Cart UI Components
- **`CartIcon`**: Cart button with item count badge
- **`CartSidebar`**: Sliding cart panel with item management
- **`AddToCartButton`**: Add items to cart with loading states
- **`BuyNowButton`**: Skip cart, go straight to checkout

### Checkout Components
- **`CheckoutModal`**: Complete checkout flow in a modal
- **`ShippingForm`**: Address collection with validation
- **`CheckoutForm`**: Stripe payment processing

## Database Schema

The system requires these Supabase tables:

```sql
-- Cart items for persistent storage
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  customer_id UUID NULL, -- NULL for guest carts
  session_id TEXT NULL,   -- For guest cart identification
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment tracking
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  order_id UUID NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Advanced Usage

### Custom Cart Context

```tsx
import { useCart } from './contexts/CartContext'

function CustomCartBadge() {
  const { itemCount, subtotal, setIsOpen } = useCart()
  
  return (
    <button onClick={() => setIsOpen(true)}>
      Cart ({itemCount}) - ${subtotal.toFixed(2)}
    </button>
  )
}
```

### Checkout Events

```tsx
import { useCheckout } from './contexts/CheckoutContext'

function CheckoutFlow() {
  const { 
    createPaymentIntent, 
    confirmPayment, 
    isCheckingOut 
  } = useCheckout()
  
  // Custom checkout logic
}
```

## Minimal Clicks to Purchase

The system is optimized for the shortest path to purchase:

### Regular Flow (2 clicks)
1. **Click "Add to Cart"** → Item added with success feedback
2. **Click "Checkout"** → Complete purchase

### Express Flow (1 click)
1. **Click "Buy Now"** → Instant checkout with just that item

### Guest Checkout
- No registration required
- Automatic email collection
- Save address for faster future checkouts

## Security Features

- **PCI Compliance**: All payments processed by Stripe
- **SSL Encryption**: All data transmission encrypted
- **No Card Storage**: Never store payment methods
- **Session Security**: Secure guest session management

## Performance Optimizations

- **Lazy Loading**: Components load on demand
- **Optimistic Updates**: Instant UI feedback
- **Debounced API Calls**: Efficient quantity updates
- **Smart Caching**: Reduce unnecessary API calls

## Customization

### Styling
All components use Tailwind CSS classes and can be customized:

```tsx
<AddToCartButton 
  className="bg-purple-600 hover:bg-purple-700"
  size="lg"
/>
```

### Behavior
Configure checkout flow, payment methods, and more:

```tsx
<CheckoutProvider 
  storeId={storeId}
  currency="usd"
  requirePhone={true}
>
```

## Support

The shopping cart system is fully integrated with:
- ✅ Supabase authentication
- ✅ Real-time inventory checking
- ✅ Order management
- ✅ Customer accounts
- ✅ Email notifications
- ✅ Analytics tracking

For issues or feature requests, check the project repository.