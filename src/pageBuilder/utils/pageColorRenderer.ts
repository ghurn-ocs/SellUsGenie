/**
 * Page Color Renderer Utilities
 * Handles applying color palette styles to storefront pages
 */

import type { PageDocument, ColorPalette } from '../types';
import { getPaletteById } from '../data/colorPalettes';
import { generateCSSVariables, applyColorPaletteToRoot } from './colorPaletteUtils';

/**
 * Extracts color palette configuration from a page document
 */
export const extractColorPaletteFromDocument = (document: PageDocument): {
  palette: ColorPalette | null;
  customColors: Partial<ColorPalette['colors']>;
  applyOptions: any;
} => {
  const themeOverrides = document.themeOverrides || {};
  const colorPaletteData = themeOverrides.colorPalette || {};
  
  const palette = colorPaletteData.paletteId ? getPaletteById(colorPaletteData.paletteId) : null;
  const customColors = colorPaletteData.customColors || {};
  const applyOptions = colorPaletteData.applyOptions || {};

  return { palette, customColors, applyOptions };
};

/**
 * Generates CSS content for a page's color palette
 */
export const generatePageColorCSS = (document: PageDocument): string => {
  const { palette, customColors, applyOptions } = extractColorPaletteFromDocument(document);
  
  if (!palette) {
    return '';
  }

  // Create effective palette with custom colors
  const effectivePalette: ColorPalette = {
    ...palette,
    colors: { ...palette.colors, ...customColors }
  };

  const cssVariables = generateCSSVariables(effectivePalette);
  const variableCSS = Object.entries(cssVariables)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');

  return `:root {
${variableCSS}
}

/* Page-specific color applications */
${generatePageColorClasses(effectivePalette, applyOptions)}
`;
};

/**
 * Generates CSS classes for applying colors to page elements
 */
const generatePageColorClasses = (
  palette: ColorPalette,
  applyOptions: any
): string => {
  const classes = [];

  // Background classes
  if (applyOptions.backgrounds !== false) {
    classes.push(`
.page-background {
  background-color: var(--color-bg);
}

.page-background-secondary {
  background-color: var(--color-bg-secondary);
}

.page-background-accent {
  background-color: var(--color-bg-accent);
}
`);
  }

  // Text classes
  if (applyOptions.text !== false) {
    classes.push(`
.page-text {
  color: var(--color-text);
}

.page-text-secondary {
  color: var(--color-text-secondary);
}

.page-text-muted {
  color: var(--color-text-muted);
}

.page-text-inverse {
  color: var(--color-text-inverse);
}

.page-heading {
  color: var(--color-text);
}
`);
  }

  // Button classes
  if (applyOptions.buttons !== false) {
    classes.push(`
.page-button-primary {
  background-color: var(--color-btn-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-btn-primary);
}

.page-button-primary:hover {
  background-color: var(--color-btn-primary-hover);
  border-color: var(--color-btn-primary-hover);
}

.page-button-secondary {
  background-color: var(--color-btn-secondary);
  color: var(--color-text);
  border-color: var(--color-btn-secondary);
}

.page-button-secondary:hover {
  background-color: var(--color-btn-secondary-hover);
  border-color: var(--color-btn-secondary-hover);
}
`);
  }

  // Border and UI classes
  if (applyOptions.borders !== false) {
    classes.push(`
.page-border {
  border-color: var(--color-border);
}

.page-border:hover {
  border-color: var(--color-border-hover);
}

.page-shadow {
  box-shadow: 0 1px 3px 0 var(--color-shadow), 0 1px 2px 0 var(--color-shadow);
}
`);
  }

  // Header and Footer classes
  if (applyOptions.headerFooter !== false) {
    classes.push(`
.page-header {
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
}

.page-footer {
  background-color: var(--color-footer-bg);
  color: var(--color-footer-text);
}
`);
  }

  // Widget-specific classes
  classes.push(`
/* Widget color applications */
.widget-container {
  color: var(--color-text);
}

.widget-title {
  color: var(--color-text);
}

.widget-content {
  color: var(--color-text-secondary);
}

.widget-link {
  color: var(--color-primary);
}

.widget-link:hover {
  color: var(--color-primary-hover);
}

.widget-card {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}
`);

  return classes.join('\n');
};

/**
 * Applies color palette to the current document context
 */
export const applyPageColors = (document: PageDocument): void => {
  const { palette, customColors } = extractColorPaletteFromDocument(document);
  
  if (!palette) {
    return;
  }

  const effectivePalette: ColorPalette = {
    ...palette,
    colors: { ...palette.colors, ...customColors }
  };

  applyColorPaletteToRoot(effectivePalette);
};

/**
 * Removes all page color styling
 */
export const removePageColors = (): void => {
  if (typeof window === 'undefined' || !window.document) {
    return;
  }

  const root = window.document.documentElement;
  
  // Remove all color CSS variables
  const computedStyles = window.getComputedStyle(root);
  Array.from(computedStyles).forEach(property => {
    if (property.startsWith('--color-')) {
      root.style.removeProperty(property);
    }
  });

  // Remove palette attribute
  root.removeAttribute('data-color-palette');
  root.removeAttribute('data-color-palette-category');
};

/**
 * Injects page color CSS into the document head
 */
export const injectPageColorCSS = (document: PageDocument, elementId = 'page-colors'): void => {
  if (typeof window === 'undefined' || !window.document) {
    return;
  }

  // Remove existing style element
  const existingStyle = window.document.getElementById(elementId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Generate and inject new CSS
  const css = generatePageColorCSS(document);
  if (css) {
    const styleElement = window.document.createElement('style');
    styleElement.id = elementId;
    styleElement.textContent = css;
    window.document.head.appendChild(styleElement);
  }
};