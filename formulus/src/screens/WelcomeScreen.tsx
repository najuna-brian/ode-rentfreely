import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainAppStackParamList } from '../types/NavigationTypes';
import { colors } from '../theme/colors';
import { Button } from '../components/common';
import logo from '../../assets/images/logo.png';

type WelcomeScreenNavigationProp = StackNavigationProp<MainAppStackParamList>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = () => {
    // Use reset instead of navigate so that "Welcome" is removed from the
    // stack history.  This prevents the hardware back button from returning
    // the user to the Welcome screen after they've configured the server.
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome to Formulus</Text>
        <Text style={styles.subtitle}>
          Configure your server to get started
        </Text>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[600],
    marginBottom: 40,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
