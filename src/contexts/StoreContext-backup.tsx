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

  const fetchStores = useCallback(async () => {
    if (!user) {
      setStores([])
      setCurrentStore(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('store_owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setStores(data || [])
      
      // Set first store as current if no current store is selected
      // Only set if we don't have a current store AND we have stores
      if (data && data.length > 0) {
        setCurrentStore(prevStore => prevStore || data[0])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const createStore = useCallback(async (storeData: Partial<Store>): Promise<Store> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const newStore = {
        store_owner_id: user.id,
        store_name: storeData.store_name || 'New Store',
        store_slug: storeData.store_slug || `store-${Date.now()}`,
        is_active: true,
        subscription_status: 'trial' as const,
        trial_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        ...storeData
      }

      const { data, error } = await supabase
        .from('stores')
        .insert([newStore])
        .select()
        .single()

      if (error) throw error

      setStores(prev => [data, ...prev])
      if (!currentStore) {
        setCurrentStore(data)
      }

      return data
    } catch (error) {
      console.error('Error creating store:', error)
      throw error
    }
  }, [user, currentStore])

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

      if (currentStore?.id === storeId) {
        setCurrentStore(prev => prev ? { ...prev, ...updates } : null)
      }
    } catch (error) {
      console.error('Error updating store:', error)
      throw error
    }
  }, [currentStore?.id])

  const deleteStore = useCallback(async (storeId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)

      if (error) throw error

      setStores(prev => {
        const filtered = prev.filter(store => store.id !== storeId)
        
        // If deleting current store, set the first remaining store as current
        if (currentStore?.id === storeId && filtered.length > 0) {
          setCurrentStore(filtered[0])
        } else if (currentStore?.id === storeId) {
          setCurrentStore(null)
        }
        
        return filtered
      })
    } catch (error) {
      console.error('Error deleting store:', error)
      throw error
    }
  }, [currentStore?.id])

  const refreshStores = useCallback(async () => {
    await fetchStores()
  }, [fetchStores])

  const value = useMemo(() => ({
    stores,
    currentStore,
    setCurrentStore,
    loading,
    createStore,
    updateStore,
    deleteStore,
    refreshStores
  }), [stores, currentStore, loading, createStore, updateStore, deleteStore, refreshStores])

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}
