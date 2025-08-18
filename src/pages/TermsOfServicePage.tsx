import React from 'react'
import { useLocation } from 'wouter'
import { Scale, FileText, Shield, AlertTriangle, Mail, Gavel } from 'lucide-react'
import { GenieMascot } from '../components/ui/GenieMascot'

interface TermsOfServicePageProps {}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = () => {
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
              <Scale className="w-8 h-8 text-[#9B51E0]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-[#A0A0A0] text-lg">Last updated: August 18, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-[#1E1E1E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
              <p className="text-[#A0A0A0] leading-relaxed">
                These Terms of Service ("Terms") govern your use of Sell Us Genie ("Service"), operated by Omni Cyber Solutions LLC ("Company," "we," "our," or "us"), a limited liability company organized under the laws of the United States of America.
              </p>
              <p className="text-[#A0A0A0] leading-relaxed mt-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </div>

            {/* Service Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Service Description
              </h2>
              <p className="text-[#A0A0A0] mb-4">Sell Us Genie is a multi-tenant e-commerce platform that enables users to:</p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Create and manage multiple online stores under a single account</li>
                <li>• Process payments and manage customer orders</li>
                <li>• Access analytics and reporting tools</li>
                <li>• Utilize integrated marketing and customer management features</li>
                <li>• Build custom storefronts using our visual page builder</li>
              </ul>
            </div>

            {/* Account Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Account Terms</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Account Creation</h3>
              <ul className="text-[#A0A0A0] space-y-2 mb-6">
                <li>• You must be at least 18 years old to use our Service</li>
                <li>• You must provide accurate and complete information when creating an account</li>
                <li>• You are responsible for maintaining the security of your account credentials</li>
                <li>• You must not create accounts through unauthorized means or impersonate others</li>
                <li>• One person or entity may not maintain multiple accounts for the same purpose</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Account Responsibility</h3>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• You are responsible for all activity that occurs under your account</li>
                <li>• You must immediately notify us of any unauthorized use of your account</li>
                <li>• You must comply with all applicable laws and regulations when using the Service</li>
                <li>• You are responsible for all content uploaded to your stores</li>
              </ul>
            </div>

            {/* Acceptable Use */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Acceptable Use Policy
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Permitted Use</h3>
              <p className="text-[#A0A0A0] mb-4">You may use our Service for lawful business purposes, including:</p>
              <ul className="text-[#A0A0A0] space-y-2 mb-6">
                <li>• Selling legal products and services</li>
                <li>• Processing legitimate customer transactions</li>
                <li>• Managing customer relationships and communications</li>
                <li>• Analyzing business performance and metrics</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Prohibited Use</h3>
              <p className="text-[#A0A0A0] mb-4">You may not use our Service to:</p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Sell illegal, counterfeit, or prohibited items</li>
                <li>• Engage in fraudulent or deceptive practices</li>
                <li>• Violate intellectual property rights</li>
                <li>• Transmit harmful code, viruses, or malware</li>
                <li>• Spam, harass, or abuse other users</li>
                <li>• Circumvent security measures or access restrictions</li>
                <li>• Use the Service for any unlawful purpose</li>
              </ul>
            </div>

            {/* Payment Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Payment and Subscription Terms</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Subscription Plans</h3>
              <ul className="text-[#A0A0A0] space-y-2 mb-6">
                <li>• All subscription fees are charged in advance on a monthly basis</li>
                <li>• Free trial periods are available for new accounts</li>
                <li>• Subscription fees are non-refundable except as required by law</li>
                <li>• We reserve the right to modify subscription pricing with 30 days notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Payment Processing</h3>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Payments are processed by Stripe, a third-party payment processor</li>
                <li>• You authorize us to charge your designated payment method</li>
                <li>• Failed payments may result in service suspension</li>
                <li>• You are responsible for any bank fees or currency conversion charges</li>
              </ul>
            </div>

            {/* Data and Content */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Content and Data Ownership</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Your Content</h3>
              <ul className="text-[#A0A0A0] space-y-2 mb-6">
                <li>• You retain ownership of all content you upload to the Service</li>
                <li>• You grant us a license to use your content solely to provide the Service</li>
                <li>• You are responsible for ensuring you have rights to all uploaded content</li>
                <li>• You must not upload content that infringes on others' rights</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Our Content</h3>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• The Service, including software and design, is our intellectual property</li>
                <li>• You may not copy, modify, or redistribute our proprietary content</li>
                <li>• Our trademarks and logos may not be used without permission</li>
                <li>• We reserve all rights not expressly granted to you</li>
              </ul>
            </div>

            {/* Service Availability */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Service Availability and Modifications
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Service Uptime</h3>
              <ul className="text-[#A0A0A0] space-y-2 mb-6">
                <li>• We strive to maintain high service availability but do not guarantee 100% uptime</li>
                <li>• Planned maintenance will be communicated in advance when possible</li>
                <li>• We are not liable for damages caused by service interruptions</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Service Modifications</h3>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• We may modify, update, or discontinue features at any time</li>
                <li>• Major changes will be communicated to users in advance</li>
                <li>• Continued use of the Service constitutes acceptance of modifications</li>
              </ul>
            </div>

            {/* Termination */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Account Termination</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Termination by You</h3>
              <ul className="text-[#A0A0A0] space-y-2 mb-6">
                <li>• You may cancel your account at any time through your account settings</li>
                <li>• Cancellation takes effect at the end of your current billing period</li>
                <li>• You remain responsible for charges incurred before cancellation</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Termination by Us</h3>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• We may suspend or terminate accounts for violations of these Terms</li>
                <li>• We may terminate accounts for non-payment after notice</li>
                <li>• Upon termination, your data may be permanently deleted after 30 days</li>
              </ul>
            </div>

            {/* Disclaimers and Limitations */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Disclaimers and Limitation of Liability</h2>
              
              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Service Disclaimer</h3>
                <p className="text-[#A0A0A0] text-sm">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </div>

              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h3>
                <p className="text-[#A0A0A0] text-sm">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, OMNI CYBER SOLUTIONS LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
                </p>
              </div>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Gavel className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Governing Law and Disputes
              </h2>
              <p className="text-[#A0A0A0] mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the United States of America, without regard to conflict of law principles.
              </p>
              <p className="text-[#A0A0A0] mb-4">
                Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the federal and state courts located within the United States.
              </p>
              <p className="text-[#A0A0A0]">
                You agree that any legal action or proceeding related to these Terms must be brought within one year of the cause of action arising.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
              <p className="text-[#A0A0A0] mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by:
              </p>
              <ul className="text-[#A0A0A0] space-y-2 mb-4">
                <li>• Posting the updated Terms on this page</li>
                <li>• Updating the "Last updated" date</li>
                <li>• Sending email notifications for significant changes</li>
              </ul>
              <p className="text-[#A0A0A0]">
                Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Contact Information
              </h2>
              <p className="text-[#A0A0A0] mb-4">If you have any questions about these Terms of Service, please contact us:</p>
              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <h3 className="text-white font-semibold mb-4">Legal Department</h3>
                <p className="text-[#A0A0A0]">Email: <a href="mailto:Legal@SellUsGenie.com" className="text-[#9B51E0] hover:text-[#8A47D0]">Legal@SellUsGenie.com</a></p>
                <p className="text-[#A0A0A0]">Company: Omni Cyber Solutions LLC</p>
                <p className="text-[#A0A0A0]">Location: United States of America</p>
              </div>
              
              <div className="mt-6 p-4 bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg">
                <p className="text-[#E0E0E0] text-sm">
                  <strong>Legal Response Time:</strong> We aim to respond to all legal inquiries within 5 business days.
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
              <button onClick={() => navigate('/privacy')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Privacy</button>
              <button onClick={() => navigate('/contact')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TermsOfServicePage