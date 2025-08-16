/**
 * Button Widget
 * Interactive button widget for the page builder
 */

import { z } from 'zod';
import { WidgetConfig, WidgetType, WidgetBase } from '../../types';
import { ButtonEditor } from './ButtonEditor';
import { ButtonView } from './ButtonView';

// Button widget schema
export const buttonSchema = z.object({
  label: z.string().default('Click me'),
  href: z.string().optional(),
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost', 'link']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  fullWidth: z.boolean().default(false),
  openInNewTab: z.boolean().default(false),
  icon: z.string().optional(),
  iconPosition: z.enum(['left', 'right']).default('left'),
  disabled: z.boolean().default(false),
  onClick: z.string().optional(), // Custom action/script
});

export type ButtonProps = z.infer<typeof buttonSchema>;

// Default button widget configuration
export const defaultButtonProps: ButtonProps = {
  label: 'Click me',
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  openInNewTab: false,
  iconPosition: 'left',
  disabled: false,
};

// Button widget configuration
export const buttonWidgetConfig: WidgetConfig = {
  type: 'button' as WidgetType,
  name: 'Button',
  description: 'Add interactive buttons to your page',
  icon: 'MousePointer',
  category: 'content',
  defaultColSpan: { sm: 12, md: 6, lg: 4 },
  schema: buttonSchema,
  defaultProps: defaultButtonProps,
  Editor: ButtonEditor,
  View: ButtonView,
  migrate: (widget: WidgetBase, targetVersion: number) => {
    // Migration logic for button widget
    if (widget.version === 1 && targetVersion === 2) {
      return {
        ...widget,
        version: 2,
        props: {
          ...widget.props,
          iconPosition: 'left', // Add new field
        }
      };
    }
    return widget;
  }
};

// Register the button widget
import { widgetRegistry } from '../registry';
widgetRegistry.register(buttonWidgetConfig);

