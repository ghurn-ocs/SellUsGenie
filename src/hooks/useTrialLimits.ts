import { useMemo } from 'react'
import { useStore } from '../contexts/StoreContext'
import { useProducts } from './useProducts'
import { useSubscription } from './useSubscription'



export const useTrialLimits = () => {
  const { currentStore } = useStore()
  const { products } = useProducts(currentStore?.id || '')
  const { isTrialUser, subscriptionLimits } = useSubscription()

  const canCreateProduct = useMemo(() => {
    if (subscriptionLimits.maxProducts === -1) return true // unlimited
    return products.length < subscriptionLimits.maxProducts
  }, [products.length, subscriptionLimits.maxProducts])

  const canUploadImage = useMemo(() => {
    if (subscriptionLimits.maxImageUploads === -1) return true // unlimited
    return true // Per-product limit will be enforced in ImageUpload component
  }, [subscriptionLimits.maxImageUploads])

  const getProductLimitMessage = () => {
    if (subscriptionLimits.maxProducts === -1) return null // unlimited
    const remaining = subscriptionLimits.maxProducts - products.length
    if (remaining <= 0) {
      return `Plan limit reached: You can create up to ${subscriptionLimits.maxProducts} products. Upgrade to create more.`
    }
    if (isTrialUser) {
      return `Trial account: ${remaining} of ${subscriptionLimits.maxProducts} products remaining.`
    }
    return `${remaining} of ${subscriptionLimits.maxProducts} products remaining in your plan.`
  }

  const getStoreLimitMessage = () => {
    if (subscriptionLimits.maxStores === -1) return null // unlimited
    if (isTrialUser) {
      return `Trial account: You can create up to ${subscriptionLimits.maxStores} stores.`
    }
    return `Your plan allows up to ${subscriptionLimits.maxStores} stores.`
  }

  return {
    isTrialUser,
    limits: subscriptionLimits,
    canCreateProduct,
    canUploadImage,
    getProductLimitMessage,
    getStoreLimitMessage,
    currentProductCount: products.length
  }
}