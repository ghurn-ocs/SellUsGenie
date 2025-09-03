/**
 * Header Layout Widget
 * Comprehensive header editing for Visual Page Builder
 */

import React from 'react';
import { z } from 'zod';
import { HeaderLayoutView, HeaderLayoutProps } from './HeaderLayoutView';
import { HeaderLayoutEditor } from './HeaderLayoutEditor';
import type { WidgetConfig, WidgetType, WidgetBase } from '../../types';

// Zod schema for props validation
const HeaderLayoutPropsSchema = z.object({
  layout: z.enum(['logo-left', 'logo-center', 'logo-right', 'custom']).default('logo-left'),
  height: z.enum(['compact', 'standard', 'tall']).default('standard'),
  
  logo: z.object({
    type: z.enum(['text', 'image', 'both']).default('text'),
    text: z.string().optional(),
    imageUrl: z.string().optional(),
    imageAlt: z.string().optional(),
    position: z.enum(['left', 'center', 'right']).default('left'),
    size: z.enum(['small', 'medium', 'large']).default('medium'),
    link: z.string().optional(),
  }).default({}),
  
  navigation: z.object({
    enabled: z.boolean().default(true),
    position: z.enum(['left', 'center', 'right']).default('center'),
    style: z.enum(['horizontal', 'hamburger', 'dropdown']).default('horizontal'),
    links: z.array(z.object({
      id: z.string(),
      label: z.string(),
      href: z.string(),
      type: z.enum(['internal', 'external', 'auto-detect']).default('internal'),
      isActive: z.boolean().optional(),
    })).default([]),
    autoDetectPages: z.boolean().default(false),
  }).default({}),
  
  cart: z.object({
    enabled: z.boolean().default(true),
    position: z.enum(['left', 'center', 'right']).default('right'),
    style: z.enum(['icon', 'icon-text', 'button']).default('icon'),
    showCount: z.boolean().default(true),
    behavior: z.enum(['sidebar', 'dropdown', 'page']).default('sidebar'),
  }).default({}),
  
  styling: z.object({
    backgroundColor: z.string().default('#ffffff'),
    textColor: z.string().default('#000000'),
    linkColor: z.string().default('#0066cc'),
    linkHoverColor: z.string().default('#004499'),
    borderBottom: z.boolean().default(false),
    sticky: z.boolean().default(false),
    shadow: z.enum(['none', 'sm', 'md', 'lg']).default('none'),
  }).default({}),
  
  responsive: z.object({
    mobile: z.object({
      showLogo: z.boolean().default(true),
      showNavigation: z.boolean().default(true),
      navigationStyle: z.enum(['hamburger', 'hidden', 'simplified']).default('hamburger'),
      showCart: z.boolean().default(true),
    }).default({}),
    tablet: z.object({
      showLogo: z.boolean().default(true),
      showNavigation: z.boolean().default(true),
      showCart: z.boolean().default(true),
    }).default({}),
  }).default({}),
});

export const defaultHeaderLayoutProps: HeaderLayoutProps = {
    layout: 'logo-left',
    height: 'standard',
    logo: {
      type: 'text',
      text: 'Your Store',
      position: 'left',
      size: 'medium',
    },
    navigation: {
      enabled: true,
      position: 'center',
      style: 'horizontal',
      links: [
        { id: '1', label: 'Home', href: '/', type: 'internal' },
        { id: '2', label: 'Shop', href: '/products', type: 'internal' },
        { id: '3', label: 'About', href: '/about', type: 'internal' },
        { id: '4', label: 'Contact', href: '/contact', type: 'internal' },
      ],
      autoDetectPages: false,
    },
    cart: {
      enabled: true,
      position: 'right',
      style: 'icon',
      showCount: true,
      behavior: 'sidebar',
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      linkColor: '#0066cc',
      linkHoverColor: '#004499',
      borderBottom: true,
      sticky: false,
      shadow: 'sm',
    },
    responsive: {
      mobile: {
        showLogo: true,
        showNavigation: true,
        navigationStyle: 'hamburger',
        showCart: true,
      },
      tablet: {
        showLogo: true,
        showNavigation: true,
        showCart: true,
      },
    },
};

// Header Layout widget configuration
export const headerLayoutWidgetConfig: WidgetConfig = {
  type: 'header-layout' as WidgetType,
  name: 'Header Layout',
  description: 'Comprehensive header with logo, navigation, and shopping cart',
  icon: 'Layout',
  category: 'layout',
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: HeaderLayoutPropsSchema,
  defaultProps: defaultHeaderLayoutProps,
  Editor: HeaderLayoutEditor,
  View: HeaderLayoutView,
  systemWidget: true,
  migrate: (widget: WidgetBase, targetVersion: number) => {
    // Migration logic for header layout widget
    return widget;
  }
};

// Register the header layout widget
import { widgetRegistry } from '../registry';
widgetRegistry.register(headerLayoutWidgetConfig);

export { HeaderLayoutView, HeaderLayoutEditor };
export type { HeaderLayoutProps };