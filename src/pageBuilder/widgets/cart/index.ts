/**
 * Cart Widget for Visual Page Builder
 * Allows store owners to configure shopping cart appearance and behavior in headers
 */

import { z } from 'zod';
import { ShoppingCart } from 'lucide-react';
import { WidgetConfig, WidgetType, WidgetBase } from '../../types';
import { CartView } from './CartView';
import { CartEditor } from './CartEditor';

// Zod schema for cart widget props validation
export const cartSchema = z.object({
  // Display Style Options
  displayStyle: z.enum(['icon', 'button', 'text', 'icon-text']).default('icon'),
  buttonText: z.string().default('Cart'),
  iconStyle: z.enum(['shopping-cart', 'shopping-bag', 'package']).default('shopping-cart'),
  showCount: z.boolean().default(true),
  
  // Behavior Options
  behavior: z.enum(['side-panel', 'dropdown', 'page-navigation']).default('side-panel'),
  
  // Styling Options
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  color: z.enum(['default', 'primary', 'secondary', 'white', 'dark']).default('default'),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
});

export type CartProps = z.infer<typeof cartSchema>;

// Default cart widget props
export const defaultCartProps: CartProps = {
  displayStyle: 'icon',
  buttonText: 'Cart',
  iconStyle: 'shopping-cart',
  showCount: true,
  behavior: 'side-panel',
  size: 'medium',
  color: 'default',
  alignment: 'center',
};

// Cart widget configuration
export const cartWidgetConfig: WidgetConfig = {
  type: 'cart' as WidgetType,
  name: 'Shopping Cart',
  description: 'Customizable shopping cart button with configurable appearance and behavior',
  icon: ShoppingCart,
  category: 'commerce',
  defaultColSpan: { sm: 6, md: 4, lg: 3 },
  schema: cartSchema,
  defaultProps: defaultCartProps,
  Editor: CartEditor,
  View: CartView,
  systemWidget: true,
  migrate: (widget: WidgetBase, targetVersion: number) => {
    // Migration logic for cart widget
    if (widget.version === 1 && targetVersion === 2) {
      return {
        ...widget,
        version: 2,
        props: {
          ...widget.props,
          alignment: 'center', // Add new field
        }
      };
    }
    return widget;
  }
};

// Register the cart widget
import { widgetRegistry } from '../registry';
widgetRegistry.register(cartWidgetConfig);