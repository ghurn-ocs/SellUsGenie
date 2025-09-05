/**
 * Footer Layout Widget
 * Comprehensive footer editing for Visual Page Builder
 */

import React from 'react';
import { z } from 'zod';
import { FooterLayoutView, FooterLayoutProps } from './FooterLayoutView';
import { FooterLayoutEditor } from './FooterLayoutEditor';
import type { WidgetConfig, WidgetType, WidgetBase } from '../../types';

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
    useColumnSystem: z.boolean().default(false),
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
      name: null, // Will use current store name dynamically
      description: null, // Will be empty by default
      logo: {
        showText: true,
      },
    },
    
    contact: {
      enabled: false, // Disabled by default - no hardcoded contact info
      email: null,
      phone: null,
      address: null,
      showIcons: true,
    },
    
    navigation: {
      enabled: true,
      useColumnSystem: false,
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
      enabled: false, // Disabled by default - no hardcoded social links
      platforms: [],
      showLabels: false,
      position: 'bottom',
    },
    
    newsletter: {
      enabled: false, // Disabled by default
      title: null,
      description: null,
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