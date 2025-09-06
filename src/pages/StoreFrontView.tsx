import React, { useEffect, useState } from 'react'
import { useRoute, useLocation } from 'wouter'
import { VisualPageBuilderStoreFront } from '../components/website/VisualPageBuilderStoreFront'
import { CartProvider } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'

interface Store {
  id: string
  store_name: string
  store_slug: string
  store_logo_url: string | null
  is_active: boolean
}

export const StoreFrontView: React.FC = () => {
  const [location] = useLocation()
  const [, params] = useRoute('/store/:storeSlug/:pagePath*')
  const [, paramsBase] = useRoute('/store/:storeSlug')
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract route params with more robust parsing
  const storeSlug = params?.storeSlug || paramsBase?.storeSlug
  const pagePath = React.useMemo(() => {
    // Parse pagePath from current location if params aren't working
    const locationParts = location.split('/')
    if (locationParts[1] === 'store' && locationParts[2]) {
      // /store/storeSlug/pagePath
      return locationParts.slice(3).join('/') || ''
    }
    return (params as any)?.['pagePath*'] || ''
  }, [location, params])

  // Debug: Log URL changes to understand routing behavior
  useEffect(() => {
    console.log('🔄 StoreFrontView URL changed:', {
      location,
      storeSlug,
      pagePath,
      params,
      paramsBase
    })
  }, [location, storeSlug, pagePath, params, paramsBase])

  // Fetch store data
  useEffect(() => {
    const fetchStore = async () => {
      if (!storeSlug) return

      try {
        const { data, error } = await supabase
          .from('stores')
          .select('id, store_name, store_slug, store_logo_url, is_active')
          .eq('store_slug', storeSlug)
          .eq('is_active', true)
          .single()

        if (error) {
          setError('Store not found')
          return
        }

        setStore(data)
      } catch (err) {
        setError('Failed to load store')
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [storeSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600">{error || 'The requested store could not be found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <CartProvider storeId={store.id}>
      <VisualPageBuilderStoreFront
        storeId={store.id}
        storeName={store.store_name}
        pagePath={pagePath}
        storeSlug={storeSlug}
      />
    </CartProvider>
  )
}