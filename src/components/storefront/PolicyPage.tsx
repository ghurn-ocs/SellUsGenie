import React from 'react'
import { ArrowLeft, FileText } from 'lucide-react'

interface PolicyPageProps {
  storeId: string
  storeName: string
  policyType: 'privacy' | 'returns' | 'about'
  content: string
  onBack: () => void
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ 
  storeId, 
  storeName, 
  policyType, 
  content, 
  onBack 
}) => {
  const titles = {
    privacy: 'Privacy Policy',
    returns: 'Returns Policy',
    about: 'About Us'
  }

  const defaultContent = {
    privacy: `# Privacy Policy

This Privacy Policy describes how ${storeName} collects, uses, and protects your information when you use our website and services.

## Information We Collect
- Personal information you provide when making purchases
- Usage data about how you interact with our website
- Device and browser information

## How We Use Your Information
- To process orders and payments
- To improve our products and services
- To communicate with you about your orders

## Contact Us
If you have questions about this Privacy Policy, please contact us.`,

    returns: `# Returns Policy

At ${storeName}, we want you to be completely satisfied with your purchase.

## Return Window
You may return items within 30 days of delivery for a full refund.

## Return Conditions
- Items must be in original condition
- Original packaging must be included
- Proof of purchase required

## How to Return
Contact us to initiate a return and receive return shipping instructions.

## Refunds
Refunds will be processed to your original payment method within 5-10 business days.

## Contact Us
For return questions, please contact our customer service team.`,

    about: `# About ${storeName}

Welcome to ${storeName}! We're passionate about providing high-quality products and exceptional customer service.

## Our Story
Founded with a commitment to excellence, we strive to bring you the best products at competitive prices.

## Our Mission
To provide customers with an outstanding shopping experience from browsing to delivery.

## Contact Us
We'd love to hear from you! Reach out with any questions or feedback.`
  }

  const displayContent = content || defaultContent[policyType]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Store
            </button>
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-gray-400 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{titles[policyType]}</h1>
                <p className="text-sm text-gray-500">{storeName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose prose-gray max-w-none">
              {displayContent.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
                      {line.substring(2)}
                    </h1>
                  )
                } else if (line.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-xl font-semibold text-gray-900 mb-4 mt-8 first:mt-0">
                      {line.substring(3)}
                    </h2>
                  )
                } else if (line.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-lg font-medium text-gray-900 mb-3 mt-6 first:mt-0">
                      {line.substring(4)}
                    </h3>
                  )
                } else if (line.startsWith('- ')) {
                  return (
                    <li key={index} className="text-gray-700 mb-2 ml-4">
                      {line.substring(2)}
                    </li>
                  )
                } else if (line.trim() === '') {
                  return <br key={index} />
                } else {
                  return (
                    <p key={index} className="text-gray-700 mb-4">
                      {line}
                    </p>
                  )
                }
              })}
            </div>

            {/* Contact Information */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Questions?</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this {titles[policyType].toLowerCase()}, 
                  please don't hesitate to contact us.
                </p>
                <button 
                  onClick={onBack}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}