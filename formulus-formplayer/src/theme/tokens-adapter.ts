/**
 * Tokens Adapter
 *
 * Adapts the @ode/tokens JSON export to match the structure expected by theme.ts
 * The JSON format from Style Dictionary includes { value: "..." } wrappers,
 * and uses "font" instead of "typography", so we transform it to match.
 */

import tokensJson from '@ode/tokens/dist/json/tokens.json';

// TypeScript interface for tokens structure
export interface Tokens {
  spacing: Record<string, string>;
  border: {
    width: Record<string, string>;
    radius: Record<string, string>;
  };
  color: {
    semantic: {
      error: Record<string, string>;
      success: Record<string, string>;
      info: Record<string, string>;
      warning: Record<string, string>;
      scanner: Record<string, string>;
      theme: Record<string, any>;
      'theme-light': Record<string, any>;
      ui: Record<string, any>;
    };
    neutral: Record<string, string>;
    brand: {
      primary: Record<string, string | Record<string, string>>;
      secondary: Record<string, string | Record<string, string>>;
    };
  };
  typography?: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  font?: {
    family: Record<string, string>;
    size: Record<string, string>;
    weight: Record<string, string>;
    lineHeight: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  touchTarget: {
    min: number;
    comfortable: number;
    large: number;
  };
  contrast?: Record<string, string>;
  focus?: Record<string, string>;
  filter?: Record<string, any>;
  duration?: Record<string, string>;
  easing?: Record<string, string>;
  opacity?: Record<string, string>;
  shadow?: Record<string, any>;
  zIndex?: Record<string, string>;
  component?: Record<string, any>;
  icon?: Record<string, any>;
  avatar?: Record<string, string>;
  logo?: Record<string, string>;
  breakpoint?: Record<string, string>;
  container?: Record<string, string>;
  grid?: Record<string, string>;
}

// Helper to recursively extract values from { value: "..." } structure
const extractValues = (obj: any): any => {
  if (
    obj &&
    typeof obj === 'object' &&
    'value' in obj &&
    Object.keys(obj).length === 1
  ) {
    // This is a { value: "..." } wrapper, extract the value
    return obj.value;
  }

  if (Array.isArray(obj)) {
    return obj.map(extractValues);
  }

  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = extractValues(obj[key]);
    }
    return result;
  }

  return obj;
};

// Helper to parse pixel values to numbers
const parsePx = (value: string): number => {
  return parseInt(value.replace('px', ''), 10);
};

// Transform the tokens and map font -> typography structure
const transformed = extractValues(tokensJson);

// Map font structure to typography structure to match theme.ts expectations
if (transformed.font) {
  transformed.typography = {
    fontFamily: transformed.font.family,
    fontSize: transformed.font.size,
    fontWeight: transformed.font.weight,
    lineHeight: transformed.font.lineHeight,
    letterSpacing: transformed.font.letterSpacing,
  };
  // Keep font for backwards compatibility, but typography is the primary
}

// Parse touchTarget values from "48px" strings to numbers (48)
if (transformed.touchTarget) {
  transformed.touchTarget = {
    min: parsePx(transformed.touchTarget.min),
    comfortable: parsePx(transformed.touchTarget.comfortable),
    large: parsePx(transformed.touchTarget.large),
  };
}

export const tokens: Tokens = transformed;
