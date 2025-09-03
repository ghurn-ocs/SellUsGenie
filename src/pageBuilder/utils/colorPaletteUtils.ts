/**
 * Color Palette Utilities
 * Utilities for applying color palettes to page elements and CSS
 */
import { ColorPalette, ColorPaletteApplyOptions } from '../types';
/**
 * Generates CSS custom properties from a color palette
 */
export const generateCSSVariables = (palette: ColorPalette): Record<string, string> => {
  const variables: Record<string, string> = {};
  Object.entries(palette.colors).forEach(([key, value]) => {
    const cssProperty = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    variables[cssProperty] = value;
  });
  // Add semantic color mappings for easier usage
  variables['--color-primary'] = palette.colors.primary;
  variables['--color-primary-hover'] = palette.colors.primaryHover;
  variables['--color-secondary'] = palette.colors.secondary;
  variables['--color-secondary-hover'] = palette.colors.secondaryHover;
  variables['--color-accent'] = palette.colors.accent;
  variables['--color-accent-hover'] = palette.colors.accentHover;
  variables['--color-bg'] = palette.colors.background;
  variables['--color-bg-secondary'] = palette.colors.backgroundSecondary;
  variables['--color-bg-accent'] = palette.colors.backgroundAccent;
  variables['--color-text'] = palette.colors.textPrimary;
  variables['--color-text-secondary'] = palette.colors.textSecondary;
  variables['--color-text-muted'] = palette.colors.textMuted;
  variables['--color-text-inverse'] = palette.colors.textInverse;
  variables['--color-border'] = palette.colors.border;
  variables['--color-border-hover'] = palette.colors.borderHover;
  variables['--color-shadow'] = palette.colors.shadow;
  variables['--color-btn-primary'] = palette.colors.buttonPrimary;
  variables['--color-btn-primary-hover'] = palette.colors.buttonPrimaryHover;
  variables['--color-btn-secondary'] = palette.colors.buttonSecondary;
  variables['--color-btn-secondary-hover'] = palette.colors.buttonSecondaryHover;
  variables['--color-header-bg'] = palette.colors.headerBackground;
  variables['--color-header-text'] = palette.colors.headerText;
  variables['--color-footer-bg'] = palette.colors.footerBackground;
  variables['--color-footer-text'] = palette.colors.footerText;
  return variables;
};
/**
 * Applies color palette to the document root
 */
export const applyColorPaletteToRoot = (palette: ColorPalette): void => {
  if (typeof window === 'undefined' || !window.document) {
    return; // Server-side rendering or no document
  }
  const root = window.document.documentElement;
  const variables = generateCSSVariables(palette);
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  // Add palette ID as a data attribute for CSS targeting
  root.setAttribute('data-color-palette', palette.id);
};
/**
 * Removes color palette variables from document root
 */
export const removeColorPaletteFromRoot = (): void => {
  if (typeof window === 'undefined' || !window.document) {
    return;
  }
  const root = window.document.documentElement;
  const computedStyles = window.getComputedStyle(root);
  // Remove all color variables
  Array.from(computedStyles).forEach(property => {
    if (property.startsWith('--color-')) {
      root.style.removeProperty(property);
    }
  });
  root.removeAttribute('data-color-palette');
};
/**
 * Applies color palette with specific options
 */
export const applyColorPaletteWithOptions = (
  palette: ColorPalette, 
  options: ColorPaletteApplyOptions = {}
): void => {
  const {
    backgrounds = true,
    buttons = true,
    text = true,
    borders = true,
    headerFooter = true,
    customElements = []
  } = options;
  if (typeof window === 'undefined' || !window.document) {
    return;
  }
  const root = window.document.documentElement;
  // Apply based on options
  if (backgrounds) {
    root.style.setProperty('--color-bg', palette.colors.background);
    root.style.setProperty('--color-bg-secondary', palette.colors.backgroundSecondary);
    root.style.setProperty('--color-bg-accent', palette.colors.backgroundAccent);
  }
  if (text) {
    root.style.setProperty('--color-text', palette.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', palette.colors.textSecondary);
    root.style.setProperty('--color-text-muted', palette.colors.textMuted);
    root.style.setProperty('--color-text-inverse', palette.colors.textInverse);
  }
  if (buttons) {
    root.style.setProperty('--color-btn-primary', palette.colors.buttonPrimary);
    root.style.setProperty('--color-btn-primary-hover', palette.colors.buttonPrimaryHover);
    root.style.setProperty('--color-btn-secondary', palette.colors.buttonSecondary);
    root.style.setProperty('--color-btn-secondary-hover', palette.colors.buttonSecondaryHover);
  }
  if (borders) {
    root.style.setProperty('--color-border', palette.colors.border);
    root.style.setProperty('--color-border-hover', palette.colors.borderHover);
    root.style.setProperty('--color-shadow', palette.colors.shadow);
  }
  if (headerFooter) {
    root.style.setProperty('--color-header-bg', palette.colors.headerBackground);
    root.style.setProperty('--color-header-text', palette.colors.headerText);
    root.style.setProperty('--color-footer-bg', palette.colors.footerBackground);
    root.style.setProperty('--color-footer-text', palette.colors.footerText);
  }
  // Apply to custom elements
  customElements.forEach(selector => {
    try {
      const elements = window.document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.color = palette.colors.textPrimary;
          element.style.backgroundColor = palette.colors.background;
        }
      });
    } catch (e) {
    }
  });
  // Set palette metadata
  root.setAttribute('data-color-palette', palette.id);
  root.setAttribute('data-color-palette-category', palette.category);
};
/**
 * Gets the current color palette from CSS variables
 */
