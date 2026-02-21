import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Keychain from 'react-native-keychain';
import { login, register } from '../api/synkronus/Auth';
import { serverConfigService } from '../services/ServerConfigService';
import { notifyAuthStateChanged } from '../navigation/MainAppNavigator';
import { useAppTheme } from '../contexts/AppThemeContext';
import { Button, Input as ODEInput } from '../components/common';
import { ToastService } from '../services/ToastService';
import Icon from '@react-native-vector-icons/material-design-icons';

const AuthScreen = () => {
  const { themeColors } = useAppTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isLogin = mode === 'login';

  const isFormValid = useMemo(() => {
    const hasUsername = username.trim().length >= 3;
    const hasPassword = password.trim().length >= 6;
    if (isLogin) return hasUsername && hasPassword;
    return hasUsername && hasPassword && password === confirmPassword;
  }, [username, password, confirmPassword, isLogin]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // Ensure server URL is configured before any auth call
      await serverConfigService.ensureConfigured();

      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      if (isLogin) {
        await Keychain.setGenericPassword(trimmedUsername, trimmedPassword);
        await login(trimmedUsername, trimmedPassword);
        ToastService.showShort('Welcome back!');
      } else {
        await register(trimmedUsername, trimmedPassword);
        // Also store credentials in Keychain for auto-login
        await Keychain.setGenericPassword(trimmedUsername, trimmedPassword);
        ToastService.showShort('Account created! Welcome to RentFreely.');
      }

      // Tell MainAppNavigator the user is now logged in.
      // This swaps the Auth screen for MainApp automatically
      // (React Navigation conditional rendering — no navigation.reset needed).
      notifyAuthStateChanged(true);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`${isLogin ? 'Login' : 'Registration'} failed:`, err);

      let message = isLogin
        ? 'Login failed. Please check your credentials.'
        : 'Registration failed. Please try again.';

      if (err?.message) {
        // Use server-provided error message if available
        if (err.message.includes('already taken')) {
          message = 'This username is already taken. Try a different one.';
        } else if (
          err.message.includes('Invalid credentials') ||
          err.message.includes('invalid credentials')
        ) {
          message = 'Invalid username or password.';
        } else if (err.message.includes('at least')) {
          message = err.message;
        } else if (
          err.message.includes('Network') ||
          err.message.includes('fetch')
        ) {
          message =
            'Cannot reach server. Please check your internet connection.';
        }
      }

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isFormValid,
    isSubmitting,
    username,
    password,
    isLogin,
  ]);

  const toggleMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setErrorMessage('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.primary }]}
      edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* ─── Brand Header ────────────────────── */}
        <View style={styles.header}>
          <Icon name="home-city" size={48} color="rgba(255,255,255,0.95)" />
          <Text style={styles.brandName}>RentFreely</Text>
          <Text style={styles.tagline}>
            Find your perfect home in Uganda
          </Text>
        </View>

        {/* ─── Auth Form Card ──────────────────── */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                isLogin && {
                  backgroundColor: themeColors.primary,
                  borderColor: themeColors.primary,
                },
              ]}
              onPress={() => {
                setMode('login');
                setErrorMessage('');
              }}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.modeButtonText,
                  isLogin && styles.modeButtonTextActive,
                ]}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                !isLogin && {
                  backgroundColor: themeColors.primary,
                  borderColor: themeColors.primary,
                },
              ]}
              onPress={() => {
                setMode('register');
                setErrorMessage('');
              }}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.modeButtonText,
                  !isLogin && styles.modeButtonTextActive,
                ]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {isLogin
              ? 'Welcome back'
              : 'Create your account'}
          </Text>

          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: themeColors.errorLight },
              ]}>
              <Icon name="alert-circle" size={18} color={themeColors.error} />
              <Text style={[styles.errorText, { color: themeColors.error }]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <ODEInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ODEInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!isLogin && (
            <ODEInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}

          {!isLogin && password && confirmPassword && password !== confirmPassword && (
            <Text style={[styles.hint, { color: themeColors.error }]}>
              Passwords do not match
            </Text>
          )}

          <Button
            title={
              isSubmitting
                ? isLogin
                  ? 'Logging in...'
                  : 'Creating account...'
                : isLogin
                  ? 'Log In'
                  : 'Create Account'
            }
            onPress={handleSubmit}
            variant="primary"
            size="large"
            loading={isSubmitting}
            disabled={!isFormValid || isSubmitting}
            fullWidth
          />

          <TouchableOpacity
            onPress={toggleMode}
            style={styles.switchLink}
            activeOpacity={0.6}>
            <Text style={styles.switchText}>
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Text style={[styles.switchAction, { color: themeColors.primary }]}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  hint: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    fontSize: 14,
    color: '#666666',
  },
  switchAction: {
    fontWeight: '600',
  },
});

export default AuthScreen;
