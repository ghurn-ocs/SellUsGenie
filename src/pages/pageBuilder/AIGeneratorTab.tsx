/**
 * AI Generator Tab Component
 * Contains AI-powered content generation for policies, about us, and other pages
 * Moved from Settings → Policies to consolidate content generation tools
 */

import React, { useState } from 'react';
import { Wand2, FileText, Shield, AlertCircle, CheckCircle, Loader2, Copy, Check } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { aiPolicyGenerator } from '../../services/aiPolicyGenerator';

type ContentType = 'privacy_policy' | 'returns_policy' | 'terms_policy' | 'about_us' | 'product_descriptions' | 'marketing_copy' | 'faq' | 'email_templates' | 'social_media' | 'blog_posts' | 'landing_pages' | 'meta_descriptions' | 'shipping_policy';

interface ContentTypeConfig {
  id: ContentType;
  title: string;
  description: string;
  prompt: string;
}

const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    id: 'privacy_policy',
    title: 'Privacy Policy',
    description: 'GDPR, CCPA compliant privacy policy',
    prompt: 'Generate a comprehensive privacy policy for an e-commerce store that complies with GDPR, CCPA, and other applicable privacy laws. Include sections on data collection, cookies, user rights, contact information, and data processing. Make it legally compliant yet readable for customers.'
  },
  {
    id: 'returns_policy',
    title: 'Returns Policy',
    description: 'Consumer protection compliant returns policy',
    prompt: 'Generate a clear and fair returns/refund policy for an e-commerce store that complies with consumer protection laws. Include return timeframes, condition requirements, refund processes, shipping responsibilities, and exceptions. Make it customer-friendly while protecting business interests.'
  },
  {
    id: 'terms_policy',
    title: 'Terms & Conditions',
    description: 'E-commerce specific terms and conditions',
    prompt: 'Generate comprehensive terms and conditions for an e-commerce store covering user agreements, payment terms, liability limitations, intellectual property, dispute resolution, and account responsibilities. Ensure legal compliance while being clear and enforceable.'
  },
  {
    id: 'about_us',
    title: 'About Us',
    description: 'Brand story & mission page content',
    prompt: 'Generate engaging About Us page content that tells the company story, mission, and values in a professional yet personable way. Include the founding story, team passion, customer commitment, and what makes this business unique. Write in a warm, authentic tone that builds trust.'
  },
  {
    id: 'product_descriptions',
    title: 'Product Descriptions',
    description: 'SEO-optimized product content',
    prompt: 'Generate compelling product descriptions for e-commerce products. Create descriptions that are SEO-optimized with relevant keywords, highlight key features and benefits, address customer pain points, include technical specifications when relevant, and use persuasive copywriting techniques to drive conversions. Write in an engaging tone that helps customers visualize owning and using the product.'
  },
  {
    id: 'marketing_copy',
    title: 'Marketing Copy',
    description: 'Conversion-focused headlines and content',
    prompt: 'Generate high-converting marketing copy for e-commerce campaigns. Create attention-grabbing headlines, compelling calls-to-action, benefit-driven bullet points, social proof elements, and urgency-building language. Focus on customer benefits rather than just features, address objections, and use proven copywriting formulas like AIDA, PAS, or Before/After/Bridge. Write copy that motivates immediate action.'
  },
  {
    id: 'faq',
    title: 'FAQ Content',
    description: 'Frequently asked questions and answers',
    prompt: 'Generate comprehensive FAQ content for an e-commerce store. Include common questions about products, shipping, returns, payments, account management, and customer service. Provide clear, helpful answers that reduce customer friction and support burden. Organize questions logically by category and write answers that are friendly, informative, and build confidence in the buying decision.'
  },
  {
    id: 'email_templates',
    title: 'Email Templates',
    description: 'Customer communication templates',
    prompt: 'Generate professional email templates for e-commerce customer communications. Include order confirmations, shipping notifications, welcome emails, abandoned cart recovery, customer service responses, and promotional announcements. Write templates that are personalized, branded, and maintain consistent tone while being informative and actionable.'
  },
  {
    id: 'social_media',
    title: 'Social Media Content',
    description: 'Posts and captions for social platforms',
    prompt: 'Generate engaging social media content for e-commerce marketing. Create posts for Instagram, Facebook, Twitter, and LinkedIn that showcase products, share behind-the-scenes content, highlight customer testimonials, announce promotions, and build brand personality. Include relevant hashtags, calls-to-action, and platform-specific optimization.'
  },
  {
    id: 'blog_posts',
    title: 'Blog Posts',
    description: 'SEO-optimized blog content',
    prompt: 'Generate engaging blog posts for e-commerce content marketing. Create articles that provide value to customers through how-to guides, product spotlights, industry trends, buying guides, and lifestyle content. Optimize for SEO with natural keyword integration, compelling headlines, and content that drives traffic and builds authority.'
  },
  {
    id: 'landing_pages',
    title: 'Landing Page Copy',
    description: 'High-converting page content',
    prompt: 'Generate high-converting landing page copy for e-commerce campaigns. Create compelling headlines, persuasive subheadings, benefit-focused sections, customer testimonials, feature highlights, and strong calls-to-action. Structure content to guide visitors through the customer journey and address objections while building urgency and trust.'
  },
  {
    id: 'meta_descriptions',
    title: 'Meta Descriptions',
    description: 'SEO meta tags and descriptions',
    prompt: 'Generate compelling meta descriptions and SEO tags for e-commerce pages. Create descriptions under 160 characters that accurately summarize page content, include target keywords naturally, entice clicks from search results, and improve search engine visibility. Write unique descriptions for product pages, category pages, and content pages.'
  },
  {
    id: 'shipping_policy',
    title: 'Shipping Policy',
    description: 'Clear shipping terms and information',
    prompt: 'Generate a comprehensive shipping policy for an e-commerce store. Include shipping methods, delivery timeframes, costs, geographic coverage, processing times, tracking information, international shipping details, and special handling procedures. Write clear, customer-friendly terms that set proper expectations and reduce shipping-related inquiries.'
  }
];

