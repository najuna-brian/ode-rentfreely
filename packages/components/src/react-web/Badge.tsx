/**
 * ODE Badge Component - React Web
 *
 * Modern minimalist badge for labels and status indicators
 */

import React from 'react';
import type { BadgeProps } from '../shared/types';
import tokensJson from '@ode/tokens/dist/json/tokens.json';

const tokens = tokensJson as any;

const getToken = (path: string): string => {
  const parts = path.split('.');
  let value: unknown = tokens;
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  const resolved = (value as { value?: string })?.value ?? (value as string);
  return (
    resolved ?? tokens?.color?.neutral?.black?.value ?? tokens?.color?.neutral?.black ?? '#000000'
  );
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'medium',
  className = '',
  style,
  testID,
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: getToken('color.brand.primary.50'),
          text: getToken('color.brand.primary.700'),
        };
      case 'secondary':
        return {
          bg: getToken('color.brand.secondary.50'),
          text: getToken('color.brand.secondary.700'),
        };
      case 'success':
        return {
          bg: getToken('color.semantic.success.50'),
          text: getToken('color.semantic.success.600'),
        };
      case 'error':
        return {
          bg: getToken('color.semantic.error.50'),
          text: getToken('color.semantic.error.600'),
        };
      case 'warning':
        return {
          bg: getToken('color.semantic.warning.50'),
          text: getToken('color.semantic.warning.600'),
        };
      case 'info':
        return {
          bg: getToken('color.semantic.info.50'),
          text: getToken('color.semantic.info.600'),
        };
      case 'neutral':
      default:
        return {
          bg: getToken('color.neutral.100'),
          text: getToken('color.neutral.700'),
        };
    }
  };

  const colors = getVariantColors();
  const borderRadius = getToken('border.radius.md');

  const sizeMap = {
    small: {
      padding: `${getToken('spacing.1')} ${getToken('spacing.2')}`,
      fontSize: getToken('font.size.xs'),
    },
    medium: {
      padding: `${getToken('spacing.2')} ${getToken('spacing.3')}`,
      fontSize: getToken('font.size.sm'),
    },
    large: {
      padding: `${getToken('spacing.2')} ${getToken('spacing.4')}`,
      fontSize: getToken('font.size.base'),
    },
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius,
    fontWeight: getToken('font.weight.medium'),
    fontFamily: getToken('font.family.sans'),
    lineHeight: getToken('font.lineHeight.none'),
    ...sizeMap[size],
    ...style,
  };

  return (
    <span
      className={`ode-badge ode-badge--${variant} ode-badge--${size} ${className}`}
      style={badgeStyle}
      data-testid={testID}
    >
      {children}
    </span>
  );
};

export default Badge;
