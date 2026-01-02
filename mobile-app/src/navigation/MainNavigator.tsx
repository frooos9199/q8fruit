import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

// شاشات مؤقتة للتطوير
function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>🍎 الرئيسية</Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 10 }}>مرحباً بك في تطبيق فكهاني الكويت</Text>
    </View>
  );
}

function CategoriesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>📂 التصنيفات</Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 10 }}>تصفح جميع تصنيفات المنتجات</Text>
    </View>
  );
}

function CartScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>🛒 السلة</Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 10 }}>سلة التسوق الخاصة بك</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>👤 حسابي</Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 10 }}>إدارة حسابك وطلباتك</Text>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#22c55e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: 'الرئيسية',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏠</Text>,
          headerTitle: 'فكهاني الكويت'
        }} 
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{ 
          tabBarLabel: 'التصنيفات',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📂</Text>,
          headerTitle: 'التصنيفات'
        }} 
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ 
          tabBarLabel: 'السلة',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🛒</Text>,
          headerTitle: 'سلة التسوق'
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'حسابي',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>👤</Text>,
          headerTitle: 'حسابي'
        }} 
      />
    </Tab.Navigator>
  );
}
