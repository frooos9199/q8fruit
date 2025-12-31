import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../types';

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // هنا راح نجلب المنتجات من Firebase
    // مؤقتاً نستخدم بيانات تجريبية
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "تفاح أحمر",
        units: [{ name: "كيلو", price: 1.250 }],
        quantity: 100,
        active: true,
        category: "فواكه",
        images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"],
        order: 0
      },
      {
        id: 2,
        name: "موز",
        units: [{ name: "كيلو", price: 0.750 }],
        quantity: 150,
        active: true,
        category: "فواكه",
        images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400"],
        order: 1
      }
    ];
    setProducts(mockProducts);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const addToCart = (product: Product) => {
    // إضافة للسلة
    setCartCount(prev => prev + 1);
    // هنا راح نحفظ في AsyncStorage
  };

  const filteredProducts = products.filter(product =>
    product.name.includes(searchText) && product.active
  );

  return (
    <View style={styles.container}>
      {/* الهيدر */}
      <LinearGradient
        colors={['#10B981', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>فكهاني الكويت</Text>
          <Text style={styles.headerSubtitle}>طازج • طبيعي • صحي</Text>
          
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('السلة')}
          >
            <Ionicons name="basket" size={24} color="white" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* البحث */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن المنتجات..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* المنتجات */}
      <ScrollView
        style={styles.productsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { product })}
            >
              <Image
                source={{ uri: product.images?.[0] || product.image }}
                style={styles.productImage}
              />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>
                {product.units[0]?.price} د.ك / {product.units[0]?.name}
              </Text>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(product)}
              >
                <LinearGradient
                  colors={['#10B981', '#3B82F6']}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.addButtonText}>أضف للسلة</Text>
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cartButton: {
    position: 'absolute',
    right: 0,
    top: 10,
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 12,
  },
});