/**
 * Subscribe Widget
 * Newsletter subscription widget for lead capture
 */

import { z } from 'zod';
import { Mail } from 'lucide-react';
import { WidgetConfig } from '../../types';
import { SubscribeEditor } from './SubscribeEditor';
import { SubscribeView } from './SubscribeView';

// Subscribe widget props schema
export const SubscribePropsSchema = z.object({
  title: z.string().default('Stay Updated'),
  subtitle: z.string().default('Subscribe to our newsletter for the latest updates and exclusive offers'),
  placeholder: z.string().default('Enter your email address'),
  buttonText: z.string().default('Subscribe'),
  successMessage: z.string().default('Thank you for subscribing! We\'ll keep you updated.'),
  errorMessage: z.string().default('Something went wrong. Please try again.'),
  showPrivacyText: z.boolean().default(true),
  privacyText: z.string().default('We respect your privacy and will never share your email address.'),
  backgroundColor: z.string().default('bg-gray-50'),
  textColor: z.string().default('text-gray-900'),
  buttonColor: z.string().default('bg-primary-600 hover:bg-primary-700'),
  buttonTextColor: z.string().default('text-white'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  layout: z.enum(['horizontal', 'vertical']).default('horizontal'),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  padding: z.string().default('p-6'),
});

export type SubscribeProps = z.infer<typeof SubscribePropsSchema>;

// Widget configuration
export const subscribeWidget: WidgetConfig = {
  type: 'subscribe',
  name: 'Subscribe',
  description: 'Newsletter subscription form for lead capture',
  category: 'marketing',
  icon: Mail,
  defaultColSpan: { sm: 12, md: 8, lg: 6 },
  schema: SubscribePropsSchema,
  defaultProps: {
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
  },
  Editor: SubscribeEditor,
  View: SubscribeView,
};

// Register the widget
import { widgetRegistry } from '../registry';
widgetRegistry.register(subscribeWidget);