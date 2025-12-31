import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CartItem } from '../types';

export default function CartScreen({ navigation }: any) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'knet'>('cash');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    // هنا راح نجلب السلة من AsyncStorage
    const mockCart: CartItem[] = [
      {
        id: 1,
        name: "تفاح أحمر",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
        unit: "كيلو",
        price: 1.250,
        quantity: 2
      }
    ];
    setCartItems(mockCart);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم ورقم الهاتف');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('خطأ', 'السلة فارغة');
      return;
    }

    // هنا راح نرسل الطلب لـ Firebase
    Alert.alert(
      'تم إرسال الطلب',
      'شكراً لك! سيتم التواصل معك قريباً',
      [
        {
          text: 'موافق',
          onPress: () => {
            setCartItems([]);
            setCustomerName('');
            setCustomerPhone('');
            navigation.navigate('طلباتي');
          }
        }
      ]
    );
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="basket-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>السلة فارغة</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('الرئيسية')}
        >
          <Text style={styles.shopButtonText}>تسوق الآن</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* عناصر السلة */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>عناصر السلة</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUnit}>{item.unit}</Text>
                <Text style={styles.itemPrice}>{item.price} د.ك</Text>
              </View>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={16} color="white" />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* معلومات العميل */}
        <View style={styles.customerContainer}>
          <Text style={styles.sectionTitle}>معلومات التواصل</Text>
          
          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
            value={customerName}
            onChangeText={setCustomerName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* طريقة الدفع */}
        <View style={styles.paymentContainer}>
          <Text style={styles.sectionTitle}>طريقة الدفع</Text>
          
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Ionicons name="cash" size={24} color={paymentMethod === 'cash' ? '#10B981' : '#666'} />
              <Text style={[
                styles.paymentText,
                paymentMethod === 'cash' && styles.paymentTextSelected
              ]}>
                كاش
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'knet' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod('knet')}
            >
              <Ionicons name="card" size={24} color={paymentMethod === 'knet' ? '#10B981' : '#666'} />
              <Text style={[
                styles.paymentText,
                paymentMethod === 'knet' && styles.paymentTextSelected
              ]}>
                كي نت
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* المجموع وزر الطلب */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>المجموع:</Text>
          <Text style={styles.totalPrice}>{getTotalPrice().toFixed(3)} د.ك</Text>
        </View>
        
        <TouchableOpacity style={styles.orderButton} onPress={placeOrder}>
          <LinearGradient
            colors={['#10B981', '#3B82F6']}
            style={styles.orderButtonGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.orderButtonText}>إرسال الطلب</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'right',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    alignItems: 'flex-end',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemUnit: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  quantityButton: {
    backgroundColor: '#10B981',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 15,
  },
  customerContainer: {
    padding: 15,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    textAlign: 'right',
    elevation: 1,
  },
  paymentContainer: {
    padding: 15,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paymentOption: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 1,
  },
  paymentOptionSelected: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  paymentText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  paymentTextSelected: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  orderButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  orderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  orderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});