import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import SplashScreenComponent from './src/screens/SplashScreen';
import MainNavigator from './src/navigation/MainNavigator';
import { initializeFirebase } from './src/config/firebase';

const Stack = createStackNavigator();

// منع إخفاء شاشة البداية تلقائياً
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  // تحميل خط Cairo
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // تهيئة Firebase
        await initializeFirebase();
        
        // محاكاة تحميل البيانات
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setIsAppReady(true);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);


  if (isLoading || !fontsLoaded) {
    return (
      <SplashScreenComponent 
        onFinish={() => setIsLoading(false)}
        onLayoutRootView={onLayoutRootView}
      />
    );
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <StatusBar style="light" backgroundColor="#22c55e" />
      {/* تطبيق خط Cairo على جميع النصوص */}
      <MainNavigator />
    </NavigationContainer>
  );
}