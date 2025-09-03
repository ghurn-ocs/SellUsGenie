/**
 * Store Provisioning Service
 * Automatically provisions default pages and content when a store is created
 */

import { SupabasePageRepository } from '../pageBuilder/data/SupabasePageRepository';
import { supabase } from '../lib/supabase';
import type { PageDocument } from '../pageBuilder/types';

interface StoreProvisioningData {
  storeId: string;
  storeName: string;
  storeSlug: string;
}

/**
 * Creates default pages that every store should have
 */
export async function provisionDefaultPages(data: StoreProvisioningData): Promise<void> {
  const { storeId, storeName } = data;
  const repository = new SupabasePageRepository(storeId);

  try {
    // Create default pages in parallel
    const pageCreationPromises = [
      createHomePage(repository, storeName),
      createAboutUsPage(repository, storeName),
      createPrivacyPolicyPage(repository, storeName),
      createTermsOfServicePage(repository, storeName),
      createContactUsPage(repository, storeName),
      createReturnsPage(repository, storeName),
    ];

    await Promise.all(pageCreationPromises);
    
    console.log(`✅ Default pages provisioned for store: ${storeName}`);
  } catch (error) {
    console.error('❌ Failed to provision default pages:', error);
    // Don't throw - store creation should succeed even if page creation fails
  }
}

/**
 * Creates and publishes a home page
 */
async function createHomePage(repository: SupabasePageRepository, storeName: string): Promise<void> {
  const homePageContent: PageDocument = {
    id: crypto.randomUUID(),
    name: 'Home Page',
    slug: '/',
    version: 1,
    sections: [{
      id: crypto.randomUUID(),
      title: 'Hero Section',
      background: {
        colorToken: 'bg-gradient-to-r from-purple-600 to-blue-600'
      },
      padding: 'py-16 px-4',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 12, lg: 12 },
          props: {
            content: `<div class="text-center text-white">
              <h1 class="text-4xl md:text-6xl font-bold mb-4">Welcome to ${storeName}</h1>
              <p class="text-xl md:text-2xl mb-8 opacity-90">Your trusted online destination</p>
              <div class="space-x-4">
                <a href="#products" class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Shop Now</a>
                <a href="#about" class="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">Learn More</a>
              </div>
            </div>`,
            textAlign: 'center',
            fontSize: 'base',
            fontWeight: 'normal',
            color: 'text-white',
            lineHeight: 'normal',
            allowHtml: true
          },
          visibility: { sm: true, md: true, lg: true }
        }]
      }]
    }],
    status: 'published',
    seo: {
      metaTitle: `${storeName} - Welcome to Our Store`,
      metaDescription: `Discover amazing products at ${storeName}. Shop with confidence and enjoy our excellent customer service.`,
      ogTitle: `Welcome to ${storeName}`,
      ogDescription: `Your trusted online destination for quality products and exceptional service.`
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await repository.saveDraft(homePageContent);
  await repository.publish(homePageContent.id);
}

/**
 * Creates and publishes an About Us page
 */
async function createAboutUsPage(repository: SupabasePageRepository, storeName: string): Promise<void> {
  const aboutPageContent: PageDocument = {
    id: crypto.randomUUID(),
    name: 'About Us',
    slug: '/about',
    version: 1,
    sections: [{
      id: crypto.randomUUID(),
      title: 'About Section',
      padding: 'py-16 px-4',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 10, lg: 8 },
          props: {
            content: `<div class="max-w-4xl mx-auto">
              <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">About ${storeName}</h1>
              <div class="prose prose-lg text-gray-700 space-y-6">
                <p>Welcome to ${storeName}, where quality meets exceptional service. We are committed to providing our customers with the finest products and an outstanding shopping experience.</p>
                
                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
                <p>To deliver exceptional products and services that exceed our customers' expectations while building lasting relationships based on trust and reliability.</p>
                
                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
                <ul class="list-disc pl-6 space-y-2">
                  <li>High-quality products carefully selected for you</li>
                  <li>Exceptional customer service and support</li>
                  <li>Fast and reliable shipping</li>
                  <li>Secure and easy shopping experience</li>
                  <li>100% satisfaction guarantee</li>
                </ul>
                
                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
                <p>Have questions or need assistance? We're here to help! Contact our friendly customer service team and we'll be happy to assist you.</p>
              </div>
            </div>`,
            textAlign: 'left',
            fontSize: 'base',
            fontWeight: 'normal',
            color: 'text-gray-900',
            lineHeight: 'normal',
            allowHtml: true
          },
          visibility: { sm: true, md: true, lg: true }
        }]
      }]
    }],
    status: 'published',
    seo: {
      metaTitle: `About Us - ${storeName}`,
      metaDescription: `Learn more about ${storeName}, our mission, values, and commitment to providing exceptional products and customer service.`,
      ogTitle: `About ${storeName}`,
      ogDescription: `Discover our story, mission, and what makes us your trusted choice for quality products.`
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await repository.saveDraft(aboutPageContent);
  await repository.publish(aboutPageContent.id);
}

