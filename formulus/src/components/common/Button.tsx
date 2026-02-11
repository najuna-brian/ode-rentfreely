/**
 * Formulus Button – uses ODE design system Button from @ode/components.
 * Wraps ODE Button to support existing Formulus API (title, tertiary, fullWidth).
 */

import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { Button as ODEButton } from '@ode/components/react-native';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** ODE grouped style: horizontal 'left'|'middle'|'right', vertical 'top'|'bottom', or 'standalone' */
  position?: 'left' | 'right' | 'middle' | 'top' | 'bottom' | 'standalone';
  /** When true, show hover style (e.g. selected filter tab) */
  active?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * Maps Formulus tertiary variant to ODE neutral (same visual: text-only style).
 */
const variantMap = {
  primary: 'primary' as const,
  secondary: 'secondary' as const,
  tertiary: 'neutral' as const,
  danger: 'danger' as const,
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  position = 'standalone',
  active = false,
  style,
  textStyle: _textStyle,
  testID,
  accessibilityLabel,
}) => {
  return (
    <ODEButton
      onPress={onPress}
      variant={variantMap[variant]}
      size={size}
      position={position}
      active={active}
      disabled={disabled}
      loading={loading}
      style={[fullWidth && { width: '100%' }, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? title}>
      {title}
    </ODEButton>
  );
};

export default Button;
