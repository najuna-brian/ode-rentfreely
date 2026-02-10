/**
 * ODE Design System Color Tokens
 * Sourced from @ode/tokens package (single source of truth).
 *
 * Primary: Green (#4F7F4E)
 * Secondary: Gold (#E9B85B)
 */

import tokens from '@ode/tokens/dist/react-native/tokens-resolved';

const c = (tokens as { color: Record<string, unknown> }).color as Record<string, unknown>;
const n = c.neutral as Record<string, string>;
const brand = c.brand as { primary: Record<string, unknown>; secondary: Record<string, unknown> };

export const colors = {
  brand: {
    primary: brand.primary as Record<string, string>,
    secondary: brand.secondary as Record<string, string>,
  },
  neutral: {
    white: n.white,
    50: n['50'],
    100: n['100'],
    200: n['200'],
    300: n['300'],
    400: n['400'],
    500: n['500'],
    600: n['600'],
    700: n['700'],
    800: n['800'],
    900: n['900'],
    black: n.black,
    transparent: 'transparent',
  },
  semantic: {
    success: {
      50: (c.semantic as Record<string, Record<string, Record<string, string>>>).success['50'],
      500: (c.semantic as Record<string, Record<string, Record<string, string>>>).success['500'],
      600: (c.semantic as Record<string, Record<string, Record<string, string>>>).success['600'],
    },
    error: {
      50: (c.semantic as Record<string, Record<string, Record<string, string>>>).error['50'],
      500: (c.semantic as Record<string, Record<string, Record<string, string>>>).error['500'],
      600: (c.semantic as Record<string, Record<string, Record<string, string>>>).error['600'],
      ios: '#FF3B30', // iOS system error red (platform override)
    },
    warning: {
      50: (c.semantic as Record<string, Record<string, Record<string, string>>>).warning['50'],
      500: (c.semantic as Record<string, Record<string, Record<string, string>>>).warning['500'],
      600: (c.semantic as Record<string, Record<string, Record<string, string>>>).warning['600'],
    },
    info: {
      50: (c.semantic as Record<string, Record<string, Record<string, string>>>).info['50'],
      500: (c.semantic as Record<string, Record<string, Record<string, string>>>).info['500'],
      600: (c.semantic as Record<string, Record<string, Record<string, string>>>).info['600'],
      ios: '#007AFF', // iOS system blue (platform override)
      light: '#E3F2FD',
      medium: '#4A90E2',
    },
    scanner: {
      success: '#00ff00', // QR scanner overlay (platform-specific)
    },
  },
  ui: {
    gray: {
      lightest: '#F8F8F8',
      lighter: '#F0F2F5',
      light: '#E5E5E5',
      medium: '#CCCCCC',
      ios: '#8E8E93',
    },
    background: 'rgba(0, 0, 0, 0.5)',
  },
};

export default colors;
