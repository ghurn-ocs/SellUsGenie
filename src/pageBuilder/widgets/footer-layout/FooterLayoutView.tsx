/**
 * Footer Layout Widget View
 * Provides comprehensive footer layout editing within Visual Page Builder
 */

import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import type { Widget } from '../../types';

export interface FooterLayoutProps {
  // Layout Configuration
  layout: 'single-column' | 'two-column' | 'three-column' | 'four-column' | 'custom';
  
  // Company Information
  company: {
    name?: string;
    description?: string;
    logo?: {
      imageUrl?: string;
      showText?: boolean;
    };
  };
  
  // Contact Information
  contact: {
    enabled: boolean;
    email?: string;
    phone?: string;
    address?: string;
    showIcons: boolean;
  };
  
  // Navigation Links
  navigation: {
    enabled: boolean;
    columns: Array<{
      id: string;
      title: string;
      links: Array<{
        id: string;
        label: string;
        href: string;
        type: 'internal' | 'external';
      }>;
    }>;
    autoDetectPages: boolean;
  };
  
  // Social Media
  social: {
    enabled: boolean;
    platforms: Array<{
      id: string;
      platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
      url: string;
      label?: string;
    }>;
    showLabels: boolean;
    position: 'top' | 'bottom' | 'center';
  };
  
  // Newsletter Signup
  newsletter: {
    enabled: boolean;
    title?: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
  };
  
  // Legal Links
  legal: {
    enabled: boolean;
    links: Array<{
      id: string;
      label: string;
      href: string;
    }>;
    copyright?: string;
    showYear: boolean;
  };
  
  // Styling
  styling: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
    linkHoverColor: string;
    borderTop: boolean;
    padding: 'compact' | 'standard' | 'spacious';
  };
  
  // Responsive Configuration
  responsive: {
    mobile: {
      layout: 'stacked' | 'collapsed';
      showAllSections: boolean;
    };
  };
}

const SocialIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'facebook': return <Facebook className="h-5 w-5" />;
    case 'twitter': return <Twitter className="h-5 w-5" />;
    case 'instagram': return <Instagram className="h-5 w-5" />;
    case 'linkedin': return <Linkedin className="h-5 w-5" />;
    default: return <Mail className="h-5 w-5" />;
  }
};