export const getCurrentPaletteFromCSS = (): Partial<ColorPalette['colors']> | null => {
  if (typeof window === 'undefined' || !window.document) {
    return null;
  }
  const root = window.document.documentElement;
  const computedStyles = window.getComputedStyle(root);
  const colors: Partial<ColorPalette['colors']> = {};
  // Extract color values from CSS custom properties
  const colorMap: Array<[string, keyof ColorPalette['colors']]> = [
    ['--color-primary', 'primary'],
    ['--color-primary-hover', 'primaryHover'],
    ['--color-secondary', 'secondary'],
    ['--color-secondary-hover', 'secondaryHover'],
    ['--color-accent', 'accent'],
    ['--color-accent-hover', 'accentHover'],
    ['--color-bg', 'background'],
    ['--color-bg-secondary', 'backgroundSecondary'],
    ['--color-bg-accent', 'backgroundAccent'],
    ['--color-text', 'textPrimary'],
    ['--color-text-secondary', 'textSecondary'],
    ['--color-text-muted', 'textMuted'],
    ['--color-text-inverse', 'textInverse'],
    ['--color-border', 'border'],
    ['--color-border-hover', 'borderHover'],
    ['--color-shadow', 'shadow'],
    ['--color-btn-primary', 'buttonPrimary'],
    ['--color-btn-primary-hover', 'buttonPrimaryHover'],
    ['--color-btn-secondary', 'buttonSecondary'],
    ['--color-btn-secondary-hover', 'buttonSecondaryHover'],
    ['--color-header-bg', 'headerBackground'],
    ['--color-header-text', 'headerText'],
    ['--color-footer-bg', 'footerBackground'],
    ['--color-footer-text', 'footerText'],
  ];
  colorMap.forEach(([cssVar, colorKey]) => {
    const value = computedStyles.getPropertyValue(cssVar).trim();
    if (value) {
      colors[colorKey] = value;
    }
  });
  return Object.keys(colors).length > 0 ? colors : null;
};
/**
 * Generates CSS stylesheet content for a color palette
 */
export const generatePaletteCSS = (palette: ColorPalette): string => {
  const variables = generateCSSVariables(palette);
  const cssVariables = Object.entries(variables)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');
  return `:root[data-color-palette="${palette.id}"] {
${cssVariables}
}
/* Widget-specific color applications */
[data-color-palette="${palette.id}"] .widget-background {
  background-color: var(--color-bg);
}
[data-color-palette="${palette.id}"] .widget-text {
  color: var(--color-text);
}
[data-color-palette="${palette.id}"] .widget-border {
  border-color: var(--color-border);
}
[data-color-palette="${palette.id}"] .widget-button {
  background-color: var(--color-btn-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-btn-primary);
}
[data-color-palette="${palette.id}"] .widget-button:hover {
  background-color: var(--color-btn-primary-hover);
  border-color: var(--color-btn-primary-hover);
}
[data-color-palette="${palette.id}"] .widget-button-secondary {
  background-color: var(--color-btn-secondary);
  color: var(--color-text);
  border-color: var(--color-btn-secondary);
}
[data-color-palette="${palette.id}"] .widget-button-secondary:hover {
  background-color: var(--color-btn-secondary-hover);
  border-color: var(--color-btn-secondary-hover);
}
[data-color-palette="${palette.id}"] .widget-header {
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
}
[data-color-palette="${palette.id}"] .widget-footer {
  background-color: var(--color-footer-bg);
  color: var(--color-footer-text);
}`;
};
/**
 * Injects palette-specific CSS into the document
 */
export const injectPaletteCSS = (palette: ColorPalette): void => {
  if (typeof window === 'undefined' || !window.document) {
    return;
  }
  // Remove any existing palette CSS
  const existingStyle = window.document.getElementById(`palette-css-${palette.id}`);
  if (existingStyle) {
    existingStyle.remove();
  }
  // Create and inject new palette CSS
  const styleElement = window.document.createElement('style');
  styleElement.id = `palette-css-${palette.id}`;
  styleElement.textContent = generatePaletteCSS(palette);
  window.document.head.appendChild(styleElement);
};
/**
 * Removes palette-specific CSS from the document
 */
export const removePaletteCSS = (paletteId: string): void => {
  if (typeof window === 'undefined' || !window.document) {
    return;
  }
  const styleElement = window.document.getElementById(`palette-css-${paletteId}`);
  if (styleElement) {
    styleElement.remove();
  }
};