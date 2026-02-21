import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import AuthScreen from '../screens/AuthScreen';
import ObservationDetailScreen from '../screens/ObservationDetailScreen';
import { MainAppStackParamList } from '../types/NavigationTypes';
import { getUserInfo } from '../api/synkronus/Auth';
import { serverConfigService } from '../services/ServerConfigService';
import { useAppTheme } from '../contexts/AppThemeContext';

const Stack = createStackNavigator<MainAppStackParamList>();

/**
 * Module-level callback so AuthScreen can tell the navigator
 * "the user just logged in" without prop-drilling or context.
 */
let _onAuthStateChanged: ((loggedIn: boolean) => void) | null = null;

/** Called by AuthScreen after a successful login/register */
export function notifyAuthStateChanged(loggedIn: boolean) {
  _onAuthStateChanged?.(loggedIn);
}

const MainAppNavigator: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const { themeColors } = useAppTheme();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Register the module-level callback so AuthScreen can update us
  useEffect(() => {
    _onAuthStateChanged = (loggedIn: boolean) => {
      if (mounted.current) {
        setIsLoggedIn(loggedIn);
      }
    };
    return () => { _onAuthStateChanged = null; };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      // Ensure server URL is configured on first launch
      await serverConfigService.ensureConfigured();

      // Check if user has a valid session
      const user = await getUserInfo();
      if (mounted.current) {
        setIsLoggedIn(!!user);
      }
    };
    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    // Still checking — return nothing (splash screen handles this briefly)
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColors.surface },
        headerTintColor: themeColors.onBackground,
        headerTitleStyle: { color: themeColors.onBackground },
      }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen
            name="MainApp"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ObservationDetail"
            component={ObservationDetailScreen}
            options={{ title: 'Observation Details' }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default MainAppNavigator;
