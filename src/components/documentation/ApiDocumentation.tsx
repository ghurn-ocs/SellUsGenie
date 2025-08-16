import React, { useState } from 'react'
import { GenieMascot } from '../ui/GenieMascot'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  requestBody?: any
  response: any
  example: string
}

const ApiDocumentation: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('overview')
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)

  const endpoints: Record<string, ApiEndpoint[]> = {
    products: [
      {
        method: 'GET',
        path: '/api/stores/{store_id}/products',
        description: 'Retrieve all products for a store',
        parameters: [
          { name: 'store_id', type: 'string', required: true, description: 'The unique identifier for the store' },
          { name: 'page', type: 'number', required: false, description: 'Page number for pagination (default: 1)' },
          { name: 'limit', type: 'number', required: false, description: 'Number of items per page (default: 20)' },
          { name: 'category', type: 'string', required: false, description: 'Filter by product category' }
        ],
        response: {
          products: [
            {
              id: 'prod_123',
              name: 'Sample Product',
              description: 'Product description',
              price: 29.99,
              inventory_quantity: 100,
              is_active: true,
              created_at: '2024-01-15T10:30:00Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 150,
            pages: 8
          }
        },
        example: 'curl -X GET "https://api.streamsell.com/api/stores/store_123/products" \\\n  -H "Authorization: Bearer YOUR_API_KEY"'
      },
      {
        method: 'POST',
        path: '/api/stores/{store_id}/products',
        description: 'Create a new product',
        parameters: [
          { name: 'store_id', type: 'string', required: true, description: 'The unique identifier for the store' }
        ],
        requestBody: {
          name: 'New Product',
          description: 'Product description',
          price: 39.99,
          inventory_quantity: 50,
          category: 'electronics',
          is_active: true
        },
        response: {
          id: 'prod_456',
          name: 'New Product',
          description: 'Product description',
          price: 39.99,
          inventory_quantity: 50,
          category: 'electronics',
          is_active: true,
          created_at: '2024-01-15T11:00:00Z'
        },
        example: 'curl -X POST "https://api.streamsell.com/api/stores/store_123/products" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name":"New Product","price":39.99}\''
      }
    ],
    orders: [
      {
        method: 'GET',
        path: '/api/stores/{store_id}/orders',
        description: 'Retrieve all orders for a store',
        parameters: [
          { name: 'store_id', type: 'string', required: true, description: 'The unique identifier for the store' },
          { name: 'status', type: 'string', required: false, description: 'Filter by order status (pending, processing, completed, cancelled)' },
          { name: 'date_from', type: 'string', required: false, description: 'Filter orders from this date (ISO 8601)' },
          { name: 'date_to', type: 'string', required: false, description: 'Filter orders up to this date (ISO 8601)' }
        ],
        response: {
          orders: [
            {
              id: 'order_789',
              customer_email: 'customer@example.com',
              status: 'completed',
              total: 89.97,
              items: [
                {
                  product_id: 'prod_123',
                  quantity: 2,
                  price: 29.99
                }
              ],
              created_at: '2024-01-15T12:00:00Z'
            }
          ]
        },
        example: 'curl -X GET "https://api.streamsell.com/api/stores/store_123/orders?status=completed" \\\n  -H "Authorization: Bearer YOUR_API_KEY"'
      },
      {
        method: 'PUT',
        path: '/api/stores/{store_id}/orders/{order_id}/status',
        description: 'Update order status',
        parameters: [
          { name: 'store_id', type: 'string', required: true, description: 'The unique identifier for the store' },
          { name: 'order_id', type: 'string', required: true, description: 'The unique identifier for the order' }
        ],
        requestBody: {
          status: 'processing',
          tracking_number: 'TRK123456789'
        },
        response: {
          id: 'order_789',
          status: 'processing',
          tracking_number: 'TRK123456789',
          updated_at: '2024-01-15T13:00:00Z'
        },
        example: 'curl -X PUT "https://api.streamsell.com/api/stores/store_123/orders/order_789/status" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"status":"processing"}\''
      }
    ],
    analytics: [
      {
        method: 'GET',
        path: '/api/stores/{store_id}/analytics/overview',
        description: 'Get store analytics overview',
        parameters: [
          { name: 'store_id', type: 'string', required: true, description: 'The unique identifier for the store' },
          { name: 'period', type: 'string', required: false, description: 'Time period (7d, 30d, 90d, 1y)' }
        ],
        response: {
          period: '30d',
          total_revenue: 12459.87,
          total_orders: 156,
          unique_customers: 89,
          average_order_value: 79.87,
          conversion_rate: 2.34,
          top_products: [
            {
              product_id: 'prod_123',
              name: 'Best Seller',
              sales: 45,
              revenue: 1349.55
            }
          ]
        },
        example: 'curl -X GET "https://api.streamsell.com/api/stores/store_123/analytics/overview?period=30d" \\\n  -H "Authorization: Bearer YOUR_API_KEY"'
      }
    ]
  }

  const sections = [
    { id: 'overview', title: 'Overview', icon: '📘' },
    { id: 'authentication', title: 'Authentication', icon: '🔐' },
    { id: 'products', title: 'Products', icon: '📦' },
    { id: 'orders', title: 'Orders', icon: '🛒' },
    { id: 'analytics', title: 'Analytics', icon: '📊' },
    { id: 'webhooks', title: 'Webhooks', icon: '🔗' },
    { id: 'errors', title: 'Errors', icon: '⚠️' }
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/20 text-green-400'
      case 'POST': return 'bg-blue-500/20 text-blue-400'
      case 'PUT': return 'bg-yellow-500/20 text-yellow-400'
      case 'DELETE': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#1E1E1E] text-white">
      <div className="mb-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-[#9B51E0] hover:text-[#A051E0] transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Help
        </button>
        
        <div className="flex items-center mb-4">
          <GenieMascot mood="happy" size="lg" className="mr-4" />
          <h1 className="text-3xl font-bold">API Documentation</h1>
        </div>
        <p className="text-[#A0A0A0] text-lg">
          Complete reference for integrating with the StreamSell API. Build custom applications and automate your store operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 sticky top-4">
            <h3 className="font-semibold mb-4">Documentation</h3>
            <nav className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                    selectedSection === section.id
                      ? 'bg-[#9B51E0] text-white'
                      : 'text-[#A0A0A0] hover:bg-[#3A3A3A] hover:text-white'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedSection === 'overview' && (
            <div className="space-y-6">
              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <h2 className="text-2xl font-bold mb-4">StreamSell API Overview</h2>
                <p className="text-[#A0A0A0] mb-4">
                  The StreamSell API is a RESTful API that allows you to programmatically interact with your store data. 
                  You can manage products, orders, customers, and access analytics data.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1E1E1E] rounded-lg p-4">
                    <h3 className="font-semibold text-[#9B51E0] mb-2">Base URL</h3>
                    <code className="text-sm text-[#A0A0A0] bg-[#0D1117] px-2 py-1 rounded">
                      https://api.streamsell.com
                    </code>
                  </div>
                  
                  <div className="bg-[#1E1E1E] rounded-lg p-4">
                    <h3 className="font-semibold text-[#9B51E0] mb-2">API Version</h3>
                    <code className="text-sm text-[#A0A0A0] bg-[#0D1117] px-2 py-1 rounded">
                      v1
                    </code>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Features</h3>
                  <ul className="text-[#A0A0A0] space-y-2">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      RESTful architecture with predictable URLs
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      JSON request and response bodies
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      OAuth 2.0 and API key authentication
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Rate limiting and error handling
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Webhook notifications for real-time updates
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Start</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[#A0A0A0] mb-2">1. Get your API key from the Settings page</p>
                    <p className="text-[#A0A0A0] mb-2">2. Make your first request:</p>
                    <pre className="bg-[#0D1117] text-[#A0A0A0] p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET "https://api.streamsell.com/api/stores/your_store_id/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'authentication' && (
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h2 className="text-2xl font-bold mb-4">Authentication</h2>
              <p className="text-[#A0A0A0] mb-6">
                The StreamSell API uses API keys for authentication. Include your API key in the Authorization header of each request.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Getting Your API Key</h3>
                  <ol className="text-[#A0A0A0] space-y-2 list-decimal list-inside">
                    <li>Navigate to Settings → API Keys in your dashboard</li>
                    <li>Click "Generate New API Key"</li>
                    <li>Copy and securely store your key</li>
                    <li>Use the key in the Authorization header</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Authorization Header</h3>
                  <pre className="bg-[#0D1117] text-[#A0A0A0] p-4 rounded-lg text-sm">
Authorization: Bearer YOUR_API_KEY
                  </pre>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="font-medium text-yellow-400 mb-1">Security Note</p>
                      <p className="text-sm text-[#A0A0A0]">
                        Never expose your API keys in client-side code or public repositories. Store them securely and rotate them regularly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(selectedSection === 'products' || selectedSection === 'orders' || selectedSection === 'analytics') && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold capitalize">{selectedSection} API</h2>
              
              {endpoints[selectedSection]?.map((endpoint, index) => (
                <div key={index} className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center mb-4">
                    <span className={`px-3 py-1 rounded text-sm font-medium mr-3 ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-[#9B51E0] text-sm">{endpoint.path}</code>
                  </div>
                  
                  <p className="text-[#A0A0A0] mb-4">{endpoint.description}</p>
                  
                  {endpoint.parameters && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#3A3A3A]">
                              <th className="text-left py-2 text-[#A0A0A0]">Name</th>
                              <th className="text-left py-2 text-[#A0A0A0]">Type</th>
                              <th className="text-left py-2 text-[#A0A0A0]">Required</th>
                              <th className="text-left py-2 text-[#A0A0A0]">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.parameters.map((param, i) => (
                              <tr key={i} className="border-b border-[#3A3A3A]/50">
                                <td className="py-2 text-[#9B51E0]">{param.name}</td>
                                <td className="py-2 text-[#A0A0A0]">{param.type}</td>
                                <td className="py-2">
                                  <span className={`px-2 py-1 rounded text-xs ${param.required ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {param.required ? 'Required' : 'Optional'}
                                  </span>
                                </td>
                                <td className="py-2 text-[#A0A0A0]">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Example Request</h4>
                      <pre className="bg-[#0D1117] text-[#A0A0A0] p-4 rounded-lg text-xs overflow-x-auto">
{endpoint.example}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <pre className="bg-[#0D1117] text-[#A0A0A0] p-4 rounded-lg text-xs overflow-x-auto">
{JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSection === 'errors' && (
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
              <p className="text-[#A0A0A0] mb-6">
                The StreamSell API uses conventional HTTP response codes to indicate the success or failure of an API request.
              </p>
              
              <div className="space-y-4">
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-green-400">2xx Success</h3>
                  <ul className="text-sm text-[#A0A0A0] space-y-1">
                    <li><code>200</code> - OK: Request successful</li>
                    <li><code>201</code> - Created: Resource created successfully</li>
                    <li><code>204</code> - No Content: Request successful, no content returned</li>
                  </ul>
                </div>
                
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-red-400">4xx Client Errors</h3>
                  <ul className="text-sm text-[#A0A0A0] space-y-1">
                    <li><code>400</code> - Bad Request: Invalid request syntax</li>
                    <li><code>401</code> - Unauthorized: Invalid or missing API key</li>
                    <li><code>403</code> - Forbidden: Access denied</li>
                    <li><code>404</code> - Not Found: Resource not found</li>
                    <li><code>429</code> - Too Many Requests: Rate limit exceeded</li>
                  </ul>
                </div>
                
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <h3 className="font-semibant mb-2 text-yellow-400">5xx Server Errors</h3>
                  <ul className="text-sm text-[#A0A0A0] space-y-1">
                    <li><code>500</code> - Internal Server Error: Something went wrong on our end</li>
                    <li><code>503</code> - Service Unavailable: Temporary server overload</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApiDocumentation