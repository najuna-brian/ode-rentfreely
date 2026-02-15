/**
 * ODE Input Component - React Web
 *
 * Modern minimalist input with clean styling and error states
 */

import React, { useState, useRef } from 'react';
import type { InputProps } from '../shared/types';
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

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  type = 'text',
  required = false,
  className = '',
  style,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChangeText) {
      onChangeText(newValue);
    }
  };

  const borderColor = error
    ? getToken('color.semantic.error.500')
    : isFocused
      ? getToken('color.brand.primary.500')
      : getToken('color.neutral.400');

  const borderWidth = isFocused ? getToken('border.width.medium') : getToken('border.width.thin');
  const borderRadius = getToken('border.radius.sm');

  const containerStyle: React.CSSProperties = {
    marginBottom: getToken('spacing.4'),
    width: '100%',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: getToken('font.size.sm'),
    fontWeight: getToken('font.weight.medium'),
    color: getToken('color.neutral.900'),
    marginBottom: getToken('spacing.2'),
    fontFamily: getToken('font.family.sans'),
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: getToken('spacing.4'),
    fontSize: getToken('font.size.base'),
    fontFamily: getToken('font.family.sans'),
    lineHeight: getToken('font.lineHeight.normal'),
    color: getToken('color.neutral.900'),
    backgroundColor: disabled ? getToken('color.neutral.100') : getToken('color.neutral.white'),
    border: `${borderWidth} solid ${borderColor}`,
    borderRadius,
    minHeight: getToken('touchTarget.large') || getToken('touchTarget.comfortable'),
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
  };

  const errorStyle: React.CSSProperties = {
    marginTop: getToken('spacing.1'),
    fontSize: getToken('font.size.sm'),
    color: getToken('color.semantic.error.500'),
    fontFamily: getToken('font.family.sans'),
  };

  return (
    <div className={`ode-input ${className}`} style={containerStyle} data-testid={testID}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && (
            <span
              style={{
                color: getToken('color.semantic.error.500'),
                marginLeft: getToken('spacing.1'),
              }}
            >
              *
            </span>
          )}
        </label>
      )}
      <input
        ref={inputRef}
        type={type}
        value={value || ''}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyle}
        aria-invalid={!!error}
        aria-describedby={error ? `${testID}-error` : undefined}
      />
      {error && (
        <div id={testID ? `${testID}-error` : undefined} style={errorStyle} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
