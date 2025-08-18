import React, { useEffect, useState } from 'react'
import { useRoute } from 'wouter'
import { useStoreFront, applyColorScheme } from '../hooks/useStoreFront'
import { FunctionalStoreFront } from '../components/storefront/FunctionalStoreFront'
import { supabase } from '../lib/supabase'

interface Store {
  id: string
  store_name: string
  store_slug: string
  is_active: boolean
}

export const StoreFrontView: React.FC = () => {
  const [, params] = useRoute('/store/:storeSlug')
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const storeSlug = params?.storeSlug

  // Fetch store data
  useEffect(() => {
    const fetchStore = async () => {
      if (!storeSlug) return

      try {
        const { data, error } = await supabase
          .from('stores')
          .select('id, store_name, store_slug, is_active')
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

  const {
    currentTemplate,
    currentLayout,
    currentColorScheme,
    isLoading: templateLoading
  } = useStoreFront(store?.id || '')

  // Apply color scheme when it loads
  useEffect(() => {
    if (currentColorScheme) {
      applyColorScheme(currentColorScheme)
    }
  }, [currentColorScheme])

  if (loading || templateLoading) {
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

  if (!currentTemplate || !currentLayout || !currentColorScheme) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{store.store_name}</h1>
          <p className="text-gray-600">This store is still being set up. Please check back later.</p>
        </div>
      </div>
    )
  }

  return (
    <FunctionalStoreFront
      layout={currentLayout}
      colorScheme={currentColorScheme}
      storeId={store.id}
      storeName={store.store_name}
      customizations={currentTemplate.customizations}
    />
  )
}