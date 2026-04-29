import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MainTabParamList } from '../types';
import { HomeScreen, CartScreen, ProfileScreen, OffersScreen, AdminScreen } from '../screens';
import { useAuth, useCart } from '../context';
import { COLORS, FONT_SIZE } from '../constants';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { canAccessAdmin } = useAuth();
  const { itemCount } = useCart();
  const isArabic = i18n.language === 'ar';
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          height: 60 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.white,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: isArabic ? 'الرئيسية' : 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" />,
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          tabBarLabel: isArabic ? 'العروض' : 'Offers',
          tabBarIcon: ({ color }) => <TabIcon icon="🎁" />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: isArabic ? 'السلة' : 'Cart',
          tabBarIcon: ({ color }) => <TabIcon icon="🛒" />,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: isArabic ? 'البروفايل' : 'Profile',
          tabBarIcon: ({ color }) => <TabIcon icon="👤" />,
        }}
      />
      {canAccessAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            tabBarLabel: isArabic ? 'الإدارة' : 'Admin',
            tabBarIcon: ({ color }) => <TabIcon icon="⚙️" />,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const TabIcon: React.FC<{ icon: string }> = ({ icon }) => (
  <Text style={{ fontSize: 24 }}>{icon}</Text>
);