export const FooterLayoutView: React.FC<{ widget: Widget<FooterLayoutProps> }> = ({ widget }) => {
  const { props } = widget;
  
  const getLayoutClasses = () => {
    const baseClasses = "w-full px-4 md:px-6 lg:px-8";
    const paddingClasses = {
      compact: "py-8",
      standard: "py-12",
      spacious: "py-16"
    };
    
    const gridClasses = {
      'single-column': "text-center",
      'two-column': "grid md:grid-cols-2 gap-8",
      'three-column': "grid md:grid-cols-3 gap-8",
      'four-column': "grid md:grid-cols-2 lg:grid-cols-4 gap-8"
    };
    
    return `${baseClasses} ${paddingClasses[props.styling?.padding || 'standard']} ${gridClasses[props.layout || 'three-column']}`;
  };
  
  const renderCompanySection = () => {
    if (!props.company?.name && !props.company?.description && !props.company?.logo?.imageUrl) {
      return null;
    }
    
    return (
      <div className="space-y-4">
        {/* Company Logo/Name */}
        <div className="flex items-center space-x-3">
          {props.company.logo?.imageUrl && (
            <img 
              src={props.company.logo.imageUrl} 
              alt={`${props.company.name} logo`}
              className="h-10 w-auto object-contain"
            />
          )}
          {props.company.logo?.showText && props.company.name && (
            <h3 className="text-lg font-bold">{props.company.name}</h3>
          )}
        </div>
        
        {/* Company Description */}
        {props.company.description && (
          <p className="text-sm opacity-80 max-w-sm">
            {props.company.description}
          </p>
        )}
      </div>
    );
  };
  
  const renderContactSection = () => {
    if (!props.contact?.enabled) return null;
    
    return (
      <div className="space-y-4">
        <h4 className="font-semibold">Contact Us</h4>
        <div className="space-y-2 text-sm">
          {props.contact.email && (
            <div className="flex items-center space-x-2">
              {props.contact.showIcons && <Mail className="h-4 w-4 opacity-70" />}
              <a 
                href={`mailto:${props.contact.email}`}
                className="hover:opacity-80"
                style={{ color: props.styling?.linkColor }}
              >
                {props.contact.email}
              </a>
            </div>
          )}
          
          {props.contact.phone && (
            <div className="flex items-center space-x-2">
              {props.contact.showIcons && <Phone className="h-4 w-4 opacity-70" />}
              <a 
                href={`tel:${props.contact.phone}`}
                className="hover:opacity-80"
                style={{ color: props.styling?.linkColor }}
              >
                {props.contact.phone}
              </a>
            </div>
          )}
          
          {props.contact.address && (
            <div className="flex items-start space-x-2">
              {props.contact.showIcons && <MapPin className="h-4 w-4 opacity-70 mt-0.5 flex-shrink-0" />}
              <address className="not-italic opacity-80 text-xs leading-relaxed">
                {props.contact.address}
              </address>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderNavigationColumns = () => {
    if (!props.navigation?.enabled || !props.navigation.columns?.length) return null;
    
    return (
      <>
        {props.navigation.columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <h4 className="font-semibold">{column.title}</h4>
            <ul className="space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: props.styling?.linkColor }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </>
    );
  };
  
  const renderNewsletterSection = () => {
    if (!props.newsletter?.enabled) return null;
    
    return (
      <div className="space-y-4">
        <div>
          {props.newsletter.title && (
            <h4 className="font-semibold mb-2">{props.newsletter.title}</h4>
          )}
          {props.newsletter.description && (
            <p className="text-sm opacity-80 mb-4">{props.newsletter.description}</p>
          )}
        </div>
        
        <form className="flex space-x-2">
          <input
            type="email"
            placeholder={props.newsletter.placeholder || "Enter your email"}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {props.newsletter.buttonText || "Subscribe"}
          </button>
        </form>
      </div>
    );
  };
  
  const renderSocialLinks = () => {
    if (!props.social?.enabled || !props.social.platforms?.length) return null;
    
    return (
      <div className="space-y-4">
        {props.social.position === 'top' && (
          <h4 className="font-semibold">Follow Us</h4>
        )}
        
        <div className="flex space-x-3">
          {props.social.platforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={platform.label || `Visit our ${platform.platform}`}
            >
              <SocialIcon platform={platform.platform} />
            </a>
          ))}
        </div>
        
        {props.social.showLabels && (
          <div className="flex flex-wrap gap-2">
            {props.social.platforms.map((platform) => (
              <a
                key={`${platform.id}-label`}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:opacity-80"
                style={{ color: props.styling?.linkColor }}
              >
                {platform.label || platform.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const renderLegalSection = () => {
    if (!props.legal?.enabled) return null;
    
    const currentYear = new Date().getFullYear();
    const copyrightText = props.legal.copyright || `© ${currentYear} ${props.company?.name || 'Your Company'}`;
    
    return (
      <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-xs opacity-70">
            {props.legal.showYear ? copyrightText : (props.legal.copyright || `${props.company?.name || 'Your Company'}`)}
          </div>
          
          {/* Legal Links */}
          {props.legal.links?.length > 0 && (
            <div className="flex space-x-4">
              {props.legal.links.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="text-xs hover:opacity-80"
                  style={{ color: props.styling?.linkColor }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const footerStyle = {
    backgroundColor: props.styling?.backgroundColor || '#f8f9fa',
    color: props.styling?.textColor || '#000000',
    ...(props.styling?.borderTop && { borderTop: '1px solid rgba(0,0,0,0.1)' })
  };
  
  return (
    <footer className="footer-layout-widget w-full" style={footerStyle}>
      <div className="max-w-7xl mx-auto">
        <div className={getLayoutClasses()}>
          {/* Main Footer Content */}
          <div className={`${
            props.layout === 'single-column' ? 'space-y-8' : 'contents'
          }`}>
            {renderCompanySection()}
            {renderContactSection()}
            {renderNavigationColumns()}
            {renderNewsletterSection()}
            {props.social?.position !== 'bottom' && renderSocialLinks()}
          </div>
          
          {/* Bottom Social Links */}
          {props.social?.position === 'bottom' && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              {renderSocialLinks()}
            </div>
          )}
        </div>
        
        {/* Legal Section */}
        {renderLegalSection()}
      </div>
      
      {/* Preview Indicators for Editor */}
      <div className="footer-preview-overlay absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded-md"></div>
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Footer Layout
        </div>
      </div>
    </footer>
  );
};

export default FooterLayoutView;