export const AIGeneratorTab: React.FC = () => {
  const { currentStore } = useStore();
  const [generatingType, setGeneratingType] = useState<ContentType | null>(null);
  const [generationResult, setGenerationResult] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyContent = async () => {
    if (!generationResult) return;
    
    try {
      await navigator.clipboard.writeText(generationResult);
      setIsCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleGenerateContent = async (contentType: ContentTypeConfig) => {
    if (!currentStore) {
      setGenerationError('No store selected');
      return;
    }

    setGeneratingType(contentType.id);
    setGenerationError(null);
    setGenerationResult(null);

    try {
      const response = await aiPolicyGenerator.generatePolicy({
        prompt: contentType.prompt,
        storeInfo: {
          id: currentStore.id,
          name: currentStore.store_name,
          business_type: 'E-commerce',
          description: 'Online retail store',
          country: currentStore.store_country || 'United States',
          currency: 'USD'
        },
        policyType: contentType.id
      });

      if (response.success) {
        setGenerationResult(response.generatedContent);
      } else {
        setGenerationError(response.error || 'Failed to generate content');
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setGeneratingType(null);
    }
  };

  if (!currentStore) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-[#A0A0A0] mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Store Selected</h3>
          <p className="text-[#A0A0A0]">Please select a store to generate AI content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Wand2 className="h-6 w-6 text-[#9B51E0] mr-3" />
          <h2 className="text-xl font-bold text-white">AI Content Generator</h2>
        </div>

        {/* AI Content Generator Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg p-6">
            <p className="text-indigo-300 text-sm mb-6">
              Generate high-quality content for your e-commerce store using AI. From legal policies to marketing copy,
              create professional content tailored to your business needs. Powered by Google's Gemini AI.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTENT_TYPES.map((contentType) => (
                <div key={contentType.id} className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white mb-1">{contentType.title}</h4>
                      <p className="text-sm text-[#A0A0A0]">{contentType.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateContent(contentType)}
                    disabled={generatingType === contentType.id}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {generatingType === contentType.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generation Results */}
        {generationResult && (
          <div className="mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <h3 className="text-lg font-medium text-green-400">Generated Content</h3>
                </div>
                <button
                  onClick={handleCopyContent}
                  className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  title={isCopied ? 'Copied!' : 'Copy to clipboard'}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A] max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-white">{generationResult}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Generation Error */}
        {generationError && (
          <div className="mb-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-400">Generation Failed</h3>
                  <p className="text-sm text-red-300 mt-1">{generationError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};