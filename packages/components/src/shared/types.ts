/**
 * Shared Types for ODE Components
 * 
 * Platform-agnostic type definitions used across React Native and React Web implementations
 */

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';
/** Horizontal: left/middle/right. Vertical stack: top/bottom. Single: standalone. */
export type ButtonPosition = 'left' | 'right' | 'middle' | 'standalone' | 'top' | 'bottom';

export interface ButtonProps {
  /**
   * Button text content
   */
  children: React.ReactNode;
  
  /**
   * Click handler
   */
  onPress?: () => void;
  
  /**
   * Button variant (affects color scheme)
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;
  
  /**
   * Whether button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether button is in loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Position when used in a button group.
   * Horizontal: 'left' | 'middle' | 'right'. Vertical: 'top' | 'bottom'. Single: 'standalone'.
   * @default 'standalone'
   */
  position?: ButtonPosition;

  /**
   * When true, show the same style as hover (e.g. filled background, contrast text).
   * Use for the selected/active option in a group (e.g. filter tabs).
   * @default false
   */
  active?: boolean;
  
  /**
   * Additional className/style (platform-specific)
   */
  className?: string;
  style?: any;
  
  /**
   * Test ID for testing
   */
  testID?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

export interface InputProps {
  /**
   * Input label
   */
  label?: string;
  
  /**
   * Input placeholder
   */
  placeholder?: string;
  
  /**
   * Input value
   */
  value?: string;
  
  /**
   * Change handler
   */
  onChangeText?: (text: string) => void;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Whether input is disabled
   */
  disabled?: boolean;
  
  /**
   * Input type (web only)
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  
  /**
   * Mask input (React Native: secureTextEntry for password fields)
   */
  secureTextEntry?: boolean;
  
  /**
   * Whether input is required
   */
  required?: boolean;
  
  /**
   * Additional className/style
   */
  className?: string;
  style?: any;
  
  /**
   * Test ID
   */
  testID?: string;
}

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card subtitle
   */
  subtitle?: string;
  
  /**
   * Whether card is elevated (has shadow)
   * @default true
   */
  elevated?: boolean;
  
  /**
   * Additional className/style
   */
  className?: string;
  style?: any;
  
  /**
   * Click handler (makes card clickable)
   */
  onPress?: () => void;
  
  /**
   * Test ID
   */
  testID?: string;
}

export interface BadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode;
  
  /**
   * Badge variant
   * @default 'neutral'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
  
  /**
   * Badge size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Additional className/style
   */
  className?: string;
  style?: any;
  
  /**
   * Test ID
   */
  testID?: string;
}

export type ThemeMode = 'light' | 'dark';