/**
 * Creates basic policy pages (these will be overridden by Settings->Policies content)
 */
async function createPrivacyPolicyPage(repository: SupabasePageRepository, storeName: string): Promise<void> {
  const privacyPageContent: PageDocument = {
    id: crypto.randomUUID(),
    name: 'Privacy Policy',
    slug: '/privacy',
    version: 1,
    sections: [{
      id: crypto.randomUUID(),
      title: 'Privacy Policy',
      padding: 'py-16 px-4',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 10, lg: 8 },
          props: {
            content: `<div class="max-w-4xl mx-auto prose prose-lg">
              <h1 class="text-4xl font-bold mb-8">Privacy Policy</h1>
              <p class="text-sm text-gray-600 mb-8">Last updated: ${new Date().toLocaleDateString()}</p>
              
              <p>At ${storeName}, we are committed to protecting your privacy and ensuring the security of your personal information.</p>
              
              <h2>Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.</p>
              
              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
              
              <h2>Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
              
              <h2>Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us.</p>
            </div>`,
            textAlign: 'left',
            fontSize: 'base',
            fontWeight: 'normal',
            color: 'text-gray-900',
            lineHeight: 'normal',
            allowHtml: true
          },
          visibility: { sm: true, md: true, lg: true }
        }]
      }]
    }],
    status: 'published',
    seo: {
      metaTitle: `Privacy Policy - ${storeName}`,
      metaDescription: `Read our privacy policy to understand how ${storeName} collects, uses, and protects your personal information.`,
      ogTitle: `Privacy Policy - ${storeName}`,
      ogDescription: 'Learn about our commitment to protecting your privacy and personal information.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await repository.saveDraft(privacyPageContent);
  await repository.publish(privacyPageContent.id);
}

/**
 * Creates Terms of Service page
 */
async function createTermsOfServicePage(repository: SupabasePageRepository, storeName: string): Promise<void> {
  const termsPageContent: PageDocument = {
    id: crypto.randomUUID(),
    name: 'Terms & Conditions',
    slug: '/terms',
    version: 1,
    sections: [{
      id: crypto.randomUUID(),
      title: 'Terms of Service',
      padding: 'py-16 px-4',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 10, lg: 8 },
          props: {
            content: `<div class="max-w-4xl mx-auto prose prose-lg">
              <h1 class="text-4xl font-bold mb-8">Terms & Conditions</h1>
              <p class="text-sm text-gray-600 mb-8">Last updated: ${new Date().toLocaleDateString()}</p>
              
              <h2>Acceptance of Terms</h2>
              <p>By accessing and using ${storeName}, you accept and agree to be bound by the terms and provision of this agreement.</p>
              
              <h2>Products and Services</h2>
              <p>All products and services are subject to availability. We reserve the right to discontinue any product at any time.</p>
              
              <h2>Payment Terms</h2>
              <p>Payment is required at the time of purchase. We accept various payment methods as displayed during checkout.</p>
              
              <h2>Shipping and Delivery</h2>
              <p>We will make every effort to deliver products within the estimated timeframes, though delivery times are not guaranteed.</p>
              
              <h2>Contact Information</h2>
              <p>For questions about these Terms & Conditions, please contact us.</p>
            </div>`,
            textAlign: 'left',
            fontSize: 'base',
            fontWeight: 'normal',
            color: 'text-gray-900',
            lineHeight: 'normal',
            allowHtml: true
          },
          visibility: { sm: true, md: true, lg: true }
        }]
      }]
    }],
    status: 'published',
    seo: {
      metaTitle: `Terms & Conditions - ${storeName}`,
      metaDescription: `Read the terms and conditions for using ${storeName} and purchasing our products.`,
      ogTitle: `Terms & Conditions - ${storeName}`,
      ogDescription: 'Review our terms of service and conditions for using our platform.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await repository.saveDraft(termsPageContent);
  await repository.publish(termsPageContent.id);
}

/**
 * Creates Contact Us page
 */
