import React, { useEffect, useState } from 'react'
import { useRoute } from 'wouter'
import { VisualPageBuilderStoreFront } from '../components/website/VisualPageBuilderStoreFront'
import { supabase } from '../lib/supabase'

interface Store {
  id: string
  store_name: string
  store_slug: string
  is_active: boolean
}

export const StoreFrontView: React.FC = () => {
  const [, params] = useRoute('/store/:storeSlug/:pagePath*')
  const [, paramsBase] = useRoute('/store/:storeSlug')
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const storeSlug = params?.storeSlug || paramsBase?.storeSlug
  const pagePath = params?.pagePath || ''

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
    <VisualPageBuilderStoreFront
      storeId={store.id}
      storeName={store.store_name}
      pagePath={pagePath}
    />
  )
}