/**
 * ODE Button Component - React Web
 *
 * Synkronus-style: full borders on all sides, border.radius.md in px (8px),
 * thin border, token-based spacing/typography. Same border radius in px for common design language.
 */

import React, { useState, useMemo } from 'react';
import type { ButtonProps, ButtonVariant } from '../shared/types';
import { getOppositeVariant } from '../shared/utils';
import tokensJson from '@ode/tokens/dist/json/tokens.json';

export interface WebButtonProps extends ButtonProps {
  /**
   * Whether this button is part of a pair (for opposite styling)
   */
  isPaired?: boolean;

  /**
   * The variant of the paired button (if any)
   */
  pairedVariant?: ButtonVariant;
}

// Extract token values
const tokens = tokensJson as any;

const Button: React.FC<WebButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  position = 'standalone',
  active = false,
  isPaired = false,
  pairedVariant,
  className = '',
  style,
  testID,
  accessibilityLabel,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActiveOrHovered = active || isHovered;

  // Determine actual variant - if paired, use opposite of paired variant
  const actualVariant: ButtonVariant = useMemo(() => {
    if (isPaired && pairedVariant) {
      return getOppositeVariant(pairedVariant);
    }
    return variant;
  }, [isPaired, pairedVariant, variant]);

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

  const primaryGreen = getToken('color.brand.primary.500');
  const errorRed = getToken('color.semantic.error.500');
  const errorRedAlpha = getToken('color.semantic.error.alpha.15');
  const textOnFill = getToken('color.neutral.white');

  const neutralGrey = getToken('color.neutral.600');
  const borderColor = useMemo(() => {
    switch (actualVariant) {
      case 'primary':
        return primaryGreen;
      case 'secondary':
        return getToken('color.brand.secondary.500');
      case 'neutral':
        return neutralGrey;
      case 'danger':
        return errorRed;
      default:
        return primaryGreen;
    }
  }, [actualVariant, primaryGreen, neutralGrey, errorRed]);

  // Danger: default = red (border, text, tint bg); hover = grey (border, text), transparent
  const dangerDefaultBorder = errorRed;
  const dangerHoverBorder = neutralGrey;
  const hoverBg = actualVariant === 'danger' ? 'transparent' : borderColor;
  const activeBorderColor =
    actualVariant === 'danger'
      ? isHovered
        ? dangerHoverBorder
        : dangerDefaultBorder
      : isActiveOrHovered
        ? 'transparent'
        : borderColor;
  const activeTextColor =
    actualVariant === 'danger'
      ? isHovered
        ? neutralGrey
        : errorRed
      : isActiveOrHovered
        ? textOnFill
        : borderColor;
  const activeBg =
    actualVariant === 'danger'
      ? isHovered
        ? 'transparent'
        : errorRedAlpha || 'transparent'
      : isActiveOrHovered
        ? hoverBg
        : 'transparent';

  // Common design language: border radius in px (token is 8px)
  const borderRadiusRaw = getToken('border.radius.md');
  const borderRadiusPx =
    typeof borderRadiusRaw === 'string' && borderRadiusRaw.endsWith('px')
      ? borderRadiusRaw
      : `${parseInt(String(borderRadiusRaw).replace(/\D/g, ''), 10) || 8}px`;
  const borderWidth = getToken('border.width.thin');

  const paddingMap = {
    small: { vertical: getToken('spacing.2'), horizontal: getToken('spacing.4') },
    medium: { vertical: getToken('spacing.3'), horizontal: getToken('spacing.6') },
    large: { vertical: getToken('spacing.4'), horizontal: getToken('spacing.8') },
  };

  const fontSizeMap = {
    small: getToken('font.size.sm'),
    medium: getToken('font.size.base'),
    large: getToken('font.size.lg'),
  };

  const padding = paddingMap[size];
  const fontSize = fontSizeMap[size];

  const borderStyle: React.CSSProperties = {
    border: `${borderWidth} solid ${activeBorderColor}`,
    borderRadius: borderRadiusPx,
  };

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    padding: `${padding.vertical} ${padding.horizontal}`,
    fontSize,
    fontFamily: getToken('font.family.sans'),
    fontWeight: getToken('font.weight.medium'),
    color: activeTextColor,
    backgroundColor: activeBg,
    ...borderStyle,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getToken('touchTarget.comfortable') || getToken('spacing.12'),
    textTransform: 'none',
    letterSpacing: getToken('font.letterSpacing.wide'),
    overflow: 'hidden',
    ...style,
  };

  const handleClick = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || loading}
      className={`ode-button ode-button--${actualVariant} ode-button--${size} ${className}`}
      style={buttonStyle}
      data-testid={testID}
      aria-label={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              border: `2px solid ${activeTextColor}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
          {children}
        </span>
      ) : (
        <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;
