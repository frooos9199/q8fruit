import React, { useState, useCallback, useMemo, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native';

const Tab = createBottomTabNavigator();

// شاشات مؤقتة للتطوير
// بيانات منتجات افتراضية
const PRODUCTS = [
  { id: '1', name: 'تفاح أحمر', price: 0.750, image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'موز', price: 0.500, image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8e9?auto=format&fit=crop&w=400&q=80' },
  { id: '3', name: 'عنب أخضر', price: 1.200, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
  { id: '4', name: 'برتقال', price: 0.600, image: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80' },
  { id: '5', name: 'رمان', price: 1.000, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
  { id: '6', name: 'كيوي', price: 0.900, image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
];

function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
  };

  // فلترة المنتجات مباشرة عند كل تغيير
  const filtered = useMemo(() => {
    const q = inputValue.trim();
    if (q === '') return PRODUCTS;
    return PRODUCTS.filter(p => p.name.includes(q));
  }, [inputValue]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price.toFixed(3)} د.ك</Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)} activeOpacity={0.7}>
        <Text style={styles.addBtnText}>+ أضف للسلة</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f6f6', paddingTop: 10 }}>
      <Text style={{ fontSize: 26, color: '#22c55e', fontFamily: 'Cairo_700Bold', textAlign: 'center', marginBottom: 8 }}>🍎 جميع المنتجات</Text>
      <View style={{ marginHorizontal: 16, marginBottom: 10 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
          <Text style={{ fontSize: 20, color: '#bbb', marginRight: 4 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, height: 44, fontFamily: 'Cairo_400Regular', fontSize: 16, color: '#222' }}
            placeholder="ابحث باسم المنتج..."
            placeholderTextColor="#aaa"
            value={inputValue}
            onChangeText={setInputValue}
            returnKeyType="search"
          />
        </View>
      </View>
      {filtered.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#888', fontFamily: 'Cairo_400Regular', marginTop: 30 }}>لا توجد منتجات مطابقة</Text>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-evenly' }}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
// ...existing code...


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 18,
    padding: 12,
    width: 165,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 17,
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  price: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 15,
    color: '#22c55e',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  addBtnText: {
    color: '#fff',
    fontFamily: 'Cairo_700Bold',
    fontSize: 15,
  },
});

// بيانات افتراضية للعروض
const OFFERS = [
  { id: '1', title: 'عرض التفاح + الموز', desc: 'احصل على خصم 20% عند شراء تفاح وموز معًا', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80' },
  { id: '2', title: 'عرض العنب الأخضر', desc: 'خصم خاص على العنب الأخضر الطازج', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
];

function CategoriesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f6f6f6', paddingTop: 10 }}>
      <Text style={{ fontSize: 26, color: '#22c55e', fontFamily: 'Cairo_700Bold', textAlign: 'center', marginBottom: 8 }}>🎉 العروض</Text>
      {OFFERS.length === 0 ? (
        <Text style={{ fontFamily: 'Cairo_400Regular', fontSize: 18, color: '#888', textAlign: 'center', marginTop: 40 }}>لا توجد عروض حالياً</Text>
      ) : (
        OFFERS.map(offer => (
          <View key={offer.id} style={offerStyles.card}>
            <Image source={{ uri: offer.image }} style={offerStyles.image} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={offerStyles.title}>{offer.title}</Text>
              <Text style={offerStyles.desc}>{offer.desc}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const offerStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  title: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  desc: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#22c55e',
    marginBottom: 2,
  },
});

// بيانات افتراضية للسلة (نفس المنتجات)
function CartScreen() {
  const [cart, setCart] = useState([
    { id: '1', name: 'تفاح أحمر', price: 0.750, image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80', quantity: 2 },
    { id: '2', name: 'موز', price: 0.500, image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8e9?auto=format&fit=crop&w=400&q=80', quantity: 1 },
  ]);

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };
  const changeQty = (id, delta) => {
    setCart((prev) => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f6f6', paddingTop: 10 }}>
      <Text style={{ fontSize: 26, color: '#22c55e', fontFamily: 'Cairo_700Bold', textAlign: 'center', marginBottom: 8 }}>🛒 سلة التسوق</Text>
      {cart.length === 0 ? (
        <Text style={{ fontFamily: 'Cairo_400Regular', fontSize: 18, color: '#888', textAlign: 'center', marginTop: 40 }}>سلتك فارغة</Text>
      ) : (
        <>
          {cart.map(item => (
            <View key={item.id} style={cartStyles.card}>
              <Image source={{ uri: item.image }} style={cartStyles.image} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={cartStyles.name}>{item.name}</Text>
                <Text style={cartStyles.price}>{item.price.toFixed(3)} د.ك</Text>
                <View style={cartStyles.qtyRow}>
                  <TouchableOpacity style={cartStyles.qtyBtn} onPress={() => changeQty(item.id, -1)}>
                    <Text style={cartStyles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={cartStyles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity style={cartStyles.qtyBtn} onPress={() => changeQty(item.id, 1)}>
                    <Text style={cartStyles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={cartStyles.removeBtn} onPress={() => removeFromCart(item.id)}>
                <Text style={cartStyles.removeBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={cartStyles.totalRow}>
            <Text style={cartStyles.totalLabel}>الإجمالي:</Text>
            <Text style={cartStyles.totalValue}>{total.toFixed(3)} د.ك</Text>
          </View>
          <TouchableOpacity style={cartStyles.checkoutBtn}>
            <Text style={cartStyles.checkoutText}>إتمام الطلب</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const cartStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  name: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  price: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#22c55e',
    marginBottom: 6,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  qtyBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginHorizontal: 4,
  },
  qtyBtnText: {
    color: '#fff',
    fontFamily: 'Cairo_700Bold',
    fontSize: 18,
  },
  qtyText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 16,
    color: '#222',
    minWidth: 28,
    textAlign: 'center',
  },
  removeBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Cairo_700Bold',
    lineHeight: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 8,
  },
  totalLabel: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 17,
    color: '#222',
  },
  totalValue: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 17,
    color: '#22c55e',
  },
  checkoutBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    marginHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 4,
  },
  checkoutText: {
    color: '#fff',
    fontFamily: 'Cairo_700Bold',
    fontSize: 17,
  },
});

function ProfileScreen() {
  // بيانات افتراضية للمستخدم
  const user = {
    name: 'أحمد الكويتي',
    phone: '98899426',
    email: 'ahmad@email.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#f6f6f6', paddingTop: 24 }}>
      <View style={profileStyles.header}>
        <Image source={{ uri: user.avatar }} style={profileStyles.avatar} />
        <Text style={profileStyles.name}>{user.name}</Text>
        <Text style={profileStyles.email}>{user.email}</Text>
      </View>
      <View style={profileStyles.infoBox}>
        <Text style={profileStyles.infoLabel}>رقم الهاتف:</Text>
        <Text style={profileStyles.infoValue}>{user.phone}</Text>
      </View>
      <TouchableOpacity style={profileStyles.actionBtn}>
        <Text style={profileStyles.actionText}>تعديل الحساب</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[profileStyles.actionBtn, { backgroundColor: '#ef4444', marginTop: 8 }]}>
        <Text style={[profileStyles.actionText, { color: '#fff' }]}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 20,
    color: '#22c55e',
    marginBottom: 2,
  },
  email: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 24,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  infoLabel: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 15,
    color: '#222',
  },
  infoValue: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 15,
    color: '#444',
  },
  actionBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    marginHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 2,
  },
  actionText: {
    color: '#fff',
    fontFamily: 'Cairo_700Bold',
    fontSize: 16,
  },
});

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
          fontSize: 13,
          fontFamily: 'Cairo_700Bold',
        },
        headerStyle: {
          backgroundColor: '#22c55e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Cairo_700Bold',
          fontSize: 20,
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
