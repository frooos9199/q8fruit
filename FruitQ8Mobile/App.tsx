import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CartProvider, AuthProvider, NotificationProvider, useAuth } from './src/context';
import { initializePushNotifications } from './src/services/notifications';
import './src/utils/i18n';

function AppShell(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();
  const { user } = useAuth();
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    if (!navigationReady) {
      return;
    }

    initializePushNotifications(navigationRef, user?.id);
  }, [navigationReady, navigationRef, user?.id]);

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setNavigationReady(true)}>
      <RootNavigator />
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <AppShell />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
