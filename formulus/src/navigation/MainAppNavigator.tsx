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

  // Handle Android hardware back button so it navigates back within the app
  // instead of closing it immediately when there is navigation history.
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const onBackPress = () => {
      // @ts-expect-error: navigation type is generic here, but canGoBack/goBack exist at runtime
      if (navigation.canGoBack && navigation.canGoBack()) {
        // @ts-expect-error: see above
        navigation.goBack();
        return true; // we've handled the back press
      }
      // Let the OS handle the back press (which may close the app)
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
