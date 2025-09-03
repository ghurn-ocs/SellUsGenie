/**
 * Widget Registry
 * Central registry for all available widgets in the page builder
 */

import type { WidgetConfig, WidgetType } from '../types';

class WidgetRegistry {
  private widgets = new Map<WidgetType, WidgetConfig>();

  /**
   * Register a widget configuration
   */
  register(config: WidgetConfig): void {
    // Prevent duplicate registrations
    if (this.widgets.has(config.type)) {
      console.warn(`Widget type "${config.type}" is already registered. Skipping duplicate registration.`);
      return;
    }
    this.widgets.set(config.type, config);
  }

  /**
   * Get a widget configuration by type
   */
  get(type: WidgetType): WidgetConfig | undefined {
    return this.widgets.get(type);
  }

  /**
   * Get all registered widgets
   */
  getAll(): WidgetConfig[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Get only user-facing widgets (excludes system widgets)
   */
  getUserWidgets(): WidgetConfig[] {
    return this.getAll().filter(widget => !widget.systemWidget);
  }

  /**
   * Get widgets by category
   */
  getByCategory(category: string): WidgetConfig[] {
    return this.getAll().filter(widget => widget.category === category);
  }

  /**
   * Get user widgets by category (excludes system widgets)
   */
  getUserWidgetsByCategory(category: string): WidgetConfig[] {
    return this.getUserWidgets().filter(widget => widget.category === category);
  }

  /**
   * Get all widget types
   */
  getTypes(): WidgetType[] {
    return Array.from(this.widgets.keys());
  }

  /**
   * Check if a widget type is registered
   */
  has(type: WidgetType): boolean {
    return this.widgets.has(type);
  }

  /**
   * Create a new widget instance
   */
  createWidget(type: WidgetType, id: string): any {
    const config = this.get(type);
    if (!config) {
      throw new Error(`Widget type "${type}" not found`);
    }

    return {
      id,
      type,
      version: 1,
      colSpan: config.defaultColSpan,
      props: config.defaultProps,
      visibility: { sm: true, md: true, lg: true }
    };
  }

  /**
   * Migrate a widget to the latest version
   */
  migrateWidget(widget: any, targetVersion: number): any {
    const config = this.get(widget.type as WidgetType);
    if (!config || !config.migrate) {
      return widget;
    }

    let migratedWidget = { ...widget };
    while (migratedWidget.version < targetVersion) {
      migratedWidget = config.migrate(migratedWidget, migratedWidget.version + 1);
    }

    return migratedWidget;
  }
}

// Create singleton instance
export const widgetRegistry = new WidgetRegistry();

/**
 * Register all widgets
 * This function should be called after all widget modules are imported
 */
export function registerAllWidgets(): void {
  // The widgets will be registered when their modules are imported
  // This function is called to ensure all widgets are loaded
  console.log('Widget registry initialized');
  console.log('Available widgets:', widgetRegistry.getAll().map(w => w.name));
}

/**
 * Get widget categories for the library
 */
export const WIDGET_CATEGORIES = [
  { id: 'content', name: 'Content', description: 'Text and rich content widgets' },
  { id: 'media', name: 'Media', description: 'Images, videos, and media widgets' },
  { id: 'commerce', name: 'Commerce', description: 'Product and shopping widgets' },
  { id: 'layout', name: 'Layout', description: 'Spacing and structural widgets' }
] as const;
