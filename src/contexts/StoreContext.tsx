import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Store } from '../lib/supabase'

interface StoreContextType {
  stores: Store[]
  currentStore: Store | null
  setCurrentStore: (store: Store) => void
  loading: boolean
  createStore: (storeData: Partial<Store>) => Promise<Store>
  updateStore: (storeId: string, updates: Partial<Store>) => Promise<void>
  deleteStore: (storeId: string) => Promise<void>
  refreshStores: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export const useStore = () => {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

interface StoreProviderProps {
  children: React.ReactNode
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  // Stable user ID reference
  const userId = user?.id

  const fetchStores = useCallback(async () => {
    if (!userId) {
      setStores([])
      setCurrentStore(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('store_owner_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setStores(data || [])
      
      // Only set current store if we don't have one and data exists
      setCurrentStore(prevStore => {
        if (prevStore) return prevStore
        return data && data.length > 0 ? data[0] : null
      })
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const createStore = useCallback(async (storeData: Partial<Store>): Promise<Store> => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const newStore = {
        store_owner_id: userId,
        store_name: storeData.store_name || 'New Store',
        store_slug: storeData.store_slug || `store-${Date.now()}`,
        is_active: true,
        subscription_status: 'trial' as const,
        trial_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        ...storeData
      }

      const { data, error } = await supabase
        .from('stores')
        .insert([newStore])
        .select()
        .single()

      if (error) throw error

      setStores(prev => [data, ...prev])
      setCurrentStore(prevStore => prevStore || data)

      return data
    } catch (error) {
      console.error('Error creating store:', error)
      throw error
    }
  }, [userId])

  const updateStore = useCallback(async (storeId: string, updates: Partial<Store>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)

      if (error) throw error

      setStores(prev => prev.map(store => 
        store.id === storeId ? { ...store, ...updates } : store
      ))

      setCurrentStore(prev => 
        prev?.id === storeId ? { ...prev, ...updates } : prev
      )
    } catch (error) {
      console.error('Error updating store:', error)
      throw error
    }
  }, [])

  const deleteStore = useCallback(async (storeId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)

      if (error) throw error

      setStores(prev => {
        const filtered = prev.filter(store => store.id !== storeId)
        // If we deleted the current store, set new current store
        setCurrentStore(current => {
          if (current?.id === storeId) {
            return filtered.length > 0 ? filtered[0] : null
          }
          return current
        })
        return filtered
      })
    } catch (error) {
      console.error('Error deleting store:', error)
      throw error
    }
  }, [])

  const refreshStores = useCallback(() => fetchStores(), [fetchStores])

  // Stable context value with minimal dependencies
  const contextValue = useMemo(() => ({
    stores,
    currentStore,
    setCurrentStore,
    loading,
    createStore,
    updateStore,
    deleteStore,
    refreshStores
  }), [
    stores,
    currentStore,
    loading,
    createStore,
    updateStore,
    deleteStore,
    refreshStores
  ])

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  )
}