async function createContactUsPage(repository: SupabasePageRepository, storeName: string): Promise<void> {
  const contactPageContent: PageDocument = {
    id: crypto.randomUUID(),
    name: 'Contact Us',
    slug: '/contact',
    version: 1,
    sections: [{
      id: crypto.randomUUID(),
      title: 'Contact Section',
      padding: 'py-16 px-4',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 10, lg: 8 },
          props: {
            content: `<div class="max-w-4xl mx-auto">
              <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Contact ${storeName}</h1>
              <div class="prose prose-lg text-gray-700 space-y-6">
                <p class="text-center mb-8">We'd love to hear from you! Get in touch with our team using the information below or send us a message.</p>
                
                <div class="grid md:grid-cols-2 gap-8 mb-8">
                  <div class="text-center">
                    <h2 class="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
                    <p>Email: contact@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</p>
                    <p>Phone: (555) 123-4567</p>
                    <p>Hours: Mon-Fri 9AM-6PM</p>
                  </div>
                  
                  <div class="text-center">
                    <h2 class="text-2xl font-semibold text-gray-900 mb-4">Visit Us</h2>
                    <p>123 Business Street<br>
                    City, State 12345<br>
                    United States</p>
                  </div>
                </div>
                
                <div class="text-center">
                  <h2 class="text-2xl font-semibold text-gray-900 mb-4">Send Us a Message</h2>
                  <p>Use the contact form below or email us directly. We typically respond within 24 hours.</p>
                </div>
              </div>
            </div>`,
            textAlign: 'left',
            fontSize: 'base',
            fontWeight: 'normal',
            color: 'text-gray-900',
            lineHeight: 'normal',
            allowHtml: true
          },
          visibility: { sm: true, md: true, lg: true }
        }]
      }]
    }],
    status: 'published',
    seo: {
      metaTitle: `Contact Us - ${storeName}`,
      metaDescription: `Get in touch with ${storeName}. Find our contact information, location, and send us a message.`,
      ogTitle: `Contact ${storeName}`,
      ogDescription: 'Contact our team with questions, feedback, or support needs. We\'re here to help!'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await repository.saveDraft(contactPageContent);
  await repository.publish(contactPageContent.id);
}

/**
 * Creates and publishes a Returns page
 */
