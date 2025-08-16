/**
 * Spacer Widget View
 * Renders vertical spacing on canvas and public pages
 */

import React from 'react';
import type { WidgetViewProps } from '../../types';
import type { SpacerProps } from './index';

export const SpacerView: React.FC<WidgetViewProps> = ({ widget, theme }) => {
  const props = widget.props as SpacerProps;
  const {
    height,
    backgroundColor,
    borderTop,
    borderBottom,
    borderColor,
  } = props;

  return (
    <div
      className="spacer-widget"
      style={{
        height: `${height}px`,
        backgroundColor: backgroundColor || 'transparent',
        borderTop: borderTop ? `1px solid ${borderColor}` : 'none',
        borderBottom: borderBottom ? `1px solid ${borderColor}` : 'none',
      }}
    />
  );
};

