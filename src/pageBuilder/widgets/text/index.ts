/**
 * Text Widget
 * Rich text content widget for the page builder
 */

import { z } from 'zod';
import { WidgetConfig, WidgetType, WidgetBase } from '../../types';
import { TextEditor } from './TextEditor';
import { TextView } from './TextView';

// Text widget schema
export const textSchema = z.object({
  content: z.string().default(''),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  fontSize: z.enum(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']).default('base'),
  fontWeight: z.enum(['normal', 'medium', 'semibold', 'bold']).default('normal'),
  color: z.string().default('text-gray-900'),
  maxWidth: z.string().optional(),
  lineHeight: z.enum(['tight', 'snug', 'normal', 'relaxed', 'loose']).default('normal'),
  allowHtml: z.boolean().default(false),
});

export type TextProps = z.infer<typeof textSchema>;

// Default text widget configuration
export const defaultTextProps: TextProps = {
  content: 'Enter your text here...',
  textAlign: 'left',
  fontSize: 'base',
  fontWeight: 'normal',
  color: 'text-gray-900',
  lineHeight: 'normal',
  allowHtml: false,
};

// Text widget configuration
export const textWidgetConfig: WidgetConfig = {
  type: 'text' as WidgetType,
  name: 'Text',
  description: 'Add rich text content to your page',
  icon: 'Type',
  category: 'content',
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: textSchema,
  defaultProps: defaultTextProps,
  Editor: TextEditor,
  View: TextView,
  migrate: (widget: WidgetBase, targetVersion: number) => {
    // Migration logic for text widget
    if (widget.version === 1 && targetVersion === 2) {
      return {
        ...widget,
        version: 2,
        props: {
          ...widget.props,
          allowHtml: false, // Add new field
        }
      };
    }
    return widget;
  }
};

// Register the text widget
import { widgetRegistry } from '../registry';
widgetRegistry.register(textWidgetConfig);

