import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './Navigation';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Text } from 'react-native';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Lato_400Regular } from '@expo-google-fonts/lato';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        Poppins_600SemiBold,
        Lato_400Regular,
      });
      setFontsLoaded(true);
    } catch (e) {
      console.error('Error loading fonts:', e);
    } finally {
      await SplashScreen.hideAsync();
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
