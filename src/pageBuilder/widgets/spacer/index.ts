/**
 * Spacer Widget
 * Adds vertical spacing between sections
 */

import { z } from 'zod';
import { widgetRegistry } from '../registry';
import type { WidgetConfig } from '../../types';
import { SpacerEditor } from './SpacerEditor';
import { SpacerView } from './SpacerView';

// Schema for spacer widget properties
export const spacerSchema = z.object({
  height: z.number().min(0).max(200).default(40),
  backgroundColor: z.string().optional(),
  borderTop: z.boolean().default(false),
  borderBottom: z.boolean().default(false),
  borderColor: z.string().default('#e5e7eb'),
});

export type SpacerProps = z.infer<typeof spacerSchema>;

// Default properties for new spacer widgets
export const defaultSpacerProps: SpacerProps = {
  height: 40,
  borderTop: false,
  borderBottom: false,
  borderColor: '#e5e7eb',
};

// Widget configuration
export const spacerWidgetConfig: WidgetConfig = {
  type: 'spacer',
  name: 'Spacer',
  category: 'layout',
  description: 'Add vertical spacing between sections',
  icon: '📏',
  defaultProps: defaultSpacerProps,
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  schema: spacerSchema,
  Editor: SpacerEditor,
  View: SpacerView,
  migrate: (widget: any, version: number) => {
    // Migration logic for future versions
    return widget;
  }
};

// Register the widget
widgetRegistry.register(spacerWidgetConfig);

