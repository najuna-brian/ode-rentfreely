/**
 * NumberStepperRenderer
 *
 * Custom renderer for number/integer fields that adds simple +/- buttons
 * via Material-UI's InputAdornment. Preserves all default Material-UI behavior.
 */

import React, { useState } from 'react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  schemaMatches,
  JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const isNumberControl: RankedTester = rankWith(
  5, // Higher priority to override default Material-UI number renderer (rank 2)
  schemaMatches(schema => {
    const type = schema.type;
    return type === 'number' || type === 'integer';
  }),
);

const NumberStepperRenderer = ({
  data,
  handleChange,
  path,
  schema,
  uischema: _uischema,
  errors,
  enabled = true,
  label, // ControlProps includes label automatically resolved by JSON Forms
}: ControlProps) => {
  const numericValue =
    data !== undefined && data !== null && data !== '' ? Number(data) : 0;
  const min = schema.minimum ?? (schema as any).minimum;
  const max = schema.maximum ?? (schema as any).maximum;
  const step = schema.multipleOf ?? (schema as any).step ?? 1;

  const handleAdd = () => {
    const currentValue = numericValue || 0;
    const newValue = currentValue + step;
    if (max === undefined || newValue <= max) {
      handleChange(path, newValue);
    }
  };

  const handleSubtract = () => {
    const currentValue = numericValue || 0;
    const newValue = currentValue - step;
    if (min === undefined || newValue >= min) {
      handleChange(path, newValue);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      handleChange(path, undefined);
      return;
    }
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      // Apply min/max constraints
      let constrainedValue = numValue;
      if (min !== undefined && constrainedValue < min) {
        constrainedValue = min;
      }
      if (max !== undefined && constrainedValue > max) {
        constrainedValue = max;
      }
      handleChange(path, constrainedValue);
    }
  };

  const currentValue = numericValue || 0;
  const addDisabled = max !== undefined && currentValue >= max;
  const subtractDisabled = min !== undefined && currentValue <= min;

  // Track focus state to show helper text only when focused
  const [isFocused, setIsFocused] = useState(false);

  // Use schema.description for helper text (like "Please enter your age", "Height in centimeters")
  // Show errors if present, otherwise show description only when focused
  const helperText = errors
    ? Array.isArray(errors)
      ? errors.join(', ')
      : String(errors)
    : isFocused
      ? schema.description
      : undefined;

  return (
    <TextField
      label={label}
      type="number"
      value={numericValue === 0 && data === undefined ? '' : numericValue}
      onChange={handleInputChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={!enabled}
      error={Boolean(errors)}
      helperText={helperText}
      inputProps={{
        min,
        max,
        step,
      }}
      InputProps={{
        endAdornment: isFocused ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleSubtract}
              onMouseDown={e => e.preventDefault()}
              disabled={subtractDisabled || !enabled}
              edge="end"
              aria-label={`Decrease ${label || 'value'}`}>
              <Remove fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleAdd}
              onMouseDown={e => e.preventDefault()}
              disabled={addDisabled || !enabled}
              edge="end"
              aria-label={`Increase ${label || 'value'}`}>
              <Add fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        width: '100%',
        // Hide native number input spinners
        '& input[type="number"]': {
          '-moz-appearance': 'textfield',
          '&::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
          },
          '&::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
          },
        },
      }}
    />
  );
};

export const numberStepperRenderer: JsonFormsRendererRegistryEntry = {
  tester: isNumberControl,
  renderer: withJsonFormsControlProps(NumberStepperRenderer),
};

export default withJsonFormsControlProps(NumberStepperRenderer);
