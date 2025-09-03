import { z } from 'zod';
import { NavigationView } from './NavigationView';
import { NavigationEditor } from './NavigationEditor';
import { widgetRegistry } from '../registry';
import { Navigation } from 'lucide-react';

const navigationSchema = z.object({
  links: z.array(z.object({
    name: z.string(),
    href: z.string(),
    active: z.boolean().optional()
  })).optional(),
  className: z.string().optional(),
  linkClassName: z.string().optional(),
  activeLinkClassName: z.string().optional()
});

// Register the navigation widget
widgetRegistry.register({
  type: 'navigation',
  name: 'Navigation',
  description: 'Dynamic navigation menu with store-aware routing',
  category: 'layout',
  icon: 'Navigation',
  defaultColSpan: { sm: 12, md: 12, lg: 12 },
  View: NavigationView,
  Editor: NavigationEditor,
  schema: navigationSchema,
  defaultProps: {
    links: [],
    className: 'hidden md:flex space-x-8',
    linkClassName: '',
    activeLinkClassName: ''
  },
  systemWidget: true
});

export { NavigationView, NavigationEditor };