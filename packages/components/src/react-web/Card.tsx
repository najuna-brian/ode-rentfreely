/**
 * ODE Card Component - React Web
 * 
 * Modern minimalist card with subtle elevation and clean styling
 */

import React from 'react';
import type { CardProps } from '../shared/types';
import tokensJson from '@ode/tokens/dist/json/tokens.json';

const tokens = tokensJson as any;

const getToken = (path: string): string => {
  const parts = path.split('.');
  let value: unknown = tokens;
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  const resolved = (value as { value?: string })?.value ?? (value as string);
  return resolved ?? (tokens?.color?.neutral?.black?.value ?? tokens?.color?.neutral?.black ?? '#000000');
};

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  elevated = true,
  className = '',
  style,
  onPress,
  testID,
}) => {
  const borderRadius = getToken('border.radius.lg');
  const shadow = elevated ? getToken('shadow.sm') : 'none';

  const cardStyle: React.CSSProperties = {
    backgroundColor: getToken('color.neutral.white'),
    borderRadius,
    padding: getToken('spacing.6'),
    boxShadow: shadow,
    border: `1px solid ${getToken('color.neutral.200')}`,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onPress ? 'pointer' : 'default',
    ...style,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: getToken('font.size.xl'),
    fontWeight: getToken('font.weight.semibold'),
    color: getToken('color.neutral.900'),
    marginBottom: subtitle ? getToken('spacing.2') : getToken('spacing.4'),
    fontFamily: getToken('font.family.sans'),
    lineHeight: getToken('font.lineHeight.tight'),
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: getToken('font.size.sm'),
    fontWeight: getToken('font.weight.regular'),
    color: getToken('color.neutral.600'),
    marginBottom: getToken('spacing.4'),
    fontFamily: getToken('font.family.sans'),
    lineHeight: getToken('font.lineHeight.normal'),
  };

  const handleClick = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <>
      <style>
        {onPress && `
          .ode-card-clickable:hover {
            box-shadow: ${getToken('shadow.md')} !important;
            transform: translateY(-2px);
          }
        `}
      </style>
      <div
        className={`ode-card ${onPress ? 'ode-card-clickable' : ''} ${className}`}
        style={cardStyle}
        onClick={handleClick}
        data-testid={testID}
        role={onPress ? 'button' : undefined}
        tabIndex={onPress ? 0 : undefined}
        onKeyDown={(e) => {
          if (onPress && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onPress();
          }
        }}
      >
        {title && <h3 style={titleStyle}>{title}</h3>}
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        {children}
      </div>
    </>
  );
};

export default Card;
