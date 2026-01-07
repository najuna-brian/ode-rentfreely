import React from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  AccessibilityState,
} from 'react-native';
import { colors } from '../../theme/colors';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  testID?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  testID,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...textInputProps}
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.neutral[500]}
        testID={testID}
        accessibilityLabel={label || textInputProps.placeholder || 'Text input'}
        accessibilityRole="text"
        accessibilityState={{ invalid: !!error } as AccessibilityState}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[800],
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.ui.gray.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.neutral.black,
    backgroundColor: colors.neutral.white,
  },
  inputError: {
    borderColor: colors.semantic.error.ios,
  },
  errorText: {
    fontSize: 12,
    color: colors.semantic.error.ios,
    marginTop: 4,
  },
});

export default Input;
