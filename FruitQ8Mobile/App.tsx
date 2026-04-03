import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CartProvider, AuthProvider, NotificationProvider } from './src/context';
import './src/utils/i18n';

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
