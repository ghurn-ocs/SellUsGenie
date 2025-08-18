import React, { useState } from 'react'
import { Globe, Plus, Check, X, AlertCircle, ExternalLink, Copy, Crown, HelpCircle, ChevronDown, ChevronRight, Shield, Zap, Eye } from 'lucide-react'
import { useCustomDomain } from '../../hooks/useCustomDomain'
import { useSubscription } from '../../hooks/useSubscription'

interface CustomDomainSettingsProps {
  storeId: string
}

export const CustomDomainSettings: React.FC<CustomDomainSettingsProps> = ({ storeId }) => {
  const { 
    domains, 
    primaryDomain, 
    canUseCustomDomain, 
    isLoading,
    addCustomDomain, 
    verifyDomain, 
    setPrimaryDomain, 
    removeDomain,
    validateDomain,
    validationErrors,
    getVerificationInstructions
  } = useCustomDomain(storeId)
  
  const { subscription, subscriptionLimits } = useSubscription()
  
  const [showAddDomain, setShowAddDomain] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [newSubdomain, setNewSubdomain] = useState('')
  const [copiedText, setCopiedText] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(''), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return

    try {
      await addCustomDomain.mutateAsync({
        domainName: newDomain.trim(),
        subdomain: newSubdomain.trim() || undefined
      })
      setNewDomain('')
      setNewSubdomain('')
      setShowAddDomain(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'text-green-400 bg-green-400/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20'
      case 'failed':
      case 'expired':
        return 'text-red-400 bg-red-400/20'
      default:
        return 'text-[#A0A0A0] bg-[#3A3A3A]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return <Check className="w-3 h-3" />
      case 'failed':
      case 'expired':
        return <X className="w-3 h-3" />
      default:
        return <AlertCircle className="w-3 h-3" />
    }
  }

  const toggleGuideSection = (section: string) => {
    setExpandedGuide(expandedGuide === section ? null : section)
  }

  // Setup Guide Component
  const DomainSetupGuide = () => (
    <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-[#9B51E0]" />
          Domain Setup Guide
        </h3>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center text-sm text-[#9B51E0] hover:text-[#B16CE8] transition-colors"
        >
          {showGuide ? (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Hide Guide
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 mr-1" />
              Show Setup Guide
            </>
          )}
        </button>
      </div>

      {showGuide && (
        <div className="space-y-4">
          <p className="text-[#A0A0A0] text-sm mb-4">
            Follow these steps to successfully connect your custom domain to your store:
          </p>

          {/* Step 1: Purchase Domain */}
          <div className="border border-[#3A3A3A] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGuideSection('purchase')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1E1E1E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:ring-inset"
            >
              <div className="flex items-center">
                <div className="w-6 h-6 bg-[#9B51E0] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  1
                </div>
                <span className="text-white font-medium">Purchase & Own a Domain</span>
              </div>
              {expandedGuide === 'purchase' ? (
                <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
              )}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedGuide === 'purchase' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-4 pb-4 border-t border-[#3A3A3A]">
                <div className="mt-4 space-y-3">
                  <p className="text-[#A0A0A0] text-sm">
                    You need to own a domain name before you can connect it to your store.
                  </p>
                  <div className="bg-[#1E1E1E] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Recommended Domain Registrars:</h4>
                    <ul className="text-sm text-[#A0A0A0] space-y-1">
                      <li>• <strong className="text-white">Namecheap</strong> - User-friendly, good pricing</li>
                      <li>• <strong className="text-white">Google Domains</strong> - Simple management, integrated with Google services</li>
                      <li>• <strong className="text-white">Cloudflare Registrar</strong> - At-cost pricing, excellent performance</li>
                      <li>• <strong className="text-white">GoDaddy</strong> - Popular, lots of features</li>
                    </ul>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-300 text-sm">
                      <strong>💡 Tip:</strong> Choose a domain that matches your brand and is easy to remember. 
                      Consider .com for maximum trust, but .shop, .store, or country-specific domains work too.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Add Domain Here */}
          <div className="border border-[#3A3A3A] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGuideSection('add')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1E1E1E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:ring-inset"
            >
              <div className="flex items-center">
                <div className="w-6 h-6 bg-[#9B51E0] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  2
                </div>
                <span className="text-white font-medium">Add Your Domain to SellUsGenie</span>
              </div>
              {expandedGuide === 'add' ? (
                <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
              )}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedGuide === 'add' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-4 pb-4 border-t border-[#3A3A3A]">
                <div className="mt-4 space-y-3">
                  <p className="text-[#A0A0A0] text-sm">
                    Click "Add Domain" above and enter your domain information.
                  </p>
                  <div className="bg-[#1E1E1E] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Domain Format Examples:</h4>
                    <ul className="text-sm text-[#A0A0A0] space-y-1">
                      <li>• <code className="bg-[#3A3A3A] px-1 rounded text-white">mystore.com</code> - Use entire domain</li>
                      <li>• <code className="bg-[#3A3A3A] px-1 rounded text-white">shop.mystore.com</code> - Use subdomain "shop"</li>
                      <li>• <code className="bg-[#3A3A3A] px-1 rounded text-white">store.mybrand.net</code> - Use subdomain "store"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Configure DNS */}
          <div className="border border-[#3A3A3A] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGuideSection('dns')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1E1E1E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:ring-inset"
            >
              <div className="flex items-center">
                <div className="w-6 h-6 bg-[#9B51E0] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  3
                </div>
                <span className="text-white font-medium">Configure DNS Records</span>
              </div>
              {expandedGuide === 'dns' ? (
                <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
              )}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedGuide === 'dns' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-4 pb-4 border-t border-[#3A3A3A]">
                <div className="mt-4 space-y-3">
                  <p className="text-[#A0A0A0] text-sm">
                    After adding your domain, we'll provide specific DNS records to add to your domain provider.
                  </p>
                  <div className="bg-[#1E1E1E] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">You'll need to add:</h4>
                    <ul className="text-sm text-[#A0A0A0] space-y-1">
                      <li>• <strong className="text-white">TXT Record</strong> - Proves you own the domain</li>
                      <li>• <strong className="text-white">CNAME Record</strong> - Routes traffic to your store</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-300 text-sm">
                      <strong>⏱️ Important:</strong> DNS changes can take up to 24 hours to take effect globally. 
                      Most changes happen within 1-2 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Verification & SSL */}
          <div className="border border-[#3A3A3A] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGuideSection('verify')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1E1E1E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:ring-inset"
            >
              <div className="flex items-center">
                <div className="w-6 h-6 bg-[#9B51E0] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  4
                </div>
                <span className="text-white font-medium">Verification & SSL Setup</span>
              </div>
              {expandedGuide === 'verify' ? (
                <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
              )}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedGuide === 'verify' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-4 pb-4 border-t border-[#3A3A3A]">
                <div className="mt-4 space-y-3">
                  <p className="text-[#A0A0A0] text-sm">
                    Once DNS is configured, we'll verify your domain and automatically provision SSL certificates.
                  </p>
                  <div className="bg-[#1E1E1E] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">What happens automatically:</h4>
                    <ul className="text-sm text-[#A0A0A0] space-y-1">
                      <li>• <Shield className="w-3 h-3 inline mr-1" /> SSL certificate provisioning</li>
                      <li>• <Zap className="w-3 h-3 inline mr-1" /> Global CDN deployment</li>
                      <li>• <Eye className="w-3 h-3 inline mr-1" /> Domain verification</li>
                    </ul>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-300 text-sm">
                      <strong>🎉 Success:</strong> Once verified, your store will be accessible at your custom domain 
                      with automatic HTTPS encryption!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#9B51E0]/10 border border-[#9B51E0]/30 rounded-lg p-4 mt-6">
            <p className="text-[#C9A9E8] text-sm">
              <strong>Need help?</strong> Contact our support team if you get stuck during setup. 
              We're here to help you get your custom domain working perfectly.
            </p>
          </div>
        </div>
      )}
    </div>
  )

  // Plan upgrade prompt for non-eligible users
  if (!canUseCustomDomain) {
    return (
      <div>
        <DomainSetupGuide />
        
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#9B51E0]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Custom Domain
              </h3>
              <p className="text-[#A0A0A0] mb-4">
                Use your own domain name (like mystore.com) instead of the default subdomain. 
                This feature is available for Professional and Enterprise plans.
              </p>
              <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
                <h4 className="font-medium text-white mb-2">Benefits of Custom Domains:</h4>
                <ul className="text-sm text-[#A0A0A0] space-y-1">
                  <li>• Professional branded appearance</li>
                  <li>• Better SEO performance and search rankings</li>
                  <li>• Increased customer trust and credibility</li>
                  <li>• Free SSL certificate included</li>
                  <li>• Full DNS control and configuration</li>
                  <li>• Global CDN for faster loading worldwide</li>
                </ul>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[#A0A0A0]">
                    Current plan: <span className="capitalize text-white">{subscription?.plan_id || 'Trial'}</span>
                  </span>
                </div>
                <button className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg text-sm font-medium hover:bg-[#B16CE8] transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DomainSetupGuide />
      
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
        <div className="p-6 border-b border-[#3A3A3A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-[#A0A0A0]" />
              <div>
                <h3 className="text-lg font-semibold text-white">Custom Domain</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Use your own domain name for your store
                </p>
              </div>
            </div>
            {!showAddDomain && (
              <button
                onClick={() => setShowAddDomain(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#9B51E0] text-white rounded-lg text-sm font-medium hover:bg-[#B16CE8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Domain</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Add Domain Form */}
          {showAddDomain && (
            <div className="mb-6 p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
              <h4 className="font-medium text-white mb-3">Add Custom Domain</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Domain Name *
                  </label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Subdomain (Optional)
                  </label>
                  <input
                    type="text"
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value)}
                    placeholder="shop"
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  />
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <div>
                      {validationErrors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddDomain}
                  disabled={addCustomDomain.isPending || !newDomain.trim()}
                  className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg text-sm font-medium hover:bg-[#B16CE8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addCustomDomain.isPending ? 'Adding...' : 'Add Domain'}
                </button>
                <button
                  onClick={() => {
                    setShowAddDomain(false)
                    setNewDomain('')
                    setNewSubdomain('')
                  }}
                  className="px-4 py-2 bg-[#3A3A3A] text-[#A0A0A0] rounded-lg text-sm font-medium hover:bg-[#4A4A4A] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Domains List */}
          {isLoading ? (
            <div className="text-center py-8 text-[#A0A0A0]">Loading domains...</div>
          ) : domains.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-[#3A3A3A] mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No custom domains</h4>
              <p className="text-[#A0A0A0]">
                Add a custom domain to use your own branded URL for your store.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => {
                const instructions = getVerificationInstructions(domain)
                
                return (
                  <div key={domain.id} className="border border-[#3A3A3A] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-white text-lg">
                            {domain.full_domain}
                          </h4>
                          {domain.is_primary && (
                            <span className="px-2 py-1 bg-[#9B51E0]/20 text-[#C9A9E8] text-xs font-medium rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(domain.verification_status)}`}>
                              {getStatusIcon(domain.verification_status)}
                              <span className="ml-1 capitalize">{domain.verification_status}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(domain.ssl_status)}`}>
                              {getStatusIcon(domain.ssl_status)}
                              <span className="ml-1">SSL {domain.ssl_status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {domain.verification_status === 'verified' && !domain.is_primary && (
                          <button
                            onClick={() => setPrimaryDomain.mutate(domain.id)}
                            disabled={setPrimaryDomain.isPending}
                            className="px-3 py-1 bg-[#9B51E0]/20 text-[#C9A9E8] rounded text-sm font-medium hover:bg-[#9B51E0]/30 transition-colors"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => removeDomain.mutate(domain.id)}
                          disabled={removeDomain.isPending}
                          className="p-1 text-[#A0A0A0] hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* DNS Instructions */}
                    {domain.verification_status === 'pending' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                        <h5 className="font-medium text-yellow-300 mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          DNS Configuration Required
                        </h5>
                        
                        <p className="text-sm text-yellow-200 mb-4">
                          Add these DNS records to your domain provider to verify ownership and route traffic:
                        </p>

                        <div className="space-y-4">
                          {/* TXT Record for Verification */}
                          <div className="bg-[#2A2A2A] rounded border border-[#3A3A3A] p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">TXT Record (Verification)</span>
                              <button
                                onClick={() => copyToClipboard(instructions.txtRecord.value, 'txt')}
                                className="flex items-center space-x-1 text-xs text-[#9B51E0] hover:text-[#B16CE8] transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedText === 'txt' ? 'Copied!' : 'Copy'}</span>
                              </button>
                            </div>
                            <div className="text-xs space-y-1">
                              <div><span className="text-[#A0A0A0]">Name:</span> <code className="bg-[#1E1E1E] px-1 rounded text-white">@</code></div>
                              <div><span className="text-[#A0A0A0]">Value:</span> <code className="bg-[#1E1E1E] px-1 rounded text-white break-all">{instructions.txtRecord.value}</code></div>
                            </div>
                          </div>

                          {/* CNAME Record */}
                          <div className="bg-[#2A2A2A] rounded border border-[#3A3A3A] p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">CNAME Record (Traffic)</span>
                              <button
                                onClick={() => copyToClipboard(instructions.cnameRecord.value, 'cname')}
                                className="flex items-center space-x-1 text-xs text-[#9B51E0] hover:text-[#B16CE8] transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedText === 'cname' ? 'Copied!' : 'Copy'}</span>
                              </button>
                            </div>
                            <div className="text-xs space-y-1">
                              <div><span className="text-[#A0A0A0]">Name:</span> <code className="bg-[#1E1E1E] px-1 rounded text-white">@</code></div>
                              <div><span className="text-[#A0A0A0]">Points to:</span> <code className="bg-[#1E1E1E] px-1 rounded text-white">{instructions.cnameRecord.value}</code></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-yellow-200">
                            DNS changes can take up to 24 hours to propagate globally.
                          </p>
                          <button
                            onClick={() => verifyDomain.mutate(domain.id)}
                            disabled={verifyDomain.isPending}
                            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                          >
                            {verifyDomain.isPending ? 'Checking...' : 'Check DNS'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Success State */}
                    {domain.verification_status === 'verified' && domain.ssl_status === 'active' && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                        <div className="flex items-center space-x-2 text-green-300">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Domain verified and active!</span>
                        </div>
                        <p className="text-sm text-green-200 mt-1">
                          Your store is now accessible at{' '}
                          <a 
                            href={`https://${domain.full_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:no-underline inline-flex items-center space-x-1 text-green-300"
                          >
                            <span>{domain.full_domain}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}