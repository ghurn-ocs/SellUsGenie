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
    <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
      <div className="p-6 border-b border-[#3A3A3A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-[#A0A0A0]" />
            <div>
              <h3 className="text-lg font-semibold text-white">Store Policies</h3>
              <p className="text-sm text-[#A0A0A0]">
                Set up your privacy policy, returns policy, and about us page
              </p>
            </div>
          </div>
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              disabled={savePolicies.isPending}
              className="flex items-center space-x-2 px-4 py-2 bg-[#9B51E0] text-white rounded-lg text-sm font-medium hover:bg-[#B16CE8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{savePolicies.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-[#1E1E1E] rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#9B51E0] text-white'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A]'
              }`}
            >
              {tab.label}
              {unsavedChanges[tab.field] && (
                <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <div key={tab.id} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {tab.label}
                </label>
                <textarea
                  value={policies?.[tab.field] || ''}
                  onChange={(e) => handlePolicyChange(tab.field, e.target.value)}
                  placeholder={`Enter your ${tab.label.toLowerCase()} here...`}
                  rows={15}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent resize-y"
                />
                <p className="mt-2 text-xs text-[#A0A0A0]">
                  This will be displayed on your storefront. You can use plain text or basic HTML formatting.
                </p>
              </div>

              {/* Template Suggestions */}
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">Need help writing your {tab.label.toLowerCase()}?</h4>
                <p className="text-xs text-[#A0A0A0] mb-3">
                  {tab.id === 'privacy' && 'Include information about data collection, usage, cookies, and user rights.'}
                  {tab.id === 'returns' && 'Cover return timeframes, condition requirements, refund process, and shipping costs.'}
                  {tab.id === 'terms' && 'Define the legal terms and conditions for using your store and services.'}
                  {tab.id === 'about' && 'Tell your story, mission, values, and what makes your business unique.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tab.id === 'privacy' && (
                    <>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Data Collection</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Cookies</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Third Parties</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">User Rights</span>
                    </>
                  )}
                  {tab.id === 'returns' && (
                    <>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Return Window</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Item Condition</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Refund Process</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Shipping Costs</span>
                    </>
                  )}
                  {tab.id === 'terms' && (
                    <>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">User Agreement</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Payment Terms</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Liability</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Prohibited Uses</span>
                    </>
                  )}
                  {tab.id === 'about' && (
                    <>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Company Story</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Mission & Values</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Team</span>
                      <span className="px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] text-xs rounded">Contact Info</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        ))}

        {/* Error Display */}
        {savePolicies.isError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to save policies. Please try again.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}