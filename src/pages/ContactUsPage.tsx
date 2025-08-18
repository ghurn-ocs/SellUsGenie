import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Shield, Scale } from 'lucide-react'
import { GenieMascot } from '../components/ui/GenieMascot'

interface ContactUsPageProps {}

const ContactUsPage: React.FC<ContactUsPageProps> = () => {
  const [, navigate] = useLocation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      })
    }, 3000)
  }

  const contactOptions = [
    {
      title: 'General Support',
      email: 'Support@SellUsGenie.com',
      icon: <MessageCircle className="w-6 h-6" />,
      description: 'Get help with your account, billing, or technical issues.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Legal Inquiries',
      email: 'Legal@SellUsGenie.com', 
      icon: <Scale className="w-6 h-6" />,
      description: 'Legal questions, compliance, and business partnerships.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Privacy Concerns',
      email: 'Privacy@SellUsGenie.com',
      icon: <Shield className="w-6 h-6" />,
      description: 'Data protection, privacy rights, and GDPR requests.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#3A3A3A] bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <GenieMascot mood="happy" className="w-8 h-8" />
                <span className="text-xl font-bold text-[#9B51E0]">Sell Us Genie™</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/features')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors">Features</button>
              <button onClick={() => navigate('/why-not')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors">Why Not Others?</button>
              <button onClick={() => navigate('/')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors">Back to Home</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <GenieMascot mood="standing" className="w-24 h-24" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Get in </span>
            <span className="text-[#9B51E0]">Touch</span>
          </h1>
          <p className="text-xl text-[#A0A0A0] max-w-3xl mx-auto mb-8">
            We're here to help! Whether you need support, have legal questions, or privacy concerns, 
            our team is ready to assist you.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Contact Information</h2>
            <p className="text-[#A0A0A0]">Choose the best way to reach us based on your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contactOptions.map((option, index) => (
              <div key={index} className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 hover:border-[#9B51E0] transition-colors">
                <div className={`w-12 h-12 ${option.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <div className={option.color}>{option.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                <p className="text-[#A0A0A0] text-sm mb-4">{option.description}</p>
                <a 
                  href={`mailto:${option.email}`}
                  className="flex items-center space-x-2 text-[#9B51E0] hover:text-[#8A47D0] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">{option.email}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Send us a Message</h2>
            <p className="text-[#A0A0A0]">Fill out the form below and we'll get back to you as soon as possible</p>
          </div>

          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-[#A0A0A0]">Thank you for contacting us. We'll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                    >
                      <option value="general">General Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="legal">Legal Inquiry</option>
                      <option value="privacy">Privacy Concern</option>
                      <option value="partnership">Business Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent resize-vertical"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Additional Contact Info */}
      <section className="py-16 bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Quick Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#9B51E0]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-3 h-3 text-[#9B51E0]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">General Inquiries</p>
                    <a href="mailto:Support@SellUsGenie.com" className="text-[#9B51E0] hover:text-[#8A47D0] transition-colors">
                      Support@SellUsGenie.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#9B51E0]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-3 h-3 text-[#9B51E0]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Response Time</p>
                    <p className="text-[#A0A0A0]">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#9B51E0]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-3 h-3 text-[#9B51E0]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Company</p>
                    <p className="text-[#A0A0A0]">Omni Cyber Solutions LLC</p>
                    <p className="text-[#A0A0A0]">United States of America</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">How quickly do you respond to inquiries?</h4>
                  <p className="text-[#A0A0A0] text-sm">We aim to respond to all inquiries within 24 hours during business days. Urgent technical issues are prioritized.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">What information should I include in my message?</h4>
                  <p className="text-[#A0A0A0] text-sm">Please include your account email, a clear description of your issue or question, and any relevant screenshots or error messages.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Do you offer phone support?</h4>
                  <p className="text-[#A0A0A0] text-sm">Currently, we provide support primarily through email to ensure accurate and detailed responses. Phone support is available for enterprise customers.</p>
                </div>
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
              <span className="text-[#9B51E0] font-bold">Sell Us Genie™</span>
              <span className="text-[#A0A0A0]">© 2024 Omni Cyber Solutions LLC</span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => navigate('/')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">
                Home
              </button>
              <button onClick={() => navigate('/features')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">
                Features
              </button>
              <button onClick={() => navigate('/why-not')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">
                Why Not Others?
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ContactUsPage