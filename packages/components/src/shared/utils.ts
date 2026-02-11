/**
 * Shared Utilities for ODE Components
 * 
 * Platform-agnostic utility functions
 */

import type { ButtonVariant, ButtonPosition, ThemeMode } from './types';

/**
 * Get the opposite button variant for paired buttons
 */
export function getOppositeVariant(variant: ButtonVariant): ButtonVariant {
  switch (variant) {
    case 'primary':
      return 'neutral';
    case 'secondary':
      return 'primary';
    case 'neutral':
      return 'primary';
    case 'danger':
      return 'danger';
    default:
      return 'primary';
  }
}

/**
 * Get text color for button based on variant and mode.
 * Prefer passing getToken from @ode/tokens so values come from the design system.
 */
export function getButtonTextColor(
  _variant: ButtonVariant,
  isHovered: boolean,
  mode: ThemeMode = 'light',
  getToken?: (path: string) => string
): string {
  if (isHovered) {
    if (getToken) return getToken(mode === 'light' ? 'color.neutral.white' : 'color.neutral.black');
    return mode === 'light' ? '#FFFFFF' : '#000000';
  }
  return 'inherit';
}

/**
 * Get border color for button variant.
 * Prefer passing getToken from @ode/tokens so values come from the design system.
 */
export function getButtonBorderColor(variant: ButtonVariant, getToken?: (path: string) => string): string {
  if (getToken) {
    switch (variant) {
      case 'primary': return getToken('color.brand.primary.500');
      case 'secondary': return getToken('color.brand.secondary.500');
      case 'neutral': return getToken('color.neutral.600');
      case 'danger': return getToken('color.neutral.600');
      default: return getToken('color.brand.primary.500');
    }
  }
  switch (variant) {
    case 'primary': return '#4F7F4E';
    case 'secondary': return '#E9B85B';
    case 'neutral': return '#757575';
    case 'danger': return '#757575';
    default: return '#4F7F4E';
  }
}

/**
 * Get background color for button variant (used on hover).
 * Prefer passing getToken so values come from tokens.
 */
export function getButtonBackgroundColor(variant: ButtonVariant, getToken?: (path: string) => string): string {
  return getButtonBorderColor(variant, getToken);
}

/**
 * Border fade style:
 * - toLeft: no left border; right + tapered top/bottom; right-side radii
 * - toRight: no right border; left + tapered top/bottom; left-side radii
 * - full: all four borders, all radii (e.g. middle button in a group of three)
 *
 * Usage:
 * - Single: toLeft. Horizontal pair: left→toLeft, right→toRight.
 * - Horizontal three: left→toLeft, middle→full, right→toRight.
 * - Vertical stack: top→toRight, bottom→toLeft.
 */
export function getBorderFadeDirection(position: ButtonPosition): 'toLeft' | 'toRight' | 'full' {
  switch (position) {
    case 'standalone':
    case 'left':
    case 'bottom':
      return 'toLeft';
    case 'right':
    case 'top':
      return 'toRight';
    case 'middle':
      return 'full';
    default:
      return 'toLeft';
  }
}
