/**
 * Subscribe Widget View
 * Renders the subscription form and handles lead capture
 */
import React, { useState } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { WidgetViewProps } from '../../types';
import { SubscribeProps } from './index';
import { supabase } from '../../../lib/supabase';
import { useStore } from '../../../contexts/StoreContext';
export const SubscribeView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  const { currentStore } = useStore();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // Provide default values for all props to prevent crashes
  const props: SubscribeProps = {
    title: 'Stay Updated',
    subtitle: 'Subscribe to our newsletter for the latest updates and exclusive offers',
    placeholder: 'Enter your email address',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing! We\'ll keep you updated.',
    errorMessage: 'Something went wrong. Please try again.',
    showPrivacyText: true,
    privacyText: 'We respect your privacy and will never share your email address.',
    backgroundColor: 'bg-gray-50',
    textColor: 'text-gray-900',
    buttonColor: 'bg-primary-600 hover:bg-primary-700',
    buttonTextColor: 'text-white',
    borderRadius: 'md',
    layout: 'horizontal',
    alignment: 'center',
    padding: 'p-6',
    ...(widget.props as SubscribeProps)
  };
  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  // Get store ID from current context
  const getStoreId = (): string | null => {
    // 1. First try to get from React context (most reliable)
    if (currentStore?.id) {
      return currentStore.id;
    }
    // 2. Fallback to other methods for storefront/public pages
    if (typeof window !== 'undefined') {
      // Check for global store context
      const storeContext = (window as any).__STORE_CONTEXT__;
      if (storeContext?.id) {
        return storeContext.id;
      }
      // Check URL patterns for store ID
      const urlPath = window.location.pathname;
      // Pattern: /stores/[storeId]/...
      const storeMatch = urlPath.match(/\/stores\/([^\/]+)/);
      if (storeMatch?.[1]) {
        return storeMatch[1];
      }
      // Pattern: admin panel with store parameter
      const adminMatch = urlPath.match(/\/admin/) && new URLSearchParams(window.location.search).get('storeId');
      if (adminMatch) {
        return adminMatch;
      }
      // Check for subdomain pattern if using custom domains
      const hostname = window.location.hostname;
      const subdomainMatch = hostname.match(/^([^.]+)\./);
      if (subdomainMatch?.[1] && subdomainMatch[1] !== 'www') {
        // This would need validation against store custom domains
        return subdomainMatch[1];
      }
    }
    return null;
  };
  // Handle subscription submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    setStatus('idle');
    try {
      const storeId = getStoreId();
      if (!storeId) {
        throw new Error('Store context not found. Please ensure this widget is used within a store context.');
      }
      // Check if lead already exists
      const { data: existingLead, error: checkError } = await supabase
        .from('leads')
        .select('id, email')
        .eq('store_id', storeId)
        .eq('email', email.toLowerCase().trim())
        .single();
      if (checkError && checkError.code !== 'PGRST116') {
        // Error other than "not found"
        throw checkError;
      }
      if (existingLead) {
        // Lead already exists, update the subscription status
        const { error: updateError } = await supabase
          .from('leads')
          .update({ 
            subscribed_to_newsletter: true,
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
          })
          .eq('id', existingLead.id);
        if (updateError) throw updateError;
      } else {
        // Create new lead
        const { error: insertError } = await supabase
          .from('leads')
          .insert([{
            store_id: storeId,
            email: email.toLowerCase().trim(),
            source: 'newsletter_widget',
            status: 'subscribed',
            subscribed_to_newsletter: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
          }]);
        if (insertError) throw insertError;
      }
      // Success
      setStatus('success');
      setEmail(''); // Clear the form
      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(props.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Build CSS classes
  const containerClasses = [
    props.backgroundColor,
    props.textColor,
    props.padding,
    `rounded-${props.borderRadius}`,
    props.alignment === 'center' ? 'text-center' : props.alignment === 'right' ? 'text-right' : 'text-left'
  ].filter(Boolean).join(' ');
  const formClasses = [
    'max-w-md mx-auto',
    props.layout === 'vertical' ? 'space-y-4' : 'flex gap-2'
  ].filter(Boolean).join(' ');
  const inputClasses = [
    'flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
    props.layout === 'vertical' ? 'w-full' : 'min-w-0'
  ].filter(Boolean).join(' ');
  const buttonClasses = [
    'px-6 py-2 rounded-md font-medium transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none',
    props.buttonColor,
    props.buttonTextColor,
    props.layout === 'vertical' ? 'w-full' : 'whitespace-nowrap',
    isSubmitting ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
  ].filter(Boolean).join(' ');
  return (
    <div className={containerClasses}>
      {/* Title and Subtitle */}
      <div className="mb-6">
        {props.title && (
          <h3 className="text-2xl font-bold mb-2">{props.title}</h3>
        )}
        {props.subtitle && (
          <p className="text-gray-600 mb-4">{props.subtitle}</p>
        )}
      </div>
      {/* Status Messages */}
      {status === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-800">
          <Check className="w-5 h-5" />
          <span>{props.successMessage}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}
      {/* Subscription Form */}
      {status !== 'success' && (
        <form onSubmit={handleSubmit} className={formClasses}>
          <div className={props.layout === 'vertical' ? '' : 'flex-1'}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={props.placeholder}
              className={inputClasses}
              disabled={isSubmitting}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={buttonClasses}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Subscribing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{props.buttonText}</span>
              </div>
            )}
          </button>
        </form>
      )}
      {/* Privacy Text */}
      {props.showPrivacyText && props.privacyText && status !== 'success' && (
        <p className="mt-4 text-xs text-gray-500">{props.privacyText}</p>
      )}
    </div>
  );
};