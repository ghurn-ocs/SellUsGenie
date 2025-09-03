import React, { useState } from 'react'
import { FileText, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface PolicySettingsProps {
  storeId: string
}

interface StorePolicy {
  id?: string
  store_id: string
  privacy_policy?: string
  returns_policy?: string
  terms_policy?: string
  about_us?: string
  updated_at?: string
}

export const PolicySettings: React.FC<PolicySettingsProps> = ({ storeId }) => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'privacy' | 'returns' | 'terms' | 'about'>('privacy')
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({})

  // Fetch existing policies
  const { data: policies, isLoading } = useQuery({
    queryKey: ['store-policies', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_policies')
        .select('*')
        .eq('store_id', storeId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || {
        store_id: storeId,
        privacy_policy: '',
        returns_policy: '',
        terms_policy: '',
        about_us: ''
      }
    }
  })

  // Save policies mutation
  const savePolicies = useMutation({
    mutationFn: async (updatedPolicies: StorePolicy) => {
      const { data, error } = await supabase
        .from('store_policies')
        .upsert({
          ...updatedPolicies,
          store_id: storeId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'store_id'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-policies', storeId] })
      setUnsavedChanges({})
    }
  })

  const handlePolicyChange = (field: keyof StorePolicy, value: string) => {
    const updatedPolicies = { ...policies, [field]: value }
    queryClient.setQueryData(['store-policies', storeId], updatedPolicies)
    setUnsavedChanges(prev => ({ ...prev, [field]: true }))
  }

  const handleSave = () => {
    if (policies) {
      savePolicies.mutate(policies)
    }
  }

  const hasUnsavedChanges = Object.values(unsavedChanges).some(Boolean)

  if (isLoading) {
    return (
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <div className="text-center py-8 text-[#A0A0A0]">Loading policies...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'privacy' as const, label: 'Privacy Policy', field: 'privacy_policy' as keyof StorePolicy },
    { id: 'returns' as const, label: 'Returns Policy', field: 'returns_policy' as keyof StorePolicy },
    { id: 'terms' as const, label: 'Terms & Conditions', field: 'terms_policy' as keyof StorePolicy },
    { id: 'about' as const, label: 'About Us', field: 'about_us' as keyof StorePolicy }
  ]

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Store Policies</h2>
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              disabled={savePolicies.isPending}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 disabled:opacity-50"
            >
              <Save className="w-3 h-3 mr-1 inline" />
              {savePolicies.isPending ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Set up your privacy policy, returns policy, and about us page
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Tab Navigation */}
        <div className="grid grid-cols-2 gap-1 mb-4 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {unsavedChanges[tab.field] && (
                <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <div key={tab.id} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tab.label}
                </label>
                <textarea
                  value={policies?.[tab.field] || ''}
                  onChange={(e) => handlePolicyChange(tab.field, e.target.value)}
                  placeholder={`Enter your ${tab.label.toLowerCase()} here...`}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  This will be displayed on your storefront. You can use plain text or basic HTML formatting.
                </p>
              </div>

              {/* Template Suggestions */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Need help writing your {tab.label.toLowerCase()}?</h4>
                <p className="text-xs text-gray-600 mb-3">
                  {tab.id === 'privacy' && 'Include information about data collection, usage, cookies, and user rights.'}
                  {tab.id === 'returns' && 'Cover return timeframes, condition requirements, refund process, and shipping costs.'}
                  {tab.id === 'terms' && 'Define the legal terms and conditions for using your store and services.'}
                  {tab.id === 'about' && 'Tell your story, mission, values, and what makes your business unique.'}
                </p>
                <div className="flex flex-wrap gap-1">
                  {tab.id === 'privacy' && (
                    <>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Data Collection</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Cookies</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Third Parties</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">User Rights</span>
                    </>
                  )}
                  {tab.id === 'returns' && (
                    <>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Return Window</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Item Condition</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Refund Process</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Shipping Costs</span>
                    </>
                  )}
                  {tab.id === 'terms' && (
                    <>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">User Agreement</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Payment Terms</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Liability</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Prohibited Uses</span>
                    </>
                  )}
                  {tab.id === 'about' && (
                    <>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Company Story</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Mission & Values</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Team</span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Contact Info</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        ))}

        {/* Error Display */}
        {savePolicies.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to save policies. Please try again.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}