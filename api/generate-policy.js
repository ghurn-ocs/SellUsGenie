// Google Cloud AI Policy Generation API Endpoint
// Production-ready endpoint using Google's Generative AI API
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, storeInfo, policyType, authToken } = req.body

    if (!prompt || !storeInfo || !policyType || !authToken) {
      return res.status(400).json({ 
        error: 'Missing required fields: prompt, storeInfo, policyType, authToken' 
      })
    }

    // Initialize Supabase client with environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Supabase credentials' 
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the auth token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)
    
    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized: Invalid auth token' 
      })
    }

    // Get store details including address information for legal compliance
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id, name, business_type, description, currency, store_country, store_city, store_state')
      .eq('id', storeInfo.id)
      .eq('owner_id', user.id)
      .single()

    if (storeError || !storeData) {
      return res.status(403).json({ 
        error: 'Store not found or access denied' 
      })
    }

    // Use actual store data with address-based country for legal compliance
    const enhancedStoreInfo = {
      ...storeInfo,
      name: storeData.name,
      business_type: storeData.business_type,
      description: storeData.description,
      currency: storeData.currency,
      // Use store address country for legal compliance (fallback to store info if not set)
      country: storeData.store_country || storeInfo.country || 'United States',
      state: storeData.store_state,
      city: storeData.store_city
    }

    // Get Google Cloud API key from secure storage (system settings)
    const { data: apiKeyData, error: keyError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'google_cloud_api_key')
      .single()

    if (keyError || !apiKeyData?.value) {
      return res.status(500).json({ 
        error: 'Google Cloud AI API key not configured. Please contact support.' 
      })
    }

    const GOOGLE_API_KEY = apiKeyData.value

    // Call Google's Generative AI API (Gemini)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`,
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
                  text: `${prompt}

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

Please generate a comprehensive, professional, and legally compliant ${policyType.replace('_', ' ')} that is specifically tailored to this business operating in ${enhancedStoreInfo.country}. The policy must meet all legal requirements for e-commerce businesses in ${enhancedStoreInfo.country}. Use clear language that customers can understand while maintaining legal precision and compliance.`
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
      return res.status(500).json({ 
        error: 'Failed to generate policy with AI',
        details: errorData.error?.message || 'Unknown error'
      })
    }

    const data = await response.json()

    // Extract generated text from Google AI response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      return res.status(500).json({ 
        error: 'No content generated by AI',
        details: 'AI response was empty or malformed'
      })
    }

    // Calculate approximate token usage (rough estimate)
    const inputTokens = Math.floor(prompt.length / 4)
    const outputTokens = Math.floor(generatedText.length / 4)
    const totalTokens = inputTokens + outputTokens

    // Estimated cost based on Google AI pricing
    const costPer1kTokens = 0.00015 // Gemini 1.5 Flash pricing
    const estimatedCost = (totalTokens / 1000) * costPer1kTokens

    return res.status(200).json({
      success: true,
      generatedContent: generatedText,
      tokensUsed: totalTokens,
      costUsd: estimatedCost,
      model: 'gemini-1.5-flash-latest'
    })

  } catch (error) {
    console.error('Policy generation error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}