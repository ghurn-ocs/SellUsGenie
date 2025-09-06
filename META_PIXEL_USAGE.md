# Meta Pixel Analytics Integration

The Meta Pixel integration has been completed for SellUsGenie. This document provides usage examples and configuration instructions.

## ✅ What's Been Implemented

1. **Meta Pixel Service** (`src/lib/metaPixel.ts`)
   - Full e-commerce event tracking
   - Advanced matching capabilities
   - Custom event support
   - TypeScript support with proper types

2. **Settings Integration** (`src/components/settings/IntegrationsSettings.tsx`)
   - Configuration modal for Pixel ID
   - Advanced matching toggle
   - Connection testing
   - Status display

3. **External Analytics Hook** (`src/hooks/useExternalAnalytics.ts`)
   - Unified tracking across GA4 and Meta Pixel
   - Automatic initialization
   - E-commerce event helpers

## 🚀 Quick Start

### 1. Configure Meta Pixel

1. Go to **Settings > Integrations > Analytics**
2. Click **Setup** on the Meta Pixel section
3. Enter your Pixel ID (found in Facebook Ads Manager)
4. Enable Advanced Matching (recommended)
5. Test the connection
6. Save configuration

### 2. Use in Components

```tsx
import { useExternalAnalytics } from '../hooks/useExternalAnalytics'

const ProductPage: React.FC<{ storeId: string, product: Product }> = ({ storeId, product }) => {
  const { trackViewItem, trackAddToCart } = useExternalAnalytics(storeId)
  
  // Track product view on mount
  useEffect(() => {
    trackViewItem({
      currency: 'USD',
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: 1,
        price: product.price
      }]
    })
  }, [product, trackViewItem])
  
  // Track add to cart
  const handleAddToCart = () => {
    trackAddToCart({
      currency: 'USD',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: 1,
        price: product.price
      }]
    })
    
    // Your existing add to cart logic
    addToCart(product)
  }
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  )
}
```

### 3. Track Purchase Events

```tsx
import { useExternalAnalytics } from '../hooks/useExternalAnalytics'

const CheckoutSuccess: React.FC<{ storeId: string, order: Order }> = ({ storeId, order }) => {
  const { trackPurchase } = useExternalAnalytics(storeId)
  
  useEffect(() => {
    trackPurchase({
      transaction_id: order.id,
      value: order.total,
      currency: order.currency,
      tax: order.tax,
      shipping: order.shipping,
      items: order.items.map(item => ({
        item_id: item.product_id,
        item_name: item.product_name,
        category: item.category,
        quantity: item.quantity,
        price: item.price
      }))
    })
  }, [order, trackPurchase])
  
  return <div>Thank you for your purchase!</div>
}
```

## 🎯 Available Tracking Methods

The `useExternalAnalytics` hook provides these methods:

- **`trackPageView()`** - Track page views
- **`trackPurchase(data)`** - Track completed purchases
- **`trackAddToCart(data)`** - Track add to cart events
- **`trackViewItem(data)`** - Track product page views
- **`trackBeginCheckout(data)`** - Track checkout initiation
- **`trackSearch(data)`** - Track search events
- **`trackSignup()`** - Track user registrations
- **`trackLogin()`** - Track user logins
- **`trackCustomEvent(name, params)`** - Track custom events
- **`setUserProperties(userData)`** - Set user data for advanced matching

## 🔧 Advanced Configuration

### Direct Service Usage

If you need direct access to the Meta Pixel service:

```tsx
import { metaPixel } from '../lib/metaPixel'

// Initialize manually
await metaPixel.initialize({
  pixelId: 'YOUR_PIXEL_ID',
  enableAdvancedMatching: true,
  enableAutoConfig: true
})

// Track custom conversion
metaPixel.trackCustomConversion('CustomEvent', {
  value: 100,
  currency: 'USD'
})
```

### User Data for Enhanced Matching

```tsx
import { useExternalAnalytics } from '../hooks/useExternalAnalytics'

const UserProfile: React.FC = () => {
  const { setUserProperties } = useExternalAnalytics(storeId)
  
  useEffect(() => {
    if (user) {
      setUserProperties({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      })
    }
  }, [user, setUserProperties])
  
  return <div>User Profile</div>
}
```

## 🛠️ Testing

### Connection Test
The integration includes a connection test feature in the settings panel. This will:
1. Validate the Pixel ID format
2. Initialize the pixel with your configuration
3. Send a test event to verify connectivity

### Facebook Pixel Helper
Install the Facebook Pixel Helper browser extension to verify events are firing correctly:
1. Install from Chrome Web Store
2. Navigate to your storefront
3. Check if events appear in the extension popup

## 📊 Event Types Supported

### Standard E-commerce Events
- **PageView** - Automatic page tracking
- **ViewContent** - Product page views
- **AddToCart** - Items added to cart
- **InitiateCheckout** - Checkout process started
- **AddPaymentInfo** - Payment method added
- **Purchase** - Completed transactions
- **Search** - Product/content searches
- **CompleteRegistration** - User sign-ups

### Custom Events
- Any custom event name with custom parameters
- Conversion tracking for specific business goals
- Lead generation events

## 🔒 Privacy & Compliance

The Meta Pixel integration includes:
- **Advanced Matching**: Automatically hashes sensitive data
- **User Consent**: Respects cookie consent preferences
- **Data Minimization**: Only tracks necessary e-commerce events
- **Secure Transmission**: All data sent over HTTPS

## 🐛 Troubleshooting

### Common Issues

1. **Events not firing**
   - Check Pixel ID format (15-16 digits)
   - Verify integration is enabled in settings
   - Check browser console for errors

2. **Advanced matching not working**
   - Ensure user email/phone is properly formatted
   - Verify enhanced matching is enabled in Facebook

3. **Custom events not tracking**
   - Check event name format (no spaces, use underscores)
   - Verify parameters are properly formatted

### Debug Mode
Enable debug logging by opening browser console - events will be logged when fired.

## 🚀 What's Next

The integration is complete and ready for production use. Future enhancements could include:
- Conversions API integration for server-side tracking
- Custom audience integration
- A/B testing framework integration
- Enhanced attribution modeling

---

**Ready to use!** Configure your Meta Pixel ID in Settings > Integrations > Analytics to start tracking.