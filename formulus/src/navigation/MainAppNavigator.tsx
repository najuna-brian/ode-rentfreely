import React, {useEffect, useState} from 'react';
import {BackHandler, Platform} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import MainTabNavigator from './MainTabNavigator';
import WelcomeScreen from '../screens/WelcomeScreen';
import FormManagementScreen from '../screens/FormManagementScreen';
import ObservationDetailScreen from '../screens/ObservationDetailScreen';
import {MainAppStackParamList} from '../types/NavigationTypes';
import {serverConfigService} from '../services/ServerConfigService';

const Stack = createStackNavigator<MainAppStackParamList>();

const MainAppNavigator: React.FC = () => {
  const navigation = useNavigation();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const checkConfiguration = async () => {
    const serverUrl = await serverConfigService.getServerUrl();
    setIsConfigured(!!serverUrl);
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  // Handle Android hardware back button in a conservative way:
  // only intercept when there is actual stack history above the root.
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const onBackPress = () => {
      // @ts-expect-error: navigation type is generic here, but getState exists at runtime
      const state = navigation.getState?.();

      // Only handle back when we're in a stack with more than one route and
      // not at the root (index > 0). This avoids interfering with tab presses
      // and prevents the app from getting into an odd state.
      if (
        state &&
        state.type === 'stack' &&
        Array.isArray(state.routes) &&
        state.routes.length > 1 &&
        typeof state.index === 'number' &&
        state.index > 0
      ) {
        // @ts-expect-error: goBack exists at runtime
        navigation.goBack();
        return true;
      }

      // Let React Navigation / Android handle back normally (may exit app at root)
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      checkConfiguration();
    }, []),
  );

  if (isConfigured === null) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#ffffff'},
        headerTintColor: '#000000',
        headerTitleStyle: {color: '#000000'},
      }}
      initialRouteName={isConfigured ? 'MainApp' : 'Welcome'}>
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MainApp"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="FormManagement"
        component={FormManagementScreen}
        options={{title: 'Form Management'}}
      />
      <Stack.Screen
        name="ObservationDetail"
        component={ObservationDetailScreen}
        options={{title: 'Observation Details'}}
      />
    </Stack.Navigator>
  );
};

export default MainAppNavigator;
