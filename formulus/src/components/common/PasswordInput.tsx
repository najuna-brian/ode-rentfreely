import React, {useState} from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
  AccessibilityState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../theme/colors';

export interface PasswordInputProps extends Omit<
  TextInputProps,
  'secureTextEntry'
> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  testID?: string;
  /**
   * Show label above the input (default: true)
   */
  showLabel?: boolean;
}

/**
 * Reusable PasswordInput component with visibility toggle.
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  containerStyle,
  testID,
  style,
  showLabel = true,
  ...textInputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const accessibilityLabel = isPasswordVisible
    ? 'Hide password'
    : 'Show password';

  // Extract paddingHorizontal from style to calculate proper paddingRight
  const inputStyle = StyleSheet.flatten([styles.input, style]);
  const paddingHorizontal = inputStyle.paddingHorizontal || 12;
  const paddingRight =
    typeof paddingHorizontal === 'number'
      ? paddingHorizontal + 40 // Space for icon + some padding
      : 45; // Default fallback

  return (
    <View style={[styles.container, containerStyle]}>
      {showLabel && label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            error && styles.inputError,
            textInputProps.multiline && styles.inputMultiline,
            style,
            {paddingRight}, // Ensure icon space is always available
          ]}
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor={
            textInputProps.placeholderTextColor || colors.neutral[500]
          }
          testID={testID}
          accessibilityLabel={
            textInputProps.accessibilityLabel ||
            label ||
            textInputProps.placeholder ||
            'Password input'
          }
          accessibilityRole="text"
          accessibilityState={{invalid: !!error} as AccessibilityState}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={togglePasswordVisibility}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint={
            isPasswordVisible ? 'Tap to hide password' : 'Tap to show password'
          }
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={22}
            color={colors.neutral[600]}
          />
        </TouchableOpacity>
      </View>
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
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
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
  inputMultiline: {
    minHeight: 48,
    paddingTop: 12,
    paddingBottom: 12,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.semantic.error.ios,
    marginTop: 4,
  },
});

export default PasswordInput;
