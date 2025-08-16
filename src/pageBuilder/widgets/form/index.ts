/**
 * Form Widget
 * Advanced form builder with various field types and validation
 */

import { z } from 'zod';
import { widgetRegistry } from '../registry';
import { FormEditor } from './FormEditor';
import { FormView } from './FormView';
import type { WidgetConfig } from '../../types';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'number' | 'url' | 'password';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  options?: Array<{ value: string; label: string }>; // for select, radio, checkbox
  defaultValue?: string | string[];
  helpText?: string;
  width?: 'full' | 'half' | 'third' | 'quarter';
  conditionalLogic?: {
    showWhen?: { fieldId: string; value: string | string[]; operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' };
  };
}

export interface FormProps {
  title?: string;
  description?: string;
  fields: FormField[];
  submitButton: {
    text: string;
    loadingText?: string;
    style: 'primary' | 'secondary' | 'outline' | 'minimal';
    size: 'sm' | 'md' | 'lg';
    fullWidth: boolean;
  };
  actions: {
    onSubmit: 'email' | 'webhook' | 'redirect' | 'custom';
    emailTo?: string;
    webhookUrl?: string;
    redirectUrl?: string;
    successMessage?: string;
    errorMessage?: string;
  };
  styling: {
    layout: 'stacked' | 'inline' | 'grid';
    spacing: 'compact' | 'normal' | 'loose';
    fieldStyle: 'outlined' | 'filled' | 'underlined';
    showLabels: boolean;
    showPlaceholders: boolean;
    showRequiredIndicator: boolean;
  };
  validation: {
    validateOnBlur: boolean;
    validateOnChange: boolean;
    showErrorsInline: boolean;
    customValidation?: string; // JavaScript code
  };
  integrations?: {
    mailchimp?: { listId: string; apiKey: string };
    hubspot?: { portalId: string; formId: string };
    salesforce?: { orgId: string; formId: string };
    zapier?: { webhookUrl: string };
  };
}

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file', 'number', 'url', 'password']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    customMessage: z.string().optional(),
  }).optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
  defaultValue: z.union([z.string(), z.array(z.string())]).optional(),
  helpText: z.string().optional(),
  width: z.enum(['full', 'half', 'third', 'quarter']).optional(),
  conditionalLogic: z.object({
    showWhen: z.object({
      fieldId: z.string(),
      value: z.union([z.string(), z.array(z.string())]),
      operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
    }).optional(),
  }).optional(),
});

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(formFieldSchema),
  submitButton: z.object({
    text: z.string(),
    loadingText: z.string().optional(),
    style: z.enum(['primary', 'secondary', 'outline', 'minimal']),
    size: z.enum(['sm', 'md', 'lg']),
    fullWidth: z.boolean(),
  }),
  actions: z.object({
    onSubmit: z.enum(['email', 'webhook', 'redirect', 'custom']),
    emailTo: z.string().email().optional(),
    webhookUrl: z.string().url().optional(),
    redirectUrl: z.string().url().optional(),
    successMessage: z.string().optional(),
    errorMessage: z.string().optional(),
  }),
  styling: z.object({
    layout: z.enum(['stacked', 'inline', 'grid']),
    spacing: z.enum(['compact', 'normal', 'loose']),
    fieldStyle: z.enum(['outlined', 'filled', 'underlined']),
    showLabels: z.boolean(),
    showPlaceholders: z.boolean(),
    showRequiredIndicator: z.boolean(),
  }),
  validation: z.object({
    validateOnBlur: z.boolean(),
    validateOnChange: z.boolean(),
    showErrorsInline: z.boolean(),
    customValidation: z.string().optional(),
  }),
  integrations: z.object({
    mailchimp: z.object({
      listId: z.string(),
      apiKey: z.string(),
    }).optional(),
    hubspot: z.object({
      portalId: z.string(),
      formId: z.string(),
    }).optional(),
    salesforce: z.object({
      orgId: z.string(),
      formId: z.string(),
    }).optional(),
    zapier: z.object({
      webhookUrl: z.string().url(),
    }).optional(),
  }).optional(),
});

const formConfig: WidgetConfig = {
  type: 'form',
  name: 'Advanced Form',
  description: 'Customizable form with multiple field types and integrations',
  icon: '📝',
  category: 'content',
  defaultColSpan: { sm: 12, md: 8, lg: 6 },
  schema: formSchema,
  defaultProps: {
    title: 'Contact Form',
    description: 'Get in touch with us',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        width: 'full',
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        width: 'full',
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Tell us how we can help',
        required: true,
        width: 'full',
      },
    ],
    submitButton: {
      text: 'Send Message',
      loadingText: 'Sending...',
      style: 'primary',
      size: 'md',
      fullWidth: false,
    },
    actions: {
      onSubmit: 'email',
      emailTo: 'contact@example.com',
      successMessage: 'Thank you for your message! We\'ll get back to you soon.',
      errorMessage: 'Sorry, there was an error sending your message. Please try again.',
    },
    styling: {
      layout: 'stacked',
      spacing: 'normal',
      fieldStyle: 'outlined',
      showLabels: true,
      showPlaceholders: true,
      showRequiredIndicator: true,
    },
    validation: {
      validateOnBlur: true,
      validateOnChange: false,
      showErrorsInline: true,
    },
  },
  Editor: FormEditor,
  View: FormView,
};

// Register the widget
widgetRegistry.register(formConfig);

export { formConfig };