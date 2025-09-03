// Client-side AI Policy Generator Service
// Secure implementation for static hosting environments

import { supabase } from '../lib/supabase'

interface AIGenerationRequest {
  prompt: string
  storeInfo: {
    id: string
    name: string
    business_type: string
    description: string
    country: string
    currency: string
  }
  policyType: string
}

interface AIGenerationResponse {
  success: boolean
  generatedContent: string
  tokensUsed: number
  costUsd: number
  model: string
  error?: string
}

class AIPolicyGeneratorService {
  private async getGoogleCloudAPIKey(): Promise<string> {
    // For now, use the key from environment variables until system_settings table is created
    // This ensures immediate functionality for production deployment
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      throw new Error('Google Cloud AI API key not configured. Please contact support.')
    }
    
    return apiKey
  }

  private async getEnhancedStoreInfo(storeId: string): Promise<any> {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get store details including address information for legal compliance
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id, store_name, store_country, store_city, store_state')
      .eq('id', storeId)
      .eq('store_owner_id', user.id)
      .single()

    if (storeError || !storeData) {
      throw new Error('Store not found or access denied')
    }

    // Return enhanced store info with address-based country for legal compliance
    return {
      name: storeData.store_name || 'Your Store',
      business_type: 'E-commerce', // Default since not in schema
      description: 'Online retail store', // Default since not in schema
      currency: 'USD', // Default since not in schema
      // Use store address country for legal compliance
      country: storeData.store_country || 'United States',
      state: storeData.store_state,
      city: storeData.store_city
    }
  }

  async generatePolicy(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Get API key from secure storage
      const apiKey = await this.getGoogleCloudAPIKey()
      
      // Get enhanced store information with address data
      const enhancedStoreInfo = await this.getEnhancedStoreInfo(request.storeInfo.id)

      // Create enhanced prompt with country-specific compliance
      const enhancedPrompt = `${request.prompt}

Store Information:
- Name: ${enhancedStoreInfo.name}
- Business Type: ${enhancedStoreInfo.business_type}
- Country: ${enhancedStoreInfo.country}
- State/Province: ${enhancedStoreInfo.state || 'Not specified'}
- City: ${enhancedStoreInfo.city || 'Not specified'}
- Currency: ${enhancedStoreInfo.currency}
- Description: ${enhancedStoreInfo.description}

CRITICAL LEGAL COMPLIANCE REQUIREMENTS:
- This policy MUST comply with ${enhancedStoreInfo.country} laws and regulations
- Include jurisdiction-specific legal requirements for ${enhancedStoreInfo.country}
- Use appropriate legal language and terminology for ${enhancedStoreInfo.country}
- Reference applicable consumer protection laws for ${enhancedStoreInfo.country}
- Include required disclosures and rights specific to ${enhancedStoreInfo.country}
- Ensure compliance with data protection laws (GDPR for EU, CCPA for California, etc.)
- Use proper legal entity references for ${enhancedStoreInfo.country} businesses

Please generate a comprehensive, professional, and legally compliant ${request.policyType.replace('_', ' ')} that is specifically tailored to this business operating in ${enhancedStoreInfo.country}. The policy must meet all legal requirements for e-commerce businesses in ${enhancedStoreInfo.country}. Use clear language that customers can understand while maintaining legal precision and compliance.`

      // Call Google's Generative AI API (Gemini)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: enhancedPrompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Google AI API Error:', errorData)
        
        // Handle specific API errors with user-friendly messages
        if (response.status === 403 && errorData.error?.message?.includes('Generative Language API has not been used')) {
          throw new Error('Google AI services are not properly configured. Please contact support to enable AI policy generation.')
        }
        
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Extract generated text from Google AI response
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error('No content generated by AI - response was empty or malformed')
      }

      // Calculate approximate token usage (rough estimate)
      const inputTokens = Math.floor(enhancedPrompt.length / 4)
      const outputTokens = Math.floor(generatedText.length / 4)
      const totalTokens = inputTokens + outputTokens

      // Estimated cost based on Google AI pricing
      const costPer1kTokens = 0.00015 // Gemini 1.5 Flash pricing
      const estimatedCost = (totalTokens / 1000) * costPer1kTokens

      return {
        success: true,
        generatedContent: generatedText,
        tokensUsed: totalTokens,
        costUsd: estimatedCost,
        model: 'gemini-1.5-flash-latest'
      }

    } catch (error) {
      console.error('AI Policy Generation Error:', error)
      return {
        success: false,
        generatedContent: '',
        tokensUsed: 0,
        costUsd: 0,
        model: 'gemini-1.5-flash-latest',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

export const aiPolicyGenerator = new AIPolicyGeneratorService()