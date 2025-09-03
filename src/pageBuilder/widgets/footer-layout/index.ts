/**
 * Footer Layout Widget
 * Comprehensive footer editing for Visual Page Builder
 */

import React from 'react';
import { z } from 'zod';
import { FooterLayoutView, FooterLayoutProps } from './FooterLayoutView';
import type { WidgetConfig, WidgetType, WidgetBase } from '../../types';

// Note: FooterLayoutEditor would be implemented similar to HeaderLayoutEditor
// For now, we'll use a simple placeholder
const FooterLayoutEditor = ({ widget, updateWidget }: any) => {
  return null; // Placeholder - will be implemented later
};

// Zod schema for props validation
const FooterLayoutPropsSchema = z.object({
  layout: z.enum(['single-column', 'two-column', 'three-column', 'four-column', 'custom']).default('three-column'),
  
  company: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    logo: z.object({
      imageUrl: z.string().optional(),
      showText: z.boolean().default(true),
    }).optional(),
  }).default({}),
  
  contact: z.object({
    enabled: z.boolean().default(true),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    showIcons: z.boolean().default(true),
  }).default({}),
  
  navigation: z.object({
    enabled: z.boolean().default(true),
    columns: z.array(z.object({
      id: z.string(),
      title: z.string(),
      links: z.array(z.object({
        id: z.string(),
        label: z.string(),
        href: z.string(),
        type: z.enum(['internal', 'external']).default('internal'),
      })),
    })).default([]),
    autoDetectPages: z.boolean().default(false),
  }).default({}),
  
  social: z.object({
    enabled: z.boolean().default(true),
    platforms: z.array(z.object({
      id: z.string(),
      platform: z.enum(['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok']),
      url: z.string(),
      label: z.string().optional(),
    })).default([]),
    showLabels: z.boolean().default(false),
    position: z.enum(['top', 'bottom', 'center']).default('bottom'),
  }).default({}),
  
  newsletter: z.object({
    enabled: z.boolean().default(false),
    title: z.string().optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    buttonText: z.string().optional(),
  }).default({}),
  
  legal: z.object({
    enabled: z.boolean().default(true),
    links: z.array(z.object({
      id: z.string(),
      label: z.string(),
      href: z.string(),
    })).default([]),
    copyright: z.string().optional(),
    showYear: z.boolean().default(true),
  }).default({}),
  
  styling: z.object({
    backgroundColor: z.string().default('#f8f9fa'),
    textColor: z.string().default('#000000'),
    linkColor: z.string().default('#0066cc'),
    linkHoverColor: z.string().default('#004499'),
    borderTop: z.boolean().default(true),
    padding: z.enum(['compact', 'standard', 'spacious']).default('standard'),
  }).default({}),
  
  responsive: z.object({
    mobile: z.object({
      layout: z.enum(['stacked', 'collapsed']).default('stacked'),
      showAllSections: z.boolean().default(true),
    }).default({}),
  }).default({}),
});

export const defaultFooterLayoutProps: FooterLayoutProps = {
    layout: 'three-column',
    
    company: {
      name: 'Your Store',
      description: 'Quality products and exceptional service since 2024.',
      logo: {
        showText: true,
      },
    },
    
    contact: {
      enabled: true,
      email: 'hello@yourstore.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street\nYour City, State 12345',
      showIcons: true,
    },
    
    navigation: {
      enabled: true,
      columns: [
        {
          id: '1',
          title: 'Shop',
          links: [
            { id: '1', label: 'All Products', href: '/products', type: 'internal' },
            { id: '2', label: 'Featured', href: '/featured', type: 'internal' },
            { id: '3', label: 'Sale Items', href: '/sale', type: 'internal' },
          ],
        },
        {
          id: '2',
          title: 'Company',
          links: [
            { id: '1', label: 'About Us', href: '/about', type: 'internal' },
            { id: '2', label: 'Contact', href: '/contact', type: 'internal' },
            { id: '3', label: 'Careers', href: '/careers', type: 'internal' },
          ],
        },
      ],
      autoDetectPages: false,
    },
    
    social: {
      enabled: true,
      platforms: [
        { id: '1', platform: 'facebook', url: 'https://facebook.com/yourstore' },
        { id: '2', platform: 'twitter', url: 'https://twitter.com/yourstore' },
        { id: '3', platform: 'instagram', url: 'https://instagram.com/yourstore' },
      ],
      showLabels: false,
      position: 'bottom',
    },
    
    newsletter: {
      enabled: true,
      title: 'Stay Updated',
      description: 'Get the latest news and exclusive offers',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
    },
    
    legal: {
      enabled: true,
      links: [
        { id: '1', label: 'Privacy Policy', href: '/privacy' },
        { id: '2', label: 'Terms of Service', href: '/terms' },
        { id: '3', label: 'Cookie Policy', href: '/cookies' },
      ],
      showYear: true,
    },
    
    styling: {
      backgroundColor: '#f8f9fa',
      textColor: '#000000',
      linkColor: '#0066cc',
      linkHoverColor: '#004499',
      borderTop: true,
      padding: 'standard',
    },
    
    responsive: {
      mobile: {
        layout: 'stacked',
        showAllSections: true,
      },
    },
};

// Footer Layout widget configuration
export const footerLayoutWidgetConfig: WidgetConfig = {
  type: 'footer-layout' as WidgetType,
  name: 'Footer Layout',
  description: 'Comprehensive footer with company info, navigation, and social links',
  icon: 'Layout',
  category: 'layout',
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: FooterLayoutPropsSchema,
  defaultProps: defaultFooterLayoutProps,
  Editor: FooterLayoutEditor,
  View: FooterLayoutView,
  systemWidget: true,
  migrate: (widget: WidgetBase, targetVersion: number) => {
    // Migration logic for footer layout widget
    return widget;
  }
};

// Register the footer layout widget
import { widgetRegistry } from '../registry';
widgetRegistry.register(footerLayoutWidgetConfig);

export { FooterLayoutView };
export type { FooterLayoutProps };