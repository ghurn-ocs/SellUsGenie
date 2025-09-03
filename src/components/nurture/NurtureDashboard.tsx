// Marketing Dashboard Component
// Main dashboard for marketing program with leads, campaigns, and analytics

import React, { useState } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { useCustomers } from '../../hooks/useCustomers'
import { useOrders } from '../../hooks/useOrders'
import { useEmailMarketingOverview, useEmailCampaigns, useEmailSegments } from '../../hooks/useEmailMarketing'
import { LeadsTab } from './LeadsTab'
import { CampaignsTab } from './CampaignsTab'
import { IncompleteOrdersTab } from './IncompleteOrdersTab'
import { SegmentsTab } from './SegmentsTab'
import { Users, Mail, ShoppingCart, TrendingUp, Zap } from 'lucide-react'

interface NurtureDashboardProps {}

export const NurtureDashboard: React.FC<NurtureDashboardProps> = () => {
  const { currentStore } = useStore()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Data hooks
  const { customers } = useCustomers(currentStore?.id || '')
  const { orders } = useOrders(currentStore?.id || '')
  const { data: marketingOverview } = useEmailMarketingOverview(currentStore?.id || '')
  const { data: campaigns = [] } = useEmailCampaigns(currentStore?.id || '')
  const { data: segments = [] } = useEmailSegments(currentStore?.id || '')
  
  // Calculate real metrics from actual data
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  // Total leads = customers without completed orders (potential customers)
  const totalLeads = customers.filter(customer => 
    !customer.orders || customer.orders.length === 0
  ).length
  
  const activeCampaigns = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length
  
  // Abandoned carts = orders with 'pending' status (started but not completed)
  const abandonedCarts = orders.filter(order => order.status === 'pending').length
  
  // Conversions = customers who made their first purchase this week
  const conversions = customers.filter(customer => {
    if (!customer.orders || customer.orders.length === 0) return false
    const firstOrderDate = new Date(Math.min(...customer.orders.map((order: any) => new Date(order.created_at).getTime())))
    return firstOrderDate >= oneWeekAgo
  }).length
  
  // Calculate recoverable value from abandoned carts
  const recoverableValue = orders
    .filter(order => order.status === 'pending')
    .reduce((sum, order) => sum + (order.total || 0), 0)
  
  // Calculate recovery rate
  const recoveryRate = abandonedCarts > 0 ? (conversions / abandonedCarts) * 100 : 0
  
  // New leads this week = customers created in the last 7 days without orders
  const newLeadsThisWeek = customers.filter(customer => {
    const createdDate = new Date(customer.created_at)
    const hasNoOrders = !customer.orders || customer.orders.length === 0
    return createdDate >= oneWeekAgo && hasNoOrders
  }).length

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A0A0A0]">Please select a store to view marketing dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing</h1>
          <p className="text-[#A0A0A0] mt-1">
            Manage leads, recover abandoned carts, and nurture customer relationships
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-[#2A2A2A] p-1 rounded-lg border border-[#3A3A3A] shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'leads'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Leads
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'campaigns'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Email Campaigns
          </button>
          <button
            onClick={() => setActiveTab('abandoned')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'abandoned'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Abandoned Carts
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'segments'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Customer Segments
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{totalLeads.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-400 font-medium">+{newLeadsThisWeek}</span>
                <span className="text-[#A0A0A0] ml-1">new this week</span>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Active Campaigns</p>
                  <p className="text-2xl font-bold text-white">{activeCampaigns}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-blue-400 font-medium">
                  {marketingOverview?.average_open_rate ? `${marketingOverview.average_open_rate.toFixed(1)}%` : '--'}
                </span>
                <span className="text-[#A0A0A0] ml-1">avg open rate</span>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Abandoned Carts</p>
                  <p className="text-2xl font-bold text-white">{abandonedCarts}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-red-400 font-medium">
                  ${recoverableValue.toLocaleString()}
                </span>
                <span className="text-[#A0A0A0] ml-1">recoverable value</span>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Conversions</p>
                  <p className="text-2xl font-bold text-white">{conversions}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-400 font-medium">{recoveryRate.toFixed(1)}%</span>
                <span className="text-[#A0A0A0] ml-1">recovery rate</span>
              </div>
            </div>
          </div>

          {/* Getting Started Section */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-[#9B51E0]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Marketing & Email Automation</h3>
              <p className="text-[#A0A0A0] mb-6 max-w-2xl mx-auto">
                Turn visitors into customers with our comprehensive marketing system featuring professional email templates, 
                customer segmentation, and abandoned cart recovery.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Lead Management</h4>
                  <p className="text-[#A0A0A0] text-sm">Track and score leads with advanced analytics</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Email Templates</h4>
                  <p className="text-[#A0A0A0] text-sm">23 professional templates ready to use</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-6 h-6 text-orange-400" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Cart Recovery</h4>
                  <p className="text-[#A0A0A0] text-sm">Automatically recover abandoned shopping carts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leads' && <LeadsTab />}
      {activeTab === 'campaigns' && <CampaignsTab />}
      {activeTab === 'abandoned' && <IncompleteOrdersTab />}
      {activeTab === 'segments' && <SegmentsTab />}
    </div>
  )
}