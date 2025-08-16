import React, { createContext, useContext, useEffect, useState } from 'react'
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

  const fetchStores = async () => {
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
      if (data && data.length > 0 && !currentStore) {
        setCurrentStore(data[0])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [user])

  const createStore = async (storeData: Partial<Store>): Promise<Store> => {
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
  }

  const updateStore = async (storeId: string, updates: Partial<Store>): Promise<void> => {
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
  }

  const deleteStore = async (storeId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)

      if (error) throw error

      setStores(prev => prev.filter(store => store.id !== storeId))
      
      if (currentStore?.id === storeId) {
        const remainingStores = stores.filter(store => store.id !== storeId)
        setCurrentStore(remainingStores.length > 0 ? remainingStores[0] : null)
      }
    } catch (error) {
      console.error('Error deleting store:', error)
      throw error
    }
  }

  const refreshStores = async () => {
    await fetchStores()
  }

  const value = {
    stores,
    currentStore,
    setCurrentStore,
    loading,
    createStore,
    updateStore,
    deleteStore,
    refreshStores
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}