async function createReturnsPage(repository: SupabasePageRepository, storeName: string): Promise<void> {
  const returnsPageContent: PageDocument = {
    id: crypto.randomUUID(),
    name: 'Returns',
    slug: '/returns',
    version: 1,
    sections: [{
      id: crypto.randomUUID(),
      title: 'Returns Section',
      padding: 'py-16 px-4',
      rows: [{
        id: crypto.randomUUID(),
        widgets: [{
          id: crypto.randomUUID(),
          type: 'text',
          version: 1,
          colSpan: { sm: 12, md: 10, lg: 8 },
          props: {
            content: `<div class="max-w-4xl mx-auto">
              <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Returns Policy</h1>
              <div class="prose prose-lg text-gray-700 space-y-6">
                <p class="text-center mb-8">We want you to be completely satisfied with your purchase from ${storeName}. Please review our return policy below.</p>
                
                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Return Window</h2>
                <p>You may return items within <strong>30 days of delivery</strong> for a full refund, provided they are in original, unused condition with original packaging.</p>
                
                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Return Process</h2>
                <p>To initiate a return:</p>
                <ol class="list-decimal ml-6 space-y-2">
                  <li>Contact our customer service team with your order number</li>
                  <li>Provide the reason for return</li>
                  <li>We'll provide you with return shipping instructions</li>
                  <li>Package the item securely and ship it back to us</li>
                </ol>
                
                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Refund Processing</h2>
                <p>Refunds will be processed to the original payment method within <strong>5-7 business days</strong> after we receive and inspect the returned item.</p>
                
                <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Return Shipping</h2>
                <p>Return shipping costs are the responsibility of the customer. Exception: If the item is defective or we sent the wrong item, we'll cover return shipping costs.</p>
                
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                  <p class="text-blue-800"><strong>Need Help?</strong> Contact our customer service team for assistance with returns or any questions about our policy.</p>
                </div>
              </div>
            </div>`,
            textAlign: 'left',
            fontSize: 'base',
            fontWeight: 'normal',
            color: 'text-gray-900',
            lineHeight: 'normal',
            allowHtml: true
          },
          visibility: { sm: true, md: true, lg: true }
        }]
      }]
    }],
    status: 'published',
    seo: {
      metaTitle: `Returns Policy - ${storeName}`,
      metaDescription: `Learn about ${storeName}'s return policy. Easy returns within 30 days with full refund guarantee.`,
      ogTitle: `Returns Policy - ${storeName}`,
      ogDescription: 'Simple and fair return policy. 30-day return window with full refund guarantee for your peace of mind.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await repository.saveDraft(returnsPageContent);
  await repository.publish(returnsPageContent.id);
}

/**
 * Creates default store policies in the store_policies table
 */
export async function provisionDefaultPolicies(storeId: string, storeName: string): Promise<void> {
  try {
    const defaultPolicies = {
      store_id: storeId,
      privacy_policy: `Privacy Policy for ${storeName}

Last updated: ${new Date().toLocaleDateString()}

At ${storeName}, we are committed to protecting your privacy and ensuring the security of your personal information.

INFORMATION WE COLLECT
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Process your orders and payments
- Provide customer support
- Improve our products and services
- Send you important updates about your orders

INFORMATION SHARING
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

CONTACT US
If you have any questions about this Privacy Policy, please contact us.`,

      terms_of_service: `Terms & Conditions for ${storeName}

Last updated: ${new Date().toLocaleDateString()}

ACCEPTANCE OF TERMS
By accessing and using ${storeName}, you accept and agree to be bound by the terms and provisions of this agreement.

PRODUCTS AND SERVICES
All products and services are subject to availability. We reserve the right to discontinue any product at any time for any reason.

PAYMENT TERMS
- Payment is required at the time of purchase
- We accept various payment methods as displayed during checkout
- All prices are subject to change without notice

SHIPPING AND DELIVERY
We will make every effort to deliver products within the estimated timeframes, though delivery times are not guaranteed and may vary based on location and product availability.

LIMITATION OF LIABILITY
${storeName} shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of our products or services.

CONTACT INFORMATION
For questions about these Terms & Conditions, please contact us.`,

      returns_policy: `Returns Policy for ${storeName}

Last updated: ${new Date().toLocaleDateString()}

RETURN WINDOW
You may return items within 30 days of delivery for a full refund, provided they are in original, unused condition with original packaging.

RETURN PROCESS
To initiate a return:
1. Contact our customer service team with your order number
2. Provide the reason for return
3. We'll provide you with return shipping instructions
4. Package the item securely and ship it back to us

REFUND PROCESSING
Refunds will be processed to the original payment method within 5-7 business days after we receive and inspect the returned item.

RETURN SHIPPING COSTS
- Return shipping costs are the responsibility of the customer
- Exception: If the item is defective or we sent the wrong item, we'll cover return shipping

NON-RETURNABLE ITEMS
Certain items may not be eligible for return due to hygiene or safety reasons. These restrictions will be clearly noted on the product page.

CONTACT US
For questions about returns or to initiate a return, please contact our customer service team.`,

      about_us: `About ${storeName}

Welcome to ${storeName}, where quality meets exceptional service. We are committed to providing our customers with the finest products and an outstanding shopping experience.

OUR MISSION
To deliver exceptional products and services that exceed our customers' expectations while building lasting relationships based on trust and reliability.

OUR STORY
${storeName} was founded with a simple belief: that everyone deserves access to high-quality products at fair prices, backed by exceptional customer service.

WHY CHOOSE US?
✓ High-quality products carefully selected for you
✓ Exceptional customer service and support
✓ Fast and reliable shipping
✓ Secure and easy shopping experience
✓ 100% satisfaction guarantee

OUR VALUES
- Customer satisfaction is our top priority
- Quality and authenticity in everything we do
- Transparency and honesty in all our dealings
- Continuous improvement and innovation

CUSTOMER SERVICE
Our friendly and knowledgeable customer service team is here to help you with any questions or concerns. We strive to provide prompt, helpful responses to ensure your complete satisfaction.

CONTACT US
Have questions or need assistance? We're here to help! Contact our customer service team and we'll be happy to assist you with any inquiries about our products or services.`
    };

    const { error } = await supabase
      .from('store_policies')
      .upsert(defaultPolicies, {
        onConflict: 'store_id'
      });

    if (error) throw error;

    console.log(`✅ Default policies provisioned for store: ${storeName}`);
  } catch (error) {
    console.error('❌ Failed to provision default policies:', error);
    // Don't throw - store creation should succeed even if policy creation fails
  }
}

/**
 * Complete store provisioning - creates pages and policies
 */
export async function provisionNewStore(data: StoreProvisioningData): Promise<void> {
  console.log(`🚀 Provisioning new store: ${data.storeName}`);
  
  // Run both provisioning tasks in parallel
  await Promise.all([
    provisionDefaultPages(data),
    provisionDefaultPolicies(data.storeId, data.storeName)
  ]);
  
  console.log(`✅ Store provisioning complete for: ${data.storeName}`);
}