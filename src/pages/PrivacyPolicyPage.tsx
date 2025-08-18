import React from 'react'
import { useLocation } from 'wouter'
import { Shield, Eye, Lock, Globe, Mail, Scale } from 'lucide-react'
import { GenieMascot } from '../components/ui/GenieMascot'

interface PrivacyPolicyPageProps {}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = () => {
  const [, navigate] = useLocation()

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#3A3A3A] bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="flex items-center space-x-2">
                <GenieMascot mood="happy" className="w-8 h-8" />
                <span className="text-xl font-bold text-[#9B51E0]">Sell Us Genie</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/contact')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors">Contact</button>
              <button onClick={() => navigate('/')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors">Back to Home</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#9B51E0]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-[#A0A0A0] text-lg">Last updated: August 18, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-[#1E1E1E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
              <p className="text-[#A0A0A0] leading-relaxed">
                At Sell Us Genie (operated by Omni Cyber Solutions LLC), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our e-commerce platform services.
              </p>
              <p className="text-[#A0A0A0] leading-relaxed mt-4">
                <strong className="text-white">We DO NOT sell or use your information for any purposes other than to support your use of our service.</strong> Your data belongs to you, and we respect that fundamental principle.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Information You Provide</h3>
              <ul className="text-[#A0A0A0] space-y-2 mb-6">
                <li>• Account information (name, email address, password)</li>
                <li>• Store information (business details, contact information)</li>
                <li>• Payment and billing information (processed securely by Stripe)</li>
                <li>• Product and customer data you upload to your stores</li>
                <li>• Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Automatically Collected Information</h3>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Technical information (IP address, browser type, device information)</li>
                <li>• Usage analytics (pages visited, features used, time spent)</li>
                <li>• Performance data (load times, errors, system metrics)</li>
                <li>• Cookies and similar tracking technologies</li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-[#9B51E0]" />
                How We Use Your Information
              </h2>
              <p className="text-[#A0A0A0] mb-4">We use your information solely to:</p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Provide and maintain our e-commerce platform services</li>
                <li>• Process payments and manage subscriptions</li>
                <li>• Provide customer support and respond to inquiries</li>
                <li>• Improve our platform performance and features</li>
                <li>• Send important service updates and security notifications</li>
                <li>• Comply with legal obligations and prevent fraud</li>
                <li>• Analyze usage patterns to enhance user experience</li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Data Sharing and Disclosure
              </h2>
              <p className="text-[#A0A0A0] mb-4">We may share your information only in these limited circumstances:</p>
              
              <h3 className="text-xl font-semibold text-white mb-3">Service Providers</h3>
              <p className="text-[#A0A0A0] mb-4">We work with trusted third-party service providers:</p>
              <ul className="text-[#A0A0A0] space-y-2 mb-6">
                <li>• Supabase (database and authentication services)</li>
                <li>• Stripe (payment processing)</li>
                <li>• Cloud hosting providers (infrastructure)</li>
                <li>• Email service providers (transactional emails)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Legal Requirements</h3>
              <p className="text-[#A0A0A0] mb-4">We may disclose information when required by law or to:</p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Comply with legal processes or government requests</li>
                <li>• Protect our rights, property, or safety</li>
                <li>• Prevent fraud or illegal activities</li>
                <li>• Enforce our Terms of Service</li>
              </ul>
            </div>

            {/* GDPR Rights */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Your Rights (GDPR Compliance)
              </h2>
              <p className="text-[#A0A0A0] mb-4">If you are in the European Union, you have the following rights:</p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• <strong className="text-white">Right to Access:</strong> Request copies of your personal data</li>
                <li>• <strong className="text-white">Right to Rectification:</strong> Correct inaccurate personal data</li>
                <li>• <strong className="text-white">Right to Erasure:</strong> Request deletion of your personal data</li>
                <li>• <strong className="text-white">Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li>• <strong className="text-white">Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li>• <strong className="text-white">Right to Object:</strong> Object to processing of your personal data</li>
                <li>• <strong className="text-white">Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="text-[#A0A0A0] mt-4">
                To exercise these rights, contact us at <a href="mailto:Privacy@SellUsGenie.com" className="text-[#9B51E0] hover:text-[#8A47D0]">Privacy@SellUsGenie.com</a>
              </p>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
              <p className="text-[#A0A0A0] mb-4">We implement industry-standard security measures:</p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Encryption in transit and at rest</li>
                <li>• Regular security audits and updates</li>
                <li>• Access controls and authentication</li>
                <li>• Secure payment processing via Stripe</li>
                <li>• Regular data backups and recovery procedures</li>
              </ul>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
              <p className="text-[#A0A0A0] mb-4">We retain your information for as long as:</p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Your account is active</li>
                <li>• Required to provide our services</li>
                <li>• Necessary to comply with legal obligations</li>
                <li>• Needed to resolve disputes and enforce agreements</li>
              </ul>
              <p className="text-[#A0A0A0] mt-4">
                When you delete your account, we will permanently delete your data within 30 days, except where retention is required by law.
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
              <p className="text-[#A0A0A0] mb-4">We use cookies and similar technologies for:</p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Essential site functionality</li>
                <li>• User authentication and security</li>
                <li>• Analytics and performance monitoring</li>
                <li>• User preferences and settings</li>
              </ul>
              <p className="text-[#A0A0A0] mt-4">
                You can control cookies through your browser settings. However, disabling certain cookies may affect site functionality.
              </p>
            </div>

            {/* International Transfers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">International Data Transfers</h2>
              <p className="text-[#A0A0A0]">
                Our services are hosted in the United States. If you are accessing our services from outside the US, your information may be transferred to, stored, and processed in the US. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
              <p className="text-[#A0A0A0]">
                Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
              <p className="text-[#A0A0A0]">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Contact Us
              </h2>
              <p className="text-[#A0A0A0] mb-4">If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <h3 className="text-white font-semibold mb-4">Privacy Officer</h3>
                <p className="text-[#A0A0A0]">Email: <a href="mailto:Privacy@SellUsGenie.com" className="text-[#9B51E0] hover:text-[#8A47D0]">Privacy@SellUsGenie.com</a></p>
                <p className="text-[#A0A0A0]">Company: Omni Cyber Solutions LLC</p>
                <p className="text-[#A0A0A0]">Location: United States of America</p>
              </div>
              
              <div className="mt-6 p-4 bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg">
                <p className="text-[#E0E0E0] text-sm">
                  <strong>Data Protection Commitment:</strong> We are committed to protecting your privacy and will respond to all privacy inquiries within 72 hours in compliance with GDPR requirements.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#3A3A3A] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GenieMascot mood="happy" className="w-6 h-6" />
              <span className="text-[#9B51E0] font-bold">Sell Us Genie</span>
              <span className="text-[#A0A0A0]">© 2024 Omni Cyber Solutions LLC</span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => navigate('/')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Home</button>
              <button onClick={() => navigate('/terms')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Terms</button>
              <button onClick={() => navigate('/contact')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PrivacyPolicyPage